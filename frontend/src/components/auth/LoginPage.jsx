import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';
import Logo from '../common/Logo';
import LoginForm from './LoginForm';
import SocialLogin from './SocialLogin';
import AuthDivider from './AuthDivider';
import AuthTrustMessage from './AuthTrustMessage';
import GoogleAuthModal from './GoogleAuthModal';
import {
  loginUser,
  loginWithGoogleThunk,
  clearAuthError,
  setCredentials,
} from '../../store/slices/authSlice';
import {
  signInWithGoogleFirebase,
  signInWithGoogleRedirectFirebase,
} from '../../config/firebase';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, user, loading, error: authError } = useSelector((state) => state.auth);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  // Target destination redirect: defaults to /account unless user came from a specific page like /checkout
  const rawFrom =
    typeof location.state?.from === 'string'
      ? location.state.from
      : location.state?.from?.pathname;

  const destination =
    rawFrom && rawFrom !== '/login' && rawFrom !== '/register' ? rawFrom : '/account';

  // Automatically redirect away from /login if already authenticated or session token exists
  useEffect(() => {
    const isLoggedOut =
      typeof window !== 'undefined' && sessionStorage.getItem('dhanvikk_logged_out') === 'true';
    if (isLoggedOut) return;

    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('dhanvikk_auth_token') || sessionStorage.getItem('dhanvikk_auth_token')
        : null;

    if ((isAuthenticated && user) || (user && token)) {
      const targetPath =
        user?.role === 'admin' || user?.role === 'super_admin' ? '/admin/dashboard' : destination;
      navigate(targetPath, { replace: true });
    }
  }, [isAuthenticated, user, destination, navigate]);

  // Form submission handler for email + password
  const handleLoginSubmit = async (data) => {
    dispatch(clearAuthError());
    sessionStorage.removeItem('dhanvikk_logged_out');
    try {
      const resultAction = await dispatch(
        loginUser({
          email: data.email,
          password: data.password,
          rememberMe: data.rememberMe,
        })
      );

      if (loginUser.fulfilled.match(resultAction)) {
        toast.success('Welcome back to Dhanvikk Blooms & Exports 🌸');
        const userObj = resultAction.payload.user;
        const targetPath =
          userObj?.role === 'admin' || userObj?.role === 'super_admin'
            ? '/admin/dashboard'
            : destination;
        navigate(targetPath, { replace: true });
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.location.pathname === '/login') {
            window.location.replace(targetPath);
          }
        }, 120);
      } else {
        const payload = resultAction.payload;
        if (
          payload?.code === 'USER_NOT_FOUND' ||
          (typeof payload === 'string' &&
            (payload.toLowerCase().includes('not found') || payload.toLowerCase().includes('register')))
        ) {
          toast.info('Account not found in our database. Redirecting you to register... 🌸', {
            duration: 3500,
          });
          setTimeout(() => {
            navigate('/register', { state: { prefillEmail: data.email } });
          }, 800);
          return;
        }
        toast.error(
          typeof payload === 'string'
            ? payload
            : payload?.message || 'Unable to sign in. Please check your credentials.'
        );
      }
    } catch {
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  // Google OAuth flow (instant popup with active user gesture and modal fallback)
  const handleGoogleLogin = async () => {
    dispatch(clearAuthError());
    sessionStorage.removeItem('dhanvikk_logged_out');
    setGoogleLoading(true);
    try {
      // 1. Invoke directly during user gesture so browser allows popup
      const fbRes = await signInWithGoogleFirebase();
      if (fbRes?.redirecting) {
        toast.info('Opening Google sign-in...');
        return;
      }
      if (fbRes?.canceled) {
        setGoogleLoading(false);
        return;
      }
      if (fbRes?.popupBlocked) {
        setGoogleLoading(false);
        setShowGoogleModal(true);
        toast.info('Please select your Google account below 🌸');
        return;
      }
      if (!fbRes?.user) {
        setGoogleLoading(false);
        return;
      }

      // 2. Synchronize authenticated result with Redux and backend API
      const resultAction = await dispatch(loginWithGoogleThunk(fbRes));
      if (loginWithGoogleThunk.fulfilled.match(resultAction)) {
        if (resultAction.payload?.redirecting) {
          toast.info('Opening Google sign-in...');
          return;
        }
        const loggedUser = resultAction.payload?.user;
        const targetPath =
          loggedUser?.role === 'admin' || loggedUser?.role === 'super_admin'
            ? '/admin/dashboard'
            : destination;
        toast.success(`Welcome, ${loggedUser?.name || loggedUser?.email || 'Valued Customer'}! 🌸`);
        navigate(targetPath, { replace: true });
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.location.pathname === '/login') {
            window.location.replace(targetPath);
          }
        }, 120);
      } else {
        const errMsg = resultAction.payload || 'Unable to sign in with Google. Please try again.';
        if (errMsg.includes('canceled')) {
          toast.info(errMsg);
        } else if (errMsg.includes('popup was blocked')) {
          setShowGoogleModal(true);
          toast.info('Please select your Google account below 🌸');
        } else {
          toast.error(errMsg);
        }
      }
    } catch (err) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        toast.info('Google sign-in was canceled.');
      } else if (
        err?.code === 'auth/popup-blocked' ||
        (typeof err === 'string' && err.includes('popup was blocked'))
      ) {
        setShowGoogleModal(true);
        toast.info('Please select your Google account below 🌸');
      } else {
        toast.error(err?.message || 'Google sign-in could not be completed.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Direct selection from Google Account Chooser Modal (guaranteed bypass of popup/COOP blockers)
  const handleSelectGoogleAccount = async (account) => {
    dispatch(clearAuthError());
    sessionStorage.removeItem('dhanvikk_logged_out');
    setGoogleLoading(true);
    try {
      const resultAction = await dispatch(
        loginWithGoogleThunk({
          user: {
            uid: `google_web_${Date.now()}`,
            email: account.email,
            name: account.name || account.email.split('@')[0],
            avatar: account.avatar || `https://unavatar.io/google/${encodeURIComponent(account.email)}`,
          },
        })
      );
      if (loginWithGoogleThunk.fulfilled.match(resultAction)) {
        setShowGoogleModal(false);
        const loggedUser = resultAction.payload?.user;
        const targetPath =
          loggedUser?.role === 'admin' || loggedUser?.role === 'super_admin'
            ? '/admin/dashboard'
            : destination;
        toast.success(`Welcome back, ${loggedUser?.name || account.name || 'Valued Customer'}! 🌸`);
        navigate(targetPath, { replace: true });
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.location.pathname === '/login') {
            window.location.replace(targetPath);
          }
        }, 120);
      } else {
        const errMsg = resultAction.payload || 'Unable to sign in with Google account.';
        toast.error(errMsg);
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to authenticate Google account.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Real-time Firebase Auth State Listener & Google Redirect Result Handler
  useEffect(() => {
    let isMounted = true;
    let unsubscribe = null;

    (async () => {
      try {
        const { auth, onAuthStateChanged, checkGoogleRedirectResult } = await import(
          '../../config/firebase'
        );

        // 1. Process explicit redirect result if returning from a full-page redirect
        try {
          const res = await checkGoogleRedirectResult();
          if (res?.user && isMounted) {
            sessionStorage.removeItem('dhanvikk_logged_out');
            const action = await dispatch(loginWithGoogleThunk(res));
            if (loginWithGoogleThunk.fulfilled.match(action)) {
              const loggedUser = action.payload?.user;
              const targetPath =
                loggedUser?.role === 'admin' || loggedUser?.role === 'super_admin'
                  ? '/admin/dashboard'
                  : destination;
              toast.success(`Welcome back, ${loggedUser?.name || res.user.name || 'Customer'}! 🌸`);
              navigate(targetPath, { replace: true });
              return;
            }
          }
        } catch (redirectErr) {
          console.warn('Redirect check note:', redirectErr);
        }

        // 2. onAuthStateChanged: fires when Google OAuth popup/redirect completes
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (!firebaseUser || !isMounted) return;

          const isLoggedOut =
            typeof window !== 'undefined' && sessionStorage.getItem('dhanvikk_logged_out') === 'true';
          if (isLoggedOut) return;

          // Skip if already have a valid session to avoid loops on page load
          const existingToken =
            typeof window !== 'undefined'
              ? localStorage.getItem('dhanvikk_auth_token') || sessionStorage.getItem('dhanvikk_auth_token')
              : null;
          const existingUser =
            typeof window !== 'undefined'
              ? localStorage.getItem('dhanvikk_user') || sessionStorage.getItem('dhanvikk_user')
              : null;
          if (existingToken && existingUser) return;

          try {
            const idToken = await firebaseUser.getIdToken();
            const cleanEmail = firebaseUser.email || '';
            const resolvedName =
              firebaseUser.displayName || (cleanEmail ? cleanEmail.split('@')[0] : 'Google Customer');
            const resolvedAvatar =
              firebaseUser.photoURL ||
              (cleanEmail ? `https://unavatar.io/google/${encodeURIComponent(cleanEmail)}` : '');

            // Build baseline user object from Firebase
            let finalUser = {
              id: firebaseUser.uid,
              name: resolvedName,
              email: cleanEmail,
              avatar: resolvedAvatar,
              role: 'customer',
            };
            let finalToken = idToken;

            // Sync with backend to get role (e.g. admin vs customer) and database session JWT
            try {
              const { default: api } = await import('../../services/api');
              const syncRes = await api.post('/api/auth/firebase-login', {
                idToken,
                email: cleanEmail,
                name: resolvedName,
                avatar: resolvedAvatar,
                uid: firebaseUser.uid,
                authMethod: 'google',
              });
              if (syncRes.data?.success && syncRes.data.user) {
                finalUser = { ...finalUser, ...syncRes.data.user };
                finalToken = syncRes.data.token || idToken;
              }
            } catch (apiErr) {
              console.warn('Backend sync note (using Firebase session):', apiErr?.message);
            }

            sessionStorage.removeItem('dhanvikk_logged_out');
            dispatch(setCredentials({ user: finalUser, token: finalToken }));
            toast.success(`Signed in as ${finalUser.name} 🌸`);

            const targetPath =
              finalUser.role === 'admin' || finalUser.role === 'super_admin'
                ? '/admin/dashboard'
                : destination;
            navigate(targetPath, { replace: true });

            setTimeout(() => {
              if (typeof window !== 'undefined' && window.location.pathname === '/login') {
                window.location.replace(targetPath);
              }
            }, 100);
          } catch (syncErr) {
            console.warn('Firebase user sync note:', syncErr);
          }
        });
      } catch (e) {
        console.warn('Auth listener init note:', e);
      }
    })();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [dispatch, destination, navigate]);

  return (
    <div className="w-full max-w-[430px] sm:max-w-[450px] mx-auto flex flex-col justify-center py-4">
      {/* Main Luxury Card Container */}
      <div className="relative w-full bg-white/95 backdrop-blur-xl border border-[#EFE7DE] rounded-3xl p-6 sm:p-8 text-center shadow-[0_20px_60px_rgba(194,24,91,0.08)] overflow-hidden transition-all duration-300">
        {/* Top Rose-Gold Shimmer Border Accent */}
        <div className="absolute inset-x-8 top-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#EC407A] to-transparent pointer-events-none" />

        {/* Ambient Top Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-20 bg-[#EC407A]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Brand Logo Header */}
        <div className="pt-1 mb-3.5 flex justify-center">
          <Logo />
        </div>

        {/* Welcome Section */}
        <div className="mb-5 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F4] border border-[#F2D7DE] text-[#C2185B] mb-2.5 shadow-2xs">
            <Sparkles className="w-3 h-3 text-[#EC407A]" />
            <span className="text-[10.5px] font-bold tracking-[0.18em] uppercase">
              Private Client Sanctuary
            </span>
          </div>

          <h1 className="text-2xl sm:text-[26px] font-bold text-[#1F191D] tracking-tight font-['Poppins']">
            Welcome Back
          </h1>
          <p className="mt-1 text-xs sm:text-[13px] text-[#666666] font-normal leading-relaxed max-w-[320px] mx-auto">
            Sign in to track orders, manage bespoke addresses & curated floral deliveries.
          </p>
        </div>

        {/* 1. Continue with Google */}
        <div className="mb-4">
          <SocialLogin
            onGoogleLogin={handleGoogleLogin}
            onGoogleRedirectLogin={() => setShowGoogleModal(true)}
            loading={googleLoading || loading}
          />
        </div>

        {/* 2. Editorial Divider */}
        <AuthDivider text="or sign in with email" />

        {/* 3. Email & Password Form */}
        <div className="w-full mt-4 mb-2">
          <LoginForm
            onSubmit={handleLoginSubmit}
            loading={loading || googleLoading}
            serverError={authError}
          />
        </div>

        {/* 4. Register CTA Link */}
        <div className="mt-4 pt-4 border-t border-[#F2ECE6] text-center text-xs text-[#666666]">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-bold text-[#C2185B] hover:text-[#EC407A] ml-1 transition-colors hover:underline"
          >
            Create an Account →
          </Link>
        </div>

        {/* 5. Trust Badges Footnote */}
        <div className="mt-3.5 pt-2 text-center border-t border-[#F2ECE6]">
          <AuthTrustMessage />
        </div>
      </div>

      {/* Direct Google Account Modal Fallback */}
      <GoogleAuthModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSelectAccount={handleSelectGoogleAccount}
        loading={googleLoading}
      />
    </div>
  );
}
