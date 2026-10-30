import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  // @ts-ignore — getReactNativePersistence and initializeAuth exist in the React Native
  // bundle of firebase/auth but are not in the TypeScript web typings.
  initializeAuth,
  // @ts-ignore
  getReactNativePersistence,
} from 'firebase/auth';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// ─── Firebase config — read from env vars, fall back to hardcoded defaults ───
const firebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
    'AIzaSyDoBSnVKgCP7S9ETM7_R-v3VSzw1zh6JNk',
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    'auth-checker-1-main.firebaseapp.com',
  projectId:
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ||
    'auth-checker-1-main',
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    'auth-checker-1-main.firebasestorage.app',
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '160660053649',
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ||
    '1:160660053649:android:2d1e8ed74a5523d83e6930',
};

// ─── Singleton app init ───────────────────────────────────────────────────────
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// ─── Secure persistence adapter ──────────────────────────────────────────────
// Uses expo-secure-store on native and localStorage on web.
// Falls back to an in-memory map if the underlying storage is unavailable.

const memoryFallback: Record<string, string> = {};

const secureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        return typeof localStorage !== 'undefined'
          ? localStorage.getItem(key)
          : null;
      }
      const val = await SecureStore.getItemAsync(key);
      return val ?? memoryFallback[key] ?? null;
    } catch {
      return memoryFallback[key] ?? null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch {
      memoryFallback[key] = value;
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch {
      delete memoryFallback[key];
    }
  },
};

// ─── Auth instance ────────────────────────────────────────────────────────────
// Uses initializeAuth with getReactNativePersistence on native so sessions
// survive app restarts. Falls back to the default getAuth on web.

let authInstance: ReturnType<typeof getAuth>;
try {
  if (
    Platform.OS !== 'web' &&
    typeof initializeAuth === 'function' &&
    typeof getReactNativePersistence === 'function'
  ) {
    authInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(secureStoreAdapter),
    });
  } else {
    authInstance = getAuth(app);
  }
} catch {
  authInstance = getAuth(app);
}

export const auth = authInstance;

// ─── Google OAuth provider ────────────────────────────────────────────────────
// prompt: 'select_account' forces the account chooser to appear on web flows.
// On Android the account chooser is controlled by calling GoogleSignin.signOut()
// before GoogleSignin.signIn() in GoogleSignInModal.tsx.

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
googleProvider.addScope('email');
googleProvider.addScope('profile');

export default app;
