import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

// Ensure uploads folder exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Memory storage to process image buffer through Sharp before persisting to disk
const storage = multer.memoryStorage();

// File filter: accept all common image formats
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp|gif|svg|bmp|tiff|avif/;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedExtensions.test(file.mimetype) || file.mimetype.startsWith('image/');

  if (extname || mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only valid image files (JPG, PNG, WEBP, GIF, SVG, BMP, TIFF) are allowed!'));
  }
};

const multerSingle = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter,
}).single('image');

const multerMultiple = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter,
}).array('images', 8);

/**
 * Middleware: Process and automatically convert single uploaded image to .webp
 */
export const uploadSingleImage = (req, res, next) => {
  multerSingle(req, res, async (err) => {
    if (err) return next(err);
    if (!req.file) return next();

    try {
      const ext = path.extname(req.file.originalname).toLowerCase();
      const cleanBase = path
        .basename(req.file.originalname, ext)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 50) || 'upload';

      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      const webpFilename = `prod-${cleanBase}-${uniqueSuffix}.webp`;
      const webpPath = path.join(uploadsDir, webpFilename);

      // Auto-convert to modern WebP format
      await sharp(req.file.buffer)
        .rotate() // Auto-orient based on EXIF
        .webp({ quality: 85, effort: 4 })
        .toFile(webpPath);

      const stat = fs.statSync(webpPath);

      // Update req.file properties to point to the newly created .webp file
      req.file.filename = webpFilename;
      req.file.path = webpPath;
      req.file.destination = uploadsDir;
      req.file.mimetype = 'image/webp';
      req.file.size = stat.size;

      next();
    } catch (sharpError) {
      console.error('WebP conversion failed during upload:', sharpError);
      return res.status(500).json({
        success: false,
        message: `Failed to convert uploaded image to WebP: ${sharpError.message}`,
      });
    }
  });
};

/**
 * Middleware: Process and automatically convert multiple uploaded images to .webp
 */
export const uploadMultipleImages = (req, res, next) => {
  multerMultiple(req, res, async (err) => {
    if (err) return next(err);
    if (!req.files || req.files.length === 0) return next();

    try {
      await Promise.all(
        req.files.map(async (file) => {
          const ext = path.extname(file.originalname).toLowerCase();
          const cleanBase = path
            .basename(file.originalname, ext)
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .slice(0, 50) || 'upload';

          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
          const webpFilename = `prod-${cleanBase}-${uniqueSuffix}.webp`;
          const webpPath = path.join(uploadsDir, webpFilename);

          await sharp(file.buffer)
            .rotate()
            .webp({ quality: 85, effort: 4 })
            .toFile(webpPath);

          const stat = fs.statSync(webpPath);
          file.filename = webpFilename;
          file.path = webpPath;
          file.destination = uploadsDir;
          file.mimetype = 'image/webp';
          file.size = stat.size;
        })
      );
      next();
    } catch (sharpError) {
      console.error('WebP conversion failed for multi-upload:', sharpError);
      return res.status(500).json({
        success: false,
        message: `Failed to convert images to WebP: ${sharpError.message}`,
      });
    }
  });
};

export { uploadsDir };
