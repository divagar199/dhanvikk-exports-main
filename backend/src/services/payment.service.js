import Razorpay from 'razorpay';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import { ApiError } from '../utils/apiError.js';

dotenv.config();

// In-memory registry of active gateway payment attempts for reconciliation and idempotency
export const paymentAttempts = new Map();

export const getRazorpayConfig = () => {
  const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_TEtZK7VCto8PM1';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'XJsTJnwCw5PZJ38bXNhh3qtr';

  if (process.env.NODE_ENV === 'production' && (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET)) {
    throw new ApiError(500, 'FATAL: Razorpay gateway credentials are not configured in production environment.');
  }

  return { keyId, keySecret };
};

export const getRazorpayClient = () => {
  const { keyId, keySecret } = getRazorpayConfig();
  if (!keyId || !keySecret) {
    return null;
  }
  try {
    return new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  } catch (err) {
    console.warn('Razorpay client initialization warning:', err.message);
    return null;
  }
};

export const getCurrencyMultiplier = (currency = 'INR') => {
  const curr = (currency || 'INR').toUpperCase();
  if (curr === 'OMR' || curr === 'BHD' || curr === 'KWD') return 1000;
  if (curr === 'JPY' || curr === 'KRW' || curr === 'VND') return 1;
  return 100;
};

export const createGatewayOrder = async ({ amount, currency = 'INR', receipt, userId }) => {
  const numericAmount = Number(amount);
  if (!numericAmount || numericAmount <= 0) {
    throw new ApiError(400, 'Payment amount must be greater than zero.');
  }

  const { keyId } = getRazorpayConfig();
  const razorpayClient = getRazorpayClient();
  const upperCurrency = (currency || 'INR').toUpperCase();
  const multiplier = getCurrencyMultiplier(upperCurrency);
  const amountInSubunits = Math.round(numericAmount * multiplier);
  const orderReceipt = (receipt || `rcpt_${Date.now()}`).slice(0, 40);

  let order = null;

  if (razorpayClient) {
    try {
      order = await razorpayClient.orders.create({
        amount: amountInSubunits,
        currency: upperCurrency,
        receipt: orderReceipt,
        notes: {
          brand: 'Dhanvikk Blooms & Exports',
          userId: userId ? String(userId) : '',
        },
      });
    } catch (err) {
      console.warn(`Razorpay gateway order creation error (${upperCurrency}):`, err.message);
      if (process.env.NODE_ENV !== 'test' && process.env.MOCK_PAYMENT !== 'true') {
        throw new ApiError(502, `Payment gateway failed to initialize order: ${err.message}`);
      }
    }
  }

  // Controlled test fixture support for isolated test environments only
  if (!order && (process.env.NODE_ENV === 'test' || process.env.MOCK_PAYMENT === 'true')) {
    order = {
      id: `order_test_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      entity: 'order',
      amount: amountInSubunits,
      amount_paid: 0,
      amount_due: amountInSubunits,
      currency: upperCurrency,
      receipt: orderReceipt,
      status: 'created',
      created_at: Math.floor(Date.now() / 1000),
    };
  }

  if (!order) {
    throw new ApiError(502, 'Unable to establish payment gateway session. Please try again.');
  }

  // Persist pending payment attempt for strict server-side reconciliation
  paymentAttempts.set(order.id, {
    orderId: order.id,
    amount: amountInSubunits,
    currency: upperCurrency,
    userId: userId ? String(userId) : null,
    receipt: orderReceipt,
    status: 'created',
    createdAt: Date.now(),
  });

  return {
    keyId,
    order,
  };
};

export const verifyGatewaySignature = ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  expectedAmount,
  expectedCurrency,
  userId,
}) => {
  if (!razorpay_order_id || typeof razorpay_order_id !== 'string') {
    throw new ApiError(400, 'Missing required payment parameter: razorpay_order_id');
  }
  if (!razorpay_payment_id || typeof razorpay_payment_id !== 'string') {
    throw new ApiError(400, 'Missing required payment parameter: razorpay_payment_id');
  }
  if (!razorpay_signature || typeof razorpay_signature !== 'string') {
    throw new ApiError(400, 'Missing required payment parameter: razorpay_signature');
  }

  const { keySecret } = getRazorpayConfig();
  if (!keySecret) {
    throw new ApiError(500, 'Razorpay gateway secret is not configured.');
  }

  // 1. HMAC-SHA256 signature calculation using server-only secret
  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  // 2. Constant-time signature comparison to eliminate timing attacks
  const expectedBuf = Buffer.from(generatedSignature, 'utf8');
  const providedBuf = Buffer.from(razorpay_signature, 'utf8');

  if (expectedBuf.length !== providedBuf.length || !crypto.timingSafeEqual(expectedBuf, providedBuf)) {
    throw new ApiError(400, 'Invalid payment signature. Payment verification failed.');
  }

  // 3. Reconcile with pending payment attempt if tracked
  const attempt = paymentAttempts.get(razorpay_order_id);
  if (attempt) {
    // Check for replay attacks
    if (attempt.status === 'captured') {
      return {
        isValid: true,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        isReplay: true,
      };
    }

    // Validate expected currency and amount if provided
    if (expectedCurrency && attempt.currency !== expectedCurrency.toUpperCase()) {
      throw new ApiError(400, `Payment currency mismatch. Expected ${attempt.currency}, received ${expectedCurrency}.`);
    }

    if (expectedAmount !== undefined && expectedAmount !== null) {
      const multiplier = getCurrencyMultiplier(attempt.currency);
      const expectedSubunits = Math.round(Number(expectedAmount) * multiplier);
      if (attempt.amount !== expectedSubunits) {
        throw new ApiError(400, `Payment amount mismatch. Expected ${attempt.amount} subunits, received ${expectedSubunits}.`);
      }
    }

    if (userId && attempt.userId && attempt.userId !== String(userId)) {
      throw new ApiError(403, 'Payment does not belong to the authenticated user.');
    }

    attempt.status = 'captured';
    attempt.paymentId = razorpay_payment_id;
    attempt.capturedAt = Date.now();
  }

  return {
    isValid: true,
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    isReplay: false,
  };
};
