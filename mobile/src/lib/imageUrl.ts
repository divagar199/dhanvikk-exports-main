import { BASE } from './api';

export const FALLBACK_FLOWER_IMAGE =
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80';

/**
 * Resolves local backend image paths (/images/products/..., /uploads/...)
 * into absolute URLs accessible to React Native <Image />.
 */
export function resolveImageUrl(img?: string | string[] | null): string {
  if (Array.isArray(img)) {
    return resolveImageUrl(img[0]);
  }

  if (!img || typeof img !== 'string') {
    return FALLBACK_FLOWER_IMAGE;
  }

  const trimmed = img.trim();
  if (!trimmed) {
    return FALLBACK_FLOWER_IMAGE;
  }

  // If already absolute URL or data URI
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }

  // Prepend leading slash if missing
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  return `${BASE}${cleanPath}`;
}

/**
 * Resolves an array of image strings, filtering and normalizing.
 */
export function resolveProductImages(
  images?: string[] | null,
  singleImage?: string | null
): string[] {
  const list: string[] = [];

  if (Array.isArray(images) && images.length > 0) {
    images.forEach((item) => {
      if (item && typeof item === 'string' && item.trim()) {
        list.push(resolveImageUrl(item));
      }
    });
  }

  if (list.length === 0 && singleImage && typeof singleImage === 'string' && singleImage.trim()) {
    list.push(resolveImageUrl(singleImage));
  }

  if (list.length === 0) {
    list.push(FALLBACK_FLOWER_IMAGE);
  }

  return list;
}
