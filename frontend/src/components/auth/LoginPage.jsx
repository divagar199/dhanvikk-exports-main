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

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, error: authError } = useSelector((state) => state.auth);

  // Target destination redirect (e.g. /checkout or /account)
  const from =
    typeof location.state?.from === 'string'
      ? location.state.from
      : location.state?.from?.pathname || '/account';

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
        toast.success('Welcome back to Dhanvikk Blooms & Exports 🌸');
        const user = resultAction.payload.user;
        if (user.role === 'admin' || user.role === 'super_admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate(from || '/account', { replace: true });
        }
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
    try {
      const resultAction = await dispatch(loginWithGoogleThunk());
      if (loginWithGoogleThunk.fulfilled.match(resultAction)) {
        const loggedUser = resultAction.payload?.user;
        toast.success(`Welcome, ${loggedUser?.name || loggedUser?.email || 'Valued Customer'}! 🌸`);
        navigate(from || '/account', { replace: true });
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
    }
  };

  // Check if returning from Google Redirect
  React.useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { checkGoogleRedirectResult } = await import('../../config/firebase');
        const res = await checkGoogleRedirectResult();
        if (res && isMounted) {
          const action = await dispatch(loginWithGoogleThunk(res.user));
          if (loginWithGoogleThunk.fulfilled.match(action)) {
            toast.success(`Welcome back, ${res.user.name || 'Customer'}! 🌸`);
            navigate(from || '/account', { replace: true });
          }
        }
      } catch (e) {
        console.warn('Redirect result check note:', e);
      }
    })();
    return () => { isMounted = false; };
  }, [dispatch, from, navigate]);

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
          <SocialLogin onGoogleLogin={handleGoogleLogin} loading={loading} />
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
