/**
 * Resolve image URL to ensure local uploads (/uploads/...) and external URLs load smoothly
 */
export function getProductImageUrl(img) {
  if (!img) {
    return 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80';
  }

  // If array of images passed
  if (Array.isArray(img)) {
    return getProductImageUrl(img[0]);
  }

  if (typeof img !== 'string') {
    return 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80';
  }

  // If already absolute URL
  if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) {
    return img;
  }

  // If stored locally in /uploads/
  const backendUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
  if (img.startsWith('/uploads')) {
    return `${backendUrl}${img}`;
  }

  if (img.startsWith('uploads/')) {
    return `${backendUrl}/${img}`;
  }

  return img;
}

/**
 * Resolve user profile image, prioritizing Google/Gmail profile pictures
 */
export function getUserAvatarUrl(user = {}) {
  const avatar = user?.avatar || user?.photoURL || '';
  const email = (user?.email || '').toLowerCase().trim();
  const name = user?.name || user?.displayName || email.split('@')[0] || 'Customer';

  if (avatar && (avatar.includes('googleusercontent.com') || avatar.includes('cloudinary') || avatar.includes('unsplash') || avatar.startsWith('data:'))) {
    return avatar;
  }

  if (email.endsWith('@gmail.com') || email.includes('google')) {
    return `https://unavatar.io/google/${encodeURIComponent(email)}?fallback=${encodeURIComponent(
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=800020&color=d4af37&bold=true&size=256`
    )}`;
  }

  if (avatar) return avatar;

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=800020&color=d4af37&bold=true&size=256`;
}
