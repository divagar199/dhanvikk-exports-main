import React from 'react';

export default function IconButton({
  icon: Icon,
  label,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-xl text-[#777777] hover:text-[#EC407A] hover:bg-[#FFF3F6] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EC407A] disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${className}`}
      {...props}
    >
      <Icon className="w-4 h-4" aria-hidden="true" />
    </button>
  );
}
