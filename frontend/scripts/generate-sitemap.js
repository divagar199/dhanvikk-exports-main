import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import products data
const productsModule = await import('../src/data/products.js');
const categoriesModule = await import('../src/data/categories.js');

const products = productsModule.PRODUCTS || [];
const definedCategories = categoriesModule.DEFINED_CATEGORIES || [];

const BASE_URL = 'https://dhanvikkexports.com';
const today = new Date().toISOString().split('T')[0];

const categorySlugs = [
  'flowers',
  'flower-boxes',
  'forever-roses',
  'plants',
  'gift-bundles',
  'traditional-exports',
  'roses',
  'hand-bouquets',
  'orchids',
  'birthday',
  'anniversary',
  'romance',
  'congratulations',
  'get-well',
  'housewarming',
];

// Add any other categories from definedCategories
definedCategories.forEach((c) => {
  if (c.slug && !categorySlugs.includes(c.slug)) {
    categorySlugs.push(c.slug);
  }
});

function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Homepage -->
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${BASE_URL}/dhanvikk-brand-logo.png</image:loc>
      <image:title>Dhanvikk Blooms Luxury Florist Atelier</image:title>
      <image:caption>Haute couture luxury florist and international botanical export atelier</image:caption>
    </image:image>
  </url>
`;

// Categories
categorySlugs.forEach((slug) => {
  xml += `  <url>
    <loc>${BASE_URL}/category/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
`;
});

// Products with images
products.forEach((prod) => {
  const prodSlug = prod.slug || prod.id;
  const prodUrl = `${BASE_URL}/product/${prodSlug}`;
  const rawImg = prod.image || (Array.isArray(prod.images) ? prod.images[0] : null);
  const fullImgUrl = rawImg
    ? rawImg.startsWith('http')
      ? rawImg
      : `${BASE_URL}${rawImg}`
    : `${BASE_URL}/dhanvikk-brand-logo.png`;

  xml += `  <url>
    <loc>${prodUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
    <image:image>
      <image:loc>${escapeXml(fullImgUrl)}</image:loc>
      <image:title>${escapeXml(prod.name)} - Dhanvikk Blooms</image:title>
      <image:caption>${escapeXml(prod.description || prod.name)}</image:caption>
    </image:image>
  </url>
`;
});

xml += `</urlset>\n`;

const outputPath = path.resolve(__dirname, '../public/sitemap.xml');
fs.writeFileSync(outputPath, xml, 'utf8');
console.log(`Generated sitemap with 1 homepage, ${categorySlugs.length} categories, and ${products.length} products at ${outputPath}`);
