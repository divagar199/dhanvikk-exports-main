const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function run() {
  const rootDir = path.resolve(__dirname, '..', '..');
  const productsDir = path.join(rootDir, 'frontend', 'public', 'images', 'products');
  
  if (!fs.existsSync(productsDir)) {
    console.error('Products directory does not exist:', productsDir);
    process.exit(1);
  }

  const files = fs.readdirAllSync ? fs.readdirAllSync(productsDir) : fs.readdirSync(productsDir);
  console.log(`Found ${files.length} items in ${productsDir}`);

  let convertedCount = 0;
  let totalSavedBytes = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
      const baseName = path.basename(file, ext);
      const inputPath = path.join(productsDir, file);
      const outputPath = path.join(productsDir, `${baseName}.webp`);

      const origStat = fs.statSync(inputPath);
      
      try {
        await sharp(inputPath)
          .resize({ width: 900, withoutEnlargement: true })
          .webp({ quality: 82, effort: 4 })
          .toFile(outputPath);

        const newStat = fs.statSync(outputPath);
        totalSavedBytes += (origStat.size - newStat.size);
        convertedCount++;

        // Remove original bulky file
        fs.unlinkSync(inputPath);
      } catch (err) {
        console.error(`Failed to convert ${file}:`, err.message);
      }
    }
  }

  console.log(`Successfully converted ${convertedCount} images to WebP.`);
  console.log(`Saved ${(totalSavedBytes / (1024 * 1024)).toFixed(2)} MB of storage.`);

  // Update frontend/src/data/products.js
  const frontendProductsFile = path.join(rootDir, 'frontend', 'src', 'data', 'products.js');
  if (fs.existsSync(frontendProductsFile)) {
    let content = fs.readFileSync(frontendProductsFile, 'utf8');
    content = content.replace(/\/images\/products\/([^"'\s]+)\.(png|jpg|jpeg)/g, '/images/products/$1.webp');
    fs.writeFileSync(frontendProductsFile, content, 'utf8');
    console.log('Updated frontend/src/data/products.js');
  }

  // Update backend/src/data/seedProducts.js
  const backendSeedFile = path.join(rootDir, 'backend', 'src', 'data', 'seedProducts.js');
  if (fs.existsSync(backendSeedFile)) {
    let content = fs.readFileSync(backendSeedFile, 'utf8');
    content = content.replace(/\/images\/products\/([^"'\s]+)\.(png|jpg|jpeg)/g, '/images/products/$1.webp');
    fs.writeFileSync(backendSeedFile, content, 'utf8');
    console.log('Updated backend/src/data/seedProducts.js');
  }

  // Update frontend/src/store/slices/wishlistSlice.js
  const wishlistFile = path.join(rootDir, 'frontend', 'src', 'store', 'slices', 'wishlistSlice.js');
  if (fs.existsSync(wishlistFile)) {
    let content = fs.readFileSync(wishlistFile, 'utf8');
    content = content.replace(/\/images\/products\/([^"'\s]+)\.(png|jpg|jpeg)/g, '/images/products/$1.webp');
    fs.writeFileSync(wishlistFile, content, 'utf8');
    console.log('Updated wishlistSlice.js');
  }
}

run().catch(console.error);
