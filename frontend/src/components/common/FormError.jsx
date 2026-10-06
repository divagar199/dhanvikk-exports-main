import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function FormError({ message, className = '', id }) {
  if (!message) return null;

  return (
    <div
      id={id}
      role="alert"
      aria-live="polite"
      className={`flex items-start gap-2 text-[13px] text-[#C2185B] bg-[#FFF3F6] border border-[#FCC1C5]/60 rounded-xl p-3 animate-in fade-in slide-in-from-top-1 duration-200 ${className}`}
    >
      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#C2185B]" aria-hidden="true" />
      <span className="leading-snug font-medium">{message}</span>
    </div>
  );
}
