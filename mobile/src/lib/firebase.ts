import { initializeApp, getApps } from 'firebase/app';
// @ts-ignore - getReactNativePersistence and initializeAuth are available in React Native bundle
import { initializeAuth, getReactNativePersistence, getAuth, GoogleAuthProvider } from 'firebase/auth';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDoBSnVKgCP7S9ETM7_R-v3VSzw1zh6JNk',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'auth-checker-1-main.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'auth-checker-1-main',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'auth-checker-1-main.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '160660053649',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:160660053649:android:2d1e8ed74a5523d83e6930',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const memoryFallback: Record<string, string> = {};

const secureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
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

let authInstance: any;
try {
  if (Platform.OS !== 'web' && typeof initializeAuth === 'function' && typeof getReactNativePersistence === 'function') {
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
export const googleProvider = new GoogleAuthProvider();
export default app;
