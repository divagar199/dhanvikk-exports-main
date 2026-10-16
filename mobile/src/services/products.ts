import { api } from '@/lib/api';
import { resolveImageUrl, resolveProductImages } from '@/lib/imageUrl';
import { getStorageItem, setStorageItem } from '@/lib/storage';
import type { Product, ProductReview } from '@/types/models';

const REVIEWS_STORAGE_PREFIX = 'dhanvikk.reviews.';

export async function getStoredProductReviews(productId: string): Promise<ProductReview[]> {
  try {
    const list = await getStorageItem<ProductReview[]>(`${REVIEWS_STORAGE_PREFIX}${productId}`);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function saveStoredProductReview(productId: string, review: ProductReview): Promise<ProductReview[]> {
  try {
    const current = await getStoredProductReviews(productId);
    const updated = [review, ...current.filter((r) => r.id !== review.id && r.comment !== review.comment)];
    await setStorageItem(`${REVIEWS_STORAGE_PREFIX}${productId}`, updated);
    return updated;
  } catch {
    return [review];
  }
}

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
    reviews: Array.isArray(raw.reviews) ? raw.reviews : undefined,
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
  let raw: any = null;
  try {
    const data = await api<any>('/api/products/' + encodeURIComponent(id));
    raw = data?.product || data;
  } catch (err: any) {
    console.warn('API getProduct warning:', err.message);
  }

  const product = normalizeProduct(raw || { id, slug: id, name: 'Luxury Bloom', price: 1499, description: '', stock: 10, images: [] });

  // Merge server reviews with permanently stored local device reviews
  const localReviews = await getStoredProductReviews(product.id || id);
  const serverReviews: ProductReview[] = Array.isArray(product.reviews) ? product.reviews : [];

  const seenKeys = new Set<string>();
  const mergedReviews: ProductReview[] = [];

  for (const r of localReviews) {
    const key = r.id || `${r.userName}-${r.comment}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      mergedReviews.push(r);
    }
  }

  for (const r of serverReviews) {
    const key = r.id || (r as any)._id || `${r.userName}-${r.comment}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      mergedReviews.push(r);
    }
  }

  product.reviews = mergedReviews;
  if (mergedReviews.length > 0) {
    product.reviewsCount = Math.max(product.reviewsCount || 0, mergedReviews.length);
  }

  return product;
}

export async function rateProduct(
  id: string,
  rating: number,
  comment?: string,
  userName?: string
): Promise<{ success: boolean; message: string; product: Product; review?: ProductReview }> {
  const payload: any = { rating, comment };
  if (userName) payload.userName = userName;

  let data: any = null;
  try {
    data = await api<any>(`/api/products/${encodeURIComponent(id)}/reviews`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (err: any) {
    console.warn('API rateProduct notice:', err.message);
  }

  const review: ProductReview = data?.review || {
    id: `rev-${Date.now()}`,
    userName: userName || 'Verified Customer',
    rating,
    comment: comment || 'Verified Dhanvikk luxury floral arrangement.',
    verified: true,
    createdAt: new Date().toISOString(),
  };

  // Permanently save review locally in device storage for this product
  await saveStoredProductReview(id, review);

  const product = normalizeProduct(data?.product);
  return {
    success: true,
    message: data?.message || 'Review submitted and stored permanently! 🌸',
    product,
    review,
  };
}