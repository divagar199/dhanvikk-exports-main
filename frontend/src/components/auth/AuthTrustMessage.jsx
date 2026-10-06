import React from 'react';
import { ShieldCheck, Truck, Flower2 } from 'lucide-react';

export default function AuthTrustMessage({ className = '' }) {
  return (
    <div
      className={`flex items-center justify-center flex-wrap gap-x-2.5 gap-y-1 text-[11px] sm:text-[12px] text-[#777777] select-none text-center ${className}`}
    >
      <span className="inline-flex items-center gap-1 font-normal">
        <Flower2 className="w-3 h-3 text-[#EC407A]/70" aria-hidden="true" />
        Fresh flowers
      </span>
      <span className="text-[#E8E2E4] font-bold" aria-hidden="true">•</span>
      <span className="inline-flex items-center gap-1 font-normal">
        <ShieldCheck className="w-3 h-3 text-[#EC407A]/70" aria-hidden="true" />
        Secure payments
      </span>
      <span className="text-[#E8E2E4] font-bold" aria-hidden="true">•</span>
      <span className="inline-flex items-center gap-1 font-normal">
        <Truck className="w-3 h-3 text-[#EC407A]/70" aria-hidden="true" />
        Reliable delivery
      </span>
    </div>
  );
}
