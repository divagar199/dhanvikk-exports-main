import React from 'react';
import { Truck, Gift, MessageCircle } from 'lucide-react';

export default function AnnouncementBar() {
  return (
    <div className="w-full bg-gradient-to-r from-[#FFF5F7] via-[#FAF7F2] to-[#FFF0F4] text-[#4A3F45] border-b border-[#F0E6DE] text-[11px] sm:text-xs select-none tracking-wide shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[38px] sm:min-h-[40px] py-1 sm:py-1.5 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Premium Guarantee & Highlights */}
        <div className="flex items-center gap-3 sm:gap-4 text-[#52484E] min-w-0">
          <div className="flex items-center gap-2 font-medium min-w-0 leading-normal">
            <Gift className="w-3.5 h-3.5 text-[#C2185B] flex-shrink-0" />
            <span className="hidden md:inline text-[#4A3F45]">
              Complimentary handwritten message card with every order
            </span>
            <span className="hidden sm:inline md:hidden text-[#4A3F45]">
              Complimentary message card with every order
            </span>
            <span className="sm:hidden text-[#4A3F45] truncate">
              Complimentary gift card included
            </span>
          </div>

          <span className="hidden lg:inline text-[#D8CDC4] select-none">•</span>

          <div className="hidden lg:flex items-center gap-2 text-[#6B5E66] whitespace-nowrap leading-normal">
            <Truck className="w-3.5 h-3.5 text-[#C2185B] flex-shrink-0" />
            <span>Same-Day & Midnight Delivery Across UAE & India</span>
          </div>
        </div>

        {/* Right: Premium Concierge Contact via WhatsApp */}
        <div className="flex items-center flex-shrink-0">
          <a
            href="https://wa.me/919108916328?text=Hello%20Dhanvikk%20Blooms!%20I%20would%20like%20to%20place%20an%20order%20or%20make%20an%20inquiry."
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contact Dhanvikk Floral Concierge on WhatsApp +91 91089 16328"
            className="group inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/95 hover:bg-white border border-[#25D366]/35 hover:border-[#25D366] text-[#128C7E] text-[11px] sm:text-xs font-semibold shadow-2xs hover:shadow-xs hover:ring-2 hover:ring-[#25D366]/15 transition-all duration-200"
          >
            {/* Live Concierge Active Indicator */}
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#25D366]" />
            </span>

            {/* WhatsApp Icon */}
            <MessageCircle className="w-3.5 h-3.5 text-[#25D366] transition-transform duration-200 group-hover:scale-110 flex-shrink-0" />

            {/* Label & Number */}
            <span className="hidden sm:inline text-[#5A4F55] font-normal">Contact Us:</span>
            <span className="hidden xs:inline font-semibold text-[#128C7E] group-hover:text-[#0b6b5e] tracking-tight whitespace-nowrap">
              +91 91089 16328
            </span>
            <span className="xs:hidden font-semibold text-[#128C7E]">
              WhatsApp
            </span>

            {/* Concierge Badge on Desktop */}
            <span className="hidden md:inline-flex items-center text-[9px] uppercase tracking-wider font-bold bg-[#E8F8F0] text-[#0E7A66] px-1.5 py-0.5 rounded-full border border-[#25D366]/20 leading-none">
              WhatsApp
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
