import { apiClient } from './apiClient';
import { Order } from '../types';
import { firebaseAuthService } from './firebaseAuthService';

export const orderService = {
  async createOrder(orderPayload: Partial<Order>): Promise<{ success: boolean; message: string; order: Order }> {
    const response = await apiClient.post('/api/orders', orderPayload);
    if (response.data && response.data.order) {
      firebaseAuthService.saveOrderToFirestore(response.data.order).catch(() => {});
      return response.data;
    }
    throw new Error(response.data?.message || 'Failed to place order');
  },

  async getMyOrders(_email?: string): Promise<{ success: boolean; count: number; orders: Order[] }> {
    const response = await apiClient.get('/api/orders/my-orders');
    return response.data;
  },
};

export default orderService;
