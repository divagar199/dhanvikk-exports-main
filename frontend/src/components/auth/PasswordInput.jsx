import React, { forwardRef, useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import Input from '../common/Input';

const PasswordInput = forwardRef(function PasswordInput(
  {
    id = 'password',
    name = 'password',
    label = 'Password',
    placeholder = 'Enter your password',
    error,
    autoComplete = 'current-password',
    ...props
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);

  const toggleVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const endIcon = (
    <button
      type="button"
      onClick={toggleVisibility}
      aria-label={showPassword ? 'Hide password' : 'Show password'}
      className="p-1 rounded-md text-[#777777] hover:text-[#EC407A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EC407A] transition-colors cursor-pointer"
    >
      {showPassword ? (
        <EyeOff className="w-4 h-4" aria-hidden="true" />
      ) : (
        <Eye className="w-4 h-4" aria-hidden="true" />
      )}
    </button>
  );

  return (
    <Input
      ref={ref}
      id={id}
      name={name}
      type={showPassword ? 'text' : 'password'}
      label={label}
      placeholder={placeholder}
      startIcon={Lock}
      endIcon={endIcon}
      autoComplete={autoComplete}
      error={error}
      required
      {...props}
    />
  );
});

export default PasswordInput;
