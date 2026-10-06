// Automated E2E verification test suite for Dhanvikk Luxury Botanicals
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';

function request(method, endpoint, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Accept': 'application/json',
        ...headers
      }
    };

    let bodyData = null;
    if (data && !(data instanceof Buffer) && !headers['Content-Type']?.includes('multipart/form-data')) {
      bodyData = JSON.stringify(data);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(bodyData);
    } else if (data instanceof Buffer) {
      bodyData = data;
      options.headers['Content-Length'] = data.length;
    }

    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => raw += chunk);
      res.on('end', () => {
        try {
          const parsed = raw ? JSON.parse(raw) : null;
          resolve({ status: res.statusCode, body: parsed, raw });
        } catch (e) {
          resolve({ status: res.statusCode, body: raw, raw });
        }
      });
    });

    req.on('error', reject);
    if (bodyData) req.write(bodyData);
    req.end();
  });
}

function createMultipartFormData(boundary, fields, files) {
  const parts = [];

  for (const [key, val] of Object.entries(fields)) {
    parts.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${val}\r\n`
    ));
  }

  for (const file of files) {
    parts.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="${file.fieldName}"; filename="${file.fileName}"\r\nContent-Type: ${file.contentType}\r\n\r\n`
    ));
    parts.push(file.content);
    parts.push(Buffer.from('\r\n'));
  }

  parts.push(Buffer.from(`--${boundary}--\r\n`));
  return Buffer.concat(parts);
}

async function runTests() {
  console.log('====================================================');
  console.log('🏆 DHANVIKK LUXURY BOTANICALS - COMPLETE E2E TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    process.stdout.write(`⏳ ${name}... `);
    try {
      await fn();
      console.log('✅ PASS');
      passed++;
    } catch (err) {
      console.log(`❌ FAIL: ${err.message}`);
      failed++;
    }
  }

  // 1. Health check
  await test('1. Health Check Endpoint (/api/health)', async () => {
    const res = await request('GET', '/api/health');
    if (res.status !== 200 || res.body.status !== 'healthy') {
      throw new Error(`Expected 200 healthy, got ${res.status}`);
    }
  });

  // 2. Products List
  await test('2. Product Catalog Retrieval (/api/products)', async () => {
    const res = await request('GET', '/api/products');
    if (res.status !== 200 || !res.body.success || !Array.isArray(res.body.products)) {
      throw new Error(`Failed to load product catalog`);
    }
    if (res.body.products.length === 0) {
      throw new Error(`Product catalog returned empty list`);
    }
  });

  // 3. Category Filter
  await test('3. Filter Catalog by Category (e.g. Flowers)', async () => {
    const res = await request('GET', '/api/products?category=Flowers');
    if (res.status !== 200 || !res.body.success) {
      throw new Error(`Category filter failed`);
    }
    const allFlowers = res.body.products.every(p => p.category === 'Flowers');
    if (!allFlowers) {
      throw new Error(`Not all returned products match category Flowers`);
    }
  });

  // 4. Super Admin Info
  await test('4. Super Admin Config Info (/api/admin/staff/info)', async () => {
    const res = await request('GET', '/api/admin/staff/info');
    if (res.status !== 200 || !res.body.success) {
      throw new Error(`Failed to get super admin info`);
    }
    if (res.body.superAdminEmail !== 'divagar.m.msc.cs@gmail.com') {
      throw new Error(`Expected super admin divagar.m.msc.cs@gmail.com, got ${res.body.superAdminEmail}`);
    }
  });

  // 5. Staff Roster (Simulated Super Admin Email Header)
  await test('5. Retrieve Staff Roster with Super Admin Privileges', async () => {
    const res = await request('GET', '/api/admin/staff', null, {
      'x-user-email': 'divagar.m.msc.cs@gmail.com'
    });
    if (res.status !== 200 || !res.body.success || !Array.isArray(res.body.staff)) {
      throw new Error(`Failed to retrieve staff roster: ${JSON.stringify(res.body)}`);
    }
  });

  // 6. Add New Staff Member
  let testStaffId = null;
  const testEmail = `florist.test.${Date.now()}@dhanvikk.com`;
  await test('6. Super Admin Adds Staff Member (/api/admin/staff)', async () => {
    const res = await request('POST', '/api/admin/staff', {
      name: 'Master Floral Designer',
      email: testEmail,
      role: 'staff',
      permissions: ['products', 'orders']
    }, {
      'x-user-email': 'divagar.m.msc.cs@gmail.com'
    });
    if (res.status !== 201 || !res.body.success) {
      throw new Error(`Failed to onboard staff: ${JSON.stringify(res.body)}`);
    }
    testStaffId = res.body.staff?.id || res.body.staff?._id;
  });

  // 7. Update Staff Permissions
  await test('7. Update Staff Permissions & Status', async () => {
    if (!testStaffId) throw new Error('No staff ID from previous step');
    const res = await request('PUT', `/api/admin/staff/${testStaffId}`, {
      status: 'active',
      permissions: ['products', 'orders', 'inventory']
    }, {
      'x-user-email': 'divagar.m.msc.cs@gmail.com'
    });
    if (res.status !== 200 || !res.body.success) {
      throw new Error(`Failed to update staff: ${JSON.stringify(res.body)}`);
    }
  });

  // 8. Delete Staff Member
  await test('8. Delete Staff Member', async () => {
    if (!testStaffId) throw new Error('No staff ID from previous step');
    const res = await request('DELETE', `/api/admin/staff/${testStaffId}`, null, {
      'x-user-email': 'divagar.m.msc.cs@gmail.com'
    });
    if (res.status !== 200 || !res.body.success) {
      throw new Error(`Failed to delete staff: ${JSON.stringify(res.body)}`);
    }
  });

  // 9. Guard Super Admin Against Deletion
  await test('9. Safety Guard: Super Admin Cannot Be Deleted', async () => {
    const res = await request('DELETE', '/api/admin/staff/staff-super-01', null, {
      'x-user-email': 'divagar.m.msc.cs@gmail.com'
    });
    if (res.status !== 403) {
      throw new Error(`Expected 403 Forbidden when deleting Super Admin, got ${res.status}`);
    }
  });

  // 10. Upload Local Image File
  let uploadedLocalUrl = null;
  await test('10. Upload Local Image File (/api/products/upload)', async () => {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    // 1x1 transparent PNG buffer
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const multipartBody = createMultipartFormData(boundary, {}, [{
      fieldName: 'image',
      fileName: 'botanical_test_bloom.png',
      contentType: 'image/png',
      content: pngBuffer
    }]);

    const res = await request('POST', '/api/products/upload', multipartBody, {
      'Content-Type': `multipart/form-data; boundary=${boundary}`
    });

    const url = res.body?.relativeUrl || res.body?.imageUrl;
    if (res.status !== 200 || !res.body.success || !url) {
      throw new Error(`Failed to upload local image: ${JSON.stringify(res.body)}`);
    }
    uploadedLocalUrl = res.body.relativeUrl;
    if (!uploadedLocalUrl.startsWith('/uploads/')) {
      throw new Error(`Expected url to start with /uploads/, got ${uploadedLocalUrl}`);
    }
  });

  // 11. Retrieve Local Upload Gallery (/api/products/local-images)
  await test('11. Retrieve Local Upload Gallery (/api/products/local-images)', async () => {
    const res = await request('GET', '/api/products/local-images');
    if (res.status !== 200 || !res.body.success || !Array.isArray(res.body.images)) {
      throw new Error(`Failed to retrieve local gallery`);
    }
    const found = res.body.images.some(img => img.relativeUrl === uploadedLocalUrl || img.url === uploadedLocalUrl);
    if (!found) {
      throw new Error(`Uploaded image ${uploadedLocalUrl} not found in gallery listing`);
    }
  });

  // 12. Create Product with Local Image
  let createdProductId = null;
  await test('12. Create Product with Category & Local Image (/api/products)', async () => {
    const res = await request('POST', '/api/products', {
      name: 'E2E Test Orchid Royale',
      price: 1850,
      currency: 'INR',
      category: 'Plants',
      inStock: true,
      stockCount: 15,
      images: [uploadedLocalUrl || '/uploads/sample.png'],
      description: 'End to end verified luxury botanical plant.'
    });

    if (res.status !== 201 || !res.body.success || !res.body.product?.id) {
      throw new Error(`Failed to create product: ${JSON.stringify(res.body)}`);
    }
    createdProductId = res.body.product.id;
  });

  // 13. Update Created Product
  await test('13. Update Created Product', async () => {
    if (!createdProductId) throw new Error('No product ID to update');
    const res = await request('PUT', `/api/products/${createdProductId}`, {
      price: 2100,
      stockCount: 20
    });
    if (res.status !== 200 || !res.body.success) {
      throw new Error(`Failed to update product: ${JSON.stringify(res.body)}`);
    }
  });

  // 14. Delete Created Product
  await test('14. Delete Created Product', async () => {
    if (!createdProductId) throw new Error('No product ID to delete');
    const res = await request('DELETE', `/api/products/${createdProductId}`);
    if (res.status !== 200 || !res.body.success) {
      throw new Error(`Failed to delete product: ${JSON.stringify(res.body)}`);
    }
  });

  console.log('\n====================================================');
  console.log(`🎯 RESULTS: ${passed} PASSED, ${failed} FAILED (Total: ${passed + failed})`);
  console.log('====================================================');
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
