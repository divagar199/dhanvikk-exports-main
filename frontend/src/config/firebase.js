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

// Firebase configuration for project: auth-checker-diva
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDwLPDUMXVPwGY4LtVxpG1YnTNQMHyPeW8',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'auth-checker-diva.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'auth-checker-diva',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'auth-checker-diva.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '972583680950',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:972583680950:web:207e65c929b731f0205f17',
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Custom parameters for Google OAuth
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Sync or create a user profile in Firestore 'users' collection
 */
export const syncUserWithFirestore = async (firebaseUser, additionalData = {}) => {
  if (!firebaseUser?.uid) return null;

  const userRef = doc(db, 'users', firebaseUser.uid);
  try {
    let existingData = {};
    try {
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        existingData = snap.data();
      }
    } catch {
      // Proceed with fresh document if read is restricted
    }

    const baseData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || existingData.email || '',
      displayName: firebaseUser.displayName || existingData.displayName || additionalData.name || 'Valued Customer',
      photoURL: firebaseUser.photoURL || existingData.photoURL || '',
      phoneNumber: firebaseUser.phoneNumber || existingData.phoneNumber || additionalData.phone || '',
      lastLoginAt: serverTimestamp(),
      role: existingData.role || additionalData.role || 'customer',
      ...additionalData,
    };

    // Single atomic write with merge
    await setDoc(userRef, baseData, { merge: true });

    return { id: firebaseUser.uid, ...baseData };
  } catch (error) {
    console.warn('Firestore user profile sync warning (proceeding with auth session):', error.message);
    return {
      uid: firebaseUser.uid,
      id: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || additionalData.name || 'Valued Customer',
      photoURL: firebaseUser.photoURL || '',
      role: 'customer',
    };
  }
};

/**
 * Sign In with Google Popup (Authenticates with Google and syncs Firestore profile)
 */
export const signInWithGoogleFirebase = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const token = await user.getIdToken();

    // Synchronize Firestore user profile
    let profile = null;
    try {
      profile = await syncUserWithFirestore(user, {
        provider: 'google',
      });
    } catch (err) {
      console.warn('Background sync note:', err.message);
    }

    const cleanEmail = user.email || '';
    const resolvedName = user.displayName || profile?.displayName || (cleanEmail ? cleanEmail.split('@')[0] : 'Google Customer');
    const resolvedAvatar = user.photoURL || profile?.photoURL || (cleanEmail ? `https://unavatar.io/google/${encodeURIComponent(cleanEmail)}` : '');

    return {
      success: true,
      user: {
        id: user.uid,
        name: resolvedName,
        email: cleanEmail,
        avatar: resolvedAvatar,
        phone: user.phoneNumber || profile?.phoneNumber || '',
        role: profile?.role || 'customer',
      },
      token,
    };
  } catch (error) {
    console.error('Google Sign-In Error:', error.code, error.message);
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

    let profile = null;
    try {
      profile = await syncUserWithFirestore(user, { provider: 'google' });
    } catch (err) {
      console.warn('Redirect sync note:', err.message);
    }

    const cleanEmail = user.email || '';
    const resolvedName = user.displayName || profile?.displayName || (cleanEmail ? cleanEmail.split('@')[0] : 'Google Customer');
    const resolvedAvatar = user.photoURL || profile?.photoURL || (cleanEmail ? `https://unavatar.io/google/${encodeURIComponent(cleanEmail)}` : '');

    return {
      success: true,
      user: {
        id: user.uid,
        name: resolvedName,
        email: cleanEmail,
        avatar: resolvedAvatar,
        phone: user.phoneNumber || profile?.phoneNumber || '',
        role: profile?.role || 'customer',
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
