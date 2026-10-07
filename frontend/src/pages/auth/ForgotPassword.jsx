import React, { useState } from 'react';
import SEO from '../../components/common/SEO';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import Logo from '../../components/common/Logo';
import EmailInput from '../../components/auth/EmailInput';
import Button from '../../components/common/Button';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export default function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <>
      <SEO
        title="Reset Password | Dhanvikk Blooms"
        description="Reset your Dhanvikk Blooms account password."
        canonical="/forgot-password"
        noindex={true}
      />

      <AuthLayout>
        <div className="w-full max-w-[420px] mx-auto bg-white/80 backdrop-blur-sm border border-[#F7F2ED] bloom-shadow-card rounded-3xl p-6 sm:p-9 text-center">
          <Logo className="mb-6" />

          {submitted ? (
            <div className="py-4">
              <div className="w-12 h-12 rounded-full bg-[#FFF3F6] text-[#EC407A] flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h1 className="text-xl font-semibold text-[#242124] mb-2 font-['Poppins']">
                Check Your Inbox
              </h1>
              <p className="text-[13px] text-[#777777] leading-relaxed mb-6">
                We've sent password reset instructions to your email address if an account is registered.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 text-[14px] font-medium text-[#EC407A] hover:text-[#C2185B]"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-semibold text-[#242124] mb-2 font-['Poppins']">
                Forgot Password
              </h1>
              <p className="text-[13px] text-[#777777] mb-6 leading-relaxed">
                Enter your registered email address to receive password recovery details.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
                <EmailInput
                  {...register('email')}
                  error={errors.email?.message}
                  disabled={loading}
                />

                <Button
                  type="submit"
                  fullWidth
                  loading={loading}
                  loadingText="Sending link..."
                >
                  Send Reset Link
                </Button>
              </form>

              <div className="mt-6 pt-4 border-t border-[#F7F2ED]">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-[#777777] hover:text-[#EC407A] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </AuthLayout>
    </>
  );
}
