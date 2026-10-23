import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import Logo from '../common/Logo';
import LoginForm from './LoginForm';
import SocialLogin from './SocialLogin';
import AuthDivider from './AuthDivider';
import AuthTrustMessage from './AuthTrustMessage';
import { loginUser, loginWithGoogleThunk, clearAuthError } from '../../store/slices/authSlice';
import {
  signInWithGoogleFirebase,
  signInWithGoogleCredential,
  checkGoogleRedirectResult,
  auth,
} from '../../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, user, loading, error: authError } = useSelector((state) => state.auth);

  // Target destination redirect (strictly prevents circular redirect back to /login)
  const rawFrom =
    typeof location.state?.from === 'string'
      ? location.state.from
      : location.state?.from?.pathname;
  const redirectTarget = typeof window !== 'undefined' ? sessionStorage.getItem('dhanvikk_auth_redirect_target') : null;
  // Target destination redirect (strictly prevents circular redirect back to /login, /register, or unhydrated /account)
  const isAuthOrAccount = (p) => !p || p === '/login' || p === '/register' || p === '/account';
  const cleanFrom = (rawFrom && !isAuthOrAccount(rawFrom)) ? rawFrom : null;
  const cleanTarget = (redirectTarget && !isAuthOrAccount(redirectTarget)) ? redirectTarget : null;
  const targetDestination = cleanFrom || cleanTarget || '/';

  // Automatically redirect if already authenticated or when login finishes
  React.useEffect(() => {
    if (isAuthenticated && user) {
      sessionStorage.removeItem('dhanvikk_auth_redirect_target');
      if (user.role === 'admin' || user.role === 'super_admin') {
        window.location.replace('/admin/dashboard');
      } else {
        window.location.replace(targetDestination);
      }
    }
  }, [isAuthenticated, user, targetDestination]);

  // Form submission handler
  const handleLoginSubmit = async (data) => {
    dispatch(clearAuthError());
    try {
      const resultAction = await dispatch(
        loginUser({
          email: data.email,
          password: data.password,
          rememberMe: data.rememberMe,
        })
      );

      if (loginUser.fulfilled.match(resultAction)) {
        const msg = resultAction.payload?.message || (resultAction.payload?.isNewAccount
          ? 'Account not found — new account created for you in the database & Firebase! 🌸'
          : 'Welcome back to Dhanvikk Blooms & Exports 🌸');
        toast.success(msg);
        sessionStorage.removeItem('dhanvikk_auth_redirect_target');
        sessionStorage.removeItem('dhanvikk_logged_out');
        const loggedUser = resultAction.payload.user;
        if (loggedUser.role === 'admin' || loggedUser.role === 'super_admin') {
          window.location.replace('/admin/dashboard');
        } else {
          window.location.replace(targetDestination);
        }
      } else {
        toast.error(resultAction.payload || 'Unable to sign in. Please check your credentials.');
      }
    } catch {
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  // Google Identity Services (GSI) credential handler (100% immune to popup blockers)
  const handleGoogleCredential = async (credential) => {
    dispatch(clearAuthError());
    try {
      const firebaseRes = await signInWithGoogleCredential(credential);
      if (firebaseRes?.user) {
        const resultAction = await dispatch(
          loginWithGoogleThunk({
            ...firebaseRes.user,
            token: firebaseRes.token,
          })
        );
        if (loginWithGoogleThunk.fulfilled.match(resultAction)) {
          const loggedUser = resultAction.payload?.user;
          const msg = resultAction.payload?.message || `Welcome, ${loggedUser?.name || 'Valued Customer'}! 🌸`;
          toast.success(msg);
          sessionStorage.removeItem('dhanvikk_auth_redirect_target');
          sessionStorage.removeItem('dhanvikk_logged_out');
          if (loggedUser?.role === 'admin' || loggedUser?.role === 'super_admin') {
            window.location.replace('/admin/dashboard');
          } else {
            window.location.replace(targetDestination);
          }
        } else {
          toast.error(resultAction.payload || 'Google sign-in could not be completed.');
        }
      }
    } catch (err) {
      console.error('Google credential login error:', err);
      toast.error(err?.message || 'Google sign-in could not be completed.');
    }
  };

  // Google OAuth flow (instant popup directly triggered by user click gesture)
  const handleGoogleLogin = async () => {
    dispatch(clearAuthError());
    try {
      const firebaseRes = await signInWithGoogleFirebase();
      if (firebaseRes?.canceled) {
        toast.info(firebaseRes.message || 'Google sign-in was canceled.');
        return;
      }
      if (firebaseRes?.popupBlocked) {
        // If popup was blocked, activate Google One Tap or point to direct Google button
        if (typeof window !== 'undefined' && window.google?.accounts?.id) {
          toast.info('Popup was blocked. Opening Google One-Tap sign-in...');
          window.google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              toast.info('Please tap the Google button to sign in directly.');
            }
          });
          return;
        }
        toast.info('Please tap the Google button to sign in directly.');
        return;
      }
      if (firebaseRes?.unauthorizedDomain) {
        toast.error(firebaseRes.message, { duration: 9000 });
        return;
      }
      if (firebaseRes?.user) {
        const resultAction = await dispatch(
          loginWithGoogleThunk({
            ...firebaseRes.user,
            token: firebaseRes.token,
          })
        );
        if (loginWithGoogleThunk.fulfilled.match(resultAction)) {
          const loggedUser = resultAction.payload?.user;
          const msg = resultAction.payload?.message || (resultAction.payload?.isNewAccount
            ? 'Account not found — new account created with Google in the database! 🌸'
            : `Welcome, ${loggedUser?.name || loggedUser?.email || 'Valued Customer'}! 🌸`);
          toast.success(msg);
          sessionStorage.removeItem('dhanvikk_auth_redirect_target');
          sessionStorage.removeItem('dhanvikk_logged_out');
          if (loggedUser?.role === 'admin' || loggedUser?.role === 'super_admin') {
            window.location.replace('/admin/dashboard');
          } else {
            window.location.replace(targetDestination);
          }
        } else {
          toast.error(resultAction.payload || 'Google sign-in could not be completed.');
        }
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        toast.info('Google sign-in was canceled.');
      } else if (code === 'auth/unauthorized-domain') {
        toast.error('The domain "dhanvikk-exports-main.vercel.app" is not authorized in Firebase Auth. Please verify Authorized Domains in Firebase Console.', { duration: 9000 });
      } else {
        toast.error(err?.message || 'Google sign-in could not be completed.');
      }
    }
  };

  // Check if returning from Google Redirect or active Firebase session
  React.useEffect(() => {
    let isMounted = true;
    let unsubscribe = null;

    if (sessionStorage.getItem('dhanvikk_logged_out') === 'true') {
      return;
    }

    (async () => {
      try {
        // 1. Check getRedirectResult
        const res = await checkGoogleRedirectResult();
        if (res?.error && isMounted) {
          toast.error(res.message, { duration: 9000 });
        } else if (res?.user && isMounted) {
          const action = await dispatch(loginWithGoogleThunk({ ...res.user, token: res.token }));
          if (loginWithGoogleThunk.fulfilled.match(action)) {
            toast.success(`Welcome back, ${res.user.name || 'Customer'}! 🌸`);
            sessionStorage.removeItem('dhanvikk_auth_redirect_target');
            sessionStorage.removeItem('dhanvikk_logged_out');
            window.location.replace(targetDestination);
            return;
          }
        }

        // 2. Synchronize with Firebase Auth state for seamless session recovery
        unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
          if (fbUser && isMounted && sessionStorage.getItem('dhanvikk_logged_out') !== 'true') {
            const currentToken = localStorage.getItem('dhanvikk_auth_token');
            const currentUser = localStorage.getItem('dhanvikk_user');
            if (!currentToken || !currentUser) {
              const token = await fbUser.getIdToken().catch(() => '');
              const cleanEmail = fbUser.email || '';
              const action = await dispatch(
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
                sessionStorage.removeItem('dhanvikk_auth_redirect_target');
                sessionStorage.removeItem('dhanvikk_logged_out');
                window.location.replace(targetDestination);
              }
            }
          }
        });
      } catch (err) {
        console.warn('Login redirect check notice:', err);
      }
    })();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [dispatch, targetDestination]);

  return (
    <div className="w-full max-w-[420px] sm:max-w-[440px] mx-auto flex flex-col justify-center py-4">
      {/* Main Luxury White Card Container */}
      <div className="relative w-full bg-white border border-[#EFE7DE] rounded-3xl p-6 sm:p-8 text-center shadow-[0_16px_48px_rgba(194,24,91,0.06)]">
        {/* Subtle Top Rose Hairline Gradient Accent */}
        <div className="absolute inset-x-10 top-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#EC407A] to-transparent pointer-events-none" />

        {/* Logo Section */}
        <div className="pt-1 mb-3.5 flex justify-center">
          <Logo />
        </div>

        {/* Welcome Section */}
        <div className="mb-5 text-center">
          <h1 className="text-2xl sm:text-[26px] font-bold text-[#1F191D] tracking-tight font-['Poppins']">
            Welcome Back
          </h1>
          <p className="mt-1 text-xs sm:text-[13px] text-[#666666] font-normal leading-relaxed max-w-[320px] mx-auto">
            Sign in to track orders, manage saved addresses & rewards.
          </p>
        </div>

        {/* 1-Click Google Sign-In */}
        <div className="mb-4">
          <SocialLogin
            onGoogleLogin={handleGoogleLogin}
            onGoogleCredential={handleGoogleCredential}
            loading={loading}
          />
        </div>

        {/* Elegant Divider */}
        <AuthDivider text="OR CONTINUE WITH EMAIL" className="my-3" />

        {/* Login Form */}
        <div className="w-full">
          <LoginForm
            onSubmit={handleLoginSubmit}
            loading={loading}
            serverError={authError}
          />
        </div>


        {/* Register CTA Link */}
        <div className="mt-4 pt-3.5 border-t border-[#F2ECE6] text-center text-xs text-[#666666]">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-bold text-[#C2185B] hover:text-[#EC407A] ml-1 transition-colors hover:underline"
          >
            Create an Account →
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="mt-3.5 pt-2 text-center border-t border-[#F2ECE6]">
          <AuthTrustMessage />
        </div>
      </div>
    </div>
  );
}
