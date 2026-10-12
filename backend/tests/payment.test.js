import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {
  createGatewayOrder,
  verifyGatewaySignature,
  getRazorpayConfig,
  getCurrencyMultiplier,
  paymentAttempts,
} from '../src/services/payment.service.js';
import { ApiError } from '../src/utils/apiError.js';

describe('Razorpay Payment Gateway Integrity & Security Tests', () => {
  const { keySecret } = getRazorpayConfig();

  test('1. Currency subunits calculated correctly according to monetary standards', () => {
    assert.equal(getCurrencyMultiplier('INR'), 100);
    assert.equal(getCurrencyMultiplier('AED'), 100);
    assert.equal(getCurrencyMultiplier('USD'), 100);
    assert.equal(getCurrencyMultiplier('OMR'), 1000, 'OMR must use 1000 subunits (baisa)');
    assert.equal(getCurrencyMultiplier('JPY'), 1, 'JPY must use 1 subunit (zero-decimal currency)');
  });

  test('2. createGatewayOrder rejects non-positive amounts with HTTP 400', async () => {
    await assert.rejects(
      async () => {
        await createGatewayOrder({ amount: 0, currency: 'INR' });
      },
      (err) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.statusCode, 400);
        return true;
      }
    );

    await assert.rejects(
      async () => {
        await createGatewayOrder({ amount: -150, currency: 'INR' });
      },
      (err) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.statusCode, 400);
        return true;
      }
    );
  });

  test('3. createGatewayOrder registers a pending payment attempt with calculated subunits', async () => {
    const result = await createGatewayOrder({
      amount: 1500,
      currency: 'INR',
      receipt: 'rcpt_test_001',
      userId: 'usr_cust_001',
    });

    assert.ok(result.order, 'Must return order entity');
    assert.ok(result.order.id, 'Must have order ID');
    assert.equal(result.order.amount, 150000, 'INR 1500 must equal 150000 subunits');
    assert.equal(result.order.currency, 'INR');

    // Confirm stored in paymentAttempts
    const attempt = paymentAttempts.get(result.order.id);
    assert.ok(attempt, 'Pending payment attempt must be tracked');
    assert.equal(attempt.amount, 150000);
    assert.equal(attempt.currency, 'INR');
    assert.equal(attempt.userId, 'usr_cust_001');
    assert.equal(attempt.status, 'created');
  });

  test('4. verifyGatewaySignature validates genuine HMAC-SHA256 signature in constant time', async () => {
    const orderRes = await createGatewayOrder({
      amount: 2000,
      currency: 'INR',
      userId: 'usr_cust_001',
    });

    const orderId = orderRes.order.id;
    const paymentId = `pay_rzp_live_${Date.now()}`;

    // Genuine signature computed using server key secret
    const validSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const verification = verifyGatewaySignature({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: validSignature,
      expectedAmount: 2000,
      expectedCurrency: 'INR',
      userId: 'usr_cust_001',
    });

    assert.equal(verification.isValid, true);
    assert.equal(verification.orderId, orderId);
    assert.equal(verification.paymentId, paymentId);
    assert.equal(verification.isReplay, false);

    // Verify state transitioned to captured
    const attempt = paymentAttempts.get(orderId);
    assert.equal(attempt.status, 'captured');
  });

  test('5. verifyGatewaySignature rejects forged, tampered, or mismatched signatures with HTTP 400', async () => {
    const orderRes = await createGatewayOrder({
      amount: 3000,
      currency: 'INR',
      userId: 'usr_cust_001',
    });

    const orderId = orderRes.order.id;
    const paymentId = `pay_rzp_live_${Date.now()}`;
    const forgedSignature = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

    assert.throws(
      () => {
        verifyGatewaySignature({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: forgedSignature,
        });
      },
      (err) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.statusCode, 400);
        assert.match(err.message, /invalid payment signature/i);
        return true;
      }
    );
  });

  test('6. verifyGatewaySignature strictly rejects missing parameters with HTTP 400', () => {
    assert.throws(
      () => {
        verifyGatewaySignature({
          razorpay_order_id: '',
          razorpay_payment_id: 'pay_123',
          razorpay_signature: 'sig_123',
        });
      },
      (err) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.statusCode, 400);
        return true;
      }
    );
  });

  test('7. verifyGatewaySignature detects and rejects payment amount mismatch', async () => {
    const orderRes = await createGatewayOrder({
      amount: 4000,
      currency: 'INR',
      userId: 'usr_cust_001',
    });

    const orderId = orderRes.order.id;
    const paymentId = `pay_rzp_live_${Date.now()}`;
    const validSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    assert.throws(
      () => {
        verifyGatewaySignature({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: validSignature,
          expectedAmount: 2500, // Client tries to verify for 2500 when order was 4000
          expectedCurrency: 'INR',
          userId: 'usr_cust_001',
        });
      },
      (err) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.statusCode, 400);
        assert.match(err.message, /amount mismatch/i);
        return true;
      }
    );
  });

  test('8. verifyGatewaySignature detects and rejects currency mismatch', async () => {
    const orderRes = await createGatewayOrder({
      amount: 100,
      currency: 'AED',
      userId: 'usr_cust_001',
    });

    const orderId = orderRes.order.id;
    const paymentId = `pay_rzp_live_${Date.now()}`;
    const validSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    assert.throws(
      () => {
        verifyGatewaySignature({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: validSignature,
          expectedAmount: 100,
          expectedCurrency: 'USD', // Mismatched currency
          userId: 'usr_cust_001',
        });
      },
      (err) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.statusCode, 400);
        assert.match(err.message, /currency mismatch/i);
        return true;
      }
    );
  });

  test('9. verifyGatewaySignature rejects cross-user payment tampering with HTTP 403', async () => {
    const orderRes = await createGatewayOrder({
      amount: 500,
      currency: 'INR',
      userId: 'victim_user_123',
    });

    const orderId = orderRes.order.id;
    const paymentId = `pay_rzp_live_${Date.now()}`;
    const validSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    assert.throws(
      () => {
        verifyGatewaySignature({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: validSignature,
          userId: 'attacker_user_456', // Attacker trying to claim victim's payment
        });
      },
      (err) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.statusCode, 403);
        assert.match(err.message, /does not belong to the authenticated user/i);
        return true;
      }
    );
  });

  test('10. Repeated verification of an already captured payment returns idempotent response', async () => {
    const orderRes = await createGatewayOrder({
      amount: 600,
      currency: 'INR',
      userId: 'usr_cust_001',
    });

    const orderId = orderRes.order.id;
    const paymentId = `pay_rzp_live_${Date.now()}`;
    const validSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    // First verification: captured
    const first = verifyGatewaySignature({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: validSignature,
      userId: 'usr_cust_001',
    });
    assert.equal(first.isValid, true);
    assert.equal(first.isReplay, false);

    // Second verification: detected as replay
    const second = verifyGatewaySignature({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: validSignature,
      userId: 'usr_cust_001',
    });
    assert.equal(second.isValid, true);
    assert.equal(second.isReplay, true, 'Subsequent verification must be flagged as replay without double charging');
  });
});
