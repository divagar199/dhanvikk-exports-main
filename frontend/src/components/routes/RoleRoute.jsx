import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function RoleRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const hasAccess = allowedRoles.length === 0 || allowedRoles.includes(user.role);

  if (!hasAccess) {
    // Access denied for customers trying to access /admin
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#FFF3F6] flex items-center justify-center text-[#C2185B] mb-4 text-2xl font-bold">
          403
        </div>
        <h1 className="text-2xl font-semibold text-[#242124] mb-2 font-['Poppins']">
          Restricted Portal Access
        </h1>
        <p className="text-[14px] text-[#777777] max-w-md mb-6 leading-relaxed">
          Your account ({user.email}) does not have administrative privileges. Please log in with an authorized staff credential.
        </p>
        <div className="flex gap-4">
          <a
            href="/login"
            className="px-5 py-2.5 bg-[#EC407A] text-white rounded-xl text-sm font-medium hover:bg-[#C2185B] transition-colors"
          >
            Customer Login
          </a>
          <a
            href="/"
            className="px-5 py-2.5 border border-[#E5E1E2] text-[#EC407A] rounded-xl text-sm font-medium hover:bg-[#FFF3F6] hover:border-[#FCC1C5] transition-colors"
          >
            Back to Store
          </a>
        </div>
      </div>
    );
  }

  return children;
}
