import mongoose from 'mongoose';
import { OrderModel } from '../models/Order.js';
import { ProductModel } from '../models/Product.js';
import { sendOrderConfirmationEmail } from './emailService.js';
import { saveUserAddress } from './user.service.js';
import { ApiError } from '../utils/apiError.js';
import { getDBStatus } from '../config/db.js';

export const inMemoryOrders = [];

export const createOrderWithInventoryLock = async ({
  items,
  shippingAddress,
  deliveryDate = 'Today',
  timeSlot = 'Standard (9 AM - 1 PM)',
  greetingCardMessage = '',
  paymentInfo = {},
  subtotal,
  deliveryFee = 0,
  totalAmount,
  user = {},
  customerEmail = '',
  customerName = 'Valued Client',
}) => {
  if (!items || items.length === 0) {
    throw new ApiError(400, 'Order cannot be empty');
  }

  const orderYear = new Date().getFullYear();
  const orderId = `DHN-${orderYear}-${Math.floor(1000 + Math.random() * 9000)}`;

  // If MongoDB is offline, record order in in-memory storage immediately
  if (!getDBStatus()) {
    const memoryOrder = {
      _id: `ord_${Date.now()}`,
      orderId,
      user: {
        id: user.id || user._id?.toString() || 'guest',
        name: customerName,
        email: customerEmail,
        phone: shippingAddress.phone || user.phone || '',
      },
      items: items.map((i) => ({
        product: i.product || i.id || 'flw_custom',
        name: i.name || 'Floral Arrangement',
        price: Number(i.price) || 0,
        quantity: Number(i.quantity) || 1,
        image: i.image || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=400&q=80',
      })),
      shippingAddress,
      deliveryDate,
      timeSlot,
      greetingCardMessage,
      paymentInfo: {
        method: paymentInfo.method || 'Razorpay',
        razorpayOrderId: paymentInfo.razorpayOrderId || '',
        razorpayPaymentId: paymentInfo.razorpayPaymentId || '',
        razorpaySignature: paymentInfo.razorpaySignature || '',
        status: paymentInfo.status === 'Paid' ? 'Paid' : 'Pending',
      },
      subtotal: Number(subtotal !== undefined ? subtotal : totalAmount),
      deliveryFee: Number(deliveryFee || 0),
      totalAmount: Number(totalAmount),
      status: paymentInfo.status === 'Paid' ? 'Confirmed' : 'Pending',
      createdAt: new Date(),
    };
    inMemoryOrders.unshift(memoryOrder);
    return memoryOrder;
  }

  // Check whether MongoDB is a replica set (e.g. MongoDB Atlas) or standalone (local dev)
  let session = null;
  let useTransaction = false;

  try {
    const topologyType = mongoose.connection?.client?.topology?.description?.type || '';
    const isReplicaSet =
      topologyType.includes('ReplicaSet') ||
      topologyType === 'Sharded' ||
      Boolean(process.env.MONGODB_URI?.includes('replicaSet') || process.env.MONGODB_URI?.includes('mongodb+srv'));

    if (isReplicaSet) {
      session = await mongoose.startSession();
      session.startTransaction();
      useTransaction = true;
    }
  } catch (sessErr) {
    session = null;
    useTransaction = false;
  }

  try {
    // 1. Stock check & atomic decrement
    for (const item of items) {
      const productId = item.product || item.id;
      const quantity = Number(item.quantity) || 1;

      const isMongoId = /^[0-9a-fA-F]{24}$/.test(productId);
      const query = isMongoId
        ? { $or: [{ _id: productId }, { id: productId }, { slug: productId }] }
        : { $or: [{ id: productId }, { slug: productId }] };

      const product = await ProductModel.findOne(query).session(session || null);
      if (product) {
        if (product.stock < quantity) {
          throw new ApiError(
            400,
            `Insufficient stock for "${product.name}". Only ${product.stock} available in botanical reserve.`
          );
        }

        product.stock = Math.max(0, product.stock - quantity);
        product.inStock = product.stock > 0;
        await product.save({ session: session || null });
      }
    }

    // 2. Format sanitized order document
    const newOrder = {
      orderId,
      user: {
        id: user.id || user._id?.toString() || 'guest',
        name: customerName,
        email: customerEmail,
        phone: shippingAddress.phone || user.phone || '',
      },
      items: items.map((i) => ({
        product: i.product || i.id || 'flw_custom',
        name: i.name || 'Floral Arrangement',
        price: Number(i.price) || 0,
        quantity: Number(i.quantity) || 1,
        image: i.image || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=400&q=80',
      })),
      shippingAddress: {
        fullName: shippingAddress.fullName || customerName,
        phone: shippingAddress.phone || user.phone || '',
        alternatePhone: shippingAddress.alternatePhone || '',
        streetAddress: shippingAddress.streetAddress || shippingAddress.street || '',
        apartment: shippingAddress.apartment || '',
        district: shippingAddress.district || '',
        city: shippingAddress.city || 'Dubai',
        state: shippingAddress.state || 'Dubai',
        country: shippingAddress.country || 'United Arab Emirates',
        pincode: shippingAddress.pincode || shippingAddress.postalCode || '',
        deliveryNotes: shippingAddress.deliveryNotes || '',
      },
      deliveryDate,
      timeSlot,
      greetingCardMessage,
      paymentInfo: {
        method: paymentInfo.method || 'Razorpay',
        razorpayOrderId: paymentInfo.razorpayOrderId || '',
        razorpayPaymentId: paymentInfo.razorpayPaymentId || '',
        razorpaySignature: paymentInfo.razorpaySignature || '',
        status: paymentInfo.status === 'Paid' ? 'Paid' : 'Pending',
      },
      subtotal: Number(subtotal !== undefined ? subtotal : totalAmount),
      deliveryFee: Number(deliveryFee || 0),
      totalAmount: Number(totalAmount),
      status: paymentInfo.status === 'Paid' ? 'Confirmed' : 'Pending',
    };

    let createdOrderDoc;
    if (useTransaction && session) {
      const created = await OrderModel.create([newOrder], { session });
      createdOrderDoc = created[0];
      await session.commitTransaction();
    } else {
      createdOrderDoc = await OrderModel.create(newOrder);
    }

    // 3. Sync delivery address to user's MongoDB profile
    if (customerEmail && shippingAddress.streetAddress) {
      saveUserAddress(customerEmail, {
        title: 'Recent Delivery Address',
        fullName: customerName,
        phone: shippingAddress.phone,
        street: shippingAddress.streetAddress,
        city: shippingAddress.city,
        state: shippingAddress.state,
        country: shippingAddress.country,
        postalCode: shippingAddress.pincode,
      }).catch((addrErr) => console.warn('Address sync note:', addrErr.message));
    }

    // 4. Send Order Confirmation Email only when payment is verified
    if (customerEmail && paymentInfo.status === 'Paid') {
      sendOrderConfirmationEmail({
        email: customerEmail,
        order: createdOrderDoc,
        customerName,
      }).catch((emailErr) => console.warn('Order confirmation email note:', emailErr.message));
    }

    return createdOrderDoc;
  } catch (error) {
    if (useTransaction && session) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

export const getUserOrders = async (email, userId) => {
  const cleanEmail = (email || '').toLowerCase().trim();
  if (!cleanEmail && !userId) {
    return [];
  }

  if (!getDBStatus()) {
    return inMemoryOrders.filter(
      (o) =>
        (cleanEmail && (o.user?.email === cleanEmail || o.customerEmail === cleanEmail)) ||
        (userId && (o.user?.id === userId || o.userId === userId))
    );
  }

  const query = {
    $or: [{ 'user.email': cleanEmail }, { email: cleanEmail }],
  };
  if (userId) {
    query.$or.push({ 'user.id': userId.toString() });
  }

  try {
    const orders = await OrderModel.find(query).sort({ createdAt: -1 }).lean();
    return orders;
  } catch {
    return inMemoryOrders.filter((o) => o.user?.email === cleanEmail);
  }
};

export const listAllOrders = async ({ limit = 100, page = 1, status } = {}) => {
  if (!getDBStatus()) {
    let filtered = inMemoryOrders;
    if (status && status !== 'All') {
      filtered = filtered.filter((o) => o.status === status);
    }
    return {
      orders: filtered,
      count: filtered.length,
      total: filtered.length,
      page: 1,
      pages: 1,
    };
  }

  const query = {};
  if (status && status !== 'All') {
    query.status = status;
  }

  const parsedLimit = Math.min(Number(limit) || 100, 200);
  const parsedPage = Math.max(Number(page) || 1, 1);
  const skip = (parsedPage - 1) * parsedLimit;

  try {
    const [orders, total] = await Promise.all([
      OrderModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(parsedLimit).lean(),
      OrderModel.countDocuments(query),
    ]);

    return {
      orders,
      count: orders.length,
      total,
      page: parsedPage,
      pages: Math.ceil(total / parsedLimit),
    };
  } catch {
    return {
      orders: inMemoryOrders,
      count: inMemoryOrders.length,
      total: inMemoryOrders.length,
      page: 1,
      pages: 1,
    };
  }
};

export const updateStatusOfOrder = async (orderId, newStatus) => {
  if (!getDBStatus()) {
    const order = inMemoryOrders.find((o) => o.orderId === orderId || o.id === orderId);
    if (!order) {
      throw new ApiError(404, `Order with ID ${orderId} not found`);
    }
    order.status = newStatus;
    return order;
  }

  const isMongoId = /^[0-9a-fA-F]{24}$/.test(orderId);
  const query = isMongoId ? { $or: [{ orderId }, { _id: orderId }] } : { orderId };

  try {
    const order = await OrderModel.findOneAndUpdate(query, { status: newStatus }, { new: true });
    if (!order) {
      throw new ApiError(404, `Order with ID ${orderId} not found`);
    }
    return order;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    const memOrder = inMemoryOrders.find((o) => o.orderId === orderId || o.id === orderId);
    if (memOrder) {
      memOrder.status = newStatus;
      return memOrder;
    }
    throw new ApiError(404, `Order with ID ${orderId} not found`);
  }
};

export const confirmOrderPayment = async (razorpayOrderId, { paymentId, signature } = {}) => {
  const updatePayload = {
    'paymentInfo.status': 'Paid',
    'paymentInfo.razorpayPaymentId': paymentId || '',
    'paymentInfo.razorpaySignature': signature || '',
    status: 'Confirmed',
  };

  if (!getDBStatus()) {
    const memOrder = inMemoryOrders.find(
      (o) => o.paymentInfo?.razorpayOrderId === razorpayOrderId || o.orderId === razorpayOrderId
    );
    if (memOrder) {
      memOrder.paymentInfo.status = 'Paid';
      memOrder.paymentInfo.razorpayPaymentId = paymentId || '';
      memOrder.paymentInfo.razorpaySignature = signature || '';
      memOrder.status = 'Confirmed';
      return memOrder;
    }
    return null;
  }

  try {
    const order = await OrderModel.findOneAndUpdate(
      {
        $or: [
          { 'paymentInfo.razorpayOrderId': razorpayOrderId },
          { orderId: razorpayOrderId },
        ],
      },
      { $set: updatePayload },
      { new: true }
    );
    return order;
  } catch (err) {
    console.warn('confirmOrderPayment DB warning:', err.message);
    return null;
  }
};


