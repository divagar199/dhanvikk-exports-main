import api from './api';

const LOCAL_STORAGE_ORDERS = 'dhanvikk_admin_orders';

function getStoredOrders() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORDERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [];
}

function saveStoredOrders(orders) {
  try {
    localStorage.setItem(LOCAL_STORAGE_ORDERS, JSON.stringify(orders));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dhanvikk_orders_updated', { detail: orders }));
      window.dispatchEvent(new Event('storage'));
    }
  } catch {}
}

let cachedOrders = getStoredOrders();

export const orderService = {
  /**
   * Create new order in MongoDB or local storage
   */
  async createOrder(orderData) {
    try {
      const response = await api.post('/api/orders', orderData);
      if (response.data && response.data.order) {
        cachedOrders = [response.data.order, ...cachedOrders.filter((o) => (o._id || o.orderId) !== (response.data.order._id || response.data.order.orderId))];
        saveStoredOrders(cachedOrders);
      }
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
      cachedOrders = [newOrder, ...cachedOrders];
      saveStoredOrders(cachedOrders);
      return { success: true, order: newOrder };
    }
  },

  /**
   * Get logged-in user's orders
   */
  async getMyOrders() {
    try {
      const response = await api.get('/api/orders/my-orders');
      if (response.data && response.data.orders) {
        return response.data;
      }
    } catch {}
    return { success: true, orders: cachedOrders };
  },

  /**
   * Admin: Get all customer orders from MongoDB
   */
  async getAllOrders() {
    try {
      const response = await api.get('/api/orders');
      if (response.data && response.data.orders && response.data.orders.length > 0) {
        cachedOrders = response.data.orders;
        saveStoredOrders(cachedOrders);
        return response.data;
      }
    } catch {}
    const stored = getStoredOrders();
    if (stored.length > 0) cachedOrders = stored;
    return { success: true, count: cachedOrders.length, orders: cachedOrders };
  },

  /**
   * Admin: Update order delivery or payment status
   */
  async updateOrderStatus(id, statusData) {
    const newStatus = statusData.status || statusData.orderStatus || 'Confirmed';
    try {
      const response = await api.patch(`/api/orders/${id}/status`, statusData);
      cachedOrders = cachedOrders.map((o) =>
        (o._id === id || o.orderId === id) ? { ...o, status: newStatus, orderStatus: newStatus } : o
      );
      saveStoredOrders(cachedOrders);
      return response.data;
    } catch {
      cachedOrders = cachedOrders.map((o) =>
        (o._id === id || o.orderId === id) ? { ...o, status: newStatus, orderStatus: newStatus } : o
      );
      saveStoredOrders(cachedOrders);
      return { success: true, message: `Status updated to ${newStatus}` };
    }
  },
};
