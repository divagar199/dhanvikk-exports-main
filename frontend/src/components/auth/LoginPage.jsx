import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  AlertTriangle,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Lock,
  Mail,
  Zap,
  CheckCircle2,
  Crown,
  UserCheck,
} from 'lucide-react';
import Logo from '../common/Logo';
import LoginForm from './LoginForm';
import SocialLogin from './SocialLogin';
import AuthDivider from './AuthDivider';
import AuthTrustMessage from './AuthTrustMessage';
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
  const [activeAuthTab, setActiveAuthTab] = useState('google'); // 'google' | 'email'

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

  // Google OAuth flow (instant popup with active user gesture and backend sync)
  const handleGoogleLogin = async () => {
    dispatch(clearAuthError());
    sessionStorage.removeItem('dhanvikk_logged_out');
    setGoogleLoading(true);
    try {
      // 1. Invoke directly during user gesture so browser never blocks the popup
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
        toast.error('Google sign-in popup was blocked by browser. Please allow popups or click below for full-page sign-in.');
        setGoogleLoading(false);
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
        } else {
          toast.error(errMsg);
        }
      }
    } catch (err) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        toast.info('Google sign-in was canceled.');
      } else if (err?.code === 'auth/popup-blocked') {
        toast.error('Google sign-in popup was blocked by browser. Please allow popups or click below for full-page sign-in.');
      } else {
        toast.error(err?.message || 'Google sign-in could not be completed.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Direct Google Redirect flow (guaranteed bypass of popup/COOP blockers)
  const handleGoogleRedirectLogin = async () => {
    dispatch(clearAuthError());
    sessionStorage.removeItem('dhanvikk_logged_out');
    setGoogleLoading(true);
    try {
      await signInWithGoogleRedirectFirebase();
    } catch {
      toast.error('Could not initiate Google sign-in redirect.');
      setGoogleLoading(false);
    }
  };

  // Fast Demo Customer Sign In
  const handleDemoCustomerSignIn = async () => {
    handleLoginSubmit({
      email: 'customer@dhanvikk.com',
      password: 'password123',
      rememberMe: true,
    });
  };

  // Fast Demo Admin Sign In
  const handleDemoAdminSignIn = async () => {
    handleLoginSubmit({
      email: 'admin@dhanvikk.com',
      password: 'AdminBloom@2026',
      rememberMe: true,
    });
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

  const isDomainError = Boolean(authError && authError.includes('authorized in Firebase Auth'));

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

        {/* Actionable Firebase Authorized Domain Warning Banner if Domain not Whitelisted */}
        {isDomainError && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-50/95 border border-amber-300 text-left text-xs text-amber-950 space-y-2 shadow-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Authorize Domain in Firebase Console</span>
            </div>
            <p className="text-[11.5px] text-amber-800 leading-relaxed">
              Google Sign-In requires whitelisting this domain in Firebase project{' '}
              <strong className="font-semibold font-mono">auth-checker-1-main</strong>:
            </p>
            <div className="p-2 rounded-xl bg-white/90 border border-amber-200 font-mono text-[11px] font-semibold text-[#242124] select-all break-all">
              {typeof window !== 'undefined' ? window.location.hostname : 'localhost'}
            </div>
            <div className="pt-1 flex flex-col gap-1.5">
              <a
                href="https://console.firebase.google.com/project/auth-checker-1-main/authentication/settings"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-[#EC407A] hover:bg-[#D81B60] text-white font-semibold text-xs transition-colors shadow-xs"
              >
                <span>Add Domain in Firebase Console</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <span className="text-[10.5px] text-amber-700 text-center">
                Firebase Console → Authentication → Settings → Authorized domains → Add domain
              </span>
            </div>
          </div>
        )}

        {/* Elegant Mode Segmented Control Switcher */}
        <div className="mb-4 p-1 rounded-2xl bg-[#F8F5F0] border border-[#EFE7DE] flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveAuthTab('google')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeAuthTab === 'google'
                ? 'bg-white text-[#1F191D] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#E8DFD8]'
                : 'text-[#777777] hover:text-[#1F191D]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>1-Tap Google</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAuthTab('email')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeAuthTab === 'email'
                ? 'bg-white text-[#1F191D] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#E8DFD8]'
                : 'text-[#777777] hover:text-[#1F191D]'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-[#EC407A]" />
            <span>Email & Password</span>
          </button>
        </div>

        {/* TAB 1: 1-Tap Google Authentication */}
        {activeAuthTab === 'google' && (
          <div className="space-y-3.5 mb-4 animate-in fade-in duration-200">
            <SocialLogin
              onGoogleLogin={handleGoogleLogin}
              onGoogleRedirectLogin={handleGoogleRedirectLogin}
              loading={googleLoading || loading}
            />

            <div className="flex items-center justify-center gap-2 text-[11px] text-[#7A7476]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant sync with Firebase & MongoDB</span>
            </div>
          </div>
        )}

        {/* TAB 2: Email & Password Form */}
        {activeAuthTab === 'email' && (
          <div className="w-full mb-3 animate-in fade-in duration-200">
            <LoginForm
              onSubmit={handleLoginSubmit}
              loading={loading || googleLoading}
              serverError={!isDomainError ? authError : null}
            />
          </div>
        )}

        {/* Fast Test Drive Accounts Drawer */}
        <div className="mt-4 pt-3.5 border-t border-[#F2ECE6]">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">
              Fast 1-Click Demo Accounts
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Ready to test
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDemoCustomerSignIn}
              disabled={loading || googleLoading}
              className="p-2.5 rounded-xl border border-[#E5DFD9] bg-[#FAF8F5] hover:bg-[#F5EFEA] hover:border-[#D0C5BA] text-left transition-all cursor-pointer group disabled:opacity-50"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F191D]">
                <UserCheck className="w-3.5 h-3.5 text-[#C2185B]" />
                <span>Patron Client</span>
              </div>
              <p className="text-[10px] text-[#777777] mt-0.5 truncate">
                customer@dhanvikk.com
              </p>
            </button>

            <button
              type="button"
              onClick={handleDemoAdminSignIn}
              disabled={loading || googleLoading}
              className="p-2.5 rounded-xl border border-[#E5DFD9] bg-[#FAF8F5] hover:bg-[#F5EFEA] hover:border-[#D0C5BA] text-left transition-all cursor-pointer group disabled:opacity-50"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F191D]">
                <Crown className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Store Admin</span>
              </div>
              <p className="text-[10px] text-[#777777] mt-0.5 truncate">
                admin@dhanvikk.com
              </p>
            </button>
          </div>
        </div>

        {/* Register CTA Link */}
        <div className="mt-4 pt-3.5 border-t border-[#F2ECE6] text-center text-xs text-[#666666]">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-bold text-[#C2185B] hover:text-[#EC407A] ml-1 transition-colors hover:underline"
          >
            Create an Account →
          </Link>
        </div>

        {/* Trust Badges Footnote */}
        <div className="mt-3.5 pt-2 text-center border-t border-[#F2ECE6]">
          <AuthTrustMessage />
        </div>
      </div>
    </div>
  );
}
