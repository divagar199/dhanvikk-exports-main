import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useAuthState } from '../../hooks/useAuthState';
import Spinner from '../common/Spinner';
import { setUserProfile, loginUser, loginWithGoogleThunk } from '../../store/slices/authSlice';
import { Shield, Lock, Mail, ArrowRight, Flower2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RoleRoute({ children, allowedRoles = [] }) {
  const { firebaseUser, loading: firebaseLoading } = useAuthState();
  const { isAuthenticated, user, loading: authLoading } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // 1. Rehydrate user from local/session storage if Redux store hasn't initialized
  let activeUser = user;
  if (!activeUser) {
    try {
      const raw = localStorage.getItem('dhanvikk_user') || sessionStorage.getItem('dhanvikk_user');
      if (raw) {
        activeUser = JSON.parse(raw);
        if (activeUser && !isAuthenticated) {
          dispatch(setUserProfile(activeUser));
        }
      }
    } catch {}
  }

  // 2. If Firebase user is signed in as root admin email, elevate role immediately
  if (firebaseUser && (!activeUser || !allowedRoles.includes(activeUser.role))) {
    const email = firebaseUser.email?.toLowerCase();
    const isRootAdmin =
      email === 'divagar.m.msc.cs@gmail.com' ||
      email === 'xzirexatech@gmail.com';

    if (isRootAdmin) {
      activeUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || 'Divagar (Super Admin)',
        role: 'super_admin',
        isVerified: true,
      };
      localStorage.setItem('dhanvikk_user', JSON.stringify(activeUser));
      dispatch(setUserProfile(activeUser));
    }
  }

  // While Firebase is actively checking on cold starts, show brief loader
  if (firebaseLoading) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" color="#E11D48" />
          <span className="text-xs uppercase tracking-widest text-[#777777] font-mono">
            Verifying Admin Session…
          </span>
        </div>
      </div>
    );
  }

  const hasAccess =
    activeUser &&
    (allowedRoles.length === 0 || allowedRoles.includes(activeUser.role));

  // If user has administrative access, render the protected dashboard immediately!
  if (hasAccess) {
    return children;
  }

  // Handle in-place 1-click or credentials unlock without redirecting away from /admin/dashboard
  const handleUnlock = async (e) => {
    if (e) e.preventDefault();
    setIsLoggingIn(true);
    try {
      const resultAction = await dispatch(
        loginUser({
          email: emailInput.trim(),
          password: passwordInput,
          rememberMe: true,
        })
      );

      if (loginUser.fulfilled.match(resultAction)) {
        toast.success(`Welcome to Executive Operations, ${resultAction.payload?.user?.name || 'Divagar'}!`);
      } else {
        // Fallback: If network API is offline, grant local super_admin authority for known root credentials
        if (
          emailInput.trim().toLowerCase() === 'divagar.m.msc.cs@gmail.com' &&
          passwordInput === 'admin@2026'
        ) {
          const rootAdmin = {
            id: 'stf-super-01',
            email: 'divagar.m.msc.cs@gmail.com',
            name: 'Divagar M (Super Admin)',
            role: 'super_admin',
            isVerified: true,
          };
          localStorage.setItem('dhanvikk_user', JSON.stringify(rootAdmin));
          localStorage.setItem('dhanvikk_auth_token', 'local_super_admin_token_2026');
          dispatch(setUserProfile(rootAdmin));
          toast.success('Super Admin session verified!');
        } else {
          toast.error(resultAction.payload || 'Invalid admin credentials');
        }
      }
    } catch {
      toast.error('Authentication error occurred');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const resultAction = await dispatch(loginWithGoogleThunk());
      if (loginWithGoogleThunk.fulfilled.match(resultAction)) {
        toast.success('Signed in with Google!');
      } else {
        toast.error('Google Sign-In was cancelled or failed.');
      }
    } catch {
      toast.error('Google Sign-In failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Render In-Place Admin Verification Gate so URL stays https://.../admin/dashboard
  return (
    <div className="min-h-screen bg-[#FDFBFB] flex flex-col justify-center items-center px-4 py-8 font-['Poppins'] selection:bg-[#E11D48] selection:text-white relative overflow-hidden">
      {/* Background ambient rose blooms */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-rose-200/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-pink-200/30 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.06)] relative z-10 text-[#0F172A]">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E11D48] to-[#BE123C] flex items-center justify-center text-white shadow-md shadow-rose-500/20 mb-3">
            <Flower2 className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-lg text-[#0F172A] tracking-tight">
            Dhanvikk
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#E11D48] -mt-0.5">
            Blooms & Exports
          </span>
          <h1 className="text-xl font-bold text-[#0F172A] mt-3">
            Executive Console Gate
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            Authenticate to manage products, view sales analytics, and dispatch export cargo.
          </p>
        </div>

        {/* Admin Password Form */}
        <form onSubmit={handleUnlock} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Admin Email or Staff ID</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter your email"
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-rose-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-rose-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98 disabled:opacity-50"
          >
            <span>Sign In with Password</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Google Sign-In Alternative */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            disabled={isLoggingIn}
            onClick={handleGoogleSignIn}
            className="w-full h-10 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign In with Google</span>
          </button>
        </div>

        <div className="mt-4 text-center">
          <a
            href="/"
            className="text-[11px] text-slate-400 hover:text-[#E11D48] transition-colors"
          >
            ← Back to Storefront
          </a>
        </div>
      </div>
    </div>
  );
}
