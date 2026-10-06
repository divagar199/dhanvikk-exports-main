import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Breadcrumb from '../common/Breadcrumb';

export default function AuthLayout({ children, brandPanel }) {
  return (
    <div className="relative min-h-[100dvh] w-full bg-[#FFFDF9] text-[#242124] overflow-x-hidden selection:bg-[#FCC1C5] selection:text-[#C2185B]">
      {brandPanel ? (
        <div className="w-full min-h-[100dvh] grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Full-Height Editorial Visual Experience (Desktop) */}
          <div className="hidden lg:block lg:col-span-6 xl:col-span-7 h-full min-h-[100dvh] sticky top-0">
            {brandPanel}
          </div>

          {/* Right Column: Clean Form Sanctuary (Desktop & Mobile) */}
          <div className="w-full lg:col-span-6 xl:col-span-5 min-h-[100dvh] flex flex-col justify-between px-4 sm:px-8 xl:px-12 py-4 sm:py-6 lg:py-8 bg-[#FFFDF9] lg:border-l lg:border-[#EFE7E0] overflow-y-auto">
            {/* Top Navigation & Breadcrumb: Return to Boutique */}
            <div className="w-full pb-2">
              <div className="flex items-center justify-between pb-2">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-[12px] sm:text-[12.5px] font-medium tracking-wider uppercase text-[#7A7476] hover:text-[#EC407A] transition-colors group"
                >
                  <span className="w-6 h-6 rounded-full bg-white border border-[#E8DFD8] flex items-center justify-center transition-transform group-hover:-translate-x-0.5 shadow-xs">
                    <ArrowLeft className="w-3.5 h-3.5 text-[#242124] group-hover:text-[#EC407A]" />
                  </span>
                  <span>Return to Store</span>
                </Link>

                <span className="text-[11px] tracking-wider text-[#999999] font-medium">
                  🌸 Luxury Floral Couture
                </span>
              </div>

              {/* Breadcrumb Trail */}
              <Breadcrumb className="pt-2 border-t border-[#F2ECE6]" />
            </div>

            {/* Center Content / Form */}
            <div className="w-full my-auto py-2 flex justify-center items-center">
              {children}
            </div>

            {/* Bottom Subtle Legal / Microcopy */}
            <div className="w-full pt-2 text-center text-[11px] text-[#A0969A]">
              © {new Date().getFullYear()} Dhanvikk Blooms & Exports. All rights reserved.
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full min-h-[100dvh] flex flex-col justify-center items-center p-4">
          <Breadcrumb className="max-w-[420px] mb-4" />
          {children}
        </div>
      )}
    </div>
  );
}
