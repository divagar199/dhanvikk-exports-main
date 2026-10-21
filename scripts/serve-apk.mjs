import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APK_DIR = path.resolve(__dirname, '..', 'apks');

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal && !net.address.startsWith('169.254')) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const localIp = getLocalIp();
const PORT = 8080;

const server = http.createServer((req, res) => {
  const url = req.url || '/';

  if (url === '/download/release' || url === '/Dhanvikk-Blooms-Release.apk' || url === '/Dhanvikk.apk' || url === '/Dhanvikk-Final.apk') {
    const filePath = path.join(APK_DIR, 'Dhanvikk-Blooms-Release.apk');
    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Release APK not found');
    }
    const stat = fs.statSync(filePath);
    res.writeHead(200, {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Disposition': 'attachment; filename="Dhanvikk-Blooms-Release.apk"',
      'Content-Length': stat.size,
    });
    return fs.createReadStream(filePath).pipe(res);
  }

  if (url === '/download/debug' || url === '/Dhanvikk-Blooms-Debug.apk') {
    const filePath = path.join(APK_DIR, 'Dhanvikk-Blooms-Debug.apk');
    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Debug APK not found');
    }
    const stat = fs.statSync(filePath);
    res.writeHead(200, {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Disposition': 'attachment; filename="Dhanvikk-Blooms-Debug.apk"',
      'Content-Length': stat.size,
    });
    return fs.createReadStream(filePath).pipe(res);
  }

  const releasePath = path.join(APK_DIR, 'Dhanvikk-Blooms-Release.apk');
  const releaseSize = fs.existsSync(releasePath) ? (fs.statSync(releasePath).size / (1024 * 1024)).toFixed(1) : '102';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dhanvikk Blooms - Mobile Download</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
    .card { background: #1e293b; border-radius: 20px; max-width: 420px; width: 100%; padding: 32px 24px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.4); border: 1px solid #334155; }
    .badge { display: inline-block; background: rgba(233, 30, 99, 0.15); color: #f43f5e; padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; border: 1px solid rgba(244, 63, 94, 0.3); }
    h1 { font-size: 24px; font-weight: 800; color: #ffffff; margin-bottom: 8px; }
    p.desc { font-size: 14px; color: #94a3b8; line-height: 1.5; margin-bottom: 24px; }
    .btn { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 16px; border-radius: 14px; font-weight: 700; font-size: 16px; text-decoration: none; transition: transform 0.15s, opacity 0.15s; cursor: pointer; }
    .btn:active { transform: scale(0.98); }
    .btn-primary { background: linear-gradient(135deg, #e11d48, #be123c); color: white; box-shadow: 0 10px 20px rgba(225, 29, 72, 0.35); margin-bottom: 12px; }
    .btn-secondary { background: #334155; color: #cbd5e1; font-size: 14px; padding: 12px; }
    .info { margin-top: 24px; padding: 16px; background: #0f172a; border-radius: 12px; text-align: left; font-size: 12px; color: #94a3b8; line-height: 1.6; }
    .info strong { color: #f1f5f9; }
    .meta { display: flex; justify-content: space-around; margin: 18px 0; border-top: 1px solid #334155; border-bottom: 1px solid #334155; padding: 12px 0; }
    .meta-item { text-align: center; }
    .meta-label { font-size: 11px; color: #64748b; text-transform: uppercase; }
    .meta-value { font-size: 14px; font-weight: 700; color: #e2e8f0; margin-top: 2px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">&#10047; Official Mobile Build</div>
    <h1>Dhanvikk Blooms</h1>
    <p class="desc">Luxury botanical commerce & flower gifting platform for Android.</p>
    
    <div class="meta">
      <div class="meta-item">
        <div class="meta-label">Version</div>
        <div class="meta-value">v1.0.0</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Type</div>
        <div class="meta-value">Production</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Size</div>
        <div class="meta-value">${releaseSize} MB</div>
      </div>
    </div>

    <a href="/download/release" class="btn btn-primary">
      &#128229; Download Release APK
    </a>

    <a href="/download/debug" class="btn btn-secondary">
      Download Debug APK (Dev Client)
    </a>

    <div class="info">
      <strong>Installation Steps:</strong><br>
      1. Tap "Download Release APK" above.<br>
      2. Once downloaded, tap the notification to open.<br>
      3. If Android prompts "Allow from this source", tap <strong>Settings &rarr; Allow</strong>.<br>
      4. Tap <strong>Install</strong> and open the app!
    </div>
  </div>
</body>
</html>`;

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`[Dhanvikk APK Server Running]`);
  console.log(`Open this URL on your mobile phone (same Wi-Fi):`);
  console.log(`   http://${localIp}:${PORT}`);
  console.log(`Direct Download Link:`);
  console.log(`   http://${localIp}:${PORT}/download/release`);
  console.log(`======================================================\n`);
});
