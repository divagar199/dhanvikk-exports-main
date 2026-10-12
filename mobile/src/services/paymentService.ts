import { apiClient } from './apiClient';
import { RazorpayOrderResponse } from '../types';

export const paymentService = {
  /**
   * Request genuine Razorpay Order from backend
   */
  async createRazorpayOrder(amount: number, currency = 'INR', receipt?: string): Promise<RazorpayOrderResponse> {
    const numericAmount = Math.max(1, Math.round(amount));
    const upperCurrency = (currency || 'INR').toUpperCase();
    const resolvedReceipt = (receipt || `rcpt_mob_${Date.now()}`).slice(0, 40);

    const response = await apiClient.post('/api/payment/create-order', {
      amount: numericAmount,
      currency: upperCurrency,
      receipt: resolvedReceipt,
    });

    if (response.data && response.data.success) {
      return response.data;
    }

    throw new Error(response.data?.message || 'Failed to initialize payment order');
  },

  /**
   * Verify Razorpay Payment Signature through backend
   */
  async verifyRazorpayPayment(payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    expectedAmount?: number;
    expectedCurrency?: string;
  }): Promise<{
    success: boolean;
    status: string;
    message: string;
    paymentId: string;
    orderId: string;
    isReplay?: boolean;
  }> {
    if (!payload.razorpay_order_id || !payload.razorpay_payment_id || !payload.razorpay_signature) {
      throw new Error('Incomplete payment verification credentials.');
    }

    const response = await apiClient.post('/api/payment/verify-payment', {
      razorpay_order_id: payload.razorpay_order_id,
      razorpay_payment_id: payload.razorpay_payment_id,
      razorpay_signature: payload.razorpay_signature,
      expectedAmount: payload.expectedAmount,
      expectedCurrency: payload.expectedCurrency,
    });

    if (response.data && response.data.success) {
      return response.data;
    }

    throw new Error(response.data?.message || 'Payment signature verification failed.');
  },
};

export default paymentService;
