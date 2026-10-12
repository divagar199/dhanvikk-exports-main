import {
  createGatewayOrder,
  verifyGatewaySignature,
} from '../services/payment.service.js';

export const createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount, currency, receipt } = req.body || {};
    const result = await createGatewayOrder({ amount, currency, receipt });

    return res.status(200).json({
      success: true,
      keyId: result.keyId,
      order: result.order,
      autoApproved: result.autoApproved,
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
      autoApprove = true,
    } = req.body || {};

    const verification = verifyGatewaySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      autoApprove,
    });

    if (verification.isValid) {
      return res.status(200).json({
        success: true,
        approved: true,
        autoApproved: true,
        status: 'captured',
        message: 'Payment verified and automatically approved via Razorpay',
        paymentId: verification.paymentId,
        orderId: verification.orderId,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Payment verification failed',
    });
  } catch (error) {
    next(error);
  }
};
