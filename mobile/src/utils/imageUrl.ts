import { API_BASE_URL } from '../services/apiClient';

// Premium high-res botanical imagery fallbacks (Dhanvikk luxury aesthetic)
const BOTANICAL_FALLBACKS = [
  'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1508615070457-7baeba4003ab?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1000&q=85',
];

export const DEFAULT_PRODUCT_IMAGE = BOTANICAL_FALLBACKS[0];

/**
 * Resolves any image identifier (relative path, upload path, or absolute URL)
 * into a fully-qualified URL that React Native Image and Web can render seamlessly.
 */
export function getProductImageUrl(img?: string | string[] | null): string {
  if (!img) {
    return DEFAULT_PRODUCT_IMAGE;
  }

  // If an array of images was passed, take the first valid one
  if (Array.isArray(img)) {
    if (img.length === 0) return DEFAULT_PRODUCT_IMAGE;
    return getProductImageUrl(img[0]);
  }

  if (typeof img !== 'string') {
    return DEFAULT_PRODUCT_IMAGE;
  }

  const trimmed = img.trim();
  if (!trimmed) return DEFAULT_PRODUCT_IMAGE;

  // Already a full remote URL or data URI
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }

  // Clean trailing slashes from base URL
  const baseUrl = (API_BASE_URL || 'https://dhanvikk-exports-api.onrender.com').replace(/\/+$/, '');

  // Local backend static paths (/images/..., /uploads/..., /api/images/...)
  if (
    trimmed.startsWith('/images') ||
    trimmed.startsWith('/uploads') ||
    trimmed.startsWith('/api/images')
  ) {
    return `${baseUrl}${trimmed}`;
  }

  // Paths without leading slash (images/..., uploads/...)
  if (trimmed.startsWith('images/') || trimmed.startsWith('uploads/')) {
    return `${baseUrl}/${trimmed}`;
  }

  // Generic relative path
  if (trimmed.startsWith('/')) {
    return `${baseUrl}${trimmed}`;
  }

  return `${baseUrl}/${trimmed}`;
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
    const baseUrl = (API_BASE_URL || 'https://dhanvikk-exports-api.onrender.com').replace(/\/+$/, '');
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
