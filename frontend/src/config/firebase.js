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
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported as isMessagingSupported,
} from 'firebase/messaging';

// Firebase configuration for project: auth-checker-1-main
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
    // 15-second safeguard timeout so the UI never hangs indefinitely if popup is blocked or hangs
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        const timeoutErr = new Error('Google Sign-In popup timed out. Please try again or sign in with email.');
        timeoutErr.code = 'auth/timeout';
        reject(timeoutErr);
      }, 15000);
    });

    const result = await Promise.race([
      signInWithPopup(auth, googleProvider),
      timeoutPromise,
    ]);

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

    // If domain is not authorized in Firebase Console, do NOT redirect (redirect will also fail with same error)
    if (error?.code === 'auth/unauthorized-domain') {
      throw error;
    }

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

/**
 * Firebase Cloud Messaging (Web Push Notifications)
 */
export const VAPID_KEY =
  import.meta.env.VITE_FIREBASE_VAPID_KEY ||
  'BNlvUCAgAqOsezsRlff-rUp7_5QeImOtpwYU9clbli2brUvrSkYmwg6KGpWAT4DdsoArJmV0CXaW5HB_vgCjZmg';

let messagingInstance = null;

export const getFirebaseMessaging = async () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const supported = await isMessagingSupported();
      if (supported) {
        if (!messagingInstance) {
          messagingInstance = getMessaging(app);
        }
        return messagingInstance;
      }
    } catch (e) {
      console.warn('Firebase Messaging not supported:', e);
    }
  }
  return null;
};

/**
 * Request notification permissions and fetch FCM Push Token
 */
export const requestPushNotificationPermission = async () => {
  try {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return { success: false, error: 'Push notifications are not supported in this browser' };
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, error: 'Push notification permission was denied', permission };
    }

    const msg = await getFirebaseMessaging();
    if (!msg) {
      return { success: false, error: 'Web messaging could not be initialized' };
    }

    let registration;
    if ('serviceWorker' in navigator) {
      try {
        registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      } catch (swErr) {
        console.warn('Service worker registration note:', swErr);
      }
    }

    const token = await getToken(msg, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      localStorage.setItem('dhanvikk_fcm_token', token);
      return { success: true, token };
    }

    return { success: false, error: 'Failed to retrieve notification token' };
  } catch (error) {
    console.error('Error requesting push notification permission:', error);
    return { success: false, error: error?.message || 'Error requesting notification permission' };
  }
};

/**
 * Foreground Push Notification Listener
 */
export const onForegroundMessageListener = (callback) => {
  getFirebaseMessaging().then((msg) => {
    if (msg) {
      onMessage(msg, (payload) => {
        if (typeof callback === 'function') {
          callback(payload);
        }
      });
    }
  });
};

export { onAuthStateChanged };
export default app;
