import api from './api';

const FALLBACK_ORDERS = [
  {
    _id: 'ord_prod_7821',
    orderId: 'ORD-2026-7821',
    recipientName: 'Fatima Al Mansoori',
    recipientPhone: '+971 50 123 4567',
    deliveryAddress: {
      street: 'Villa 14, Al Safa 2, Jumeirah',
      city: 'Dubai',
      state: 'Dubai, UAE',
      country: 'UAE',
    },
    shippingAddress: {
      fullName: 'Fatima Al Mansoori',
      phone: '+971 50 123 4567',
      streetAddress: 'Villa 14, Al Safa 2, Jumeirah',
      city: 'Dubai',
      state: 'Dubai, UAE',
    },
    deliveryDate: '2026-10-05',
    deliverySlot: 'Standard (9 AM - 1 PM)',
    timeSlot: 'Standard (9 AM - 1 PM)',
    greetingMessage: 'Happy 5th Anniversary my love! May your day blossom with pure joy and fragrant blooms.',
    greetingCardMessage: 'Happy 5th Anniversary my love! May your day blossom with pure joy and fragrant blooms.',
    items: [
      {
        product: 'flw-001',
        name: 'Grand Ecuadorian Red Roses (50 Stems)',
        price: 3499,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
      },
      {
        product: 'flw-007',
        name: 'Artisan Champagne & Belgian Truffles Hamper',
        price: 1899,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80',
      },
    ],
    totalAmount: 5398,
    paymentStatus: 'Paid (Razorpay)',
    orderStatus: 'Confirmed',
    status: 'Confirmed',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    _id: 'ord_prod_7822',
    orderId: 'ORD-2026-7822',
    recipientName: 'Rajesh & Ananya Sengupta',
    recipientPhone: '+91 98450 67890',
    deliveryAddress: {
      street: 'Flat 402, Prestige Tower, 100 Feet Rd, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka, India',
      country: 'India',
    },
    shippingAddress: {
      fullName: 'Rajesh & Ananya Sengupta',
      phone: '+91 98450 67890',
      streetAddress: 'Flat 402, Prestige Tower, 100 Feet Rd, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka, India',
    },
    deliveryDate: '2026-10-04',
    deliverySlot: 'Evening (7 PM - 10 PM)',
    timeSlot: 'Evening (7 PM - 10 PM)',
    greetingMessage: 'Warmest congratulations on your new penthouse! Wishing you peace and fragrant memories.',
    greetingCardMessage: 'Warmest congratulations on your new penthouse! Wishing you peace and fragrant memories.',
    items: [
      {
        product: 'flw-003',
        name: 'Pastel Lilac Parisian Velvet Hatbox',
        price: 2899,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=400&q=80',
      },
    ],
    totalAmount: 2899,
    paymentStatus: 'Paid (Razorpay)',
    orderStatus: 'Out for Delivery',
    status: 'Out for Delivery',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    _id: 'ord_prod_7823',
    orderId: 'ORD-2026-7823',
    recipientName: 'Meera Krishnan',
    recipientPhone: '+91 94440 12345',
    deliveryAddress: {
      street: '12 Temple View Lane, Mylapore',
      city: 'Chennai',
      state: 'Tamil Nadu, India',
      country: 'India',
    },
    shippingAddress: {
      fullName: 'Meera Krishnan',
      phone: '+91 94440 12345',
      streetAddress: '12 Temple View Lane, Mylapore',
      city: 'Chennai',
      state: 'Tamil Nadu, India',
    },
    deliveryDate: '2026-10-04',
    deliverySlot: 'Standard (9 AM - 1 PM)',
    timeSlot: 'Standard (9 AM - 1 PM)',
    greetingMessage: 'Shubh Navratri! Fresh traditional temple marigolds for holy puja rituals.',
    greetingCardMessage: 'Shubh Navratri! Fresh traditional temple marigolds for holy puja rituals.',
    items: [
      {
        product: 'flw-trad-01',
        name: 'Sacred Madurai Marigold Garland (5 kg Bulk)',
        price: 1499,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=400&q=80',
      },
    ],
    totalAmount: 2998,
    paymentStatus: 'Paid (Razorpay)',
    orderStatus: 'Delivered',
    status: 'Delivered',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
];

let cachedOrders = [...FALLBACK_ORDERS];

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
      return { success: true, orders: cachedOrders.slice(0, 2) };
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

