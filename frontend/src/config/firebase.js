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
  signInWithCredential,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';

// Resolve optimal authDomain:
// Uses same-origin reverse-proxy on Vercel/production to completely prevent Chrome Bounce Tracking Mitigations
// and third-party cookie restrictions, falling back gracefully to standard authDomain in local development.
const getResolvedAuthDomain = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host && (host.includes('vercel.app') || host.includes('dhanvikkexports.com'))) {
      return host;
    }
  }
  return import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'auth-checker-1-main.firebaseapp.com';
};

// Firebase configuration for project: auth-checker-1-main (Web App)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: getResolvedAuthDomain(),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase App (singleton guard)
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

// Set session persistence to browserLocalPersistence so the user stays logged in across refreshes.
// This runs once at module load; errors are non-fatal (e.g., storage blocked by privacy settings).
setPersistence(auth, browserLocalPersistence).catch(() => {});

// Google OAuth provider — force account chooser every time
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
googleProvider.addScope('email');
googleProvider.addScope('profile');

// ─── User → Firestore Sync ────────────────────────────────────────────────────

/**
 * saveUserToDb
 * Writes the authenticated user to Firestore `users/{uid}`.
 * - Sets `createdAt` ONLY on first login (checks whether the doc already exists).
 * - Always updates `lastLoginAt`, `displayName`, `photoURL`, `provider`.
 * - The `role` field is NEVER set from the client on updates (only on creation).
 * - Uses `setDoc(..., { merge: true })` to avoid overwriting unrelated fields.
 */
export const saveUserToDb = async (firebaseUser, additionalData = {}) => {
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
      new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore getDoc timeout')), 3000)),
    ]);

    const isNew = !existingSnap.exists();

    const dataToWrite = {
      uid: firebaseUser.uid,
      displayName,
      email: cleanEmail,
      photoURL: firebaseUser.photoURL || '',
      phoneNumber: firebaseUser.phoneNumber || additionalData.phone || '',
      provider: additionalData.provider || 'google.com',
      lastLoginAt: serverTimestamp(),
    };

    if (isNew) {
      // Only set these fields on first login — never overwrite them later
      dataToWrite.createdAt = serverTimestamp();
      dataToWrite.role = 'user';
    }

    await Promise.race([
      setDoc(userRef, dataToWrite, { merge: true }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore setDoc timeout')), 3000)),
    ]);

    return {
      uid: firebaseUser.uid,
      displayName,
      email: cleanEmail,
      photoURL: firebaseUser.photoURL || '',
      role: isNew ? 'user' : (existingSnap.data()?.role || 'customer'),
      isNew,
    };
  } catch (err) {
    // Firestore write failure is non-fatal — auth still succeeds
    console.warn('[firebase] saveUserToDb non-fatal error:', err?.message);
    return null;
  }
};

// Keep old name as alias for backward compatibility with other code that calls syncUserWithFirestore
export const syncUserWithFirestore = async (firebaseUser, additionalData = {}) => {
  const result = await saveUserToDb(firebaseUser, additionalData);

  // Backward-compatible return shape
  if (!result) {
    const cleanEmail = (firebaseUser?.email || '').trim().toLowerCase();
    return {
      uid: firebaseUser?.uid,
      id: firebaseUser?.uid,
      email: cleanEmail,
      displayName:
        firebaseUser?.displayName ||
        additionalData.name ||
        (cleanEmail ? cleanEmail.split('@')[0] : 'Valued Customer'),
      photoURL: firebaseUser?.photoURL || '',
      phoneNumber: firebaseUser?.phoneNumber || additionalData.phone || '',
      role: additionalData.role || 'customer',
      ...additionalData,
    };
  }

  return {
    ...result,
    id: result.uid,
    name: result.displayName,
    avatar: result.photoURL,
    ...additionalData,
  };
};

// ─── Google Sign-In (Popup → Redirect Fallback) ───────────────────────────────

/**
 * Sign In with Google using a popup (account chooser always shown).
 * Falls back to redirect if popup is blocked or on mobile browsers.
 */
export const signInWithGoogleFirebase = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const token = await user.getIdToken();

    const cleanEmail = (user.email || '').trim().toLowerCase();
    const resolvedName = user.displayName || (cleanEmail ? cleanEmail.split('@')[0] : 'Google Customer');
    const resolvedAvatar = user.photoURL || '';

    // Non-blocking background sync
    saveUserToDb(user, { provider: 'google.com' }).catch(() => {});

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
        isVerified: true,
        emailVerified: user.emailVerified ?? true,
      },
      token,
    };
  } catch (error) {
    console.warn('[firebase] Google Sign-In notice:', error.code, error.message);

    // User explicitly closed or canceled the popup
    if (
      error.code === 'auth/popup-closed-by-user' ||
      error.code === 'auth/cancelled-popup-request'
    ) {
      return { canceled: true, message: 'Google sign-in was canceled.' };
    }

    // Popup was blocked by browser → fallback to redirect flow
    if (error.code === 'auth/popup-blocked') {
      console.info('[firebase] Popup blocked — falling back to signInWithRedirect...');
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('dhanvikk_auth_redirect_target', window.location.pathname || '/');
        }
        await signInWithRedirect(auth, googleProvider);
        return { redirecting: true, message: 'Redirecting to Google Sign-In...' };
      } catch (redirectErr) {
        console.warn('[firebase] Redirect fallback notice:', redirectErr);
        return {
          popupBlocked: true,
          error: error.code,
          message: 'The Google sign-in popup was blocked. Please enable popups for this site.',
        };
      }
    }

    // Domain not authorized in Firebase Console
    if (error.code === 'auth/unauthorized-domain') {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'current domain';
      return {
        unauthorizedDomain: true,
        error: error.code,
        message: `The domain "${currentHost}" is not authorized in Firebase Auth. Please add it under Authentication → Settings → Authorized Domains in the Firebase Console.`,
      };
    }

    // Account exists with a different provider
    if (error.code === 'auth/account-exists-with-different-credential') {
      return {
        accountConflict: true,
        error: error.code,
        message: 'An account already exists with this email using a different sign-in method. Please use that method to sign in.',
      };
    }

    // Network error
    if (error.code === 'auth/network-request-failed') {
      return {
        networkError: true,
        error: error.code,
        message: 'Network connection error. Please check your internet and try again.',
      };
    }

    throw error;
  }
};

/**
 * Parse Google ID Token JWT payload without external dependencies
 */
export const parseJwtPayload = (token) => {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.warn('[firebase] Failed to parse Google JWT payload:', err?.message);
    return null;
  }
};

/**
 * Sign In with Google Identity Services (GSI) credential (immune to popup blockers)
 */
export const signInWithGoogleCredential = async (idToken) => {
  if (!idToken) throw new Error('No Google credential provided.');

  const payload = parseJwtPayload(idToken);
  const cleanEmail = (payload?.email || '').trim().toLowerCase();
  const resolvedName = payload?.name || (cleanEmail ? cleanEmail.split('@')[0] : 'Google Customer');
  const resolvedAvatar = payload?.picture || '';

  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, credential);
    const user = result.user;
    const fbToken = await user.getIdToken().catch(() => idToken);

    saveUserToDb(user, { provider: 'google.com' }).catch(() => {});

    return {
      success: true,
      user: {
        id: user.uid,
        uid: user.uid,
        googleUid: user.uid,
        name: user.displayName || resolvedName,
        email: (user.email || cleanEmail).trim().toLowerCase(),
        avatar: user.photoURL || resolvedAvatar,
        phone: user.phoneNumber || '',
        role: 'customer',
        isVerified: true,
        emailVerified: user.emailVerified ?? true,
      },
      token: fbToken,
    };
  } catch (fbErr) {
    console.warn('[firebase] signInWithCredential note:', fbErr?.message);
    throw fbErr;
  }
};

/**
 * Initiate Google sign-in via full-page redirect (used as manual fallback)
 */
export const signInWithGoogleRedirect = async (customTarget = '/') => {
  if (typeof window !== 'undefined') {
    const target =
      customTarget &&
      !customTarget.includes('/login') &&
      !customTarget.includes('/register') &&
      !customTarget.includes('/account')
        ? customTarget
        : '/';
    sessionStorage.setItem('dhanvikk_auth_redirect_target', target);
  }
  await signInWithRedirect(auth, googleProvider);
};

let redirectResultPromise = null;

/**
 * Handle Google Redirect result — call exactly once on app mount.
 */
export const checkGoogleRedirectResult = () => {
  if (!redirectResultPromise) {
    redirectResultPromise = (async () => {
      try {
        const result = await getRedirectResult(auth);
        let user = result?.user;

        if (!user && auth.currentUser) {
          user = auth.currentUser;
        }

        if (!user) return null;
        const token = await user.getIdToken();
        const cleanEmail = (user.email || '').trim().toLowerCase();
        const resolvedName = user.displayName || (cleanEmail ? cleanEmail.split('@')[0] : 'Google Customer');
        const resolvedAvatar = user.photoURL || '';

        saveUserToDb(user, { provider: 'google.com' }).catch(() => {});

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
            isVerified: true,
            emailVerified: user.emailVerified ?? true,
          },
          token,
        };
      } catch (error) {
        console.warn('[firebase] checkGoogleRedirectResult notice:', error.code, error.message);
        if (error.code === 'auth/unauthorized-domain') {
          return {
            error: 'unauthorized-domain',
            message:
              'Domain not authorized in Firebase Console. Add it under Authentication → Settings → Authorized Domains.',
          };
        }
        // Try auth.currentUser as last resort
        if (auth.currentUser) {
          try {
            const user = auth.currentUser;
            const token = await user.getIdToken();
            const cleanEmail = (user.email || '').trim().toLowerCase();
            return {
              success: true,
              user: {
                id: user.uid,
                uid: user.uid,
                googleUid: user.uid,
                name: user.displayName || (cleanEmail ? cleanEmail.split('@')[0] : 'Google Customer'),
                email: cleanEmail,
                avatar: user.photoURL || '',
                phone: user.phoneNumber || '',
                role: 'customer',
                isVerified: true,
                emailVerified: user.emailVerified ?? true,
              },
              token,
            };
          } catch {
            // ignore
          }
        }
        return null;
      }
    })();
  }
  return redirectResultPromise;
};

// ─── Email / Password ─────────────────────────────────────────────────────────

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
    console.error('[firebase] Email/Password Registration Error:', error);
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
    console.error('[firebase] Email/Password Login Error:', error);
    throw error;
  }
};

/**
 * Sign Out from Firebase
 */
export const logOutFirebase = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('[firebase] Sign-Out Error:', error);
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
    console.error('[firebase] Password Reset Error:', error);
    throw error;
  }
};

export { onAuthStateChanged };
export default app;
