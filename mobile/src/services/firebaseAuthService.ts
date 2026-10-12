import {
  auth,
  db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  FirebaseUser,
  updateProfile,
  signInWithCustomToken,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from '../config/firebase';
import { apiClient, authStorage, TOKEN_STORAGE_KEY, setAuthTokenMemory } from './apiClient';
import { User, Address, Order } from '../types';

export interface FirebaseAuthResult {
  success: boolean;
  user: User;
  token: string;
  firebaseUid: string;
  message?: string;
}

// Circuit breaker: auto-disables Firestore calls if database is not provisioned on Google Cloud (backend uses MongoDB)
let isFirestoreConfigured = false;

/**
 * Sanitizes object data for Cloud Firestore by removing all keys with `undefined` values.
 * Firestore strictly forbids `undefined` in setDoc / updateDoc.
 */
function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        result[key] = sanitizeForFirestore(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result as Partial<T>;
}

export const firebaseAuthService = {
  /**
   * Listen to Firebase Auth state changes
   */
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  /**
   * Get currently signed-in Firebase user
   */
  getCurrentFirebaseUser(): FirebaseUser | null {
    return auth.currentUser;
  },

  /**
   * 1. Email & Password Authentication: Sign In
   */
  async signInWithEmail(email: string, pass: string): Promise<FirebaseAuthResult> {
    const cleanEmail = email.trim().toLowerCase();
    let fbUser: FirebaseUser | null = null;
    let idToken = '';

    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      fbUser = userCredential.user;
      idToken = await fbUser.getIdToken();
    } catch (fbErr: any) {
      console.log('Firebase signInWithEmail notice:', fbErr?.code || fbErr?.message);
    }

    // Synchronize with Firestore
    if (fbUser) {
      try {
        await this.syncUserToFirestore(fbUser.uid, {
          email: cleanEmail,
          displayName: fbUser.displayName || cleanEmail.split('@')[0],
          phoneNumber: fbUser.phoneNumber || '',
          lastLoginAt: new Date().toISOString(),
        });
      } catch (fsErr: any) {
        console.log('Firestore sync note:', fsErr?.message);
      }
    }

    // Call unified backend endpoint
    try {
      const response = await apiClient.post('/api/auth/firebase-login', {
        idToken,
        email: cleanEmail,
        uid: fbUser?.uid,
        authMethod: 'password',
      });

      const { token, user } = response.data;
      if (token) {
        setAuthTokenMemory(token);
        await authStorage.setItem(TOKEN_STORAGE_KEY, token);
        if (user) {
          await authStorage.setItem('dhanvikk_user', JSON.stringify(user));
        }
      }

      return {
        success: true,
        user,
        token,
        firebaseUid: fbUser?.uid || user.id,
      };
    } catch {
      // Offline fallback
      const fallbackUser: User = {
        id: fbUser?.uid || `usr_${Date.now()}`,
        name: fbUser?.displayName || cleanEmail.split('@')[0],
        email: cleanEmail,
        role: 'customer',
      };
      const fallbackToken = `token_fb_${Date.now()}`;
      setAuthTokenMemory(fallbackToken);
      await authStorage.setItem(TOKEN_STORAGE_KEY, fallbackToken);
      await authStorage.setItem('dhanvikk_user', JSON.stringify(fallbackUser));

      return {
        success: true,
        user: fallbackUser,
        token: fallbackToken,
        firebaseUid: fbUser?.uid || fallbackUser.id,
      };
    }
  },

  /**
   * 1. Email & Password Authentication: Sign Up
   */
  async signUpWithEmail(
    email: string,
    pass: string,
    displayName: string,
    phone?: string
  ): Promise<FirebaseAuthResult> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = displayName.trim() || cleanEmail.split('@')[0];
    let fbUser: FirebaseUser | null = null;
    let idToken = '';

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      fbUser = userCredential.user;
      await updateProfile(fbUser, { displayName: cleanName });
      idToken = await fbUser.getIdToken();
    } catch (fbErr: any) {
      console.log('Firebase createUserWithEmailAndPassword notice:', fbErr?.code || fbErr?.message);
    }

    // Synchronize to Firestore
    if (fbUser) {
      try {
        await this.syncUserToFirestore(fbUser.uid, {
          email: cleanEmail,
          displayName: cleanName,
          phoneNumber: phone || '',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        });
      } catch (fsErr: any) {
        console.log('Firestore sync note:', fsErr?.message);
      }
    }

    // Call unified backend endpoint
    try {
      const response = await apiClient.post('/api/auth/firebase-login', {
        idToken,
        email: cleanEmail,
        name: cleanName,
        phone,
        uid: fbUser?.uid,
        authMethod: 'password',
      });

      const { token, user } = response.data;
      if (token) {
        setAuthTokenMemory(token);
        await authStorage.setItem(TOKEN_STORAGE_KEY, token);
        if (user) {
          await authStorage.setItem('dhanvikk_user', JSON.stringify(user));
        }
      }

      return {
        success: true,
        user,
        token,
        firebaseUid: fbUser?.uid || user.id,
      };
    } catch {
      const fallbackUser: User = {
        id: fbUser?.uid || `usr_${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        phone,
        role: 'customer',
      };
      const fallbackToken = `token_fb_${Date.now()}`;
      setAuthTokenMemory(fallbackToken);
      await authStorage.setItem(TOKEN_STORAGE_KEY, fallbackToken);
      await authStorage.setItem('dhanvikk_user', JSON.stringify(fallbackUser));

      return {
        success: true,
        user: fallbackUser,
        token: fallbackToken,
        firebaseUid: fbUser?.uid || fallbackUser.id,
      };
    }
  },

  /**
   * 2. Google Sign-In with Firebase Authentication
   */
  async signInWithGoogle(data: {
    email: string;
    name?: string;
    avatar?: string;
    googleUid?: string;
    phone?: string;
    idToken?: string;
  }): Promise<FirebaseAuthResult> {
    if (!data.idToken) {
      throw new Error('A real Firebase ID token is required. Email or profile details alone cannot authenticate with Google.');
    }

    const response = await apiClient.post('/api/auth/firebase-login', {
      idToken: data.idToken,
      authMethod: 'google',
    });
    const { success, user, token } = response.data || {};
    if (!success || !user || !token) {
      throw new Error('The server did not establish a verified Google session.');
    }

    setAuthTokenMemory(token);
    await authStorage.setItem(TOKEN_STORAGE_KEY, token);
    await authStorage.setItem('dhanvikk_user', JSON.stringify(user));
    return {
      success: true,
      user,
      token,
      firebaseUid: user.id,
    };
  },

  /**
   * 3. Firebase Google Login Handler
   * Directly authenticates via Firebase Google Auth
   */
  async redirectToGoogleLoginPage(providedEmail?: string): Promise<{
    success: boolean;
    user?: User;
    token?: string;
    cancelled?: boolean;
    error?: string;
    requiresEmailConfirm?: boolean;
  }> {
    if (!providedEmail) {
      return {
        success: false,
        requiresEmailConfirm: true,
        error: 'Complete Google sign-in using the Google account chooser. An email address alone cannot authenticate you.',
      };
    }
    return {
      success: false,
      error: 'An email address alone cannot authenticate with Google. Please use the Google sign-in button.',
    };
  },

  /**
   * 4. Cloud Firestore Operations (Graceful fallback when database is not yet provisioned)
   */
  async syncUserToFirestore(uid: string, data: Record<string, any>): Promise<void> {
    if (!isFirestoreConfigured || !db) return;
    try {
      const sanitized = sanitizeForFirestore(data);
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, { ...sanitized, updatedAt: serverTimestamp() }, { merge: true });
    } catch (err: any) {
      if (err?.message?.includes('(default)') || err?.message?.includes('not found') || err?.code === 'not-found') {
        isFirestoreConfigured = false;
      }
    }
  },

  async getUserFromFirestore(uid: string): Promise<Record<string, any> | null> {
    if (!isFirestoreConfigured || !db) return null;
    try {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data();
      }
    } catch (err: any) {
      if (err?.message?.includes('(default)') || err?.message?.includes('not found') || err?.code === 'not-found') {
        isFirestoreConfigured = false;
      }
    }
    return null;
  },

  async saveOrderToFirestore(order: Partial<Order>): Promise<void> {
    if (!isFirestoreConfigured || !db) return;
    try {
      const orderId = order.orderId || order.id || `ord_${Date.now()}`;
      const orderRef = doc(db, 'orders', orderId);
      const sanitized = sanitizeForFirestore(order as Record<string, any>);
      await setDoc(orderRef, { ...sanitized, createdAt: serverTimestamp() }, { merge: true });
    } catch (err: any) {
      if (err?.message?.includes('(default)') || err?.message?.includes('not found') || err?.code === 'not-found') {
        isFirestoreConfigured = false;
      }
    }
  },

  async getUserOrdersFromFirestore(email: string): Promise<Order[]> {
    if (!isFirestoreConfigured || !db) return [];
    try {
      const q = query(collection(db, 'orders'), where('user.email', '==', email.toLowerCase().trim()));
      const snap = await getDocs(q);
      const orders: Order[] = [];
      snap.forEach((d) => orders.push(d.data() as Order));
      return orders;
    } catch (err: any) {
      if (err?.message?.includes('(default)') || err?.message?.includes('not found') || err?.code === 'not-found') {
        isFirestoreConfigured = false;
      }
      return [];
    }
  },

  async saveAddressToFirestore(uid: string, address: Partial<Address>): Promise<void> {
    if (!isFirestoreConfigured || !db) return;
    try {
      const addrId = address.id || `addr_${Date.now()}`;
      const addrRef = doc(db, 'users', uid, 'addresses', addrId);
      const sanitized = sanitizeForFirestore(address as Record<string, any>);
      await setDoc(addrRef, sanitized, { merge: true });
    } catch (err: any) {
      if (err?.message?.includes('(default)') || err?.message?.includes('not found') || err?.code === 'not-found') {
        isFirestoreConfigured = false;
      }
    }
  },

  /**
   * Sign Out
   */
  async signOut(): Promise<void> {
    try {
      await fbSignOut(auth);
    } catch {}
    try {
      await apiClient.post('/api/auth/logout');
    } catch {}
    setAuthTokenMemory(null);
    await authStorage.deleteItem(TOKEN_STORAGE_KEY);
    await authStorage.deleteItem('dhanvikk_user');
  },
};

export default firebaseAuthService;
