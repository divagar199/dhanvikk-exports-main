import { OrderModel } from '../models/Order.js';
import { ProductModel } from '../models/Product.js';
import { getDBStatus } from '../config/db.js';
import { sendOrderConfirmationEmail } from '../services/emailService.js';
import { recordUserOrder, recordUserAddress } from './authController.js';

export let inMemoryOrders = [
  {
    id: 'ord_1001',
    orderId: 'DHN-2026-8941',
    user: {
      id: 'usr_cust_001',
      name: 'Priya Sharma',
      email: 'priya.sharma@gmail.com',
      phone: '+91 98765 00000',
    },
    items: [
      {
        product: 'flw-7076',
        name: 'Passionate Serenity Noir',
        notes: 'Ecuadorian Obsidian Rose Bouquet',
        price: 2499,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=400&q=80',
      },
    ],
    shippingAddress: {
      fullName: 'Priya Sharma',
      phone: '+91 98765 00000',
      streetAddress: 'Villa 14, Palm Crescent, Palm Jumeirah',
      city: 'Dubai',
      state: 'Dubai, UAE',
      country: 'United Arab Emirates',
      pincode: '00000',
      deliveryNotes: 'Please ring bell twice, fresh hydration wrap included',
    },
    deliveryDate: 'Today',
    timeSlot: 'Evening (7:00 PM - 10:00 PM)',
    greetingCardMessage: 'With warmest love and blossoming blessings 🌸',
    paymentInfo: {
      method: 'Razorpay',
      razorpayPaymentId: 'pay_rzp_demo_8892',
      status: 'Paid',
    },
    subtotal: 2499,
    deliveryFee: 0,
    totalAmount: 2499,
    status: 'Preparing Floral Order',
    createdAt: new Date(),
  },
  {
    id: 'ord_1002',
    orderId: 'DHN-2026-8942',
    user: {
      id: 'usr_cust_002',
      name: 'Aarav Patel',
      email: 'customer@dhanvikk.com',
      phone: '+91 98765 43210',
    },
    items: [
      {
        product: 'flw-rose-01',
        name: 'Passionate Serenity Noir',
        notes: 'Ecuadorian Obsidian Rose Bouquet',
        price: 2499,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=400&q=80',
      },
    ],
    shippingAddress: {
      fullName: 'Aarav Patel',
      phone: '+91 98765 43210',
      streetAddress: 'Penthouse 8B, Royal Marine Drive',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400021',
      deliveryNotes: 'Leave with concierge if not available',
    },
    deliveryDate: 'Today',
    timeSlot: 'Evening (7:00 PM - 10:00 PM)',
    greetingCardMessage: 'Happy Anniversary my love! Forever blooming with you. - Aarav',
    paymentInfo: {
      method: 'Razorpay',
      razorpayPaymentId: 'pay_rzp_demo_8893',
      status: 'Paid',
    },
    subtotal: 2499,
    deliveryFee: 0,
    totalAmount: 2499,
    status: 'Preparing Floral Order',
    createdAt: new Date(),
  },
];

/**
 * @desc Create new order after Razorpay payment
 * @route POST /api/orders
 */
export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, deliveryDate, timeSlot, greetingCardMessage, paymentInfo, subtotal, deliveryFee, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order cannot be empty' });
    }

    const orderId = `DHN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const resolvedShippingAddress = shippingAddress || {
      fullName: req.body.recipientName || req.user?.name || 'Customer',
      phone: req.body.recipientPhone || req.user?.phone || '',
      streetAddress: req.body.deliveryAddress?.street || req.body.address || '',
      city: req.body.deliveryAddress?.city || req.body.city || '',
      state: req.body.deliveryAddress?.state || 'UAE',
      pincode: req.body.postalCode || '',
    };

    const customerEmail =
      req.body.email ||
      req.body.user?.email ||
      shippingAddress?.email ||
      req.user?.email ||
      process.env.SMTP_USER ||
      'divagar.m.msc.cs@gmail.com';

    const customerName =
      resolvedShippingAddress.fullName ||
      req.body.recipientName ||
      req.user?.name ||
      'Valued Client';

    const newOrder = {
      orderId,
      user: {
        id: req.user?.id || req.body.user?.id || 'guest',
        name: customerName,
        email: customerEmail,
        phone: resolvedShippingAddress.phone || req.user?.phone || '',
      },
      items,
      shippingAddress: resolvedShippingAddress,
      deliveryDate: deliveryDate || 'Today',
      timeSlot: timeSlot || req.body.deliverySlot || 'Standard (9 AM - 1 PM)',
      greetingCardMessage: greetingCardMessage || req.body.greetingMessage || '',
      paymentInfo: {
        method: paymentInfo?.method || req.body.paymentMethod || 'Razorpay',
        razorpayOrderId: paymentInfo?.razorpayOrderId || req.body.razorpayOrderId,
        razorpayPaymentId: paymentInfo?.razorpayPaymentId || req.body.razorpayPaymentId,
        status: 'Paid',
      },
      subtotal: Number(subtotal || totalAmount),
      deliveryFee: Number(deliveryFee || 0),
      totalAmount: Number(totalAmount),
      status: 'Confirmed',
      createdAt: new Date(),
    };

    if (getDBStatus()) {
      await OrderModel.create(newOrder);
    }
    inMemoryOrders.unshift(newOrder);

    // Sync order and delivery address to user's profile dashboard
    try {
      recordUserOrder(customerEmail, newOrder);
      recordUserAddress(customerEmail, resolvedShippingAddress);
    } catch (syncErr) {
      console.warn('Profile sync note:', syncErr.message);
    }

    // Asynchronously dispatch Order Confirmation Email to the customer
    if (customerEmail) {
      sendOrderConfirmationEmail({
        email: customerEmail,
        order: newOrder,
        customerName: customerName,
      }).catch((emailErr) => {
        console.warn('⚠️ [Order Email Error]:', emailErr.message);
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Floral order placed successfully!',
      order: newOrder,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get orders for logged-in user
 * @route GET /api/orders/my-orders
 */
export const getMyOrders = async (req, res) => {
  try {
    const userEmail = (
      req.user?.email ||
      req.headers['x-user-email'] ||
      req.query.email ||
      ''
    ).toLowerCase().trim();

    if (!userEmail) {
      return res.status(200).json({ success: true, count: 0, orders: [] });
    }

    if (getDBStatus()) {
      const orders = await OrderModel.find({
        $or: [{ 'user.email': userEmail }, { email: userEmail }]
      }).sort({ createdAt: -1 });
      if (orders && orders.length > 0) {
        return res.status(200).json({ success: true, count: orders.length, orders });
      }
    }

    const filtered = inMemoryOrders.filter((o) => {
      const oEmail = (o.user?.email || o.email || o.shippingAddress?.email || '').toLowerCase().trim();
      return oEmail === userEmail;
    });
    return res.status(200).json({ success: true, count: filtered.length, orders: filtered });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get all orders (Admin)
 * @route GET /api/orders
 */
export const getAllOrders = async (req, res) => {
  try {
    if (getDBStatus()) {
      const orders = await OrderModel.find().sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: orders.length, orders });
    }

    return res.status(200).json({ success: true, count: inMemoryOrders.length, orders: inMemoryOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Update order status (Admin)
 * @route PATCH /api/orders/:orderId/status
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, orderStatus } = req.body;
    const targetStatus = status || orderStatus;

    const allowed = ['Pending', 'Confirmed', 'Preparing Floral Order', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!targetStatus || !allowed.includes(targetStatus)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid order status. Allowed values: ${allowed.join(', ')}` 
      });
    }

    if (getDBStatus()) {
      const updated = await OrderModel.findOneAndUpdate(
        { $or: [{ orderId }, { _id: orderId }] },
        { status: targetStatus },
        { new: true }
      );
      if (updated) {
        return res.status(200).json({ 
          success: true, 
          message: `Order status updated to ${targetStatus}`, 
          order: updated 
        });
      }
    }

    const order = inMemoryOrders.find((o) => o.orderId === orderId || o._id === orderId);
    if (order) {
      order.status = targetStatus;
      return res.status(200).json({ success: true, message: `Order status updated to ${targetStatus}`, order });
    }

    return res.status(404).json({ success: false, message: 'Order not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
