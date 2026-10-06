import React, { forwardRef } from 'react';
import { Mail } from 'lucide-react';
import Input from '../common/Input';

const EmailInput = forwardRef(function EmailInput(
  {
    label = 'Email address',
    placeholder = 'Enter your email address',
    error,
    autoComplete = 'email',
    ...props
  },
  ref
) {
  return (
    <Input
      ref={ref}
      id="email"
      name="email"
      type="email"
      label={label}
      placeholder={placeholder}
      startIcon={Mail}
      autoComplete={autoComplete}
      error={error}
      required
      {...props}
    />
  );
});

export default EmailInput;
