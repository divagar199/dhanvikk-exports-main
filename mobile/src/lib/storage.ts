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

const CHUNK_SIZE = 1800;

export async function removeStorageItem(key: string): Promise<void> {
  try {
    const meta = await SecureStore.getItemAsync(`${key}_meta`);
    if (meta) {
      const numChunks = parseInt(meta, 10) || 0;
      for (let i = 0; i < numChunks; i++) {
        await SecureStore.deleteItemAsync(`${key}_${i}`).catch(() => {});
      }
      await SecureStore.deleteItemAsync(`${key}_meta`).catch(() => {});
    }
    await SecureStore.deleteItemAsync(key).catch(() => {});
  } catch {
    // ignore
  } finally {
    delete memoryStore[key];
  }
}

export async function getStorageItem<T>(key: string): Promise<T | null> {
  try {
    const meta = await SecureStore.getItemAsync(`${key}_meta`);
    if (meta) {
      const numChunks = parseInt(meta, 10) || 0;
      let combined = '';
      for (let i = 0; i < numChunks; i++) {
        const chunk = await SecureStore.getItemAsync(`${key}_${i}`);
        if (chunk) combined += chunk;
      }
      if (combined) {
        return JSON.parse(combined);
      }
    }
    const val = await SecureStore.getItemAsync(key);
    const raw = val ?? memoryStore[key];
    return raw ? JSON.parse(raw) : null;
  } catch {
    return memoryStore[key] ? JSON.parse(memoryStore[key]) : null;
  }
}

export async function setStorageItem(key: string, val: unknown): Promise<void> {
  const serialized = JSON.stringify(val);
  memoryStore[key] = serialized;

  try {
    if (serialized.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, serialized);
      // Clean up any stale chunks if key was previously chunked
      const prevMeta = await SecureStore.getItemAsync(`${key}_meta`);
      if (prevMeta) {
        await SecureStore.deleteItemAsync(`${key}_meta`).catch(() => {});
        const numChunks = parseInt(prevMeta, 10) || 0;
        for (let i = 0; i < numChunks; i++) {
          await SecureStore.deleteItemAsync(`${key}_${i}`).catch(() => {});
        }
      }
    } else {
      // Chunk across keys <= 1800 bytes
      const numChunks = Math.ceil(serialized.length / CHUNK_SIZE);
      for (let i = 0; i < numChunks; i++) {
        const chunk = serialized.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        await SecureStore.setItemAsync(`${key}_${i}`, chunk);
      }
      await SecureStore.setItemAsync(`${key}_meta`, String(numChunks));
      await SecureStore.deleteItemAsync(key).catch(() => {});
    }
  } catch {
    // Already saved to in-memory fallback
  }
}