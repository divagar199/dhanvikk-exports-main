import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function AdminEntryRoute() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const adminRoles = [
    'admin',
    'manager',
    'inventory_manager',
    'delivery_manager',
    'content_manager',
    'super_admin',
  ];

  if (isAuthenticated && user && adminRoles.includes(user.role)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Automatically go to admin login page for http://localhost:5173/admin
  return <Navigate to="/admin/login" replace />;
}
