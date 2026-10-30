import React, { useEffect } from 'react';
import Spinner from '../common/Spinner';
import {
  setGsiCredentialHandler,
  initGoogleIdentityServices,
} from '../../config/gsi';

/**
 * SocialLogin
 *
 * Renders the official Google Sign-In button following Google Brand Guidelines.
 * - Uses the 4-color Google "G" logo SVG (required by guidelines).
 * - Shows a loading spinner during the auth flow.
 * - Handles disabled state to prevent double-clicks.
 * - Optionally registers a GSI One-Tap credential handler.
 */
export default function SocialLogin({
  onGoogleLogin,
  onGoogleCredential,
  loading = false,
  disabled = false,
  className = '',
}) {
  // Keep GSI One-Tap credential handler synchronized
  useEffect(() => {
    if (typeof onGoogleCredential === 'function') {
      setGsiCredentialHandler(onGoogleCredential);
      initGoogleIdentityServices();
    }
    return () => {
      setGsiCredentialHandler(null);
    };
  }, [onGoogleCredential]);

  const isDisabled = disabled || loading;

  return (
    <div className={`w-full flex flex-col items-center gap-2.5 ${className}`}>
      {/*
        Google Sign-In button — follows Google Brand Guidelines:
        https://developers.google.com/identity/branding-guidelines
        - White background with 1dp border
        - 4-color "G" logo on the left
        - "Continue with Google" text in Roboto/system-ui
      */}
      <button
        type="button"
        id="google-signin-btn"
        aria-label="Continue with Google"
        onClick={onGoogleLogin}
        disabled={isDisabled}
        className={[
          'relative flex items-center justify-center w-full h-[46px]',
          'bg-white border border-[#DADCE0] rounded-[4px]',
          'text-[14px] font-medium text-[#3C4043]',
          'shadow-[0_1px_2px_0_rgba(60,64,67,0.30),0_1px_3px_1px_rgba(60,64,67,0.15)]',
          'hover:shadow-[0_1px_3px_0_rgba(60,64,67,0.30),0_4px_8px_3px_rgba(60,64,67,0.15)]',
          'hover:bg-[#F8FAFF]',
          'active:bg-[#F0F4FF]',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4285F4]',
          'transition-all duration-150',
          isDisabled ? 'opacity-60 pointer-events-none cursor-not-allowed' : 'cursor-pointer',
        ].join(' ')}
      >
        {loading ? (
          <span className="inline-flex items-center gap-3">
            <Spinner size="sm" color="#4285F4" />
            <span className="text-[#5F6368] text-[14px] font-medium" style={{ fontFamily: 'Roboto, system-ui, sans-serif' }}>
              Connecting to Google…
            </span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-[10px] px-3">
            {/* Official Google "G" logo — 4-color, exact paths from Google brand kit */}
            <svg
              className="w-[18px] h-[18px] flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 18 18"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
              />
              <path
                fill="#FBBC05"
                d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"
              />
            </svg>
            <span
              style={{ fontFamily: 'Roboto, system-ui, sans-serif', fontWeight: 500, letterSpacing: '0.01em' }}
              className="text-[14px] text-[#3C4043]"
            >
              Continue with Google
            </span>
          </span>
        )}
      </button>
    </div>
  );
}
