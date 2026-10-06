import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import EmailInput from './EmailInput';
import PasswordInput from './PasswordInput';
import Checkbox from '../common/Checkbox';
import Button from '../common/Button';
import FormError from '../common/FormError';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(4, 'Password must be at least 4 characters'),
  rememberMe: z.boolean().default(false),
});

export default function LoginForm({ onSubmit, loading = false, serverError = null }) {
  const defaultSavedEmail = localStorage.getItem('dhanvikk_remember_email') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: defaultSavedEmail,
      password: '',
      rememberMe: Boolean(defaultSavedEmail),
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full text-left">

      {/* Server / Auth Error banner */}
      {serverError && (
        <div className="mb-4">
          <FormError id="login-form-error" message={serverError} />
        </div>
      )}

      {/* Email Input Field */}
      <div className="mb-2.5 sm:mb-3.5">
        <EmailInput
          {...register('email')}
          error={errors.email?.message}
          disabled={loading}
        />
      </div>

      {/* Password Input Field */}
      <div className="mb-2 sm:mb-2.5">
        <PasswordInput
          {...register('password')}
          error={errors.password?.message}
          disabled={loading}
        />
      </div>

      {/* Remember me & Forgot Password Row */}
      <div className="flex items-center justify-between mt-2 mb-3 sm:mt-2.5 sm:mb-4">
        <Checkbox
          id="rememberMe"
          label="Remember me"
          {...register('rememberMe')}
          disabled={loading}
        />

        <Link
          to="/forgot-password"
          className="text-[12px] sm:text-[13px] text-[#7A7476] hover:text-[#C2185B] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EC407A] rounded px-1"
        >
          Forgot password?
        </Link>
      </div>

      {/* Primary Submit Button */}
      <Button
        type="submit"
        variant="primary"
        fullWidth
        loading={loading}
        loadingText="Signing in..."
        className="w-full text-[14.5px] sm:text-[15px] font-semibold tracking-wide"
      >
        Sign In
      </Button>
    </form>
  );
}
