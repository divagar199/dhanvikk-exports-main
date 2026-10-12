import {
  createOrderWithInventoryLock,
  getUserOrders,
  listAllOrders,
  updateStatusOfOrder,
} from '../services/order.service.js';

export const createOrder = async (req, res, next) => {
  try {
    const {
      items,
      shippingAddress,
      deliveryAddress,
      recipientName,
      recipientPhone,
      address,
      city,
      postalCode,
      deliveryDate,
      timeSlot,
      deliverySlot,
      greetingCardMessage,
      greetingMessage,
      paymentInfo,
      paymentMethod,
      razorpayOrderId,
      razorpayPaymentId,
      subtotal,
      deliveryFee,
      totalAmount,
    } = req.body;

    const resolvedShippingAddress = shippingAddress || {
      fullName: recipientName || req.user?.name || 'Customer',
      phone: recipientPhone || req.user?.phone || '',
      streetAddress: deliveryAddress?.street || address || '',
      city: deliveryAddress?.city || city || 'Dubai',
      state: deliveryAddress?.state || 'Dubai',
      country: deliveryAddress?.country || 'United Arab Emirates',
      pincode: postalCode || deliveryAddress?.postalCode || '',
    };

    const customerEmail = (
      req.user?.email ||
      shippingAddress?.email ||
      ''
    ).toLowerCase().trim();

    const customerName =
      resolvedShippingAddress.fullName ||
      recipientName ||
      req.user?.name ||
      'Valued Client';

    // Payment status must reflect genuine verification, never defaulting unverified orders to 'Paid'
    const isPaymentVerified =
      paymentInfo?.status === 'Paid' &&
      Boolean(paymentInfo?.razorpayPaymentId) &&
      Boolean(paymentInfo?.razorpaySignature || paymentInfo?.razorpayOrderId);

    const resolvedPaymentInfo = {
      method: paymentInfo?.method || paymentMethod || 'Razorpay',
      razorpayOrderId: paymentInfo?.razorpayOrderId || razorpayOrderId || '',
      razorpayPaymentId: paymentInfo?.razorpayPaymentId || razorpayPaymentId || '',
      razorpaySignature: paymentInfo?.razorpaySignature || '',
      status: isPaymentVerified ? 'Paid' : (paymentInfo?.status || 'Pending'),
    };

    const order = await createOrderWithInventoryLock({
      items,
      shippingAddress: resolvedShippingAddress,
      deliveryDate: deliveryDate || 'Today',
      timeSlot: timeSlot || deliverySlot || 'Standard (9 AM - 1 PM)',
      greetingCardMessage: greetingCardMessage || greetingMessage || '',
      paymentInfo: resolvedPaymentInfo,
      subtotal: subtotal !== undefined ? subtotal : totalAmount,
      deliveryFee: deliveryFee || 0,
      totalAmount,
      user: req.user || {},
      customerEmail,
      customerName,
    });

    return res.status(201).json({
      success: true,
      message: 'Floral order placed successfully!',
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const userEmail = (req.user?.email || '').toLowerCase().trim();
    const userId = (req.user?._id || req.user?.id || '').toString();

    if (!userEmail && !userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to view order history',
      });
    }

    const orders = await getUserOrders(userEmail, userId);

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const result = await listAllOrders(req.query);
    return res.status(200).json({
      success: true,
      count: result.count,
      total: result.total,
      page: result.page,
      pages: result.pages,
      orders: result.orders,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status, orderStatus } = req.body;
    const targetStatus = status || orderStatus;

    const order = await updateStatusOfOrder(orderId, targetStatus);
    return res.status(200).json({
      success: true,
      message: `Order status updated to ${targetStatus}`,
      order,
    });
  } catch (error) {
    next(error);
  }
};
