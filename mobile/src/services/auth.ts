import { api } from '@/lib/api';
import { clearSession, saveSession } from '@/lib/storage';
import type { User } from '@/types/models';

export async function login(
  email: string,
  password: string
): Promise<{ user: User; token: string }> {
  const data = await api<{ user: User; token: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data?.token) {
    await saveSession(data.token, data.user);
  }
  return data;
}
export async function loginWithGoogle(payload: {
  name?: string;
  email: string;
  avatar?: string;
  googleUid: string;
  phone?: string;
}): Promise<{ user: User; token: string }> {
  const data = await api<{ user: User; token: string }>('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (data?.token) {
    await saveSession(data.token, data.user);
  }
  return data;
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<{ user: User; token: string }> {
  const data = await api<{ user: User; token: string }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (data?.token) {
    await saveSession(data.token, data.user);
  }
  return data;
}

export async function me(): Promise<{ user: User }> {
  return api<{ user: User }>('/api/auth/me');
}

export async function getProfileData(): Promise<{
  success: boolean;
  user: User;
  cart?: any[];
  savedAddresses?: any[];
  savedBouquets?: any[];
  recentOrders?: any[];
}> {
  return api('/api/auth/profile-data');
}

export async function saveUserCart(cart: any[]): Promise<{ success: boolean; cart: any[] }> {
  return api('/api/auth/cart', {
    method: 'POST',
    body: JSON.stringify({ cart }),
  });
}

export async function toggleWishlist(bouquet: {
  id: string;
  name?: string;
  price?: number;
  image?: string;
  images?: string[];
}): Promise<{ success: boolean; savedBouquets: any[]; action: 'added' | 'removed' }> {
  return api('/api/auth/wishlist', {
    method: 'POST',
    body: JSON.stringify({ bouquet }),
  });
}

export async function updateProfile(payload: {
  name?: string;
  phone?: string;
  avatar?: string;
}): Promise<{ success: boolean; user: User }> {
  return api('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function saveAddress(address: any): Promise<{ success: boolean; address: any }> {
  return api('/api/auth/addresses', {
    method: 'POST',
    body: JSON.stringify(address),
  });
}

export async function deleteAddress(id: string): Promise<{ success: boolean }> {
  return api(`/api/auth/addresses/${id}`, {
    method: 'DELETE',
  });
}

export async function logout(): Promise<void> {
  try {
    await api('/api/auth/logout', { method: 'POST' });
  } catch {
    // Ignore server error on logout
  } finally {
    await clearSession();
  }
}