process.env.NODE_ENV = 'test';

import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });
process.env.RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_TEtZK7VCto8PM1';
process.env.RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'XJsTJnwCw5PZJ38bXNhh3qtr';

import app from '../server.js';
import { generateToken } from '../src/config/jwt.js';

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
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});

test('Backend Health & Root Verification', async (t) => {
  await t.test('GET / should return 200 OK with service banner', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'healthy');
    assert.ok(data.message.includes('Dhanvikk Blooms'));
  });

  await t.test('GET /api/health should return healthy status', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'healthy');
    assert.ok(data.service);
  });
});

test('Razorpay Payment Flow & 401 Prevention', async (t) => {
  await t.test('POST /api/payment/create-order should succeed as guest without 401 error', async () => {
    const res = await fetch(`${baseUrl}/api/payment/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 999, currency: 'INR' }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.keyId);
    assert.ok(data.order);
    assert.ok(data.order.id);
    assert.equal(data.order.amount, 99900);
  });

  await t.test('POST /api/payment/create-order should succeed with invalid or expired token without 401', async () => {
    const res = await fetch(`${baseUrl}/api/payment/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer expired_or_unrecognized_token',
      },
      body: JSON.stringify({ amount: 1500, currency: 'INR' }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.order.id);
  });

  await t.test('POST /api/payment/create-order should reject invalid amounts with 400', async () => {
    const res = await fetch(`${baseUrl}/api/payment/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: -50, currency: 'INR' }),
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
  });

  await t.test('POST /api/payment/verify-payment should accept simulated test signature', async () => {
    const res = await fetch(`${baseUrl}/api/payment/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: 'order_test_123',
        razorpay_payment_id: 'pay_test_123',
        razorpay_signature: 'test_signature_valid',
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.paymentId, 'pay_test_123');
  });

  await t.test('POST /api/payment/verify-payment should accept authentic HMAC-SHA256 signature', async () => {
    const secret = process.env.RAZORPAY_KEY_SECRET || 'XJsTJnwCw5PZJ38bXNhh3qtr';
    const orderId = 'order_hmac_test';
    const paymentId = 'pay_hmac_test';
    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const res = await fetch(`${baseUrl}/api/payment/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSignature,
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
  });

  await t.test('POST /api/payment/verify-payment should reject tampered signature with 400', async () => {
    const res = await fetch(`${baseUrl}/api/payment/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: 'order_fake',
        razorpay_payment_id: 'pay_fake',
        razorpay_signature: '0000000000000000000000000000000000000000000000000000000000000000',
      }),
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
  });
});

test('Order Creation & Retrieval', async (t) => {
  let createdOrderId;

  await t.test('POST /api/orders should successfully create an order with guest identity', async () => {
    const payload = {
      items: [
        {
          product: 'prod_roses_red',
          productId: 'prod_roses_red',
          name: 'Royal Velvet Red Roses',
          quantity: 2,
          price: 1500,
          image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23',
        },
      ],
      totalAmount: 3000,
      currency: 'INR',
      shippingAddress: {
        fullName: 'Diya Menon',
        phone: '+91 98765 88888',
        streetAddress: '88 Lily Lane, Poes Garden',
        city: 'Chennai',
        state: 'Tamil Nadu',
        country: 'India',
        pincode: '600086',
      },
      paymentInfo: {
        method: 'Razorpay',
        razorpayOrderId: 'order_test_dhn',
        razorpayPaymentId: 'pay_test_dhn',
        status: 'Paid',
      },
    };

    const res = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.order);
    assert.ok(data.order.orderId);
    createdOrderId = data.order.orderId;
    assert.equal(data.order.shippingAddress.fullName, 'Diya Menon');
  });

  await t.test('POST /api/orders should reject empty items', async () => {
    const res = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [] }),
    });
    assert.equal(res.status, 400);
  });

  await t.test('GET /api/orders/:orderId should retrieve created order', async () => {
    if (!createdOrderId) return;
    const res = await fetch(`${baseUrl}/api/orders/${createdOrderId}`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.order.orderId, createdOrderId);
  });
});

test('Authentication & Profile Saved Addresses', async (t) => {
  let authToken;

  await t.test('POST /api/auth/login should authenticate valid customer', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'customer@dhanvikk.com',
        password: 'Bloom@2026',
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.token);
    authToken = data.token;
  });

  await t.test('POST /api/auth/login should reject incorrect password with 401', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'customer@dhanvikk.com',
        password: 'WrongPasswordXYZ',
      }),
    });
    assert.equal(res.status, 401);
  });

  await t.test('GET /api/auth/profile-data should return empty address array without fake sample addresses', async () => {
    const token = generateToken({
      id: 'usr_new_test_cust',
      name: 'New Test Customer',
      email: 'new_fresh_user@dhanvikk.com',
      role: 'customer',
    });

    const res = await fetch(`${baseUrl}/api/auth/profile-data`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.savedAddresses));
    // Must NOT contain fake default sample addresses like 'Villa 14' or 'Bengaluru Residence'
    const hasFake = data.savedAddresses.some((a) =>
      String(a.street || '').includes('Bengaluru Residence')
    );
    assert.equal(hasFake, false);
  });

  await t.test('POST /api/auth/addresses should persist genuine customer address', async () => {
    const token = authToken || generateToken({
      id: 'usr_cust_001',
      name: 'Aarav Patel',
      email: 'customer@dhanvikk.com',
      role: 'customer',
    });

    const newAddr = {
      id: `addr_test_${Date.now()}`,
      title: 'Home',
      recipientName: 'Aarav Patel',
      phone: '+91 98765 43210',
      street: '12 Emerald Park Boulevard',
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      postalCode: '600020',
      isDefault: true,
    };

    const res = await fetch(`${baseUrl}/api/auth/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newAddr),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.addresses.some((a) => a.street === '12 Emerald Park Boulevard'));
  });
});

test('Product Catalog API', async (t) => {
  await t.test('GET /api/products should return non-empty products list', async () => {
    const res = await fetch(`${baseUrl}/api/products`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.products));
    assert.ok(data.products.length > 0);
  });
});
