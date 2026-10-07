import Razorpay from 'razorpay';
import crypto from 'node:crypto';
import dotenv from 'dotenv';

dotenv.config();

const getRazorpayConfig = () => ({
  keyId: process.env.RAZORPAY_KEY_ID || '',
  keySecret: process.env.RAZORPAY_KEY_SECRET || '',
});

const getRazorpayClient = () => {
  const { keyId, keySecret } = getRazorpayConfig();
  if (!keyId || !keySecret) return null;
  try {
    return new Razorpay({ key_id: keyId, key_secret: keySecret });
  } catch (err) {
    console.warn('Razorpay client initialization warning:', err.message);
    return null;
  }
});

export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt = `rcpt_${Date.now()}` } = req.body;
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const { keyId } = getRazorpayConfig();
    const razorpayClient = getRazorpayClient();
    if (!razorpayClient || !keyId) {
      return res.status(503).json({ success: false, message: 'Razorpay is not configured on the server.' });
    }

    const upperCurrency = (currency || 'INR').toUpperCase();
    const multiplier = upperCurrency === 'OMR' ? 1000 : 100;
    const amountInSubunits = Math.round(numericAmount * multiplier);
    const order = await razorpayClient.orders.create({
      amount: amountInSubunits,
      currency: upperCurrency,
      receipt,
      notes: { brand: 'Dhanvikk Blooms & Exports', userId: req.user?.id || '' },
    });

    return res.status(200).json({ success: true, keyId, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Complete Razorpay verification parameters are required.' });
    }

    const { keySecret } = getRazorpayConfig();
    if (!keySecret) {
      return res.status(503).json({ success: false, message: 'Razorpay is not configured on the server.' });
    }

    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(generatedSignature, 'utf8'),
      Buffer.from(razorpay_signature, 'utf8')
    );

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Payment verification failed: Invalid signature' });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully via Razorpay',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
