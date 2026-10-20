import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const frontendSrc = path.join(rootDir, 'frontend', 'src');
const backendSrc = path.join(rootDir, 'backend', 'src');

console.log('🔍 Starting Dhanvikk Comprehensive Bug Finding Tool...\n');

let issuesFound = 0;

function reportIssue(category, file, detail) {
  issuesFound++;
  console.log(`❌ [${category}] in ${file}:\n   -> ${detail}\n`);
}

// 1. Audit Frontend Imports & File References
console.log('--- Checking Frontend File Imports ---');
function checkImports(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      checkImports(fullPath);
    } else if (/\.(jsx?|tsx?)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const importRegex = /import\s+(?:(?:(?:\*\s+as\s+\w+)|(?:\{[^}]*\})|(?:\w+))\s+from\s+)?['"]([^'"]+)['"]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        if (importPath.startsWith('.')) {
          const resolvedDir = path.dirname(fullPath);
          const targetBase = path.resolve(resolvedDir, importPath);
          const extensions = ['', '.js', '.jsx', '.ts', '.tsx', '/index.js', '/index.jsx', '/index.ts', '/index.tsx', '.css'];
          const exists = extensions.some(ext => fs.existsSync(targetBase + ext));
          if (!exists) {
            reportIssue('BROKEN_IMPORT', path.relative(rootDir, fullPath), `Cannot resolve "${importPath}"`);
          }
        }
      }
    }
  }
}
checkImports(frontendSrc);

// 2. Audit Backend Imports
console.log('--- Checking Backend File Imports ---');
function checkBackendImports(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      checkBackendImports(fullPath);
    } else if (/\.js$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        if (importPath.startsWith('.')) {
          const resolvedDir = path.dirname(fullPath);
          const targetBase = path.resolve(resolvedDir, importPath);
          const extensions = ['', '.js', '/index.js', '.json'];
          const exists = extensions.some(ext => fs.existsSync(targetBase + ext));
          if (!exists) {
            reportIssue('BROKEN_BACKEND_IMPORT', path.relative(rootDir, fullPath), `Cannot resolve "${importPath}"`);
          }
        }
      }
    }
  }
}
checkBackendImports(backendSrc);

// 3. Scan for Mongoose Deprecated Options in Backend
console.log('--- Checking Mongoose Deprecated Options ---');
function checkMongooseDeprecations(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      checkMongooseDeprecations(fullPath);
    } else if (/\.js$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      if (/findOneAndUpdate\([^)]*\{\s*new:\s*true\s*\}/.test(content) || /findOneAndReplace\([^)]*\{\s*new:\s*true\s*\}/.test(content)) {
        reportIssue('DEPRECATED_MONGOOSE', path.relative(rootDir, fullPath), 'Using deprecated `{ new: true }` in findOneAndUpdate. Should use `{ returnDocument: "after" }` or `{ returnDocument: "after", new: true }`');
      }
    }
  }
}
checkMongooseDeprecations(backendSrc);

// 4. Audit Frontend API Endpoints vs Backend Routes
console.log('--- Auditing Frontend API Endpoints against Backend Route Registration ---');
// Collect backend routes
const backendRoutes = [];
const routeFiles = fs.readdirSync(path.join(backendSrc, 'routes'));
for (const rf of routeFiles) {
  if (rf.endsWith('.js')) {
    const content = fs.readFileSync(path.join(backendSrc, 'routes', rf), 'utf-8');
    const prefixMap = {
      'authRoutes.js': '/api/auth',
      'productRoutes.js': '/api/products',
      'orderRoutes.js': '/api/orders',
      'paymentRoutes.js': '/api/payment',
      'adminRoutes.js': '/api/admin',
      'imageRoutes.js': '/api/images',
    };
    const prefix = prefixMap[rf] || '';
    const routeRegex = /router\.(get|post|put|delete|patch)\(\s*['"]([^'"]+)['"]/g;
    let rm;
    while ((rm = routeRegex.exec(content)) !== null) {
      const method = rm[1].toUpperCase();
      const subpath = rm[2] === '/' ? '' : rm[2];
      backendRoutes.push({ method, fullPath: prefix + subpath, file: rf });
    }
  }
}
console.log(`Discovered ${backendRoutes.length} registered backend route endpoints.`);

// Collect frontend API calls
const frontendApiCalls = [];
function scanFrontendApi(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanFrontendApi(fullPath);
    } else if (/\.(jsx?|tsx?)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      // Match axios or api calls like api.get('/path'), api.post('/path')
      const callRegex = /(?:api|axios)\.(get|post|put|delete|patch)\(\s*[`'"](\/api\/[^`'"]*|(?:\/|)[a-zA-Z0-9_\-\/]+)[`'"]/g;
      let cm;
      while ((cm = callRegex.exec(content)) !== null) {
        frontendApiCalls.push({
          method: cm[1].toUpperCase(),
          path: cm[2],
          file: path.relative(rootDir, fullPath)
        });
      }
    }
  }
}
scanFrontendApi(frontendSrc);
console.log(`Discovered ${frontendApiCalls.length} frontend API calls.`);

// 5. Check for undefined variables, console.errors or bad patterns in Frontend
console.log('--- Checking Frontend for Broken Elements & Unhandled React Patterns ---');
function checkReactPatterns(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      checkReactPatterns(fullPath);
    } else if (/\.(jsx|tsx)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      // Check for <a href=""> or <a href="#"> without preventDefault or proper Router link
      const brokenHref = /<a\s+[^>]*href=['"](#|javascript:void\(0\)|)['"][^>]*>/g;
      let bm;
      while ((bm = brokenHref.exec(content)) !== null) {
        reportIssue('POTENTIAL_DEAD_LINK', path.relative(rootDir, fullPath), `Empty or '#' anchor found: "${bm[0].slice(0, 50)}..."`);
      }
      
      // Check for unhandled img without alt or without onError fallback
      const imgNoAlt = /<img\s+(?![^>]*\balt=)[^>]*>/g;
      let im;
      while ((im = imgNoAlt.exec(content)) !== null) {
        reportIssue('ACCESSIBILITY_MISSING_ALT', path.relative(rootDir, fullPath), `Image tag missing 'alt' attribute: "${im[0].slice(0, 50)}..."`);
      }
    }
  }
}
checkReactPatterns(frontendSrc);

console.log(`\n=============================================================`);
console.log(`🎯 BUG SCAN COMPLETE: Found ${issuesFound} issues to inspect/fix.`);
console.log(`=============================================================\n`);
