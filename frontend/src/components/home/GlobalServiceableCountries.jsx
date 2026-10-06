import React from 'react';
import { Globe, Plane, ShieldCheck, Sparkles } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/free-mode';

export const SERVICEABLE_COUNTRIES = [
  {
    code: 'AE',
    name: 'Dubai & UAE',
    flagUrl: 'https://flagcdn.com/w80/ae.png',
    emoji: '🇦🇪',
  },
  {
    code: 'IN',
    name: 'India',
    flagUrl: 'https://flagcdn.com/w80/in.png',
    emoji: '🇮🇳',
  },
  {
    code: 'OM',
    name: 'Oman',
    flagUrl: 'https://flagcdn.com/w80/om.png',
    emoji: '🇴🇲',
  },
  {
    code: 'SG',
    name: 'Singapore',
    flagUrl: 'https://flagcdn.com/w80/sg.png',
    emoji: '🇸🇬',
  },
  {
    code: 'MY',
    name: 'Malaysia',
    flagUrl: 'https://flagcdn.com/w80/my.png',
    emoji: '🇲🇾',
  },
  {
    code: 'QA',
    name: 'Qatar',
    flagUrl: 'https://flagcdn.com/w80/qa.png',
    emoji: '🇶🇦',
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    flagUrl: 'https://flagcdn.com/w80/sa.png',
    emoji: '🇸🇦',
  },
  {
    code: 'KW',
    name: 'Kuwait',
    flagUrl: 'https://flagcdn.com/w80/kw.png',
    emoji: '🇰🇼',
  },
  {
    code: 'LK',
    name: 'Sri Lanka',
    flagUrl: 'https://flagcdn.com/w80/lk.png',
    emoji: '🇱🇰',
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flagUrl: 'https://flagcdn.com/w80/gb.png',
    emoji: '🇬🇧',
  },
  {
    code: 'US',
    name: 'United States',
    flagUrl: 'https://flagcdn.com/w80/us.png',
    emoji: '🇺🇸',
  },
  {
    code: 'CA',
    name: 'Canada',
    flagUrl: 'https://flagcdn.com/w80/ca.png',
    emoji: '🇨🇦',
  },
  {
    code: 'AU',
    name: 'Australia',
    flagUrl: 'https://flagcdn.com/w80/au.png',
    emoji: '🇦🇺',
  },
  {
    code: 'EU',
    name: 'Europe (EU)',
    flagUrl: 'https://flagcdn.com/w80/eu.png',
    emoji: '🇪🇺',
  },
];

export default function GlobalServiceableCountries() {
  // Seamless loop array (duplicated for infinite smooth animation)
  const marqueeItems = [...SERVICEABLE_COUNTRIES, ...SERVICEABLE_COUNTRIES, ...SERVICEABLE_COUNTRIES];

  return (
    <section className="w-full py-10 sm:py-14 bg-gradient-to-b from-[#FFFDF9] via-[#FAF7F2] to-[#FFFDF9] border-y border-[#F2ECE6] overflow-hidden relative">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-48 bg-[#FFF0F4]/40 rounded-full blur-3xl pointer-events-none" />

      {/* Editorial Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8 text-center relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-[#E9E2E5] text-[#C2185B] text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2.5 shadow-2xs">
          <Globe className="w-3.5 h-3.5 text-[#EC407A]" />
          <span>Worldwide Air Cargo & Export Network</span>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-['Poppins'] text-[#242124] tracking-tight">
          Serviceable Countries & International Hubs
        </h2>

        <p className="text-xs sm:text-sm text-[#777777] max-w-2xl mx-auto mt-2 leading-relaxed">
          Daily temperature-controlled cold-chain air-freight dispatches from pristine Indian farms directly to international doorsteps, luxury boutiques, and global events.
        </p>
      </div>

      {/* Premium Ticker / Carousel Container */}
      <div className="relative w-full overflow-hidden py-2 px-2 sm:px-4">
        {/* Left & Right Soft Fade Gradients */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-[#FAF7F2] via-[#FAF7F2]/80 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-[#FAF7F2] via-[#FAF7F2]/80 to-transparent z-10" />

        {/* Interactive Swiper with Free-mode & Autoplay */}
        <Swiper
          modules={[Autoplay, FreeMode]}
          slidesPerView="auto"
          spaceBetween={16}
          loop={true}
          grabCursor={true}
          freeMode={{ enabled: true, momentum: true }}
          autoplay={{
            delay: 1500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          speed={900}
          className="w-full !overflow-visible select-none py-1"
        >
          {marqueeItems.map((country, index) => (
            <SwiperSlide key={`${country.code}-${index}`} className="!w-auto">
              <div className="flex items-center gap-3 px-5 py-2.5 sm:px-6 sm:py-3 bg-white/95 backdrop-blur-sm rounded-full border border-[#EFE7DE] hover:border-[#EC407A]/60 shadow-[0_2px_8px_rgba(36,33,36,0.03)] hover:shadow-[0_4px_16px_rgba(194,24,91,0.08)] transition-all duration-300 group select-none cursor-grab active:cursor-grabbing">
                {/* High-Resolution Crisp Flag */}
                <div className="w-7 h-5 sm:w-8 sm:h-5.5 rounded-[3px] overflow-hidden shadow-2xs border border-black/10 flex-shrink-0 bg-gray-100 flex items-center justify-center">
                  <img
                    src={country.flagUrl}
                    alt={`${country.name} Flag - Dhanvikk Blooms Delivery Country`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    decoding="async"
                    width="32"
                    height="22"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextSibling) {
                        e.currentTarget.nextSibling.style.display = 'inline';
                      }
                    }}
                  />
                  <span className="text-base hidden">{country.emoji}</span>
                </div>

                {/* Country Name Only */}
                <span className="text-xs sm:text-sm font-semibold tracking-wider text-[#242124] uppercase font-['Poppins'] group-hover:text-[#C2185B] transition-colors whitespace-nowrap">
                  {country.name}
                </span>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Trust Reassurance Badges */}
      <div className="max-w-4xl mx-auto mt-6 px-4 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[11px] sm:text-xs text-[#666666] font-medium relative z-10">
        <span className="flex items-center gap-1.5">
          <Plane className="w-3.5 h-3.5 text-[#C2185B]" />
          <span>IATA Approved Air Cargo</span>
        </span>
        <span className="hidden sm:inline text-[#DCD5CD]">•</span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Phytosanitary & Plant Quarantine Cleared</span>
        </span>
        <span className="hidden sm:inline text-[#DCD5CD]">•</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>2°C - 4°C Active Cold-Chain Shipping</span>
        </span>
      </div>
    </section>
  );
}
