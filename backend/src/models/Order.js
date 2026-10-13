import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  image: {
    type: String,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      id: String,
      name: String,
      email: String,
      phone: String,
    },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      alternatePhone: String,
      streetAddress: { type: String, required: true },
      apartment: String,
      district: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, default: 'Dubai / UAE / IN' },
      country: { type: String, default: 'United Arab Emirates' },
      pincode: { type: String, default: '' },
      deliveryNotes: String,
    },
    deliveryDate: {
      type: String,
      required: true,
    },
    timeSlot: {
      type: String,
      default: 'Standard (9 AM - 1 PM)',
    },
    greetingCardMessage: {
      type: String,
      default: '',
    },
    paymentInfo: {
      method: { type: String, default: 'razorpay' },
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      status: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
        default: 'Paid',
      },
    },
    subtotal: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Preparing Floral Order', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Confirmed',
    },
  },
  { timestamps: true }
);

export const OrderModel = mongoose.models.Order || mongoose.model('Order', orderSchema);
