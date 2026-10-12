import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  createOrderWithInventoryLock,
  getUserOrders,
  confirmOrderPayment,
  inMemoryOrders,
} from '../src/services/order.service.js';
import { createOrder, getMyOrders } from '../src/controllers/order.controller.js';
import { ApiError } from '../src/utils/apiError.js';

describe('Order Creation & Scoping Lifecycle Tests', () => {
  const sampleItems = [
    {
      product: 'flw_001',
      name: 'Grand Royal Orchids',
      price: 2499,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364',
    },
  ];

  const sampleAddress = {
    fullName: 'Fatima Al Mansoori',
    phone: '+971 50 123 4567',
    streetAddress: 'Villa 14, Al Safa 2',
    city: 'Dubai',
    state: 'Dubai',
    country: 'United Arab Emirates',
    pincode: '00000',
  };

  test('1. createOrderWithInventoryLock rejects empty orders with HTTP 400', async () => {
    await assert.rejects(
      async () => {
        await createOrderWithInventoryLock({
          items: [],
          shippingAddress: sampleAddress,
          totalAmount: 100,
        });
      },
      (err) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.statusCode, 400);
        assert.match(err.message, /order cannot be empty/i);
        return true;
      }
    );
  });

  test('2. Order created without verified payment has Pending status', async () => {
    const order = await createOrderWithInventoryLock({
      items: sampleItems,
      shippingAddress: sampleAddress,
      subtotal: 2499,
      totalAmount: 2499,
      user: { id: 'usr_order_test_1', email: 'test_buyer@dhanvikk.com' },
      customerEmail: 'test_buyer@dhanvikk.com',
      paymentInfo: {
        method: 'Razorpay',
        razorpayOrderId: 'order_rzp_pending_01',
        status: 'Pending',
      },
    });

    assert.ok(order.orderId);
    assert.equal(order.status, 'Pending', 'Unpaid order status must be Pending');
    assert.equal(order.paymentInfo.status, 'Pending', 'Unpaid payment status must be Pending');
  });

  test('3. confirmOrderPayment atomically confirms order and marks status Paid', async () => {
    const gatewayOrderId = `order_rzp_confirm_${Date.now()}`;
    const order = await createOrderWithInventoryLock({
      items: sampleItems,
      shippingAddress: sampleAddress,
      subtotal: 2499,
      totalAmount: 2499,
      user: { id: 'usr_order_test_2', email: 'verified_buyer@dhanvikk.com' },
      customerEmail: 'verified_buyer@dhanvikk.com',
      paymentInfo: {
        method: 'Razorpay',
        razorpayOrderId: gatewayOrderId,
        status: 'Pending',
      },
    });

    assert.equal(order.paymentInfo.status, 'Pending');

    // Confirm payment after signature verification
    const updated = await confirmOrderPayment(gatewayOrderId, {
      paymentId: 'pay_rzp_verified_123',
      signature: 'valid_sig_xyz',
    });

    assert.ok(updated);
    assert.equal(updated.paymentInfo.status, 'Paid');
    assert.equal(updated.paymentInfo.razorpayPaymentId, 'pay_rzp_verified_123');
    assert.equal(updated.status, 'Confirmed');
  });

  test('4. getUserOrders scopes results to user identity and ignores empty query', async () => {
    const emptyOrders = await getUserOrders('', '');
    assert.deepEqual(emptyOrders, []);

    const userOrders = await getUserOrders('verified_buyer@dhanvikk.com', 'usr_order_test_2');
    assert.ok(Array.isArray(userOrders));
    assert.ok(userOrders.length >= 1);
    assert.equal(userOrders[0].user?.email, 'verified_buyer@dhanvikk.com');
  });

  test('5. createOrder controller ignores client body.email and binds to authenticated identity', async () => {
    let statusCode = null;
    let responseBody = null;

    const req = {
      user: {
        id: 'usr_auth_real',
        email: 'authenticated_user@dhanvikk.com',
        name: 'Real User',
      },
      body: {
        email: 'attacker_impersonator@evil.com', // Malicious override attempt
        items: sampleItems,
        shippingAddress: sampleAddress,
        totalAmount: 2499,
        paymentInfo: {
          status: 'Pending',
        },
      },
    };

    const res = {
      status(code) {
        statusCode = code;
        return {
          json(data) {
            responseBody = data;
          },
        };
      },
    };

    await createOrder(req, res, () => {});

    assert.equal(statusCode, 201);
    assert.ok(responseBody.success);
    assert.equal(
      responseBody.order.user.email,
      'authenticated_user@dhanvikk.com',
      'Order user email must match authenticated req.user, ignoring body.email override'
    );
  });

  test('6. getMyOrders controller rejects unauthenticated requests with HTTP 401', async () => {
    let statusCode = null;
    let responseBody = null;

    const req = {
      user: null, // Unauthenticated
      headers: { 'x-user-email': 'admin@dhanvikk.com' }, // Spoofed header attempt
      query: { email: 'admin@dhanvikk.com' }, // Spoofed query attempt
    };

    const res = {
      status(code) {
        statusCode = code;
        return {
          json(data) {
            responseBody = data;
          },
        };
      },
    };

    await getMyOrders(req, res, () => {});

    assert.equal(statusCode, 401);
    assert.equal(responseBody.success, false);
    assert.match(responseBody.message, /authentication required/i);
  });
});
