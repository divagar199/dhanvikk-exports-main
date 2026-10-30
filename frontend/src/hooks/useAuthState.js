/**
 * useAuthState
 * Single source of truth for Firebase Auth state on the web.
 *
 * - Listens to onAuthStateChanged (the canonical Firebase signal).
 * - Exposes `firebaseUser`, `loading`, and `isAuthenticated`.
 * - Does NOT replace Redux auth state; it is used alongside it to keep
 *   ProtectedRoute from flickering during the initial auth check.
 */

import { useState, useEffect } from 'react';
import { auth, onAuthStateChanged } from '../config/firebase';

/**
 * @returns {{ firebaseUser: import('firebase/auth').User | null, loading: boolean, isAuthenticated: boolean }}
 */
export function useAuthState() {
  // Start as loading=true to avoid flicker — Firebase resolves within ~100ms on a warm session.
  const [state, setState] = useState({ firebaseUser: null, loading: true, isAuthenticated: false });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setState({
        firebaseUser: user ?? null,
        loading: false,
        isAuthenticated: Boolean(user),
      });
    });

    return () => unsubscribe();
  }, []);

  return state;
}

