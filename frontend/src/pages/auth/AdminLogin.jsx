import React, { useEffect, useState } from 'react';
import SEO from '../../components/common/SEO';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Shield, Lock, Mail, CheckCircle2, UserCheck, ArrowRight, Store, AlertCircle } from 'lucide-react';
import Logo from '../../components/common/Logo';
import Input from '../../components/common/Input';
import PasswordInput from '../../components/auth/PasswordInput';
import Button from '../../components/common/Button';
import Breadcrumb from '../../components/common/Breadcrumb';
import FormError from '../../components/common/FormError';
import { loginUser, clearAuthError } from '../../store/slices/authSlice';

const STAFF_ROLES = [
  'admin',
  'manager',
  'inventory_manager',
  'delivery_manager',
  'content_manager',
  'super_admin',
];

const adminSchema = z.object({
  email: z.string().min(3, 'Please enter a valid staff email address or Staff ID'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function AdminLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);
  const [activePreset, setActivePreset] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      email: 'divagar.m.msc.cs@gmail.com',
      password: '',
    },
  });

  // Automatically navigate if already authenticated with an administrative role
  useEffect(() => {
    if (isAuthenticated && user && STAFF_ROLES.includes(user.role)) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const executeSignIn = async (email, password) => {
    dispatch(clearAuthError());
    try {
      const action = await dispatch(
        loginUser({
          email: email.trim(),
          password,
          rememberMe: true,
        })
      );

      if (loginUser.fulfilled.match(action)) {
        const loggedUser = action.payload?.user;
        if (loggedUser && STAFF_ROLES.includes(loggedUser.role)) {
          toast.success(`Welcome to Staff Operations, ${loggedUser.name}!`);
          navigate('/admin/dashboard', { replace: true });
        } else {
          toast.error(
            'Access restricted: Your account does not have staff privileges. Please log in with administrative credentials.'
          );
        }
      } else {
        const errorMsg = action.payload || 'Authentication failed. Please verify your staff credentials.';
        toast.error(errorMsg);
      }
    } catch {
      toast.error('An unexpected error occurred during administrative login.');
    } finally {
      setActivePreset(null);
    }
  };

  const handleQuickSignIn = (email, password, presetName) => {
    setActivePreset(presetName);
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
    clearErrors();
    executeSignIn(email, password);
  };

  const onSubmit = (data) => {
    executeSignIn(data.email, data.password);
  };

  return (
    <>
      <SEO
        title="Staff & Admin Portal Login | Dhanvikk Blooms"
        description="Internal administrative portal for Dhanvikk Blooms operations, order dispatch, and catalog management."
        canonical="/admin/login"
        noindex={true}
      />

      <div className="min-h-screen bg-[#FFFDF9] text-[#242124] flex flex-col justify-center items-center px-4 py-8 selection:bg-[#EC407A] selection:text-white relative overflow-hidden">
        {/* Soft botanical ambient background glows */}
        <div className="absolute top-1/6 -left-28 w-96 h-96 rounded-full bg-[#FCC1C5]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/6 -right-28 w-96 h-96 rounded-full bg-[#D4AF37]/15 blur-3xl pointer-events-none" />

        <div className="w-full max-w-[460px] bg-white border border-[#EFE7DE] rounded-3xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.06)] relative z-10">
          <Breadcrumb
            items={[
              { label: 'Home', path: '/' },
              { label: 'Staff Portal', path: '/admin' },
              { label: 'Staff Sign In' },
            ]}
            className="mb-4"
          />

          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-3">
              <Logo size="lg" linkTo="/" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F4] border border-[#FCD9E0] text-[10px] font-bold text-[#C2185B] uppercase tracking-wider mb-2">
              <Shield className="w-3.5 h-3.5 text-[#EC407A]" />
              <span>Internal Operations Console</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#242124] font-['Poppins']">
              Staff Portal Access
            </h1>
            <p className="text-xs text-[#666666] mt-1 max-w-xs">
              Authorized floristry management, dispatch tracking & product catalog administration
            </p>
          </div>

          {/* Quick Staff Credentials Cards */}
          <div className="mb-5 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] px-1">
              <span className="text-[#C2185B] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Verified Staff Access
              </span>
              <span className="text-[10px] text-[#888888] font-mono">Dev & Production</span>
            </div>

            {/* Super Admin Preset */}
            <div className="p-3 rounded-2xl bg-gradient-to-br from-[#FFF5F7] to-[#FFF0F3] border border-[#FAD2DC] transition-all hover:border-[#EC407A]">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-xs font-bold text-[#9C1242] flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-[#EC407A]" />
                    Super Admin (Full Root Control)
                  </div>
                  <div className="text-[11px] text-[#555555] font-mono mt-0.5">
                    divagar.m.msc.cs@gmail.com • <span className="text-[#242124] font-semibold">admin@2026</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickSignIn('divagar.m.msc.cs@gmail.com', 'admin@2026', 'super_admin')}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#C2185B] to-[#EC407A] hover:opacity-95 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.98] disabled:opacity-50"
              >
                <span>⚡ {activePreset === 'super_admin' ? 'Authenticating...' : '1-Click Super Admin Sign In'}</span>
              </button>
            </div>

            {/* Manager Preset */}
            <div className="p-3 rounded-2xl bg-[#F8F9FA] border border-[#E9ECEF] transition-all hover:border-[#D4AF37]">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-xs font-bold text-[#343A40] flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-[#D4AF37]" />
                    Store Manager (Catalog & Orders)
                  </div>
                  <div className="text-[11px] text-[#555555] font-mono mt-0.5">
                    manager@dhanvikk.com • <span className="text-[#242124] font-semibold">Manager@2026</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickSignIn('manager@dhanvikk.com', 'Manager@2026', 'manager')}
                className="w-full py-2 px-3 rounded-xl bg-white border border-[#D5D0C7] hover:bg-[#F2EDE4] text-[#242124] text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98] disabled:opacity-50"
              >
                <span>⚡ {activePreset === 'manager' ? 'Authenticating...' : '1-Click Store Manager Sign In'}</span>
              </button>
            </div>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#EFE7DE]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-[#999999] tracking-wider">
              <span className="bg-white px-3">Or sign in manually</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <Input
              label="Staff Email or Staff ID"
              type="text"
              autoComplete="username"
              startIcon={Mail}
              error={errors.email?.message}
              inputClassName="text-[#242124] placeholder:text-[#999999]"
              className="[&_label]:text-[#242124] [&>div]:bg-white [&>div]:border-[#DCD5CD]"
              {...register('email')}
              placeholder="divagar.m.msc.cs@gmail.com or STF-2026-001"
            />

            <PasswordInput
              label="Password"
              autoComplete="current-password"
              error={errors.password?.message}
              className="[&_label]:text-[#242124] [&>div]:bg-white [&>div]:border-[#DCD5CD] [&_input]:text-[#242124]"
              {...register('password')}
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading && !activePreset}
                loadingText="Authenticating Staff..."
                className="font-bold py-3 shadow-[0_4px_16px_rgba(194,24,91,0.25)] rounded-xl"
              >
                <span>Enter Admin Portal</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-[#F2EDE4] flex flex-col gap-2 text-center text-xs">
            <Link
              to="/"
              className="text-[#C2185B] hover:underline inline-flex items-center justify-center gap-1 font-medium"
            >
              <span>← Return to Customer Storefront</span>
            </Link>
            <Link
              to="/login"
              className="text-[#777777] hover:text-[#242124] transition-colors inline-flex items-center justify-center gap-1"
            >
              <span>Looking for customer sign in? Click here</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
