import { api } from '@/lib/api';
import { resolveImageUrl, resolveProductImages } from '@/lib/imageUrl';
import { getStorageItem, setStorageItem } from '@/lib/storage';
import { INITIAL_CATALOG } from '@/data/initialCatalog';
import type { Product, ProductReview } from '@/types/models';

const REVIEWS_STORAGE_PREFIX = 'dhanvikk.reviews.';
const PRODUCTS_CACHE_KEY = 'dhanvikk.catalog.cache';

// In-memory product cache for 0ms instantaneous UI display
const productCache = new Map<string, Product>();
let catalogInitialized = false;

function indexProduct(p: Product) {
  if (p.id) productCache.set(String(p.id), p);
  if (p._id) productCache.set(String(p._id), p);
  if (p.slug) productCache.set(String(p.slug).toLowerCase(), p);
}

// Pre-seed in-memory catalog from bundled offline products on module load
function ensureCatalogInitialized() {
  if (catalogInitialized) return;
  if (Array.isArray(INITIAL_CATALOG)) {
    for (const item of INITIAL_CATALOG) {
      const normalized = normalizeProduct(item);
      indexProduct(normalized);
    }
  }
  catalogInitialized = true;
}
ensureCatalogInitialized();

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

/**
 * Filter products locally from the in-memory cache for 0ms instant display
 */
function filterCachedProducts(params: Record<string, string | number | undefined> = {}): Product[] {
  ensureCatalogInitialized();
  // Get unique products by id
  const seen = new Set<string>();
  let list: Product[] = [];
  for (const p of productCache.values()) {
    const key = p.id || p.slug;
    if (!seen.has(key)) {
      seen.add(key);
      list.push(p);
    }
  }

  const { category, search, limit } = params;

  if (category && category !== 'All' && category !== 'All Stems' && category !== 'All Blooms') {
    const cLower = String(category).toLowerCase();
    list = list.filter((p) => {
      const pCat = String(p.category || '').toLowerCase();
      const pFlower = String(p.flowerType || '').toLowerCase();
      const pName = String(p.name || '').toLowerCase();
      return pCat.includes(cLower) || pFlower.includes(cLower) || pName.includes(cLower);
    });
  }

  if (search && String(search).trim()) {
    const q = String(search).toLowerCase().trim();
    list = list.filter((p) => {
      const name = String(p.name || '').toLowerCase();
      const desc = String(p.description || '').toLowerCase();
      const cat = String(p.category || '').toLowerCase();
      return name.includes(q) || desc.includes(q) || cat.includes(q);
    });
  }

  if (limit && Number(limit) > 0) {
    list = list.slice(0, Number(limit));
  }

  return list;
}

export function getCachedProducts(params: Record<string, string | number | undefined> = {}): Product[] {
  return filterCachedProducts(params);
}

export async function getProducts(
  params: Record<string, string | number | undefined> = {}
): Promise<Product[]> {
  ensureCatalogInitialized();

  // Instant local result (0ms) so user never sees blank screen or cold-start spinner
  const cachedFallback = filterCachedProducts(params);

  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') {
      query.set(k, String(v));
    }
  });

  const path = '/api/products' + (query.toString() ? '?' + query.toString() : '');

  try {
    const data = await api<any>(path);

    let rawList: any[] = [];
    if (Array.isArray(data)) {
      rawList = data;
    } else if (data?.products && Array.isArray(data.products)) {
      rawList = data.products;
    }

    if (rawList.length > 0) {
      const normalizedList = rawList.map(normalizeProduct);
      // Update in-memory index
      for (const p of normalizedList) {
        indexProduct(p);
      }
      return normalizedList;
    }
  } catch (err: any) {
    // Graceful offline fallback: if Render is spinning up, return instant cached catalog
    console.warn('Network getProducts notice (serving fast cached catalog):', err.message);
  }

  return cachedFallback;
}

export function getCachedProduct(id: string): Product | null {
  ensureCatalogInitialized();
  const cleanId = String(id).trim();
  const found = productCache.get(cleanId) || productCache.get(cleanId.toLowerCase());
  return found ? { ...found } : null;
}

export async function getProduct(id: string): Promise<Product> {
  ensureCatalogInitialized();

  // 1. Instant 0ms cache lookup
  const cleanId = String(id).trim();
  const cached = getCachedProduct(cleanId);
  let product: Product = cached
    ? { ...cached }
    : normalizeProduct({ id, slug: id, name: 'Luxury Bloom', price: 1499, description: '', stock: 10, images: [] });

  // 2. Fetch fresh details / reviews in background without blocking immediate render
  try {
    const data = await api<any>('/api/products/' + encodeURIComponent(id));
    const raw = data?.product || data;
    if (raw && (raw.id || raw._id || raw.name)) {
      product = normalizeProduct(raw);
      indexProduct(product);
    }
  } catch (err: any) {
    // Cached version is already active
    console.warn('API getProduct notice (serving cached item):', err.message);
  }

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