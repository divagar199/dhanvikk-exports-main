export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  avatar?: string;
};

export type ProductReview = {
  id?: string;
  _id?: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  rating: number;
  comment: string;
  date?: string;
  createdAt?: string;
  verified?: boolean;
  helpful?: number;
};

export type Product = {
  id?: string;
  _id?: string;
  slug: string;
  name: string;
  category: string;
  subCategory?: string;
  occasion?: string;
  recipient?: string;
  flowerType?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  images: string[];
  image?: string;
  rating?: number;
  reviewsCount?: number;
  reviews?: ProductReview[];
  tag?: string;
  description: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  inStock?: boolean;
};

export type CartItem = Product & {
  quantity: number;
};

export type Address = {
  id?: string;
  title?: string;
  fullName?: string;
  recipientName: string;
  phone: string;
  street: string;
  streetAddress?: string;
  district?: string;
  city: string;
  state: string;
  postalCode?: string;
  pincode?: string;
  country: string;
  isDefault?: boolean;
};

export type Order = {
  _id?: string;
  id?: string;
  orderId: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  items: Array<{
    product?: string;
    id?: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    notes?: string;
  }>;
  shippingAddress: Record<string, any>;
  deliveryDate: string;
  timeSlot?: string;
  greetingCardMessage?: string;
  paymentInfo?: {
    method?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    status?: string;
  };
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  status: string;
  createdAt?: string;
};