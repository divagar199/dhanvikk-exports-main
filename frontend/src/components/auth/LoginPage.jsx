import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { AlertTriangle, ExternalLink, Sparkles } from 'lucide-react';
import Logo from '../common/Logo';
import LoginForm from './LoginForm';
import SocialLogin from './SocialLogin';
import AuthDivider from './AuthDivider';
import AuthTrustMessage from './AuthTrustMessage';
import { loginUser, loginWithGoogleThunk, clearAuthError } from '../../store/slices/authSlice';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, user, loading, error: authError } = useSelector((state) => state.auth);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Target destination redirect (e.g. /checkout or /account)
  const rawFrom =
    typeof location.state?.from === 'string'
      ? location.state.from
      : location.state?.from?.pathname || '/account';

  const destination = (rawFrom && rawFrom !== '/login' && rawFrom !== '/register') ? rawFrom : '/account';

  // Automatically redirect away from /login if already authenticated or session token exists
  React.useEffect(() => {
    const isLoggedOut =
      typeof window !== 'undefined' && sessionStorage.getItem('dhanvikk_logged_out') === 'true';
    if (isLoggedOut) return;

    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('dhanvikk_auth_token') || sessionStorage.getItem('dhanvikk_auth_token')
        : null;

    if (isAuthenticated && user && token) {
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, user, destination, navigate]);

  // Form submission handler
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
        const targetPath = (userObj?.role === 'admin' || userObj?.role === 'super_admin')
          ? '/admin/dashboard'
          : destination;
        navigate(targetPath, { replace: true });
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.location.pathname === '/login') {
            window.location.replace(targetPath);
          }
        }, 120);
      } else {
        toast.error(resultAction.payload || 'Unable to sign in. Please check your credentials.');
      }
    } catch {
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  // Google OAuth flow (instant)
  const handleGoogleLogin = async () => {
    dispatch(clearAuthError());
    sessionStorage.removeItem('dhanvikk_logged_out');
    setGoogleLoading(true);
    try {
      const resultAction = await dispatch(loginWithGoogleThunk());
      if (loginWithGoogleThunk.fulfilled.match(resultAction)) {
        if (resultAction.payload?.redirecting) {
          toast.info('Opening Google sign-in...');
          return;
        }
        const loggedUser = resultAction.payload?.user;
        toast.success(`Welcome, ${loggedUser?.name || loggedUser?.email || 'Valued Customer'}! 🌸`);
        navigate(destination, { replace: true });
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.location.pathname === '/login') {
            window.location.replace(destination);
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
    } catch {
      toast.error('Google sign-in could not be completed.');
    } finally {
      setGoogleLoading(false);
    }
  };


  // Quick Demo Account Auto-Fill / Sign In
  const handleDemoSignIn = async () => {
    handleLoginSubmit({
      email: 'customer@dhanvikk.com',
      password: 'password123',
      rememberMe: true,
    });
  };

  // Check if returning from Google Redirect
  React.useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { checkGoogleRedirectResult } = await import('../../config/firebase');
        const res = await checkGoogleRedirectResult();
        if (res?.user && isMounted) {
          const action = await dispatch(loginWithGoogleThunk(res.user));
          if (loginWithGoogleThunk.fulfilled.match(action)) {
            toast.success(`Welcome back, ${res.user.name || 'Customer'}! 🌸`);
            navigate(destination, { replace: true });
          }
        }
      } catch (e) {
        console.warn('Redirect result check note:', e);
      }
    })();
    return () => { isMounted = false; };
  }, [dispatch, destination, navigate]);

  const isDomainError = Boolean(authError && authError.includes('authorized in Firebase Auth'));

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

        {/* Actionable Authorized Domain Guide Banner if Firebase rejected domain */}
        {isDomainError && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-50/95 border border-amber-300 text-left text-xs text-amber-950 space-y-2 shadow-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Authorize Domain in Firebase Console</span>
            </div>
            <p className="text-[11.5px] text-amber-800 leading-relaxed">
              Google Sign-In requires adding this domain to your Firebase Authorized Domains whitelist:
            </p>
            <div className="p-2 rounded-xl bg-white/90 border border-amber-200 font-mono text-[11px] font-semibold text-[#242124] select-all break-all">
              {typeof window !== 'undefined' ? window.location.hostname : 'dhanvikk-exports-main.vercel.app'}
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

        {/* 1-Click Google Sign-In */}
        <div className="mb-4">
          <SocialLogin onGoogleLogin={handleGoogleLogin} loading={googleLoading || loading} />
        </div>

        {/* Fast Demo Account Helper */}
        <div className="mb-3">
          <button
            type="button"
            onClick={handleDemoSignIn}
            disabled={loading || googleLoading}
            className="w-full py-2 px-3 rounded-xl border border-dashed border-[#E0D8D0] bg-[#FAF8F5] hover:bg-[#F5EFEA] hover:border-[#D0C5BA] text-[12px] font-medium text-[#555555] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#EC407A]" />
            <span>1-Click Demo Customer Sign In</span>
          </button>
        </div>

        {/* Elegant Divider */}
        <AuthDivider text="OR CONTINUE WITH EMAIL" className="my-3" />

        {/* Login Form */}
        <div className="w-full">
          <LoginForm
            onSubmit={handleLoginSubmit}
            loading={loading || googleLoading}
            serverError={!isDomainError ? authError : null}
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
