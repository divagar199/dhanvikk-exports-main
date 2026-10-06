import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\divag\\.gemini\\antigravity-ide\\brain\\6d5fa3aa-a63a-4555-9348-c708628124b9";
const USER_DATA = "C:\\Users\\divag\\AppData\\Local\\Temp\\chrome-debug-360";

async function run() {
  console.log('Starting headless Chrome...');
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9225',
    `--user-data-dir=${USER_DATA}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--window-size=360,800'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  let versionInfo;
  try {
    const res = await fetch('http://127.0.0.1:9225/json/version');
    versionInfo = await res.json();
    console.log('Connected to Chrome version:', versionInfo['Browser']);
  } catch (err) {
    console.error('Failed to connect to Chrome:', err);
    chrome.kill();
    return;
  }

  // Connect to page
  const targetsRes = await fetch('http://127.0.0.1:9225/json/list');
  const targets = await targetsRes.json();
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  const wsUrl = pageTarget.webSocketDebuggerUrl;

  const ws = new WebSocket(wsUrl);

  let idCounter = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = idCounter++;
    const handler = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.id === id) {
        ws.removeEventListener('message', handler);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });

  await new Promise(r => ws.addEventListener('open', r));
  console.log('WebSocket connected to page!');

  // Set device metrics to exact 360 x 800 with mobile flag
  await send('Emulation.setDeviceMetricsOverride', {
    width: 360,
    height: 800,
    deviceScaleFactor: 2,
    mobile: true
  });
  await send('Page.enable');
  await send('Runtime.enable');

  const testPages = [
    { name: 'homepage', url: 'http://localhost:5173/' },
    { name: 'admin_login', url: 'http://localhost:5173/admin/login' },
    { name: 'admin_dashboard', url: 'http://localhost:5173/admin/dashboard' },
    { name: 'product_detail', url: 'http://localhost:5173/product/midnight-orchid-serenity' }
  ];

  for (const page of testPages) {
    console.log(`\nNavigating to ${page.name} (${page.url})...`);
    await send('Page.navigate', { url: page.url });
    await new Promise(r => setTimeout(r, 2000));

    // Evaluate scroll dimensions
    const evalRes = await send('Runtime.evaluate', {
      expression: `
        JSON.stringify({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          bodyScrollWidth: document.body.scrollWidth,
          hasLateralScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth
        })
      `,
      returnByValue: true
    });

    const metrics = JSON.parse(evalRes.result.value);
    console.log(`Results for ${page.name}:`, metrics);

    // Capture screenshot
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const shotPath = path.join(ARTIFACT_DIR, `mobile_360_${page.name}.png`);
    fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
    console.log(`Saved screenshot to: ${shotPath}`);
  }

  // Also test admin modal by clicking Add Floral Product
  console.log('\nTesting Admin Dashboard Modal on 360x800...');
  await send('Page.navigate', { url: 'http://localhost:5173/admin/dashboard' });
  await new Promise(r => setTimeout(r, 1500));

  // Click Add Product button
  const clickRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Add Floral Product'));
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `,
    returnByValue: true
  });
  console.log('Clicked Add Floral Product button:', clickRes.result.value);
  await new Promise(r => setTimeout(r, 1000));

  const modalShot = await send('Page.captureScreenshot', { format: 'png' });
  const modalShotPath = path.join(ARTIFACT_DIR, 'mobile_360_admin_product_modal.png');
  fs.writeFileSync(modalShotPath, Buffer.from(modalShot.data, 'base64'));
  console.log(`Saved modal screenshot to: ${modalShotPath}`);

  ws.close();
  chrome.kill();
  console.log('\nMobile verification testing complete!');
}

run().catch(console.error);
