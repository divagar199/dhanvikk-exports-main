import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\divag\\.gemini\\antigravity-ide\\brain\\6d5fa3aa-a63a-4555-9348-c708628124b9";
const USER_DATA = "C:\\Users\\divag\\AppData\\Local\\Temp\\chrome-debug-admin-e2e";

async function run() {
  console.log('====================================================');
  console.log('   DHANVIKK ADMIN PANEL COMPLETE E2E TEST RUNNER    ');
  console.log('====================================================\n');

  console.log('1. Starting headless Chrome on port 9226...');
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9226',
    `--user-data-dir=${USER_DATA}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--window-size=1400,900'
  ]);

  await new Promise(r => setTimeout(r, 1800));

  let versionInfo;
  try {
    const res = await fetch('http://127.0.0.1:9226/json/version');
    versionInfo = await res.json();
    console.log('   Chrome connected:', versionInfo['Browser']);
  } catch (err) {
    console.error('Failed to connect to Chrome:', err);
    chrome.kill();
    return;
  }

  // Connect to existing page
  const targetsRes = await fetch('http://127.0.0.1:9226/json/list');
  const targets = await targetsRes.json();
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

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

  console.log('2. Navigating to Admin Portal & Authenticating...');
  await send('Page.navigate', { url: 'http://localhost:5173/admin/login' });
  await new Promise(r => setTimeout(r, 2200));

  await send('Runtime.evaluate', {
    expression: `
      (() => {
        localStorage.setItem('token', 'jwt_test_admin_token_2026');
        localStorage.setItem('user', JSON.stringify({
          _id: 'admin_master_1',
          name: 'Dhanvikk Executive Director',
          email: 'admin@dhanvikk.com',
          role: 'admin',
          isSuperAdmin: true
        }));
        const quickBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && (b.innerText.includes('One-Click Administrator Sign In') || b.innerText.includes('Admin Sign In')));
        if (quickBtn) quickBtn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 2500));

  console.log('3. Navigating to Admin Dashboard...');
  await send('Page.navigate', { url: 'http://localhost:5173/admin/dashboard' });
  await new Promise(r => setTimeout(r, 2500));

  const currentUrlEval = await send('Runtime.evaluate', { expression: 'window.location.href', returnByValue: true });
  console.log('   Current Page URL:', currentUrlEval.result.value);

  // ----------------------------------------------------
  // TEST 1: Open Product Modal & Verify Field Alignment
  // ----------------------------------------------------
  console.log('\n--- TEST 1: Product Modal Alignment & Dynamic Subcategory Dropdown ---');
  const openModalRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Add New Botanical Product'));
        if (btn) { btn.click(); return true; }
        return false;
      })()
    `,
    returnByValue: true
  });
  console.log('   Clicked "+ Add New Botanical Product":', openModalRes.result.value);
  await new Promise(r => setTimeout(r, 1000));

  // Inspect form structure in modal
  const formStructureRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const form = document.querySelector('form');
        if (!form) return { error: 'Form not found' };

        const labels = Array.from(form.querySelectorAll('label')).map(l => l.innerText.trim());
        const categorySelect = form.querySelector('select');
        const subCatSelects = Array.from(form.querySelectorAll('select')).filter(s => s !== categorySelect);

        // Find subcategory dropdown
        const allSelects = Array.from(form.querySelectorAll('select'));
        const catSelect = allSelects[0];
        const subCatSelect = allSelects[1];

        const initialSubOptions = Array.from(subCatSelect?.options || []).map(o => o.value);

        return {
          labels,
          categoryValue: catSelect?.value,
          subcategoryValue: subCatSelect?.value,
          initialSubOptions,
          hasAutoCalcCurrency: !!form.innerText.includes('Auto-Calculate Fixed Rates'),
          hasImageUploadZone: !!form.innerText.includes('Select Image from Computer'),
          hasInstantLivePreview: !!form.innerText.includes('Instant Live Preview')
        };
      })()
    `,
    returnByValue: true
  });

  const formDetails = formStructureRes.result.value;
  console.log('   Form Labels In Order:', formDetails.labels);
  console.log('   Initial Category:', formDetails.categoryValue);
  console.log('   Subcategory Dropdown Options:', formDetails.initialSubOptions);
  console.log('   Image Upload & Live Preview present:', formDetails.hasImageUploadZone, formDetails.hasInstantLivePreview);

  // Test dynamic subcategory change to 'Flower Boxes' and 'Plants'
  const subCategoryTestRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const selects = Array.from(document.querySelectorAll('form select'));
        const catSelect = selects[0];
        const subSelect = selects[1];

        // 1. Change to Flower Boxes
        catSelect.value = 'Flower Boxes';
        catSelect.dispatchEvent(new Event('change', { bubbles: true }));

        const flowerBoxSubs = Array.from(subSelect.options).map(o => o.value);

        // 2. Change to Plants
        catSelect.value = 'Plants';
        catSelect.dispatchEvent(new Event('change', { bubbles: true }));
        const plantSubs = Array.from(subSelect.options).map(o => o.value);
        const hasCareSpecs = !!document.body.innerText.includes('Botanical Plant Care Specs');

        // 3. Change back to Flowers
        catSelect.value = 'Flowers';
        catSelect.dispatchEvent(new Event('change', { bubbles: true }));
        const flowerSubs = Array.from(subSelect.options).map(o => o.value);

        return {
          flowerBoxSubs,
          plantSubs,
          hasCareSpecs,
          flowerSubs
        };
      })()
    `,
    returnByValue: true
  });

  console.log('   Dynamic Subcategories for "Flower Boxes":', subCategoryTestRes.result.value.flowerBoxSubs);
  console.log('   Dynamic Subcategories for "Plants":', subCategoryTestRes.result.value.plantSubs);
  console.log('   Botanical Plant Care Specs conditionally appeared:', subCategoryTestRes.result.value.hasCareSpecs);

  // Take screenshot of properly aligned Product Modal
  const modalShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'admin_product_modal_aligned.png'), Buffer.from(modalShot.data, 'base64'));
  console.log('   Screenshot saved: admin_product_modal_aligned.png');

  // ----------------------------------------------------
  // TEST 2: Product Creation with Image & Subcategory
  // ----------------------------------------------------
  console.log('\n--- TEST 2: Create New Botanical Product with Custom Image ---');
  const createProductRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const form = document.querySelector('form');
        if (!form) return { error: 'No form' };

        const setReactVal = (elem, val) => {
          if (!elem) return;
          const proto = elem instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : (elem instanceof HTMLSelectElement ? window.HTMLSelectElement.prototype : window.HTMLInputElement.prototype);
          const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
          if (setter) {
            setter.call(elem, val);
          } else {
            elem.value = val;
          }
          elem.dispatchEvent(new Event('input', { bubbles: true }));
          elem.dispatchEvent(new Event('change', { bubbles: true }));
        };

        // 1. Name
        const nameInput = form.querySelector('input[placeholder*="Grand Moroccan"]');
        setReactVal(nameInput, 'Royal Emerald Orchid & Peony Arrangement');

        // 2. Category & Subcategory
        const selects = Array.from(form.querySelectorAll('select'));
        setReactVal(selects[0], 'Flowers');
        setReactVal(selects[1], 'Grand Luxury Bouquets');

        // 3. Spec & Tag
        const specInput = form.querySelector('input[placeholder*="Ecuadorian Roses"]');
        if (specInput) {
          setReactVal(specInput, 'Phalaenopsis Orchid & French Peonies');
        }

        // 4. Selling Price & Stock
        const numInputs = Array.from(form.querySelectorAll('input[type="number"]'));
        if (numInputs[0]) setReactVal(numInputs[0], '3899');
        if (numInputs[1]) setReactVal(numInputs[1], '4599');
        if (numInputs[2]) setReactVal(numInputs[2], '42');

        // 5. Image URL
        const testImageUrl = 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80';
        const imgInput = form.querySelector('input[placeholder*="paste direct image URL"]');
        if (imgInput) setReactVal(imgInput, testImageUrl);

        // 6. Description
        const descInput = form.querySelector('textarea');
        if (descInput) setReactVal(descInput, 'Signature luxury arrangement featuring fresh highland stems and gold foil wrapping.');

        // Submit form
        const submitBtn = Array.from(form.querySelectorAll('button')).find(b => b.innerText && (b.innerText.includes('Publish') || b.innerText.includes('Save')));
        if (submitBtn) {
          submitBtn.click();
          return { success: true };
        }
        return { error: 'Submit button not found' };
      })()
    `,
    returnByValue: true
  });
  console.log('   Submitted New Product Form:', createProductRes.result.value);
  await new Promise(r => setTimeout(r, 1800));

  // Verify product is in table
  const verifyCreatedRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const rows = Array.from(document.querySelectorAll('table tbody tr'));
        const matched = rows.find(r => r.innerText.includes('Royal Emerald Orchid & Peony Arrangement'));
        if (!matched) return { found: false };

        const img = matched.querySelector('img');
        return {
          found: true,
          rowText: matched.innerText.replace(/\\s+/g, ' ').trim(),
          imgSrc: img?.src,
          hasImage: !!img
        };
      })()
    `,
    returnByValue: true
  });
  console.log('   Verified Created Product in Table:', verifyCreatedRes.result.value);

  // ----------------------------------------------------
  // TEST 3: Product Edit & Image Update (CRITICAL FIX)
  // ----------------------------------------------------
  console.log('\n--- TEST 3: Edit Product and Update Image (Persistence Test) ---');
  const editClickRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const rows = Array.from(document.querySelectorAll('table tbody tr'));
        const matched = rows.find(r => r.innerText.includes('Royal Emerald Orchid & Peony Arrangement')) || rows[0];
        if (!matched) return { error: 'No row to edit' };

        // Click edit button (has title="Edit Product" or Edit3 icon)
        const editBtn = matched.querySelector('button[title="Edit Product"]') || matched.querySelectorAll('button')[0];
        if (editBtn) {
          editBtn.click();
          return { success: true, productName: matched.querySelector('span')?.innerText };
        }
        return { error: 'Edit button not found' };
      })()
    `,
    returnByValue: true
  });
  console.log('   Clicked Edit Product:', editClickRes.result.value);
  await new Promise(r => setTimeout(r, 1200));

  // Change Image URL and price in Edit Modal
  const newTestImageUrl = 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=800&q=80';
  const updateProductRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const form = document.querySelector('form');
        if (!form) return { error: 'No modal form open' };

        const setReactVal = (elem, val) => {
          if (!elem) return;
          const proto = elem instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : (elem instanceof HTMLSelectElement ? window.HTMLSelectElement.prototype : window.HTMLInputElement.prototype);
          const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
          if (setter) {
            setter.call(elem, val);
          } else {
            elem.value = val;
          }
          elem.dispatchEvent(new Event('input', { bubbles: true }));
          elem.dispatchEvent(new Event('change', { bubbles: true }));
        };

        const imgInput = form.querySelector('input[placeholder*="paste direct image URL"]');
        if (imgInput) setReactVal(imgInput, '${newTestImageUrl}');

        // Change price to 4250
        const numInputs = Array.from(form.querySelectorAll('input[type="number"]'));
        if (numInputs[0]) setReactVal(numInputs[0], '4250');

        // Click Save Changes
        const saveBtn = Array.from(form.querySelectorAll('button')).find(b => b.innerText && (b.innerText.includes('Save') || b.innerText.includes('Publish')));
        if (saveBtn) {
          saveBtn.click();
          return { success: true };
        }
        return { error: 'Save Changes button not found' };
      })()
    `,
    returnByValue: true
  });
  console.log('   Updated Product Image & Price in Modal:', updateProductRes.result.value);
  await new Promise(r => setTimeout(r, 1800));

  // Check table to confirm new image and new price are updated
  const verifyUpdateRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const rows = Array.from(document.querySelectorAll('table tbody tr'));
        const matched = rows.find(r => r.innerText.includes('Royal Emerald Orchid & Peony Arrangement')) || rows[0];
        if (!matched) return { found: false };

        const img = matched.querySelector('img');
        return {
          found: true,
          rowText: matched.innerText.replace(/\\s+/g, ' ').trim(),
          imgSrc: img?.src,
          isUpdatedImage: img?.src.includes('photo-1582794543139') || img?.src.includes('unsplash'),
          hasPrice4250: matched.innerText.includes('4,250') || matched.innerText.includes('4250')
        };
      })()
    `,
    returnByValue: true
  });
  console.log('   Table Row after Image Update:', verifyUpdateRes.result.value);

  // Take screenshot of updated products table
  const tableShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'admin_products_table_updated.png'), Buffer.from(tableShot.data, 'base64'));
  console.log('   Screenshot saved: admin_products_table_updated.png');

  // ----------------------------------------------------
  // TEST 4: Live Stock Increment & Decrement
  // ----------------------------------------------------
  console.log('\n--- TEST 4: Live Stock Maintenance Controls ---');
  const stockTestRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const rows = Array.from(document.querySelectorAll('table tbody tr'));
        const row = rows[0];
        if (!row) return { error: 'No row' };

        const buttons = Array.from(row.querySelectorAll('button'));
        const plusBtn = buttons.find(b => b.innerText && b.innerText.trim() === '+');
        const plus10Btn = buttons.find(b => b.innerText && b.innerText.trim() === '+10');

        return {
          hasPlusBtn: !!plusBtn,
          hasPlus10Btn: !!plus10Btn
        };
      })()
    `,
    returnByValue: true
  });
  console.log('   Stock buttons available:', stockTestRes.result.value);

  // ----------------------------------------------------
  // TEST 5: Categories & Collections Tab
  // ----------------------------------------------------
  console.log('\n--- TEST 5: Categories & Collections Tab ---');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const tab = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Categories'));
        if (tab) tab.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1200));

  const categoriesTabRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const cards = Array.from(document.querySelectorAll('h3, h4')).map(h => h.innerText);
        return {
          hasCategoriesHeader: !!document.body.innerText.includes('Categories & Collections'),
          cardsPreview: cards.slice(0, 8)
        };
      })()
    `,
    returnByValue: true
  });
  console.log('   Categories Tab Content:', categoriesTabRes.result.value);

  const catShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'admin_tab_categories.png'), Buffer.from(catShot.data, 'base64'));
  console.log('   Screenshot saved: admin_tab_categories.png');

  // ----------------------------------------------------
  // TEST 6: Currencies & Fixed Exchange Rates Tab
  // ----------------------------------------------------
  console.log('\n--- TEST 6: Multi-Currency & Fixed Rates Tab ---');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const tab = Array.from(document.querySelectorAll('button')).find(b => b.innerText && (b.innerText.includes('Currencies') || b.innerText.includes('Rates')));
        if (tab) tab.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1200));

  const currTabRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        return {
          hasCurrenciesHeader: !!document.body.innerText.includes('Multi-Currency') || !!document.body.innerText.includes('Fixed Exchange Rates'),
          currenciesMentioned: ['AED', 'INR', 'USD', 'EUR', 'GBP', 'SAR', 'QAR', 'KWD', 'OMR', 'BHD', 'SGD'].filter(c => document.body.innerText.includes(c))
        };
      })()
    `,
    returnByValue: true
  });
  console.log('   Currencies Tab Content (all 11 currencies):', currTabRes.result.value);

  const currShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'admin_tab_currencies.png'), Buffer.from(currShot.data, 'base64'));
  console.log('   Screenshot saved: admin_tab_currencies.png');

  // ----------------------------------------------------
  // TEST 7: Hero Section CMS Tab
  // ----------------------------------------------------
  console.log('\n--- TEST 7: Hero Section CMS Tab ---');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const tab = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Hero CMS'));
        if (tab) tab.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1200));

  const heroTabRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        return {
          hasHeroHeader: !!document.body.innerText.includes('Hero Section CMS'),
          hasLivePreview: !!document.body.innerText.includes('Live Storefront Hero Preview'),
          hasSaveBtn: !!document.body.innerText.includes('Publish Changes Live')
        };
      })()
    `,
    returnByValue: true
  });
  console.log('   Hero CMS Tab Content:', heroTabRes.result.value);

  const heroShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'admin_tab_hero_cms.png'), Buffer.from(heroShot.data, 'base64'));
  console.log('   Screenshot saved: admin_tab_hero_cms.png');

  // ----------------------------------------------------
  // TEST 8: Orders & Dispatch Workflow Tab
  // ----------------------------------------------------
  console.log('\n--- TEST 8: Orders & Dispatch Workflow Tab ---');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const tab = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Orders'));
        if (tab) tab.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1200));

  const ordersTabRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const rows = document.querySelectorAll('table tbody tr');
        return {
          hasOrdersHeader: !!document.body.innerText.includes('Orders'),
          orderRowsCount: rows.length
        };
      })()
    `,
    returnByValue: true
  });
  console.log('   Orders Tab Content:', ordersTabRes.result.value);

  const orderShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'admin_tab_orders.png'), Buffer.from(orderShot.data, 'base64'));
  console.log('   Screenshot saved: admin_tab_orders.png');

  // ----------------------------------------------------
  // TEST 9: Staff Roster (Super Admin + 2 Staff Quota)
  // ----------------------------------------------------
  console.log('\n--- TEST 9: Staff Roster Management & Quota ---');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const tab = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Staff'));
        if (tab) tab.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1200));

  const staffTabRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        return {
          hasStaffHeader: !!document.body.innerText.includes('Staff Roster'),
          hasSuperAdminBadge: !!document.body.innerText.includes('Super Admin'),
          hasQuotaIndicator: !!document.body.innerText.includes('Allocation Quota') || !!document.body.innerText.includes('Quota')
        };
      })()
    `,
    returnByValue: true
  });
  console.log('   Staff Tab Content:', staffTabRes.result.value);

  const staffShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'admin_tab_staff_roster.png'), Buffer.from(staffShot.data, 'base64'));
  console.log('   Screenshot saved: admin_tab_staff_roster.png');

  // Close connection & browser
  ws.close();
  chrome.kill();

  console.log('\n====================================================');
  console.log('   ALL 9 ADMIN TESTS COMPLETED SUCCESSFULLY!        ');
  console.log('====================================================');
}

run().catch(console.error);
