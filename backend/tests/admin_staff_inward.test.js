import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../server.js';
import mongoose from 'mongoose';

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  if (mongoose.connection && mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  setTimeout(() => process.exit(0), 100);
});

test('Super Admin divagar.m.msc.cs@gmail.com can log in with admin@2026', async () => {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'divagar.m.msc.cs@gmail.com',
      password: 'admin@2026',
    }),
  });

  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.user.email, 'divagar.m.msc.cs@gmail.com');
  assert.strictEqual(data.user.role, 'super_admin');
  assert.ok(data.token, 'Should return authenticated JWT token');
});

test('Super Admin info endpoint returns correct super admin email', async () => {
  const res = await fetch(`${baseUrl}/api/admin/staff/info`);
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.superAdminEmail, 'divagar.m.msc.cs@gmail.com');
});

test('Adding new staff member creates staff ID, sets password, and allows staff login', async () => {
  const staffEmail = `florist.lead.${Date.now()}@dhanvikk.com`;
  const staffPass = 'Florist@2026';
  const staffId = `STF-2026-${Date.now().toString().slice(-3)}`;

  // 1. Add staff member
  const addRes = await fetch(`${baseUrl}/api/admin/staff`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Divya Sundaram',
      email: staffEmail,
      staffId: staffId,
      password: staffPass,
      role: 'inventory_manager',
      roleTitle: 'Master Florist & Inventory Lead',
      phone: '+91 98765 99999',
    }),
  });

  const addData = await addRes.json();
  assert.strictEqual(addRes.status, 201);
  assert.strictEqual(addData.success, true);
  assert.strictEqual(addData.staff.email, staffEmail);
  assert.strictEqual(addData.staff.staffId, staffId);

  // 2. Staff can log in with their email and assigned password
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: staffEmail,
      password: staffPass,
    }),
  });

  const loginData = await loginRes.json();
  assert.strictEqual(loginRes.status, 200);
  assert.strictEqual(loginData.success, true);
  assert.strictEqual(loginData.user.email, staffEmail);
  assert.strictEqual(loginData.user.role, 'inventory_manager');

  // 3. Staff can also log in using their staffId!
  const staffIdLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: staffId,
      password: staffPass,
    }),
  });

  const staffIdLoginData = await staffIdLoginRes.json();
  assert.strictEqual(staffIdLoginRes.status, 200);
  assert.strictEqual(staffIdLoginData.success, true);
  assert.strictEqual(staffIdLoginData.user.email, staffEmail);
});

test('Unified auth: User registered via API can log in on both web and mobile', async () => {
  const mobileUserEmail = `mobile.user.${Date.now()}@gmail.com`;
  const userPass = 'MobileBloom@2026';

  // 1. Registration (as called by mobile or web)
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Lakshmi Narayanan',
      email: mobileUserEmail,
      password: userPass,
      phone: '+91 99887 76655',
    }),
  });

  const regData = await regRes.json();
  assert.strictEqual(regRes.status, 201);
  assert.strictEqual(regData.success, true);
  assert.ok(regData.token);

  // 2. Login (on web or mobile)
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: mobileUserEmail,
      password: userPass,
    }),
  });

  const loginData = await loginRes.json();
  assert.strictEqual(loginRes.status, 200);
  assert.strictEqual(loginData.success, true);
  assert.strictEqual(loginData.user.email, mobileUserEmail);

  // 3. Saved Profile Data retrieval (synced across platforms)
  const profileRes = await fetch(`${baseUrl}/api/auth/profile-data`, {
    headers: {
      Authorization: `Bearer ${loginData.token}`,
      'x-user-email': mobileUserEmail,
    },
  });

  const profileData = await profileRes.json();
  assert.strictEqual(profileRes.status, 200);
  assert.strictEqual(profileData.success, true);
  assert.strictEqual(profileData.user.email, mobileUserEmail);
});
