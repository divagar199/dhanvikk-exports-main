import React, { useMemo } from "react";
import { Truck, Gift, MessageCircle, ChevronDown } from "lucide-react";
import { useCurrency } from "../../context/CurrencyContext";
import { SKIPER_COUNTRIES, CountryFlag } from "../v1/skiper20";

export default function AnnouncementBar() {
  const { currency, selectedCountry, openCurrencyDialog } = useCurrency();

  const currentCountry = useMemo(() => {
    const code = (selectedCountry || 'AE').toUpperCase();
    return (
      SKIPER_COUNTRIES.find((c) => c.code.toUpperCase() === code) ||
      SKIPER_COUNTRIES.find((c) => c.currency === currency) ||
      SKIPER_COUNTRIES[0]
    );
  }, [selectedCountry, currency]);

  return (
    <div className="w-full bg-gradient-to-r from-[#FFF5F7] via-[#FAF7F2] to-[#FFF0F4] text-[#4A3F45] border-b border-[#F0E6DE] text-[10px] sm:text-xs select-none tracking-wide shadow-2xs">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 min-h-[36px] sm:min-h-[40px] py-1 sm:py-1.5 flex items-center justify-between gap-2 sm:gap-6">
        {/* Left: Premium Guarantee & Highlights */}
        <div className="flex items-center gap-2 sm:gap-4 text-[#52484E] min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 font-medium min-w-0 leading-normal">
            <Gift className="w-3.5 h-3.5 text-[#C2185B] flex-shrink-0" />
            <span className="hidden md:inline text-[#4A3F45]">
              Complimentary handwritten message card with every order
            </span>
            <span className="hidden sm:inline md:hidden text-[#4A3F45]">
              Complimentary message card with every order
            </span>
            <span className="sm:hidden text-[#4A3F45] truncate text-[10px]">
              Complimentary gift card
            </span>
          </div>

          <span className="hidden lg:inline text-[#D8CDC4] select-none">•</span>

          <div className="hidden lg:flex items-center gap-2 text-[#6B5E66] whitespace-nowrap leading-normal">
            <Truck className="w-3.5 h-3.5 text-[#C2185B] flex-shrink-0" />
            <span>Same-Day & Midnight Delivery Across UAE & India</span>
          </div>
        </div>

        {/* Right: Country / Currency Switcher + WhatsApp Concierge */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          {/* Top Bar Currency & Country Selector Button */}
          <button
            type="button"
            onClick={openCurrencyDialog}
            className="luxury-touch-press group inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-white/95 hover:bg-white border border-[#E8E1DA] hover:border-[#C2185B] text-[10px] sm:text-xs font-semibold text-[#242124] shadow-2xs hover:shadow-xs cursor-pointer"
            title="Change Delivery Region & Currency"
            aria-label={`Current delivery country: ${currentCountry.name}, currency: ${currency}. Click to change.`}
          >
            <CountryFlag
              code={currentCountry.code}
              name={currentCountry.name}
              flag={currentCountry.flag}
              className="w-4 h-3 rounded-[2px] object-cover shrink-0 shadow-2xs transition-transform group-hover:scale-105"
            />
            <span className="font-bold text-[#C2185B] tracking-tight">{currency}</span>
            <span className="text-[10px] text-[#777777] font-medium hidden xs:inline">
              ({currentCountry.currencySymbol})
            </span>
            <ChevronDown className="w-3 h-3 text-[#777777] group-hover:text-[#C2185B] transition-transform group-hover:translate-y-0.5" />
          </button>

          {/* Premium Concierge Contact via WhatsApp */}
          <a
            href="https://wa.me/919108916328?text=Hello%20Dhanvikk%20Blooms!%20I%20would%20like%20to%20place%20an%20order%20or%20make%20an%20inquiry."
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contact Dhanvikk Floral Concierge on WhatsApp +91 91089 16328"
            className="luxury-touch-press group inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/95 hover:bg-white border border-[#25D366]/35 hover:border-[#25D366] text-[#128C7E] text-[10px] sm:text-xs font-semibold shadow-2xs hover:shadow-xs"
          >
            <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#25D366] transition-transform duration-300 group-hover:scale-110 flex-shrink-0" />
            <span className="hidden sm:inline text-[#5A4F55] font-normal">Contact:</span>
            <span className="hidden md:inline font-semibold text-[#128C7E] group-hover:text-[#0b6b5e] tracking-tight whitespace-nowrap">
              +91 91089 16328
            </span>
            <span className="md:hidden font-semibold text-[#128C7E] whitespace-nowrap">WhatsApp</span>
            <span className="hidden lg:inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold bg-[#E8F8F0] text-[#0E7A66] px-2 py-0.5 rounded-full border border-[#25D366]/20 leading-none">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#25D366]"></span>
              </span>
              Online
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
