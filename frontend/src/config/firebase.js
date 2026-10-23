import { initializeApp, getApps } from 'firebase/app';
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

// Firebase configuration for project: auth-checker-1-main (Web App)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyC1hipp0dBNuKNRcT11fb-yj9KHZjFAQdE',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'auth-checker-1-main.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'auth-checker-1-main',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'auth-checker-1-main.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '160660053649',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:160660053649:web:3133a668cc3085163e6930',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-0Q9KCWM5N5',
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Analytics safely in browser
export let analytics = null;
if (typeof window !== 'undefined') {
  import('firebase/analytics')
    .then(({ getAnalytics, isSupported }) => {
      isSupported().then((supported) => {
        if (supported) analytics = getAnalytics(app);
      }).catch(() => {});
    })
    .catch(() => {});
}

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
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
 * Sign In with Google (Instant popup with seamless automatic redirect fallback if popup is blocked)
 */
export const signInWithGoogleFirebase = async () => {
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
        uid: user.uid,
        googleUid: user.uid,
        name: resolvedName,
        email: cleanEmail,
        avatar: resolvedAvatar,
        phone: user.phoneNumber || '',
        role: 'customer',
      },
      token,
    };
  } catch (error) {
    console.warn('Google Sign-In interaction notice:', error.code, error.message);
    
    // Automatic Seamless Fallback: If browser blocks popups, redirect directly to Google Sign-In
    if (
      error.code === 'auth/popup-blocked' ||
      error.code === 'auth/cancelled-popup-request' ||
      error.message?.includes('popup')
    ) {
      try {
        console.info('Google Popup blocked by browser; falling back seamlessly to Google redirect sign-in...');
        if (typeof window !== 'undefined') {
          const currentTarget = window.location.pathname.includes('/login') || window.location.pathname.includes('/register')
            ? '/'
            : window.location.pathname + window.location.search;
          sessionStorage.setItem('dhanvikk_auth_redirect_target', currentTarget);
        }
        await signInWithRedirect(auth, googleProvider);
        return { redirecting: true };
      } catch (redirectErr) {
        console.error('Google Redirect error after popup block:', redirectErr);
        throw redirectErr;
      }
    }
    throw error;
  }
};

/**
 * Direct Google Redirect sign in
 */
export const signInWithGoogleRedirect = async (customTarget = '/') => {
  if (typeof window !== 'undefined') {
    const target = customTarget && !customTarget.includes('/login') && !customTarget.includes('/register') && !customTarget.includes('/account')
      ? customTarget
      : '/';
    sessionStorage.setItem('dhanvikk_auth_redirect_target', target);
  }
  await signInWithRedirect(auth, googleProvider);
};

let redirectResultPromise = null;

/**
 * Handle Google Redirect result if redirect authentication was used
 */
export const checkGoogleRedirectResult = () => {
  if (!redirectResultPromise) {
    redirectResultPromise = (async () => {
      try {
        const result = await getRedirectResult(auth);
        let user = result?.user;

        // Fallback: If getRedirectResult returned null, check auth.currentUser
        if (!user && auth.currentUser) {
          user = auth.currentUser;
        }

        if (!user) return null;
        const token = await user.getIdToken();

        const cleanEmail = user.email || '';
        const resolvedName = user.displayName || (cleanEmail ? cleanEmail.split('@')[0] : 'Google Customer');
        const resolvedAvatar = user.photoURL || (cleanEmail ? `https://unavatar.io/google/${encodeURIComponent(cleanEmail)}` : '');

        syncUserWithFirestore(user, { provider: 'google' }).catch(() => {});

        return {
          success: true,
          user: {
            id: user.uid,
            uid: user.uid,
            googleUid: user.uid,
            name: resolvedName,
            email: cleanEmail,
            avatar: resolvedAvatar,
            phone: user.phoneNumber || '',
            role: 'customer',
          },
          token,
        };
      } catch (error) {
        console.warn('Redirect check notice:', error.code, error.message);
        if (error.code === 'auth/unauthorized-domain') {
          return {
            error: 'unauthorized-domain',
            message: 'Domain not authorized in Firebase Console: please add "dhanvikk-exports-main.vercel.app" to Firebase Authentication -> Settings -> Authorized Domains.',
          };
        }
        if (auth.currentUser) {
          try {
            const user = auth.currentUser;
            const token = await user.getIdToken();
            const cleanEmail = user.email || '';
            const resolvedName = user.displayName || (cleanEmail ? cleanEmail.split('@')[0] : 'Google Customer');
            const resolvedAvatar = user.photoURL || (cleanEmail ? `https://unavatar.io/google/${encodeURIComponent(cleanEmail)}` : '');
            return {
              success: true,
              user: {
                id: user.uid,
                uid: user.uid,
                googleUid: user.uid,
                name: resolvedName,
                email: cleanEmail,
                avatar: resolvedAvatar,
                phone: user.phoneNumber || '',
                role: 'customer',
              },
              token,
            };
          } catch {}
        }
        return null;
      }
    })();
  }
  return redirectResultPromise;
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
