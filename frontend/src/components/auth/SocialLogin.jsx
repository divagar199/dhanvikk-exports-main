import React from 'react';
import Spinner from '../common/Spinner';

export default function SocialLogin({ onGoogleLogin, loading = false, disabled = false, className = '' }) {
  return (
    <div className={`w-full flex flex-col gap-3 ${className}`}>
      <button
        type="button"
        onClick={onGoogleLogin}
        disabled={disabled || loading}
        className="relative flex items-center justify-center w-full h-[44px] sm:h-[46px] bg-white border border-[#E5DFD9] rounded-xl sm:rounded-[14px] text-[13.5px] sm:text-[14px] font-medium text-[#2E282A] hover:border-[#FCC1C5] hover:bg-[#FAF8F5] hover:shadow-sm active:bg-[#F5EFEA] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EC407A] disabled:opacity-60 disabled:pointer-events-none cursor-pointer group"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2.5">
            <Spinner size="sm" color="#EC407A" />
            <span className="text-[#777777]">Connecting to Google...</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-3">
            {/* Official Google G Logo */}
            <svg
              className="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.28-2.09 3.665-5.17 3.665-9.12z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.28v3.13C3.26 21.3 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.28C.46 8.2 0 10.04 0 12s.46 3.8 1.28 5.42l4-3.13z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.7 1.28 6.58l4 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
              />
            </svg>
            <span className="font-medium">Continue with Google</span>
          </span>
        )}
      </button>
    </div>
  );
}
