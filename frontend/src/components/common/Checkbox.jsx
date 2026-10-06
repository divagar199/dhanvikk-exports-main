import React from 'react';
import { Check } from 'lucide-react';

export default function Checkbox({
  id,
  name,
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none group text-[13px] text-[#242124] ${
        disabled ? 'opacity-60 cursor-not-allowed' : ''
      } ${className}`}
    >
      <div className="relative flex items-center justify-center">
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="peer sr-only"
          {...props}
        />
        {/* Custom luxury box */}
        <div
          className={`w-[18px] h-[18px] rounded-[5px] border transition-all duration-200 flex items-center justify-center ${
            checked
              ? 'bg-[#EC407A] border-[#EC407A] text-white shadow-sm shadow-[#EC407A]/25'
              : 'bg-white border-[#E5E1E2] group-hover:border-[#FCC1C5] peer-focus-visible:ring-2 peer-focus-visible:ring-[#EC407A]/40'
          }`}
        >
          {checked && <Check className="w-3 h-3 stroke-[3] text-white" aria-hidden="true" />}
        </div>
      </div>
      {label && (
        <span className="text-[13px] text-[#242124] font-normal group-hover:text-black transition-colors">
          {label}
        </span>
      )}
    </label>
  );
}
