import { api } from '@/lib/api';
import type { Order, Address, CartItem } from '@/types/models';

export async function createRazorpayOrder(amount: number): Promise<{ id: string; amount: number; currency: string; keyId: string }> {
  return api('/api/orders/create-razorpay-order', {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
}

export async function createOrder(payload: {
  items: CartItem[] | any[];
  shippingAddress: Address | Record<string, string>;
  deliveryDate: string;
  timeSlot?: string;
  greetingCardMessage?: string;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentInfo?: any;
}): Promise<{ order: Order; [key: string]: any }> {
  return api('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function verifyPayment(payload: {
  orderId?: string;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}): Promise<any> {
  return api('/api/orders/verify-payment', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getMyOrders(): Promise<Order[]> {
  const data = await api<any>('/api/orders/my-orders');
  return Array.isArray(data) ? data : data.orders || [];
}

export async function getProfileData(): Promise<{ savedAddresses?: Address[]; [key: string]: any }> {
  return api('/api/users/profile');
}

export async function getSavedAddresses(): Promise<Address[]> {
  const data = await getProfileData();
  return data.savedAddresses || [];
}

export async function saveAddress(address: Address): Promise<Address[]> {
  const data = await api<{ savedAddresses: Address[] }>('/api/users/addresses', {
    method: 'POST',
    body: JSON.stringify(address),
  });
  return data.savedAddresses || [];
}
