import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IMAGES_DIR = path.resolve(__dirname, '../../public/images');

const MIME_MAP = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
};

/**
 * Recursively get all files from directory
 */
const walkDir = (dir, baseDir = dir) => {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walkDir(fullPath, baseDir));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (MIME_MAP[ext]) {
        const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
        const stat = fs.statSync(fullPath);
        const segments = relPath.split('/');
        const category = segments.length > 1 ? segments[0] : 'root';

        results.push({
          filename: entry.name,
          category,
          relativePath: `/images/${relPath}`,
          sizeBytes: stat.size,
          lastModified: stat.mtime,
          extension: ext,
        });
      }
    }
  }
  return results;
};

/**
 * @desc Get list of all images with metadata
 * @route GET /api/images or GET /api/images/list
 */
export const getImageList = async (req, res) => {
  try {
    const host = (typeof req.get === 'function' ? req.get('host') : null) || 'localhost:5000';
    const protocol = req.protocol || 'http';
    const baseUrl = `${protocol}://${host}`;

    const { category, search } = req.query;
    let allImages = walkDir(IMAGES_DIR);

    if (category && category.toLowerCase() !== 'all') {
      allImages = allImages.filter(
        (img) => img.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (search) {
      const query = search.toLowerCase();
      allImages = allImages.filter(
        (img) =>
          img.filename.toLowerCase().includes(query) ||
          img.relativePath.toLowerCase().includes(query)
      );
    }

    // Attach full API and static URLs
    const formatted = allImages.map((img) => ({
      ...img,
      apiUrl: `${baseUrl}/api${img.relativePath}`,
      staticUrl: `${baseUrl}${img.relativePath}`,
    }));

    // Group categories with counts
    const categoriesMap = {};
    for (const img of walkDir(IMAGES_DIR)) {
      categoriesMap[img.category] = (categoriesMap[img.category] || 0) + 1;
    }

    return res.status(200).json({
      success: true,
      count: formatted.length,
      categories: categoriesMap,
      images: formatted,
    });
  } catch (error) {
    console.error('Error fetching image list:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get summary of image categories
 * @route GET /api/images/categories
 */
export const getImageCategories = async (req, res) => {
  try {
    const allImages = walkDir(IMAGES_DIR);
    const categoriesMap = {};
    for (const img of allImages) {
      categoriesMap[img.category] = (categoriesMap[img.category] || 0) + 1;
    }

    return res.status(200).json({
      success: true,
      totalImages: allImages.length,
      categories: categoriesMap,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Serve an image binary stream via API endpoint with caching & security
 * @route GET /api/images/* or GET /api/images/:category/:filename
 */
export const serveImage = (req, res) => {
  try {
    // Determine the requested subpath
    // req.params[0] captures wildcard * from express route /api/images/*
    const rawSubPath = req.params[0] || (req.params.category && req.params.filename ? `${req.params.category}/${req.params.filename}` : req.params.filename);

    if (!rawSubPath) {
      return res.status(400).json({ success: false, message: 'Image path required' });
    }

    // Strip leading /images/ or /api/images/ if client mistakenly passed full path
    const cleanSubPath = rawSubPath.replace(/^\/?(api\/images|images)\//, '').replace(/^\/+/, '');

    // Resolve absolute path and guard against directory traversal
    const targetFile = path.resolve(IMAGES_DIR, cleanSubPath);
    if (!targetFile.startsWith(IMAGES_DIR)) {
      return res.status(403).json({ success: false, message: 'Access denied: Invalid image path' });
    }

    if (!fs.existsSync(targetFile)) {
      return res.status(404).json({
        success: false,
        message: `Image not found: ${cleanSubPath}`,
      });
    }

    const ext = path.extname(targetFile).toLowerCase();
    const contentType = MIME_MAP[ext] || 'application/octet-stream';

    // Set high-performance caching and cross-origin headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');

    return res.sendFile(targetFile);
  } catch (error) {
    console.error('Error serving image:', error);
    return res.status(500).json({ success: false, message: 'Failed to stream image' });
  }
};
