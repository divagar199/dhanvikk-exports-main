import React, { useEffect } from 'react';
import SEO from '../../components/common/SEO';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Shield, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import Logo from '../../components/common/Logo';
import Input from '../../components/common/Input';
import PasswordInput from '../../components/auth/PasswordInput';
import Button from '../../components/common/Button';
import Breadcrumb from '../../components/common/Breadcrumb';
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
  email: z.string().min(3, 'Please enter a valid administrator email or Staff ID'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function AdminLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Automatically navigate if already authenticated with an administrative role
  useEffect(() => {
    if (isAuthenticated && user && STAFF_ROLES.includes(user.role)) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (data) => {
    dispatch(clearAuthError());
    try {
      const action = await dispatch(
        loginUser({
          email: data.email.trim(),
          password: data.password,
          rememberMe: true,
        })
      );

      if (loginUser.fulfilled.match(action)) {
        const loggedUser = action.payload?.user;
        if (loggedUser && STAFF_ROLES.includes(loggedUser.role)) {
          toast.success(`Welcome to Admin Operations, ${loggedUser.name}!`);
          navigate('/admin/dashboard', { replace: true });
        } else {
          toast.error(
            'Access restricted: Your account does not have administrative privileges. Please log in with admin credentials.'
          );
        }
      } else {
        const errorMsg = action.payload || 'Authentication failed. Please verify your admin credentials.';
        toast.error(errorMsg);
      }
    } catch {
      toast.error('An unexpected error occurred during administrative login.');
    }
  };

  return (
    <>
      <SEO
        title="Admin Portal Login | Dhanvikk Blooms"
        description="Internal administrative portal for Dhanvikk Blooms operations, order dispatch, and catalog management."
        canonical="/admin/login"
        noindex={true}
      />

      <div className="min-h-screen bg-[#FFFDF9] text-[#242124] flex flex-col justify-center items-center px-4 py-8 selection:bg-[#EC407A] selection:text-white relative overflow-hidden">
        {/* Soft botanical ambient background glows */}
        <div className="absolute top-1/6 -left-28 w-96 h-96 rounded-full bg-[#FCC1C5]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/6 -right-28 w-96 h-96 rounded-full bg-[#D4AF37]/15 blur-3xl pointer-events-none" />

        <div className="w-full max-w-[440px] bg-white border border-[#EFE7DE] rounded-3xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.06)] relative z-10">
          <Breadcrumb
            items={[
              { label: 'Home', path: '/' },
              { label: 'Admin Portal', path: '/admin' },
              { label: 'Admin Sign In' },
            ]}
            className="mb-4"
          />

          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-3">
              <Logo size="lg" linkTo="/" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F4] border border-[#FCD9E0] text-[10px] font-bold text-[#C2185B] uppercase tracking-wider mb-2">
              <Shield className="w-3.5 h-3.5 text-[#EC407A]" />
              <span>Executive Operations Console</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#242124] font-['Poppins']">
              Admin Portal Access
            </h1>
            <p className="text-xs text-[#666666] mt-1 max-w-xs">
              Authorized catalog administration, order fulfillment & export cargo telemetry
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <Input
              label="Admin Email or Staff ID"
              type="text"
              autoComplete="username"
              startIcon={Mail}
              error={errors.email?.message}
              inputClassName="text-[#242124] placeholder:text-[#999999]"
              className="[&_label]:text-[#242124] [&>div]:bg-white [&>div]:border-[#DCD5CD]"
              {...register('email')}
              placeholder="divagar.m.msc.cs@gmail.com"
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
                loading={loading}
                loadingText="Authenticating Admin..."
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
              className="text-[#666666] hover:text-[#242124] transition-colors"
            >
              Customer Sign In
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
