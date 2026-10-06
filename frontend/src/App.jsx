import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import { store } from './store';
import { CurrencyProvider } from './context/CurrencyContext';
import ProtectedRoute from './components/routes/ProtectedRoute';
import RoleRoute from './components/routes/RoleRoute';
import AdminEntryRoute from './components/routes/AdminEntryRoute';
import Spinner from './components/common/Spinner';

// Lazy-loaded routes for performance & fast LCP
const Home = lazy(() => import('./pages/home/HomePage'));
const Login = lazy(() => import('./pages/auth/Login'));
const AdminLogin = lazy(() => import('./pages/auth/AdminLogin'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const Register = lazy(() => import('./pages/auth/Register'));
const AccountDashboard = lazy(() => import('./pages/account/AccountDashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const CheckoutPage = lazy(() => import('./pages/checkout/CheckoutPage'));
const CategoryPage = lazy(() => import('./pages/category/CategoryPage'));
const ProductDetailPage = lazy(() => import('./pages/product/ProductDetailPage'));

function RouteFallback() {
  return (
    <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" color="#EC407A" />
        <span className="text-xs uppercase tracking-widest text-[#777777]">Loading Dhanvikk Blooms...</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <CurrencyProvider>
        <HelmetProvider>
          <BrowserRouter>
          {/* Sonner Toast Notifications */}
          <Toaster
            position="top-center"
            richColors
            toastOptions={{
              style: {
                borderRadius: '14px',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '13px',
              },
            }}
          />

          <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* Root URL: Normal Shopping Page */}
              <Route path="/" element={<Home />} />

              {/* Collections & Product Detail Pages */}
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />

              {/* Customer Authentication */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ForgotPassword />} />

              {/* Admin Routes: http://localhost:5173/admin automatically goes to admin login page */}
              <Route path="/admin" element={<AdminEntryRoute />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin/dashboard"
                element={
                  <RoleRoute allowedRoles={['admin', 'manager', 'inventory_manager', 'delivery_manager', 'content_manager', 'super_admin']}>
                    <AdminDashboard />
                  </RoleRoute>
                }
              />

              {/* Customer Account Routes */}
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <AccountDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/account/:encryptedKey" element={<AccountDashboard />} />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </HelmetProvider>
    </CurrencyProvider>
  </Provider>
  );
}
