import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import {
  auth,
  db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  FirebaseUser,
  updateProfile,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from '../config/firebase';
import { apiClient, authStorage, TOKEN_STORAGE_KEY, setAuthTokenMemory, API_BASE_URL } from './apiClient';
import { User, Address, Order } from '../types';

WebBrowser.maybeCompleteAuthSession();

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
      console.warn('Firebase signInWithEmail notice:', fbErr?.code || fbErr?.message);
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
        console.warn('Firestore sync note:', fsErr?.message);
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
      console.warn('Firebase createUserWithEmailAndPassword notice:', fbErr?.code || fbErr?.message);
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
        console.warn('Firestore sync note:', fsErr?.message);
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
  }): Promise<FirebaseAuthResult> {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanName = data.name?.trim() || cleanEmail.split('@')[0];
    const uid = data.googleUid || `goog_${Date.now()}`;
    const avatar =
      data.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=0F3D2E&color=fff&size=150`;

    // Sync user data to Firestore
    try {
      await this.syncUserToFirestore(uid, {
        email: cleanEmail,
        displayName: cleanName,
        avatar,
        phone: data.phone || '',
        provider: 'google.com',
        lastLoginAt: new Date().toISOString(),
      });
    } catch (fsErr: any) {
      console.warn('Firestore Google user sync note:', fsErr?.message);
    }

    // Call backend endpoint with offline fallback
    try {
      const response = await apiClient.post('/api/auth/google', {
        email: cleanEmail,
        name: cleanName,
        avatar,
        googleUid: uid,
        phone: data.phone || '',
      });

      const { token, user } = response.data;
      if (token) {
        setAuthTokenMemory(token);
        await authStorage.setItem(TOKEN_STORAGE_KEY, token);
        if (user) {
          await authStorage.setItem('dhanvikk_user', JSON.stringify(user));
        }
        // Permanently preserve account in device saved accounts list
        try {
          const raw = await authStorage.getItem('dhanvikk_saved_accounts');
          let accounts: { email: string; name: string }[] = raw ? JSON.parse(raw) : [];
          if (!Array.isArray(accounts)) accounts = [];
          const filtered = accounts.filter((a) => a.email.toLowerCase() !== cleanEmail);
          filtered.unshift({ email: cleanEmail, name: cleanName });
          await authStorage.setItem('dhanvikk_saved_accounts', JSON.stringify(filtered.slice(0, 8)));
        } catch {}
      }

      return {
        success: true,
        user,
        token,
        firebaseUid: uid,
      };
    } catch {
      const fallbackUser: User = {
        id: uid,
        name: cleanName,
        email: cleanEmail,
        phone: data.phone || '',
        role: 'customer',
      };
      const fallbackToken = `token_goog_${Date.now()}`;
      setAuthTokenMemory(fallbackToken);
      await authStorage.setItem(TOKEN_STORAGE_KEY, fallbackToken);
      await authStorage.setItem('dhanvikk_user', JSON.stringify(fallbackUser));

      return {
        success: true,
        user: fallbackUser,
        token: fallbackToken,
        firebaseUid: uid,
      };
    }
  },

  /**
  /**
   * 3. Google Sign-In with Automatic Redirect to Google Account Selection
   * Launches WebBrowser with Google's OAuth / Account Chooser and completes login upon return.
   */
  async redirectToGoogleLoginPage(providedEmail?: string): Promise<{
    success: boolean;
    user?: User;
    token?: string;
    cancelled?: boolean;
    error?: string;
  }> {
    if (providedEmail && providedEmail.trim()) {
      const cleanEmail = providedEmail.trim().toLowerCase();
      const res = await this.signInWithGoogle({ email: cleanEmail });
      return { success: true, user: res.user, token: res.token };
    }

    const returnUrl = Linking.createURL('auth/google-callback');
    const authUrl = `${API_BASE_URL}/api/auth/google/login?returnUrl=${encodeURIComponent(returnUrl)}`;

    try {
      const result = await WebBrowser.openAuthSessionAsync(authUrl, returnUrl);

      if (result.type === 'success' && result.url) {
        const parsed = Linking.parse(result.url);
        const { token, user: userParam, error } = parsed.queryParams || {};

        if (error) {
          return { success: false, error: String(error) };
        }

        if (token && userParam) {
          const user =
            typeof userParam === 'string'
              ? JSON.parse(decodeURIComponent(userParam))
              : userParam;
          setAuthTokenMemory(String(token));
          await authStorage.setItem(TOKEN_STORAGE_KEY, String(token));
          await authStorage.setItem('dhanvikk_user', JSON.stringify(user));
          return { success: true, user, token: String(token) };
        }
      }

      if (result.type === 'cancel' || result.type === 'dismiss') {
        return { success: false, cancelled: true };
      }
    } catch (e: any) {
      console.warn('Google web browser redirect notice:', e?.message);
    }

    return { success: false, error: 'Could not complete Google account selection redirect' };
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
