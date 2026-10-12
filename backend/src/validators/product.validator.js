import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, { message: 'Product name must be at least 2 characters long' }),
    category: z.string().optional().default('Flowers'),
    subCategory: z.string().optional().default('Hand Bouquets'),
    occasion: z.string().optional().default('All'),
    recipient: z.string().optional().default('Everyone'),
    flowerType: z.string().optional().default('Roses'),
    price: z.number().or(z.string().regex(/^\d+(\.\d+)?$/).transform(Number)).pipe(z.number().min(0)),
    originalPrice: z.number().or(z.string().regex(/^\d+(\.\d+)?$/).transform(Number)).pipe(z.number().min(0)).optional(),
    stock: z.number().or(z.string().regex(/^\d+$/).transform(Number)).pipe(z.number().min(0)).optional().default(20),
    stockCount: z.number().or(z.string().regex(/^\d+$/).transform(Number)).pipe(z.number().min(0)).optional(),
    currency: z.string().optional().default('INR'),
    inStock: z.boolean().optional(),
    images: z.array(z.string()).or(z.string().transform((s) => [s])).optional(),
    image: z.string().optional(),
    description: z.string().optional(),
    tag: z.string().optional().default('NEW'),
    isFeatured: z.boolean().optional(),
    isBestSeller: z.boolean().optional(),
    isNewArrival: z.boolean().optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string().trim().min(2).optional(),
    category: z.string().optional(),
    subCategory: z.string().optional(),
    occasion: z.string().optional(),
    recipient: z.string().optional(),
    flowerType: z.string().optional(),
    price: z.number().or(z.string().regex(/^\d+(\.\d+)?$/).transform(Number)).pipe(z.number().min(0)).optional(),
    originalPrice: z.number().or(z.string().regex(/^\d+(\.\d+)?$/).transform(Number)).pipe(z.number().min(0)).optional(),
    stock: z.number().or(z.string().regex(/^\d+$/).transform(Number)).pipe(z.number().min(0)).optional(),
    stockCount: z.number().or(z.string().regex(/^\d+$/).transform(Number)).pipe(z.number().min(0)).optional(),
    currency: z.string().optional(),
    inStock: z.boolean().optional(),
    images: z.array(z.string()).or(z.string().transform((s) => [s])).optional(),
    image: z.string().optional(),
    description: z.string().optional(),
    tag: z.string().optional(),
    isFeatured: z.boolean().optional(),
    isBestSeller: z.boolean().optional(),
    isNewArrival: z.boolean().optional(),
  }),
});

export const updateStockSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    stock: z.number().or(z.string().regex(/^\d+$/).transform(Number)).pipe(z.number().min(0)).optional(),
    delta: z.number().or(z.string().regex(/^-?\d+$/).transform(Number)).pipe(z.number()).optional(),
  }),
});

export const queryProductSchema = z.object({
  query: z.object({
    category: z.string().optional(),
    occasion: z.string().optional(),
    recipient: z.string().optional(),
    flowerType: z.string().optional(),
    search: z.string().optional(),
    sort: z.string().optional(),
    tag: z.string().optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});
