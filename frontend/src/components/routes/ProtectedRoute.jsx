import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Spinner from '../common/Spinner';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('dhanvikk_auth_token') || sessionStorage.getItem('dhanvikk_auth_token')
      : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" color="#EC407A" />
          <span className="text-xs uppercase tracking-widest text-[#777777]">Verifying Session...</span>
        </div>
      </div>
    );
  }

  // Only bounce to login if there is neither an active auth state nor a saved token
  if (!isAuthenticated && !user && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

