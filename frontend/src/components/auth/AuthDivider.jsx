import React from 'react';

export default function AuthDivider({ text = 'OR', className = '' }) {
  return (
    <div className={`relative flex items-center justify-center my-3 sm:my-3.5 ${className}`}>
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-[#EDE6E0]"></div>
      </div>
      <div className="relative px-3 bg-white text-[10.5px] font-medium tracking-[0.2em] uppercase text-[#9A9195]">
        {text}
      </div>
    </div>
  );
}
