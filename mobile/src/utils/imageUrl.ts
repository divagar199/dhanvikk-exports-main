import { API_BASE_URL } from '../services/apiClient';

// Production public asset host where all 199 product webp images are permanently hosted
export const PRODUCTION_ASSET_BASE = 'https://dhanvikk-exports-api.onrender.com';

// Customizable via EXPO_PUBLIC_IMAGE_BASE_URL if desired
export const IMAGE_ASSET_BASE =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_IMAGE_BASE_URL) ||
  PRODUCTION_ASSET_BASE;

// Premium high-res botanical imagery fallbacks (Dhanvikk luxury aesthetic)
export const BOTANICAL_FALLBACKS = [
  'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1000&q=85', // Fresh Roses
  'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1000&q=85', // Flower Boxes
  'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=1000&q=85', // Hand Bouquets
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=85', // Forever Roses
  'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1000&q=85', // Gift Bundles
  'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1000&q=85', // Plants
  'https://images.unsplash.com/photo-1508615070457-7baeba4003ab?auto=format&fit=crop&w=1000&q=85', // Orchids
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=85', // Garlands / Weddings
];

export const DEFAULT_PRODUCT_IMAGE = BOTANICAL_FALLBACKS[0];

export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  'Flower Boxes': BOTANICAL_FALLBACKS[1],
  'Forever Roses': BOTANICAL_FALLBACKS[3],
  'Flowers': BOTANICAL_FALLBACKS[0],
  'Roses': BOTANICAL_FALLBACKS[0],
  'Hand Bouquets': BOTANICAL_FALLBACKS[2],
  'Gift Bundles': BOTANICAL_FALLBACKS[4],
  'Plants': BOTANICAL_FALLBACKS[5],
  'Orchids': BOTANICAL_FALLBACKS[6],
  'Garlands': BOTANICAL_FALLBACKS[7],
};

/**
 * Returns a high-res curated botanical image matching the product category
 */
export function getCategoryFallbackImage(category?: string | null): string {
  if (!category) return DEFAULT_PRODUCT_IMAGE;
  const lower = category.toLowerCase();
  if (lower.includes('box')) return CATEGORY_FALLBACK_IMAGES['Flower Boxes'];
  if (lower.includes('forever') || lower.includes('preserved')) return CATEGORY_FALLBACK_IMAGES['Forever Roses'];
  if (lower.includes('bouquet')) return CATEGORY_FALLBACK_IMAGES['Hand Bouquets'];
  if (lower.includes('gift') || lower.includes('bundle') || lower.includes('combo')) return CATEGORY_FALLBACK_IMAGES['Gift Bundles'];
  if (lower.includes('plant') || lower.includes('bonsai')) return CATEGORY_FALLBACK_IMAGES['Plants'];
  if (lower.includes('orchid')) return CATEGORY_FALLBACK_IMAGES['Orchids'];
  if (lower.includes('garland') || lower.includes('temple') || lower.includes('pooja') || lower.includes('wedding')) {
    return CATEGORY_FALLBACK_IMAGES['Garlands'];
  }
  if (lower.includes('rose')) return CATEGORY_FALLBACK_IMAGES['Roses'];
  return DEFAULT_PRODUCT_IMAGE;
}

/**
 * Resolves any image identifier (relative path, upload path, or absolute URL)
 * into a fully-qualified URL that React Native Image and Web can render seamlessly.
 *
 * For mobile clients, static catalog paths (/images/products/...) are resolved to the
 * high-performance HTTPS production CDN, preventing Android cleartext HTTP blocks
 * and unreachable local development IPs.
 */
export function getProductImageUrl(img?: string | string[] | null, category?: string | null): string {
  if (!img) {
    return getCategoryFallbackImage(category);
  }

  // If an array of images was passed, take the first valid one
  if (Array.isArray(img)) {
    if (img.length === 0) return getCategoryFallbackImage(category);
    return getProductImageUrl(img[0], category);
  }

  if (typeof img !== 'string') {
    return getCategoryFallbackImage(category);
  }

  const trimmed = img.trim();
  if (!trimmed) return getCategoryFallbackImage(category);

  // Already a full remote URL or data URI
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:')
  ) {
    // If a full URL points to an unroutable dev localhost/port 5000 image, rewrite to HTTPS production
    const useLocal = typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_USE_LOCAL_IMAGES === 'true';
    if (!useLocal && (trimmed.includes(':5000/images/') || trimmed.includes('localhost:5000') || trimmed.includes('10.0.2.2:5000'))) {
      const match = trimmed.match(/:5000(\/.*)$/);
      if (match && match[1]) {
        return `${PRODUCTION_ASSET_BASE}${match[1]}`;
      }
    }
    return trimmed;
  }

  // Target base host for catalog static assets
  const cdnBase = (IMAGE_ASSET_BASE || PRODUCTION_ASSET_BASE).replace(/\/+$/, '');
  const useLocal = typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_USE_LOCAL_IMAGES === 'true';
  const localApiBase = (API_BASE_URL || cdnBase).replace(/\/+$/, '');

  // Local backend static paths (/images/..., /uploads/..., /api/images/...)
  if (
    trimmed.startsWith('/images') ||
    trimmed.startsWith('/api/images')
  ) {
    return `${cdnBase}${trimmed}`;
  }

  // Dynamic user uploads (/uploads/...)
  if (trimmed.startsWith('/uploads')) {
    return `${useLocal ? localApiBase : cdnBase}${trimmed}`;
  }

  // Paths without leading slash (images/..., uploads/...)
  if (trimmed.startsWith('images/')) {
    return `${cdnBase}/${trimmed}`;
  }

  if (trimmed.startsWith('uploads/')) {
    return `${useLocal ? localApiBase : cdnBase}/${trimmed}`;
  }

  // Generic relative path
  if (trimmed.startsWith('/')) {
    return `${cdnBase}${trimmed}`;
  }

  return `${cdnBase}/${trimmed}`;
}

/**
 * Resolve user profile avatar, with automatic Google / Gmail avatar integration
 */
export function getUserAvatarUrl(user?: { avatar?: string; photoURL?: string; email?: string; name?: string; displayName?: string } | null): string {
  const avatar = user?.avatar || user?.photoURL || '';
  const email = (user?.email || '').toLowerCase().trim();
  const name = user?.name || user?.displayName || (email ? email.split('@')[0] : 'Guest');

  if (
    avatar &&
    (avatar.includes('googleusercontent.com') ||
      avatar.includes('cloudinary') ||
      avatar.includes('unsplash') ||
      avatar.startsWith('data:') ||
      avatar.startsWith('http://') ||
      avatar.startsWith('https://'))
  ) {
    return avatar;
  }

  if (avatar && avatar.startsWith('/')) {
    const baseUrl = (IMAGE_ASSET_BASE || PRODUCTION_ASSET_BASE).replace(/\/+$/, '');
    return `${baseUrl}${avatar}`;
  }

  if (email.endsWith('@gmail.com') || email.includes('google')) {
    return `https://unavatar.io/google/${encodeURIComponent(email)}?fallback=${encodeURIComponent(
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=9A2143&color=FFFFFF&bold=true&size=256`
    )}`;
  }

  if (avatar) return avatar;

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=9A2143&color=FFFFFF&bold=true&size=256`;
}
