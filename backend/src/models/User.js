import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['customer', 'admin', 'manager', 'inventory_manager', 'delivery_manager', 'super_admin'],
      default: 'customer',
    },
    phone: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    encryptedPortalKey: {
      type: String,
      default: '',
    },
    savedAddresses: [
      {
        id: { type: String },
        title: { type: String, default: 'Primary Residence' },
        recipientName: { type: String, default: '' },
        phone: { type: String, default: '' },
        street: { type: String, default: '' },
        district: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        postalCode: { type: String, default: '' },
        country: { type: String, default: 'UAE' },
        isDefault: { type: Boolean, default: false },
      },
    ],
    savedBouquets: [
      {
        id: { type: String },
        name: { type: String },
        price: { type: Number },
        currency: { type: String, default: 'INR' },
        category: { type: String, default: 'Flowers' },
        image: { type: String },
        inStock: { type: Boolean, default: true },
        rating: { type: Number, default: 5 },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    cart: [
      {
        id: { type: String },
        name: { type: String },
        price: { type: Number },
        quantity: { type: Number, default: 1 },
        image: { type: String },
        currency: { type: String, default: 'INR' },
        category: { type: String, default: 'Flowers' },
      },
    ],
    loginHistory: [
      {
        timestamp: { type: Date, default: Date.now },
        ip: String,
        userAgent: String,
        method: { type: String, default: 'email' },
      },
    ],
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
