export interface Product {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  category: string;
  subCategory?: string;
  occasion?: string;
  recipient?: string;
  flowerType?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  inStock: boolean;
  images: string[];
  rating: number;
  reviewsCount?: number;
  tag?: string;
  description: string;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  createdAt?: string;
  notes?: string;
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  avatar?: string;
  encryptedPortalKey?: string;
}

export interface Address {
  id: string;
  title: string;
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
  deliveryNotes?: string;
  district?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  deliveryDate?: string;
  timeSlot?: string;
  greetingCardMessage?: string;
}

export interface OrderItem {
  product: string | Product;
  name: string;
  notes?: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id?: string;
  _id?: string;
  orderId: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
  shippingAddress: Address | {
    fullName: string;
    phone: string;
    streetAddress: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    deliveryNotes?: string;
  };
  deliveryDate: string;
  timeSlot: string;
  greetingCardMessage?: string;
  paymentInfo: {
    method: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    status: string;
  };
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  status: 'Pending' | 'Confirmed' | 'Preparing Floral Order' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  createdAt: string | Date;
}

export interface ProductFilters {
  category?: string;
  occasion?: string;
  recipient?: string;
  flowerType?: string;
  search?: string;
  sort?: 'recommended' | 'price-low' | 'price-high' | 'rating' | 'newest';
  tag?: string;
  limit?: number;
  priceRange?: [number, number];
}

export interface RazorpayOrderResponse {
  success: boolean;
  keyId: string;
  order: {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt: string;
    status: string;
    created_at?: number;
  };
}

