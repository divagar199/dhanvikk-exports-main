import { api } from '@/lib/api';
import { resolveImageUrl, resolveProductImages } from '@/lib/imageUrl';
import type { Product } from '@/types/models';

export function normalizeProduct(raw: any): Product {
  if (!raw) return raw;

  const id = String(raw.id || raw._id || raw.slug || '');
  const images = resolveProductImages(raw.images, raw.image);
  const primaryImage = images[0] || resolveImageUrl(raw.image);

  return {
    ...raw,
    id,
    _id: raw._id || raw.id,
    image: primaryImage,
    images: images.length > 0 ? images : [primaryImage],
    price: Number(raw.price || 0),
    originalPrice: raw.originalPrice ? Number(raw.originalPrice) : undefined,
    stock: raw.stock !== undefined ? Number(raw.stock) : 10,
    rating: raw.rating !== undefined ? Number(raw.rating) : 4.8,
    reviewsCount: raw.reviewsCount !== undefined ? Number(raw.reviewsCount) : 42,
    flowerType: raw.flowerType || raw.category || 'Luxury Flowers',
    category: raw.category || 'Flowers',
  };
}

export async function getProducts(
  params: Record<string, string | number | undefined> = {}
): Promise<Product[]> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') {
      query.set(k, String(v));
    }
  });

  const path = '/api/products' + (query.toString() ? '?' + query.toString() : '');
  const data = await api<any>(path);

  let rawList: any[] = [];
  if (Array.isArray(data)) {
    rawList = data;
  } else if (data?.products && Array.isArray(data.products)) {
    rawList = data.products;
  }

  return rawList.map(normalizeProduct);
}

export async function getProduct(id: string): Promise<Product> {
  const data = await api<any>('/api/products/' + encodeURIComponent(id));
  const raw = data?.product || data;
  return normalizeProduct(raw);
}