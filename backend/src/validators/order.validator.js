import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          product: z.string(),
          name: z.string(),
          price: z.number().or(z.string().regex(/^\d+(\.\d+)?$/).transform(Number)).pipe(z.number().min(0)),
          quantity: z.number().or(z.string().regex(/^\d+$/).transform(Number)).pipe(z.number().min(1)),
          image: z.string().optional().default('https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=400&q=80'),
          notes: z.string().optional(),
        })
      )
      .min(1, { message: 'Order must contain at least one item' }),
    shippingAddress: z.any().optional(),
    deliveryAddress: z.any().optional(),
    recipientName: z.string().optional(),
    recipientPhone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    deliveryDate: z.string().optional().default('Today'),
    timeSlot: z.string().optional().default('Standard (9 AM - 1 PM)'),
    deliverySlot: z.string().optional(),
    greetingCardMessage: z.string().optional().default(''),
    greetingMessage: z.string().optional(),
    paymentInfo: z.any().optional(),
    paymentMethod: z.string().optional(),
    razorpayOrderId: z.string().optional(),
    razorpayPaymentId: z.string().optional(),
    subtotal: z.number().or(z.string().regex(/^\d+(\.\d+)?$/).transform(Number)).pipe(z.number().min(0)).optional(),
    deliveryFee: z.number().or(z.string().regex(/^\d+(\.\d+)?$/).transform(Number)).pipe(z.number().min(0)).optional().default(0),
    totalAmount: z.number().or(z.string().regex(/^\d+(\.\d+)?$/).transform(Number)).pipe(z.number().min(0)),
    email: z.string().optional(),
    user: z.any().optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    orderId: z.string(),
  }),
  body: z.object({
    status: z.enum([
      'Pending',
      'Confirmed',
      'Preparing Floral Order',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
    ]).optional(),
    orderStatus: z.enum([
      'Pending',
      'Confirmed',
      'Preparing Floral Order',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
    ]).optional(),
  }),
});

export const createRazorpayOrderSchema = z.object({
  body: z.object({
    amount: z.number().or(z.string().regex(/^\d+(\.\d+)?$/).transform(Number)).pipe(z.number().min(1)),
    currency: z.string().optional().default('INR'),
    receipt: z.string().optional(),
  }),
});

export const verifyRazorpayPaymentSchema = z.object({
  body: z.object({
    razorpay_order_id: z.string().optional(),
    razorpay_payment_id: z.string().optional(),
    razorpay_signature: z.string().optional(),
    autoApprove: z.boolean().optional().default(true),
  }),
});
