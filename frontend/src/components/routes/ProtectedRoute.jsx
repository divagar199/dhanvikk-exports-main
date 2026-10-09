import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Spinner from '../common/Spinner';

export default function ProtectedRoute({ children }) {
  // Guest mode: All routes are fully accessible without login requirements
  return children;
}

