import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'dhanvikk.auth.token';
const USER_KEY = 'dhanvikk.auth.user';

// In-memory fallback if SecureStore has platform issues
const memoryStore: Record<string, string> = {};

export async function saveSession(token: string, user: unknown): Promise<void> {
  try {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, token),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
    ]);
  } catch {
    memoryStore[TOKEN_KEY] = token;
    memoryStore[USER_KEY] = JSON.stringify(user);
  }
}

export async function getToken(): Promise<string | null> {
  try {
    const val = await SecureStore.getItemAsync(TOKEN_KEY);
    return val ?? memoryStore[TOKEN_KEY] ?? null;
  } catch {
    return memoryStore[TOKEN_KEY] ?? null;
  }
}

export async function getStoredUser<T>(): Promise<T | null> {
  try {
    const val = await SecureStore.getItemAsync(USER_KEY);
    const raw = val ?? memoryStore[USER_KEY];
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function setStoredUser(user: unknown): Promise<void> {
  try {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  } catch {
    memoryStore[USER_KEY] = JSON.stringify(user);
  }
}

export async function clearSession(): Promise<void> {
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
  } catch {
    // ignore
  } finally {
    delete memoryStore[TOKEN_KEY];
    delete memoryStore[USER_KEY];
  }
}

export async function getStorageItem<T>(key: string): Promise<T | null> {
  try {
    const val = await SecureStore.getItemAsync(key);
    const raw = val ?? memoryStore[key];
    return raw ? JSON.parse(raw) : null;
  } catch {
    return memoryStore[key] ? JSON.parse(memoryStore[key]) : null;
  }
}

export async function setStorageItem(key: string, val: unknown): Promise<void> {
  const serialized = JSON.stringify(val);
  try {
    await SecureStore.setItemAsync(key, serialized);
  } catch {
    memoryStore[key] = serialized;
  }
}