import React from 'react';
import Spinner from './Spinner';

export default function Button({
  children,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost'
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  loadingText,
  icon: Icon,
  className = '',
  onClick,
  ...props
}) {
  const baseClasses =
    'relative inline-flex items-center justify-center font-medium font-["Poppins"] transition-all duration-200 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60 cursor-pointer';

  const variants = {
    primary:
      'bg-gradient-to-r from-[#E11D48] via-[#EC407A] to-[#C2185B] text-white hover:opacity-95 hover:shadow-[0_8px_20px_rgba(236,64,122,0.28)] hover:-translate-y-[1px] active:translate-y-0 active:opacity-100 shadow-[0_4px_14px_rgba(236,64,122,0.2)] focus-visible:ring-[#EC407A]',
    secondary:
      'bg-[#FFF3F6] text-[#C2185B] hover:bg-[#FCC1C5]/40 hover:-translate-y-[1px] active:translate-y-0 focus-visible:ring-[#EC407A]',
    outline:
      'bg-white text-[#242124] border border-[#E5E1E2] hover:border-[#FCC1C5] hover:bg-[#FFFDF9] hover:shadow-sm focus-visible:ring-[#EC407A]',
    ghost:
      'bg-transparent text-[#242124] hover:bg-[#FFF3F6] hover:text-[#C2185B] focus-visible:ring-[#EC407A]',
  };

  const sizes = {
    sm: 'h-9 px-3.5 text-xs rounded-xl gap-2',
    md: 'h-[46px] sm:h-[48px] px-5 text-[14px] font-semibold rounded-xl sm:rounded-[14px] gap-2.5',
    lg: 'h-[52px] sm:h-[56px] px-7 text-[15px] sm:text-base font-semibold rounded-2xl gap-3',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        ${baseClasses}
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2.5">
          <Spinner size="sm" color={variant === 'primary' ? 'current' : '#EC407A'} />
          <span>{loadingText || 'Please wait...'}</span>
        </span>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}
