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
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
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
export const db = getFirestore(app);

// ─── User → Firestore Sync ────────────────────────────────────────────────────
/**
 * saveUserToDb
 * Writes the authenticated user to Firestore `users/{uid}`.
 * - Sets `createdAt` ONLY on first login (checks whether the doc already exists).
 * - Always updates `lastLoginAt`, `displayName`, `photoURL`, `provider`.
 * - The `role` field is NEVER set from the client on updates (only on creation).
 * - Uses `setDoc(..., { merge: true })` to avoid overwriting unrelated fields.
 */
export const saveUserToDb = async (firebaseUser: any, additionalData: any = {}) => {
  if (!firebaseUser?.uid) return null;

  const cleanEmail = (firebaseUser.email || '').trim().toLowerCase();
  const displayName =
    firebaseUser.displayName ||
    additionalData.name ||
    (cleanEmail ? cleanEmail.split('@')[0] : 'Valued Customer');

  const userRef = doc(db, 'users', firebaseUser.uid);

  try {
    const existingSnap = await Promise.race([
      getDoc(userRef),
      new Promise<any>((_, reject) =>
        setTimeout(() => reject(new Error('Firestore getDoc timeout')), 3000)
      ),
    ]);

    const isNew = !existingSnap.exists();

    if (isNew) {
      // First login: initialize document with all required fields (createdAt, role, uid, email)
      const newUserData = {
        uid: firebaseUser.uid,
        displayName,
        email: cleanEmail,
        photoURL: firebaseUser.photoURL || '',
        phoneNumber: firebaseUser.phoneNumber || additionalData.phone || '',
        provider: additionalData.provider || 'google.com',
        role: 'user',
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      };

      await Promise.race([
        setDoc(userRef, newUserData, { merge: true }),
        new Promise<any>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore setDoc timeout')), 3000)
        ),
      ]);
    } else {
      // Subsequent login: update only mutable fields (never touches uid, email, role, or createdAt)
      const updateData = {
        displayName,
        photoURL: firebaseUser.photoURL || '',
        phoneNumber: firebaseUser.phoneNumber || additionalData.phone || '',
        provider: additionalData.provider || 'google.com',
        lastLoginAt: serverTimestamp(),
      };

      await Promise.race([
        setDoc(userRef, updateData, { merge: true }),
        new Promise<any>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore setDoc timeout')), 3000)
        ),
      ]);
    }

    return {
      uid: firebaseUser.uid,
      displayName,
      email: cleanEmail,
      photoURL: firebaseUser.photoURL || '',
      provider: additionalData.provider || 'google.com',
      role: isNew ? 'user' : (existingSnap.data()?.role || 'user'),
    };
  } catch (err) {
    console.warn('[saveUserToDb] Firestore write failed or timed out:', err);
    return null;
  }
};

// ─── Google OAuth provider ────────────────────────────────────────────────────
// prompt: 'select_account' forces the account chooser to appear on web flows.
// On Android the account chooser is controlled by calling GoogleSignin.signOut()
// before GoogleSignin.signIn() in GoogleSignInModal.tsx.

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
googleProvider.addScope('email');
googleProvider.addScope('profile');

export default app;
