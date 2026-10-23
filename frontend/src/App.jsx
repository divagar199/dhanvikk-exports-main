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
import { checkGoogleRedirectResult } from './config/firebase';
import { loginWithGoogleThunk } from './store/slices/authSlice';

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
const ProfilePage = lazy(() => import('./pages/account/ProfilePage'));
const OrdersPage = lazy(() => import('./pages/account/OrdersPage'));
const AddressPage = lazy(() => import('./pages/account/AddressPage'));
const AboutPage = lazy(() => import('./pages/company/AboutPage'));
const ContactPage = lazy(() => import('./pages/company/ContactPage'));
const FaqPage = lazy(() => import('./pages/company/FaqPage'));

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

function GlobalGoogleRedirectHandler() {
  React.useEffect(() => {
    let active = true;
    let unsubscribe = null;

    (async () => {
      try {
        // 0. Check URL params for direct OAuth/server callback token
        if (typeof window !== 'undefined' && window.location.search) {
          const params = new URLSearchParams(window.location.search);
          const callbackToken = params.get('token') || params.get('auth_token');
          const callbackEmail = params.get('email');
          if (callbackToken && callbackEmail && active) {
            sessionStorage.removeItem('dhanvikk_logged_out');
            localStorage.setItem('dhanvikk_auth_token', callbackToken);
            sessionStorage.setItem('dhanvikk_auth_token', callbackToken);
            const userObj = {
              email: callbackEmail,
              name: callbackEmail.split('@')[0],
              role: 'customer',
              isVerified: true,
              emailVerified: true,
            };
            localStorage.setItem('dhanvikk_user', JSON.stringify(userObj));
            sessionStorage.setItem('dhanvikk_user', JSON.stringify(userObj));
            store.dispatch(
              loginWithGoogleThunk({
                email: callbackEmail,
                name: userObj.name,
                token: callbackToken,
                isVerified: true,
              })
            );
            window.history.replaceState({}, document.title, window.location.pathname);
            const target = sessionStorage.getItem('dhanvikk_auth_redirect_target');
            sessionStorage.removeItem('dhanvikk_auth_redirect_target');
            const finalTarget = target && target !== '/login' && target !== '/register' && target !== '/account' ? target : '/';
            if (window.location.pathname.startsWith('/login') || window.location.pathname.startsWith('/register')) {
              window.location.replace(finalTarget);
            }
            return;
          }
        }

        const { checkGoogleRedirectResult, auth, onAuthStateChanged } = await import('./config/firebase');

        // 1. Process getRedirectResult
        const res = await checkGoogleRedirectResult();
        if (res?.user && active) {
          const action = await store.dispatch(
            loginWithGoogleThunk({
              ...res.user,
              token: res.token,
            })
          );
          if (loginWithGoogleThunk.fulfilled.match(action)) {
            const target = sessionStorage.getItem('dhanvikk_auth_redirect_target');
            sessionStorage.removeItem('dhanvikk_auth_redirect_target');
            const finalTarget = (target && target !== '/login' && target !== '/register' && target !== '/account') ? target : '/';
            if (window.location.pathname.startsWith('/login') || window.location.pathname.startsWith('/register')) {
              window.location.replace(finalTarget);
            }
            return;
          }
        }

        // 2. Synchronize active Firebase Auth state across the whole site
        unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
          if (fbUser && active && sessionStorage.getItem('dhanvikk_logged_out') !== 'true') {
            const currentToken = localStorage.getItem('dhanvikk_auth_token');
            const currentUser = localStorage.getItem('dhanvikk_user');
            if (!currentToken || !currentUser) {
              const token = await fbUser.getIdToken().catch(() => '');
              const cleanEmail = fbUser.email || '';
              const action = await store.dispatch(
                loginWithGoogleThunk({
                  googleUid: fbUser.uid,
                  id: fbUser.uid,
                  name: fbUser.displayName || (cleanEmail ? cleanEmail.split('@')[0] : 'Customer'),
                  email: cleanEmail,
                  avatar: fbUser.photoURL || '',
                  phone: fbUser.phoneNumber || '',
                  token,
                  isVerified: true,
                  emailVerified: fbUser.emailVerified ?? true,
                })
              );
              if (loginWithGoogleThunk.fulfilled.match(action)) {
                const target = sessionStorage.getItem('dhanvikk_auth_redirect_target');
                sessionStorage.removeItem('dhanvikk_auth_redirect_target');
                sessionStorage.removeItem('dhanvikk_logged_out');
                if (window.location.pathname.startsWith('/login') || window.location.pathname.startsWith('/register')) {
                  const finalTarget = (target && target !== '/login' && target !== '/register' && target !== '/account') ? target : '/';
                  window.location.replace(finalTarget);
                }
              }
            }
          }
        });
      } catch (err) {
        console.warn('Google redirect global listener note:', err);
      }
    })();

    return () => {
      active = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return null;
}

export default function App() {
  return (
    <Provider store={store}>
      <CurrencyProvider>
        <HelmetProvider>
          <BrowserRouter>
          <GlobalGoogleRedirectHandler />
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
              <Route path="/admin/dashbord" element={<Navigate to="/admin/dashboard" replace />} />

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
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/my-orders" element={<Navigate to="/orders" replace />} />
              <Route path="/address" element={<AddressPage />} />
              <Route path="/addresses" element={<Navigate to="/address" replace />} />

              {/* Company & Information Pages */}
              <Route path="/about" element={<AboutPage />} />
              <Route path="/about-us" element={<Navigate to="/about" replace />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/contact-us" element={<Navigate to="/contact" replace />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/faqs" element={<Navigate to="/faq" replace />} />

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
