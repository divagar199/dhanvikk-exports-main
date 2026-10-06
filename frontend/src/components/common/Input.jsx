import React, { forwardRef } from 'react';

const Input = forwardRef(function Input(
  {
    id,
    name,
    label,
    type = 'text',
    placeholder,
    value,
    defaultValue,
    onChange,
    onBlur,
    error,
    startIcon: StartIcon,
    endIcon,
    autoComplete,
    disabled = false,
    required = false,
    className = '',
    inputClassName = '',
    helperText,
    ...props
  },
  ref
) {
  const inputId = id || name;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText ? `${inputId}-helper` : undefined;

  return (
    <div className={`w-full text-left ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[13px] font-medium text-[#242124] mb-[7px] select-none"
        >
          {label}
          {required && <span className="text-[#C2185B] ml-1" aria-hidden="true">*</span>}
        </label>
      )}

      <div
        className={`relative flex items-center w-full h-[46px] sm:h-[48px] bg-white rounded-xl sm:rounded-[14px] border transition-all duration-200 bloom-input-shadow ${
          error
            ? 'border-[#C2185B] focus-within:ring-2 focus-within:ring-[#C2185B]/20 focus-within:border-[#C2185B]'
            : 'border-[#E8DFD8] hover:border-[#FCC1C5] focus-within:border-[#EC407A] focus-within:ring-2 focus-within:ring-[#EC407A]/20'
        } ${disabled ? 'bg-[#F7F2ED]/60 cursor-not-allowed opacity-75' : ''}`}
      >
        {StartIcon && (
          <div className="pl-3.5 pr-1 text-[#8C8286] flex items-center justify-center pointer-events-none">
            <StartIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px] transition-colors group-focus-within:text-[#EC407A]" aria-hidden="true" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
          className={`w-full h-full bg-transparent px-3 text-[13.5px] sm:text-[14px] text-[#242124] placeholder:text-[#9A9195] focus:outline-none disabled:cursor-not-allowed ${
            !StartIcon ? 'pl-3.5' : ''
          } ${!endIcon ? 'pr-3.5' : ''} ${inputClassName}`}
          {...props}
        />

        {endIcon && <div className="pr-3.5 flex items-center">{endIcon}</div>}
      </div>

      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-[12px] text-[#C2185B] font-medium animate-in fade-in duration-150">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p id={helperId} className="mt-1 text-[11px] text-[#777777]">
          {helperText}
        </p>
      )}
    </div>
  );
});

export default Input;
