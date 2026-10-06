import api from './api';

export const paymentService = {
  /**
   * Request Razorpay Order ID from backend
   */
  async createRazorpayOrder({ amount, currency = 'INR', receipt }) {
    const response = await api.post('/api/payment/create-order', {
      amount,
      currency,
      receipt,
    });
    return response.data;
  },

  /**
   * Verify Razorpay Payment Signature
   */
  async verifyPayment(paymentDetails) {
    const response = await api.post('/api/payment/verify-payment', paymentDetails);
    return response.data;
  },

  /**
   * Dynamically load Razorpay SDK script
   */
  loadRazorpayScript() {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        return resolve(true);
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },
};
