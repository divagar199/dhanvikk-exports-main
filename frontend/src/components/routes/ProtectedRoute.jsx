import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuthState } from '../../hooks/useAuthState';
import Spinner from '../common/Spinner';

/**
 * ProtectedRoute
 *
 * Guards private routes using BOTH Firebase Auth (single source of truth via onAuthStateChanged)
 * and the Redux auth slice.
 *
 * - Shows a loading spinner while Firebase resolves the initial auth state
 *   (avoids a false redirect to /login on page refresh).
 * - Redirects unauthenticated users to /login, preserving the intended destination.
 */
export default function ProtectedRoute({ children }) {
  const { firebaseUser, loading: firebaseLoading } = useAuthState();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  // While Firebase is still resolving the auth state, show a centered spinner.
  // This window is typically < 150 ms on a warm session.
  if (firebaseLoading) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" color="#EC407A" />
          <span className="text-xs uppercase tracking-widest text-[#777777]">
            Verifying session…
          </span>
        </div>
      </div>
    );
  }

  // Consider the user authenticated if Firebase says so OR if Redux has a hydrated user.
  // Firebase is the authority; Redux/localStorage is the fallback for offline/cold-start.
  const authenticated = Boolean(firebaseUser) || (isAuthenticated && Boolean(user));

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
