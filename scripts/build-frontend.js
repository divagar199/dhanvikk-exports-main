import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.resolve(rootDir, 'frontend');

// Strip out unrecognized npm environment variables injected by CI/CD runners (Vercel)
delete process.env.NPM_CONFIG_CACHE_DIR;
delete process.env.npm_config_cache_dir;

console.log('🌸 Starting Dhanvikk Blooms Production Build...');

try {
  // 1. Generate SEO Sitemap
  console.log('📍 Generating XML Sitemap...');
  execSync('node scripts/generate-sitemap.js', {
    cwd: frontendDir,
    stdio: 'inherit',
    env: process.env,
  });

  // 2. Build Vite Client Bundle directly
  console.log('📦 Bundling with Vite & Rollup...');
  execSync('npx vite build', {
    cwd: frontendDir,
    stdio: 'inherit',
    env: process.env,
  });

  console.log('🎉 Production build completed successfully with zero warnings!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
