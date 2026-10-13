import Constants from 'expo-constants';
import { getToken } from './storage';

export const BASE = String(
  process.env.EXPO_PUBLIC_API_URL ||
    Constants.expoConfig?.extra?.apiUrl ||
    'https://dhanvikk-exports-api.onrender.com'
).replace(/\/$/, '');

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');

  if (init.body && typeof init.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(BASE + path, {
      ...init,
      headers,
      signal: controller.signal,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errMsg =
        data?.message ||
        data?.error ||
        (Array.isArray(data?.errors) ? data.errors[0]?.message : null) ||
        `Request failed with status ${res.status}`;
      throw new Error(errMsg);
    }

    return data as T;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Connection timed out. Please check your network and try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}