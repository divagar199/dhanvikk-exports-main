import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const frontendSrc = path.join(rootDir, 'frontend', 'src');
const backendSrc = path.join(rootDir, 'backend', 'src');

console.log('=============================================================');
console.log('🛡️  DHANVIKK DEEP SYSTEM & ELEMENT BUG FINDING AUDITOR');
console.log('=============================================================\n');

const findings = {
  apiRouteMismatches: [],
  frontendElementIssues: [],
  backendControllerIssues: [],
  imageAndAssetIssues: [],
  deadRoutes: []
};

// 1. Gather all backend registered routes
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
      let subpath = rm[2] === '/' ? '' : rm[2];
      backendRoutes.push({
        method,
        fullPath: prefix + subpath,
        pattern: new RegExp('^' + (prefix + subpath).replace(/:[a-zA-Z0-9_]+/g, '[^/]+') + '$'),
        raw: prefix + subpath,
        file: rf
      });
    }
  }
}

// 2. Scan Frontend for all API calls
function scanDir(dir, extFilter, cb) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(full, extFilter, cb);
    } else if (extFilter.test(entry.name)) {
      cb(full, fs.readFileSync(full, 'utf-8'));
    }
  }
}

console.log('▶ Scanning Frontend API calls...');
scanDir(frontendSrc, /\.(jsx?|tsx?)$/, (file, content) => {
  const relFile = path.relative(rootDir, file);
  // Match axios / api calls: api.get('/...'), api.post(`/...`)
  const apiCallRegex = /(?:api|axios)\.(get|post|put|delete|patch)\(\s*([`'"][^`'"]*[`'"])/g;
  let m;
  while ((m = apiCallRegex.exec(content)) !== null) {
    const method = m[1].toUpperCase();
    let rawPath = m[2].slice(1, -1); // remove quotes
    
    // Normalize path
    let normalized = rawPath.replace(/\$\{[^}]+\}/g, 'mock_param');
    // If it does not start with /api/ but is a relative endpoint passed to baseURL
    if (!normalized.startsWith('/api') && !normalized.startsWith('http')) {
      normalized = '/api' + (normalized.startsWith('/') ? normalized : '/' + normalized);
    }
    
    // Strip query params
    const pathOnly = normalized.split('?')[0];

    // Check if matched in backend routes
    const match = backendRoutes.find(br => {
      if (br.method !== method) return false;
      return br.pattern.test(pathOnly);
    });

    if (!match && !pathOnly.includes('mock_param')) {
      findings.apiRouteMismatches.push({
        file: relFile,
        method,
        path: rawPath,
        resolvedPath: pathOnly
      });
    }
  }
});

// 3. Scan Frontend Elements (Buttons, Forms, Inputs, Keys, Links)
console.log('▶ Auditing Frontend Elements, Forms, Keys & Handlers...');
scanDir(frontendSrc, /\.(jsx|tsx)$/, (file, content) => {
  const relFile = path.relative(rootDir, file);

  // Check buttons without type="button" inside forms or without accessible click handler
  const formBlocks = content.match(/<form[\s\S]*?<\/form>/g) || [];
  for (const form of formBlocks) {
    const buttons = form.match(/<button[^>]*>/g) || [];
    for (const btn of buttons) {
      if (!btn.includes('type=')) {
        findings.frontendElementIssues.push({
          file: relFile,
          issue: 'BUTTON_NO_EXPLICIT_TYPE_IN_FORM',
          detail: `Button inside <form> lacks explicit type="submit" or type="button": ${btn.slice(0, 50)}...`
        });
      }
    }
  }

  // Check for dangerous empty hrefs or broken router links
  const brokenLinks = content.match(/<Link\s+[^>]*to=['"](#|javascript:[^'"]*|)['"][^>]*>/g) || [];
  for (const bl of brokenLinks) {
    findings.frontendElementIssues.push({
      file: relFile,
      issue: 'EMPTY_ROUTER_LINK',
      detail: `Link has empty or fragment "to" prop: ${bl}`
    });
  }

  // Check for .map without key prop
  const mapMatches = content.match(/\.map\(\s*\([^)]*\)\s*=>\s*\(\s*<[A-Za-z0-9_]+/g) || [];
  for (const mm of mapMatches) {
    const tag = mm.split('<')[1];
    // Check if the snippet contains key=
    const idx = content.indexOf(mm);
    const slice = content.slice(idx, idx + 200);
    if (!slice.includes('key=')) {
      findings.frontendElementIssues.push({
        file: relFile,
        issue: 'POTENTIAL_MISSING_KEY_IN_MAP',
        detail: `Render loop <${tag} ... may be missing key prop near: ${mm}`
      });
    }
  }
});

// 4. Audit Backend Controllers for Async Error Handling & Status Codes
console.log('▶ Auditing Backend Controllers for uncaught promises, status codes & inputs...');
scanDir(backendSrc, /\.js$/, (file, content) => {
  const relFile = path.relative(rootDir, file);

  // Check for async route handlers without try/catch or next()
  if (relFile.includes('controllers')) {
    const asyncFunctions = content.match(/export\s+const\s+(\w+)\s*=\s*async\s*\(([^)]*)\)\s*=>\s*\{([\s\S]*?)\n\};/g) || [];
    for (const fn of asyncFunctions) {
      const fnName = fn.match(/export\s+const\s+(\w+)/)[1];
      if (!fn.includes('try {') && !fn.includes('.catch(')) {
        findings.backendControllerIssues.push({
          file: relFile,
          issue: 'CONTROLLER_MISSING_TRY_CATCH',
          detail: `Async controller function "${fnName}" lacks top-level try/catch block`
        });
      }
    }
  }
});

// 5. Check Image and Asset References
console.log('▶ Auditing Local Image Assets and Paths...');
const imagesDir = path.join(rootDir, 'frontend', 'public');
const assetsDir = path.join(rootDir, 'frontend', 'src', 'assets');

scanDir(frontendSrc, /\.(jsx?|tsx?)$/, (file, content) => {
  const relFile = path.relative(rootDir, file);
  // Match static image path strings like '/images/...' or src="..."
  const staticImgRegex = /['"](\/(?:images|assets)\/[a-zA-Z0-9_\-\.\/]+)['"]/g;
  let sm;
  while ((sm = staticImgRegex.exec(content)) !== null) {
    const imgPath = sm[1];
    if (imgPath.startsWith('/images/')) {
      // Check if file exists in frontend/public/images OR backend/public/images
      const publicPath = path.join(rootDir, 'frontend', 'public', imgPath);
      const backendPath = path.join(rootDir, 'backend', 'public', imgPath);
      if (!fs.existsSync(publicPath) && !fs.existsSync(backendPath)) {
        // Also check .webp variant
        const webpPublic = publicPath.replace(/\.(png|jpg|jpeg)$/, '.webp');
        const webpBackend = backendPath.replace(/\.(png|jpg|jpeg)$/, '.webp');
        if (!fs.existsSync(webpPublic) && !fs.existsSync(webpBackend)) {
          findings.imageAndAssetIssues.push({
            file: relFile,
            asset: imgPath
          });
        }
      }
    }
  }
});

console.log('\n=============================================================');
console.log('📋 AUDIT FINDINGS SUMMARY');
console.log('=============================================================');
console.log(`API Route Mismatches: ${findings.apiRouteMismatches.length}`);
findings.apiRouteMismatches.forEach(m => console.log(`  - [${m.method}] ${m.resolvedPath} called in ${m.file}`));

console.log(`Frontend Element Issues: ${findings.frontendElementIssues.length}`);
findings.frontendElementIssues.forEach(e => console.log(`  - ${e.issue} in ${e.file}: ${e.detail}`));

console.log(`Backend Controller Issues: ${findings.backendControllerIssues.length}`);
findings.backendControllerIssues.forEach(c => console.log(`  - ${c.issue} in ${c.file}: ${c.detail}`));

console.log(`Missing Image/Asset Issues: ${findings.imageAndAssetIssues.length}`);
findings.imageAndAssetIssues.forEach(a => console.log(`  - Missing asset reference: "${a.asset}" in ${a.file}`));

console.log('=============================================================\n');
