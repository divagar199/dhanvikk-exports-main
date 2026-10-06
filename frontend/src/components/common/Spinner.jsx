import React from 'react';

export default function Spinner({ size = 'sm', color = 'current', className = '' }) {
  const sizeClasses = {
    xs: 'w-3.5 h-3.5 border-2',
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-[2.5px]',
    lg: 'w-7 h-7 border-3',
  }[size] || 'w-4 h-4 border-2';

  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-solid border-t-transparent ${sizeClasses} ${
        color === 'current' ? 'border-current' : 'border-[#EC407A]'
      } ${className}`}
    />
  );
}
