import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\divag\\.gemini\\antigravity-ide\\brain\\6d5fa3aa-a63a-4555-9348-c708628124b9";
const USER_DATA = "C:\\Users\\divag\\AppData\\Local\\Temp\\chrome-debug-admin-layout";

async function run() {
  console.log('====================================================');
  console.log('   DHANVIKK ADMIN PANEL LAYOUT & RESPONSIVENESS TEST ');
  console.log('====================================================\n');

  console.log('1. Launching headless Chrome...');
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9229',
    `--user-data-dir=${USER_DATA}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--window-size=1440,900'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  // Get active targets
  const targetsRes = await fetch('http://127.0.0.1:9229/json/list');
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
  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  const evalCode = async (expression) => {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res?.result?.value;
  };

  const takeScreenshot = async (filename) => {
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(shot.data, 'base64');
    const outPath = path.join(ARTIFACT_DIR, filename);
    fs.writeFileSync(outPath, buffer);
    console.log(`   Screenshot saved: ${outPath}`);
    return outPath;
  };

  console.log('2. Navigating to http://localhost:5173/admin/dashboard...');
  await send('Page.navigate', { url: 'http://localhost:5173/admin/dashboard' });
  await new Promise(r => setTimeout(r, 2000));

  // Check if we need to sign in
  const checkAndLogin = await evalCode(`
    (async () => {
      // Check if One-Click Administrator Sign In button exists
      const buttons = Array.from(document.querySelectorAll('button'));
      const oneClickBtn = buttons.find(b => b.textContent.includes('One-Click Administrator Sign In') || b.textContent.includes('Admin Sign In'));
      if (oneClickBtn) {
        oneClickBtn.click();
        return { clickedOneClick: true };
      }
      const enterPortalBtn = buttons.find(b => b.textContent.includes('Enter Admin Portal'));
      const emailInput = document.querySelector('input[type="email"]') || document.querySelector('input[placeholder*="email"]');
      const passInput = document.querySelector('input[type="password"]');
      if (enterPortalBtn && emailInput && passInput) {
        emailInput.value = 'admin@dhanvikk.com';
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        passInput.value = 'AdminBloom@2026';
        passInput.dispatchEvent(new Event('input', { bubbles: true }));
        enterPortalBtn.click();
        return { clickedEnterPortal: true };
      }
      return { alreadyLoggedIn: true };
    })()
  `);
  console.log('   Auth Check Result:', checkAndLogin);
  await new Promise(r => setTimeout(r, 3500));

  let currentUrl = await evalCode('window.location.href');
  console.log(`   Current URL after auth: ${currentUrl}`);

  // 4. Desktop Viewport Test
  console.log('\n4. Testing Desktop Viewport (1440x900)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });
  await new Promise(r => setTimeout(r, 1500));

  const desktopInfo = await evalCode(`
    (() => {
      const sidebar = document.querySelector('aside');
      const header = document.querySelector('header');
      const rightContent = document.querySelector('div.flex-1.min-w-0');
      const menuItems = Array.from(document.querySelectorAll('aside button')).map(b => b.textContent.trim());
      return {
        hasSidebar: !!sidebar,
        sidebarWidth: sidebar ? sidebar.offsetWidth : 0,
        rightContentWidth: rightContent ? rightContent.offsetWidth : 0,
        menuItemsCount: menuItems.length,
        menuItemsSample: menuItems.slice(0, 5)
      };
    })()
  `);
  console.log('   Desktop Layout inspection:', desktopInfo);
  await takeScreenshot('admin_dashboard_desktop_layout.png');

  // 5. Test Switching Tab to Orders
  console.log('\n5. Testing Left Menu Navigation: Clicking Orders Pipeline...');
  const switchTab = await evalCode(`
    (() => {
      const buttons = Array.from(document.querySelectorAll('aside button'));
      const ordersBtn = buttons.find(b => b.textContent.includes('Orders') || b.textContent.includes('Pipeline'));
      if (ordersBtn) {
        ordersBtn.click();
        return { clicked: true, text: ordersBtn.textContent.trim() };
      }
      return { clicked: false };
    })()
  `);
  console.log('   Tab Click Result:', switchTab);
  await new Promise(r => setTimeout(r, 1200));
  await takeScreenshot('admin_dashboard_desktop_orders.png');

  // Switch back to Products & Stock tab
  await evalCode(`
    (() => {
      const buttons = Array.from(document.querySelectorAll('aside button'));
      const prodBtn = buttons.find(b => b.textContent.includes('Products') || b.textContent.includes('Inventory'));
      if (prodBtn) prodBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  // 6. Mobile Viewport Test (375x812)
  console.log('\n6. Testing Mobile Viewport (375x812)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 812,
    deviceScaleFactor: 2,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 1500));

  const mobileInfo = await evalCode(`
    (() => {
      const hamburger = document.querySelector('button[aria-label*="Admin Navigation Menu"]') || document.querySelector('header button');
      const permanentSidebar = document.querySelector('aside.hidden.lg\\:flex');
      return {
        hasHamburger: !!hamburger,
        permanentSidebarHidden: permanentSidebar ? window.getComputedStyle(permanentSidebar).display === 'none' : true
      };
    })()
  `);
  console.log('   Mobile Layout inspection:', mobileInfo);
  await takeScreenshot('admin_dashboard_mobile_layout.png');

  // 7. Test Clicking Hamburger Drawer
  console.log('\n7. Clicking Hamburger Button to open Mobile Drawer...');
  const drawerClick = await evalCode(`
    (() => {
      const hamburger = document.querySelector('button[aria-label*="Admin Navigation Menu"]');
      if (hamburger) {
        hamburger.click();
        return { clicked: true };
      }
      return { clicked: false };
    })()
  `);
  console.log('   Hamburger Click Result:', drawerClick);
  await new Promise(r => setTimeout(r, 1000));

  const drawerInfo = await evalCode(`
    (() => {
      const drawer = document.querySelector('.fixed.inset-0.z-50.lg\\:hidden');
      return {
        drawerOpen: !!drawer
      };
    })()
  `);
  console.log('   Mobile Drawer State:', drawerInfo);
  await takeScreenshot('admin_dashboard_mobile_drawer_open.png');

  console.log('\n====================================================');
  console.log('   ADMIN LAYOUT VERIFICATION COMPLETE!             ');
  console.log('====================================================\n');

  ws.close();
  chrome.kill();
  process.exit(0);
}

run().catch((err) => {
  console.error('Test script error:', err);
  process.exit(1);
});
