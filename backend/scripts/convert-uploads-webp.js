import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, '../uploads');

const deleteOriginals = process.argv.includes('--delete-originals');

const walkDir = (dir) => {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walkDir(fullPath));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.png', '.jpg', '.jpeg'].includes(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
};

async function convertAll() {
  console.log(`🌸 Scanning ${UPLOADS_DIR} for images to convert to .webp...`);
  const files = walkDir(UPLOADS_DIR);
  console.log(`📸 Found ${files.length} images (.png, .jpg, .jpeg) to convert.`);

  if (files.length === 0) {
    console.log('No images found to convert.');
    return;
  }

  let totalOriginalBytes = 0;
  let totalWebpBytes = 0;
  let successCount = 0;
  let errorCount = 0;

  // Process in batches of 8 for optimal CPU & memory utilization
  const BATCH_SIZE = 8;
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const chunk = files.slice(i, i + BATCH_SIZE);
    await Promise.all(
      chunk.map(async (file) => {
        try {
          const parsed = path.parse(file);
          const destWebp = path.join(parsed.dir, `${parsed.name}.webp`);
          const origStat = fs.statSync(file);
          totalOriginalBytes += origStat.size;

          await sharp(file, { failOnError: false })
            .rotate() // Auto-orient based on EXIF
            .webp({ quality: 85, effort: 4 })
            .toFile(destWebp);

          const webpStat = fs.statSync(destWebp);
          totalWebpBytes += webpStat.size;
          successCount++;

          if (deleteOriginals && file !== destWebp) {
            fs.unlinkSync(file);
          }
        } catch (err) {
          console.error(`❌ Error converting ${path.basename(file)}:`, err.message);
          errorCount++;
        }
      })
    );

    const progress = Math.min(i + BATCH_SIZE, files.length);
    process.stdout.write(`⏳ Converted ${progress}/${files.length} images...\r`);
  }

  const origMB = (totalOriginalBytes / (1024 * 1024)).toFixed(2);
  const webpMB = (totalWebpBytes / (1024 * 1024)).toFixed(2);
  const savedMB = ((totalOriginalBytes - totalWebpBytes) / (1024 * 1024)).toFixed(2);
  const pct = totalOriginalBytes > 0 ? (((totalOriginalBytes - totalWebpBytes) / totalOriginalBytes) * 100).toFixed(1) : 0;

  console.log('\n\n🎉 WebP Conversion Complete!');
  console.log(`✅ Successfully converted: ${successCount} images`);
  if (errorCount > 0) console.log(`⚠️ Errors: ${errorCount}`);
  console.log(`📦 Original size: ${origMB} MB`);
  console.log(`✨ New WebP size: ${webpMB} MB`);
  console.log(`🚀 Space saved: ${savedMB} MB (${pct}% reduction)`);
  if (deleteOriginals) {
    console.log('🗑️ Original .png/.jpg files were removed.');
  } else {
    console.log('💡 Note: Original files retained. Run with --delete-originals to clean up originals.');
  }
}

convertAll().catch((err) => {
  console.error('Fatal conversion error:', err);
  process.exit(1);
});
