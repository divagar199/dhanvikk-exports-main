import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';

// Firebase configuration for project: auth-checker-diva
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDwLPDUMXVPwGY4LtVxpG1YnTNQMHyPeW8',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'auth-checker-diva.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'auth-checker-diva',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'auth-checker-diva.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '972583680950',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:972583680950:web:16d5c7b51f8b08a9205f17',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-9ZW01S27GN',
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Analytics safely
let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export { analytics };
export const googleProvider = new GoogleAuthProvider();

// Custom parameters for Google OAuth
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Safe user profile extraction (non-blocking)
 */
export const syncUserWithFirestore = async (firebaseUser, additionalData = {}) => {
  if (!firebaseUser?.uid) return null;

  const cleanEmail = firebaseUser.email || '';
  const baseData = {
    uid: firebaseUser.uid,
    id: firebaseUser.uid,
    email: cleanEmail,
    displayName:
      firebaseUser.displayName ||
      additionalData.name ||
      (cleanEmail ? cleanEmail.split('@')[0] : 'Valued Customer'),
    photoURL: firebaseUser.photoURL || '',
    phoneNumber: firebaseUser.phoneNumber || additionalData.phone || '',
    role: additionalData.role || 'customer',
    ...additionalData,
  };

  // Background non-blocking sync attempt (fails silently if Firestore API is disabled)
  (async () => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      await Promise.race([
        setDoc(userRef, { ...baseData, lastLoginAt: serverTimestamp() }, { merge: true }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 1000)),
      ]);
    } catch {
      // Offline or disabled Firestore is non-fatal
    }
  })();

  return baseData;
};

/**
 * Sign In with Google (Popup first for speed; automatic redirect fallback if blocked by browser)
 */
export const signInWithGoogleFirebase = async (preferRedirect = false) => {
  if (preferRedirect) {
    await signInWithRedirect(auth, googleProvider);
    return { redirecting: true };
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const token = await user.getIdToken();

    const cleanEmail = user.email || '';
    const resolvedName = user.displayName || (cleanEmail ? cleanEmail.split('@')[0] : 'Google Customer');
    const resolvedAvatar = user.photoURL || (cleanEmail ? `https://unavatar.io/google/${encodeURIComponent(cleanEmail)}` : '');

    // Non-blocking background sync attempt
    syncUserWithFirestore(user, { provider: 'google' }).catch(() => {});

    return {
      success: true,
      user: {
        id: user.uid,
        name: resolvedName,
        email: cleanEmail,
        avatar: resolvedAvatar,
        phone: user.phoneNumber || '',
        role: 'customer',
      },
      token,
    };
  } catch (error) {
    console.warn('Google Sign-In interaction:', error?.code, error?.message);
    // Automatic fallback: If browser blocks popups, initiate seamless redirect flow
    if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/cancelled-popup-request') {
      console.info('Popup blocked by browser. Automatically switching to Google redirect sign-in flow...');
      try {
        await signInWithRedirect(auth, googleProvider);
        return { redirecting: true };
      } catch (redirectErr) {
        console.error('Redirect sign-in fallback failed:', redirectErr);
        throw redirectErr;
      }
    }
    throw error;
  }
};

/**
 * Direct Google Redirect Sign-In (Guaranteed to bypass all browser popup blockers)
 */
export const signInWithGoogleRedirectFirebase = async () => {
  try {
    await signInWithRedirect(auth, googleProvider);
    return { redirecting: true };
  } catch (error) {
    console.error('Google Redirect Error:', error?.code, error?.message);
    throw error;
  }
};

/**
 * Handle Google Redirect result if redirect authentication was used
 */
export const checkGoogleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (!result?.user) return null;
    const user = result.user;
    const token = await user.getIdToken();

    const cleanEmail = user.email || '';
    const resolvedName = user.displayName || (cleanEmail ? cleanEmail.split('@')[0] : 'Google Customer');
    const resolvedAvatar = user.photoURL || (cleanEmail ? `https://unavatar.io/google/${encodeURIComponent(cleanEmail)}` : '');

    syncUserWithFirestore(user, { provider: 'google' }).catch(() => {});

    return {
      success: true,
      user: {
        id: user.uid,
        name: resolvedName,
        email: cleanEmail,
        avatar: resolvedAvatar,
        phone: user.phoneNumber || '',
        role: 'customer',
      },
      token,
    };
  } catch (error) {
    console.warn('Redirect check notice:', error.message);
    return null;
  }
};

/**
 * Register with Email and Password
 */
export const signUpWithEmailPassword = async (email, password, displayName) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    if (displayName) {
      await updateProfile(user, { displayName });
    }

    const token = await user.getIdToken();
    const profile = await syncUserWithFirestore(user, {
      name: displayName,
      provider: 'password',
    });

    return {
      success: true,
      user: {
        id: user.uid,
        name: displayName || user.email.split('@')[0],
        email: user.email,
        role: profile?.role || 'customer',
      },
      token,
    };
  } catch (error) {
    console.error('Email/Password Registration Error:', error);
    throw error;
  }
};

/**
 * Sign In with Email and Password
 */
export const signInWithEmailPasswordFirebase = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    const token = await user.getIdToken();
    const profile = await syncUserWithFirestore(user, {
      provider: 'password',
    });

    return {
      success: true,
      user: {
        id: user.uid,
        name: profile?.displayName || user.displayName || user.email.split('@')[0],
        email: user.email,
        role: profile?.role || 'customer',
      },
      token,
    };
  } catch (error) {
    console.error('Email/Password Login Error:', error);
    throw error;
  }
};

/**
 * Sign Out
 */
export const logOutFirebase = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Firebase Sign-Out Error:', error);
    throw error;
  }
};

/**
 * Send Password Reset Email
 */
export const resetPasswordFirebase = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Password Reset Error:', error);
    throw error;
  }
};

export { onAuthStateChanged };
export default app;
