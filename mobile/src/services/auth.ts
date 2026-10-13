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

export async function logout(): Promise<void> {
  try {
    await api('/api/auth/logout', { method: 'POST' });
  } catch {
    // Ignore server error on logout
  } finally {
    await clearSession();
  }
}