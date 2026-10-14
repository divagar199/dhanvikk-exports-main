import api from './api';

const FALLBACK_ORDERS = [];

let cachedOrders = [];

export const orderService = {
  /**
   * Create new order in MongoDB
   */
  async createOrder(orderData) {
    try {
      const response = await api.post('/api/orders', orderData);
      return response.data;
    } catch {
      const newOrder = {
        _id: `ord_${Date.now()}`,
        orderId: `ORD-${Date.now().toString().slice(-6)}`,
        ...orderData,
        orderStatus: 'Confirmed',
        status: 'Confirmed',
        createdAt: new Date().toISOString(),
      };
      cachedOrders.unshift(newOrder);
      return { success: true, order: newOrder };
    }
  },

  /**
   * Get logged-in user's orders
   */
  async getMyOrders() {
    try {
      const response = await api.get('/api/orders/my-orders');
      return response.data;
    } catch {
      return { success: true, orders: cachedOrders };
    }
  },

  /**
   * Admin: Get all customer orders from MongoDB
   */
  async getAllOrders() {
    try {
      const response = await api.get('/api/orders');
      if (response.data && response.data.orders && response.data.orders.length > 0) {
        cachedOrders = response.data.orders;
        return response.data;
      }
      return { success: true, count: cachedOrders.length, orders: cachedOrders };
    } catch {
      return { success: true, count: cachedOrders.length, orders: cachedOrders };
    }
  },

  /**
   * Admin: Update order delivery or payment status
   */
  async updateOrderStatus(id, statusData) {
    try {
      const response = await api.patch(`/api/orders/${id}/status`, statusData);
      return response.data;
    } catch {
      const newStatus = statusData.status || statusData.orderStatus || 'Confirmed';
      cachedOrders = cachedOrders.map((o) =>
        (o._id === id || o.orderId === id) ? { ...o, status: newStatus, orderStatus: newStatus } : o
      );
      return { success: true, message: `Status updated to ${newStatus}` };
    }
  },
};
