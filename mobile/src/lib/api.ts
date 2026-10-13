import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { getToken, getStoredUser } from './storage';

const rawApiUrl = String(
  process.env.EXPO_PUBLIC_API_URL ||
    Constants.expoConfig?.extra?.apiUrl ||
    'http://10.0.2.2:5000'
).replace(/\/$/, '');

export const BASE =
  Platform.OS === 'android' && (rawApiUrl.includes('localhost') || rawApiUrl.includes('127.0.0.1'))
    ? rawApiUrl.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2')
    : rawApiUrl;

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const [token, storedUser] = await Promise.all([
    getToken(),
    getStoredUser<{ email?: string }>().catch(() => null),
  ]);
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');

  if (init.body && typeof init.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (storedUser?.email) {
    headers.set('X-User-Email', storedUser.email);
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