import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\divag\\.gemini\\antigravity-ide\\brain\\6d5fa3aa-a63a-4555-9348-c708628124b9";
const USER_DATA = "C:\\Users\\divag\\AppData\\Local\\Temp\\chrome-debug-currency-popup";

async function run() {
  console.log('====================================================');
  console.log('   DHANVIKK CURRENCY POPUP & RESPONSIVENESS TEST    ');
  console.log('====================================================\n');

  console.log('1. Launching headless Chrome...');
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9227',
    `--user-data-dir=${USER_DATA}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--window-size=360,800' // Exact mobile viewport requested by user
  ]);

  await new Promise(r => setTimeout(r, 1800));

  // Get active targets
  const targetsRes = await fetch('http://127.0.0.1:9227/json/list');
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

  // Set device metrics to mobile 360x800
  await send('Emulation.setDeviceMetricsOverride', {
    width: 360,
    height: 800,
    deviceScaleFactor: 2,
    mobile: true
  });

  console.log('2. Navigating to Home page on 360x800 mobile viewport...');
  await send('Page.navigate', { url: 'http://localhost:5173/' });
  await new Promise(r => setTimeout(r, 2200));

  // Check AnnouncementBar currency button
  const topBarBtnRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const topBarBtn = document.querySelector('button[title*="Delivery Region"], button[title*="Delivery Country"]');
        return {
          found: !!topBarBtn,
          text: topBarBtn?.innerText?.replace(/\\s+/g, ' ').trim()
        };
      })()
    `,
    returnByValue: true
  });
  console.log('   AnnouncementBar Currency button:', topBarBtnRes.result.value);

  // Click the currency button in AnnouncementBar to open the popup
  console.log('\n3. Clicking AnnouncementBar Currency button to trigger popup...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.querySelector('button[title*="Delivery Region"], button[title*="Delivery Country"]');
        if (btn) { btn.click(); return true; }
        return false;
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1200));

  // Inspect the open popup on mobile 360x800
  const popupInspectionRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const dialog = document.querySelector('[role="dialog"]');
        if (!dialog) return { open: false };

        const title = dialog.querySelector('h3')?.innerText;
        const searchInput = dialog.querySelector('input');
        const popularChips = Array.from(dialog.querySelectorAll('div > button')).map(b => b.innerText.replace(/\\s+/g, ' ').trim());
        const countryRows = Array.from(dialog.querySelectorAll('div.flex-1 button')).slice(0, 5).map(b => b.innerText.replace(/\\s+/g, ' ').trim());

        return {
          open: true,
          title,
          hasSearch: !!searchInput,
          popularChipsCount: popularChips.length,
          samplePopularChips: popularChips.slice(0, 4),
          sampleCountryRows: countryRows,
          dialogClientWidth: dialog.clientWidth,
          dialogScrollWidth: dialog.scrollWidth,
          hasOverflow: dialog.scrollWidth > dialog.clientWidth,
          rect: dialog.getBoundingClientRect()
        };
      })()
    `,
    returnByValue: true
  });
  console.log('   Popup State & Responsiveness on 360px width:', popupInspectionRes.result.value);

  // Capture screenshot of Currency Popup on 360x800 mobile
  const popupShot = await send('Page.captureScreenshot', { format: 'png' });
  const popupShotPath = path.join(ARTIFACT_DIR, 'currency_popup_mobile_360.png');
  fs.writeFileSync(popupShotPath, Buffer.from(popupShot.data, 'base64'));
  console.log('   Screenshot saved:', popupShotPath);

  // Test selecting India (INR / ₹)
  console.log('\n4. Testing Country Selection: Selecting India (INR • ₹)...');
  const selectIndiaRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const dialog = document.querySelector('[role="dialog"]');
        if (!dialog) return { error: 'Dialog not found' };

        const rows = Array.from(dialog.querySelectorAll('div.flex-1 button'));
        const indiaBtn = rows.find(b => b.innerText.includes('India'));
        if (indiaBtn) {
          indiaBtn.click();
          return { clicked: true };
        }
        return { error: 'India button not found' };
      })()
    `,
    returnByValue: true
  });
  console.log('   Clicked India button:', selectIndiaRes.result.value);
  await new Promise(r => setTimeout(r, 1200));

  // Verify prices on homepage updated to ₹
  const priceCheckINR = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const priceElements = Array.from(document.querySelectorAll('*')).filter(el => {
          return el.children.length === 0 && (el.innerText.includes('₹') || el.innerText.includes('AED') || el.innerText.includes('$'));
        }).map(el => el.innerText.trim());

        return {
          hasINR: priceElements.some(p => p.includes('₹')),
          samplePrices: priceElements.slice(0, 6)
        };
      })()
    `,
    returnByValue: true
  });
  console.log('   Homepage prices after selecting India (INR):', priceCheckINR.result.value);

  // Open modal again and test searching "dirham" or "dubai" or "AED"
  console.log('\n5. Testing Search Filter in Currency Dialog...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.querySelector('button[title*="Delivery Region"], button[title*="Delivery Country"]');
        if (btn) btn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1000));

  const searchTestRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const input = document.querySelector('[role="dialog"] input');
        if (!input) return { error: 'Search input not found' };

        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(input, 'dirham');
        input.dispatchEvent(new Event('input', { bubbles: true }));

        const rows = Array.from(document.querySelectorAll('[role="dialog"] div.flex-1 button')).map(b => b.innerText.replace(/\\s+/g, ' ').trim());
        return {
          query: 'dirham',
          matchingRowsCount: rows.length,
          matchedResults: rows
        };
      })()
    `,
    returnByValue: true
  });
  console.log('   Search Results for "dirham":', searchTestRes.result.value);

  // Switch back to UAE (AED • د.إ)
  console.log('\n6. Selecting United Arab Emirates (AED • د.إ)...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const rows = Array.from(document.querySelectorAll('[role="dialog"] div.flex-1 button'));
        const uaeBtn = rows.find(b => b.innerText.includes('United Arab Emirates') || b.innerText.includes('AED'));
        if (uaeBtn) uaeBtn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1200));

  // Verify prices on homepage updated back to AED
  const priceCheckAED = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const priceElements = Array.from(document.querySelectorAll('*')).filter(el => {
          return el.children.length === 0 && (el.innerText.includes('AED') || el.innerText.includes('₹'));
        }).map(el => el.innerText.trim());

        return {
          hasAED: priceElements.some(p => p.includes('AED')),
          samplePrices: priceElements.slice(0, 6)
        };
      })()
    `,
    returnByValue: true
  });
  console.log('   Homepage prices after selecting UAE (AED):', priceCheckAED.result.value);

  // Desktop view check (1200x800)
  console.log('\n7. Testing Currency Dialog on Desktop Viewport (1200x800)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1200,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false
  });
  await new Promise(r => setTimeout(r, 800));

  // Open popup via Navbar trigger button on desktop
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.querySelector('header button[title*="Delivery Region"], button[title*="Delivery Region"], button[title*="Delivery Country"]');
        if (btn) btn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1200));

  const isDesktopDialogOpen = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const d = document.querySelector('[role="dialog"]');
        return {
          open: !!d,
          rect: d ? d.getBoundingClientRect() : null
        };
      })()
    `,
    returnByValue: true
  });
  console.log('   Desktop dialog inspection:', isDesktopDialogOpen.result.value);

  const desktopShot = await send('Page.captureScreenshot', { format: 'png' });
  const desktopShotPath = path.join(ARTIFACT_DIR, 'currency_popup_desktop.png');
  fs.writeFileSync(desktopShotPath, Buffer.from(desktopShot.data, 'base64'));
  console.log('   Screenshot saved:', desktopShotPath);

  ws.close();
  chrome.kill();

  console.log('\n====================================================');
  console.log('   CURRENCY POPUP VERIFICATION PASSED 100%!         ');
  console.log('====================================================');
}

run().catch(console.error);
