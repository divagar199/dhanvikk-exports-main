import React from 'react';
import { Truck, Flower2, Phone, Gift } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

export default function AnnouncementBar() {
  const { currency, setCurrency, currencies } = useCurrency();

  return (
    <div className="bg-gradient-to-r from-[#FFF0F4] via-[#FAF7F2] to-[#FFF5F7] text-[#4A3F45] border-b border-[#F2D7DE] text-[11px] sm:text-xs py-2 px-4 select-none tracking-wide shadow-2xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Express & Quality highlight */}
        <div className="flex items-center gap-4 text-[#5A4F55]">
          <div className="flex items-center gap-1.5 font-medium">
            <Gift className="w-3.5 h-3.5 text-[#C2185B]" />
            <span className="hidden sm:inline">Complimentary handwritten message card with every order</span>
            <span className="sm:hidden">Complimentary gift card</span>
          </div>
          <span className="hidden md:inline text-[#D4AF37]/50">|</span>
          <div className="hidden md:flex items-center gap-1.5 text-[#5A4F55]">
            <Truck className="w-3.5 h-3.5 text-[#C2185B]" />
            <span>Same-Day & Midnight Delivery Across UAE & India</span>
          </div>
        </div>

        {/* Right: Contact & Currency Switcher */}
        <div className="flex items-center gap-4 text-[#5A4F55] text-[11px]">
          <a
            href="https://wa.me/919108916328"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 text-[#128C7E] font-medium hover:text-[#0b6b5e] transition-colors"
          >
            <Phone className="w-3 h-3 text-[#25D366]" />
            <span>Order Support: +91 91089 16328</span>
          </a>

          <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-[#E8DCD5] shadow-2xs">
            <span className="text-[10px] text-[#888888] uppercase font-medium">Currency:</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-transparent text-[#242124] text-[11px] font-semibold focus:outline-none cursor-pointer"
            >
              {Object.values(currencies).map((c) => (
                <option key={c.code} value={c.code} className="bg-white text-[#242124]">
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
