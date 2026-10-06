import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
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
    const baseData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || additionalData.name || 'Valued Customer',
      photoURL: firebaseUser.photoURL || '',
      phoneNumber: firebaseUser.phoneNumber || '',
      lastLoginAt: serverTimestamp(),
      role: additionalData.role || 'customer',
      ...additionalData,
    };

    // Single atomic write with merge - eliminates multiple slow network roundtrips
    await setDoc(userRef, baseData, { merge: true });

    return { id: firebaseUser.uid, ...baseData };
  } catch (error) {
    console.warn('Firestore user profile sync warning (proceeding with auth session):', error.message);
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || additionalData.name || 'Valued Customer',
      role: 'customer',
    };
  }
};

/**
 * Sign In with Google Popup (Optimized for instant response)
 */
export const signInWithGoogleFirebase = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const token = await user.getIdToken();

    // Background Firestore sync - do not block immediate UI transition
    syncUserWithFirestore(user, {
      provider: 'google',
    }).catch((err) => console.warn('Background sync note:', err.message));

    return {
      success: true,
      user: {
        id: user.uid,
        name: user.displayName || 'Google Customer',
        email: user.email,
        avatar: user.photoURL || '',
        role: 'customer',
      },
      token,
    };
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
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
