import {
  createGatewayOrder,
  verifyGatewaySignature,
} from '../services/payment.service.js';
import { confirmOrderPayment } from '../services/order.service.js';

export const createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount, currency, receipt } = req.body || {};
    const userId = req.user?.id || req.user?._id;

    const result = await createGatewayOrder({
      amount,
      currency,
      receipt,
      userId,
    });

    return res.status(200).json({
      success: true,
      keyId: result.keyId,
      order: result.order,
      message: 'Razorpay order created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      expectedAmount,
      expectedCurrency,
    } = req.body || {};

    const userId = req.user?.id || req.user?._id;

    const verification = verifyGatewaySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      expectedAmount,
      expectedCurrency,
      userId,
    });

    if (verification.isValid) {
      // Reconcile and transition internal order status to Paid / Confirmed
      const updatedOrder = await confirmOrderPayment(verification.orderId, {
        paymentId: verification.paymentId,
        signature: razorpay_signature,
      });

      return res.status(200).json({
        success: true,
        status: 'captured',
        message: 'Payment verified successfully via Razorpay',
        paymentId: verification.paymentId,
        orderId: verification.orderId,
        isReplay: Boolean(verification.isReplay),
        order: updatedOrder || undefined,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Payment signature verification failed',
    });
  } catch (error) {
    next(error);
  }
};
