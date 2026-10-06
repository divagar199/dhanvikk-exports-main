import React from 'react';
import SEO from '../../components/common/SEO';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Shield, Lock, Mail } from 'lucide-react';
import Logo from '../../components/common/Logo';
import Input from '../../components/common/Input';
import PasswordInput from '../../components/auth/PasswordInput';
import Button from '../../components/common/Button';
import Breadcrumb from '../../components/common/Breadcrumb';
import FormError from '../../components/common/FormError';
import { loginUser, clearAuthError } from '../../store/slices/authSlice';

const adminSchema = z.object({
  email: z.string().email('Please enter a valid staff email'),
  password: z.string().min(6, 'Password is required'),
});

export default function AdminLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      email: 'admin@dhanvikk.com',
      password: '',
    },
  });

  const handleQuickFillAdmin = () => {
    setValue('email', 'admin@dhanvikk.com');
    setValue('password', 'AdminBloom@2026');
    onSubmit({
      email: 'admin@dhanvikk.com',
      password: 'AdminBloom@2026',
    });
  };

  const onSubmit = async (data) => {
    dispatch(clearAuthError());
    const action = await dispatch(
      loginUser({
        email: data.email,
        password: data.password,
        rememberMe: true,
      })
    );

    if (loginUser.fulfilled.match(action)) {
      const user = action.payload.user;
      if (['admin', 'manager', 'inventory_manager', 'delivery_manager', 'content_manager', 'super_admin'].includes(user.role)) {
        toast.success(`Welcome to Staff Portal, ${user.name}`);
        navigate('/admin/dashboard', { replace: true });
      } else {
        toast.error('Access restricted to verified administrators.');
      }
    } else {
      toast.error('Admin authentication failed.');
    }
  };

  return (
    <>
      <SEO
        title="Staff & Admin Portal Login | Dhanvikk Blooms"
        description="Internal administrative portal for Dhanvikk Blooms staff and operations management."
        canonical="/admin/login"
        noindex={true}
      />

      <div className="min-h-screen bg-[#FFFDF9] text-[#242124] flex flex-col justify-center items-center px-3 sm:px-4 py-6 sm:py-8 selection:bg-[#EC407A] selection:text-white relative overflow-hidden">
        {/* Decorative soft floral ambient glows */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-[#FCC1C5]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-[#D4AF37]/15 blur-3xl pointer-events-none" />

        <div className="w-full max-w-[440px] bg-white border border-[#EFE7DE] rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl relative z-10">
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
              <span>Internal Management Console</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#242124] font-['Poppins']">
              Staff Portal Access
            </h1>
            <p className="text-xs text-[#666666] mt-1 max-w-xs">
              Authorized floristry operations, catalog management & dispatch administration
            </p>
          </div>

          {/* Quick Staff Demo Fill Button */}
          <div className="mb-5 p-3.5 rounded-2xl bg-[#FFF0F4]/70 border border-[#F2D7DE] space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#C2185B] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Staff System Credentials
              </span>
              <span className="font-mono text-[#888888] text-[10px]">Production & Dev</span>
            </div>
            <div className="text-[11px] text-[#242124] font-mono space-y-0.5 bg-white border border-[#EFE7DE] p-2 rounded-xl">
              <div>Email: <span className="text-[#242124] font-bold">admin@dhanvikk.com</span></div>
              <div>Pass: <span className="text-[#242124] font-bold">AdminBloom@2026</span></div>
            </div>
            <button
              type="button"
              onClick={handleQuickFillAdmin}
              disabled={loading}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#C2185B] to-[#EC407A] hover:opacity-95 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 shadow-sm"
            >
              <span>⚡ One-Click Administrator Sign In</span>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && <FormError message={error} />}

            <Input
              label="Staff Email"
              type="email"
              startIcon={Mail}
              error={errors.email?.message}
              inputClassName="text-[#242124] placeholder:text-[#999999]"
              className="[&_label]:text-[#242124] [&>div]:bg-white [&>div]:border-[#DCD5CD]"
              {...register('email')}
            />

            <PasswordInput
              label="Password"
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
                loadingText="Authenticating Staff..."
                className="font-bold py-3 shadow-[0_4px_16px_rgba(194,24,91,0.25)]"
              >
                Enter Admin Portal
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-xs text-[#C2185B] hover:underline inline-flex items-center gap-1.5 font-medium"
            >
              <span>← Return to Customer Storefront</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
