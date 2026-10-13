import { api } from '@/lib/api';

export async function createRazorpayOrder(amount: number, currency = 'INR') {
  return api<{
    keyId: string;
    order: {
      id: string;
      amount: number;
      currency: string;
    };
  }>('/api/payment/create-order', {
    method: 'POST',
    body: JSON.stringify({
      amount,
      currency,
      receipt: `mobile_${Date.now()}`,
    }),
  });
}

export async function verifyPayment(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  return api<{ success: boolean }>('/api/payment/verify-payment', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}