import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email({ message: 'Valid email address is required' }),
    password: z.string().min(1, { message: 'Password is required' }),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, { message: 'Name must be at least 2 characters long' }),
    email: z.string().trim().email({ message: 'Valid email address is required' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
    phone: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
    zipCode: z.string().optional(),
    addressType: z.string().optional(),
    address: z.any().optional(),
  }),
});

export const googleLoginSchema = z.object({
  body: z.object({
    email: z.string().trim().email().optional(),
    name: z.string().optional(),
    avatar: z.string().optional(),
    googleUid: z.string().optional(),
    phone: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
    zipCode: z.string().optional(),
    addressType: z.string().optional(),
    isNewRegistration: z.boolean().optional(),
  }),
});

export const firebaseLoginSchema = z.object({
  body: z.object({
    idToken: z.string().optional(),
    email: z.string().optional(),
    name: z.string().optional(),
    phone: z.string().optional(),
    avatar: z.string().optional(),
    authMethod: z.string().optional(),
    uid: z.string().optional(),
  }),
});

export const addressSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    fullName: z.string().optional(),
    recipientName: z.string().optional(),
    phone: z.string().optional(),
    street: z.string().optional(),
    streetAddress: z.string().optional(),
    district: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    pincode: z.string().optional(),
    country: z.string().optional(),
    isDefault: z.boolean().optional(),
    deliveryNotes: z.string().optional(),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).optional(),
    phone: z.string().optional(),
    avatar: z.string().optional(),
  }),
});

export const cartSchema = z.object({
  body: z.object({
    cart: z.array(z.any()),
  }),
});

export const wishlistSchema = z.object({
  body: z.object({
    bouquet: z.any(),
  }),
});
