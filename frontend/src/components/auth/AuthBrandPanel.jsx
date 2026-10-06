import React from 'react';
import { ShieldCheck, Clock, Award, Star, Sparkles, Heart } from 'lucide-react';

export default function AuthBrandPanel({
  className = '',
  badge = 'Bespoke Floral Couture',
  title = 'Where nature whispers timeless luxury.',
  subtitle = 'Curated Ecuadorian blooms, sacred temple garlands, and temperature-controlled global cold-chain dispatch.',
  testimonial = {
    quote: '“The presentation is pure poetry. Every blossom arrived in pristine, fragrant perfection.”',
    author: 'Eleanor Vance',
    role: 'Private Patron & Floral Collector',
  },
}) {
  return (
    <div
      className={`relative hidden lg:flex flex-col justify-between p-10 xl:p-14 2xl:p-16 overflow-hidden select-none h-full min-h-[100dvh] w-full bg-[#FAF7F2] ${className}`}
    >
      {/* Background High-End Luminous Flower Image with Bright Airy Lighting */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1800&q=90"
          alt="Dhanvikk Blooms Luxury Pastel Botanical Floral Arrangement"
          className="w-full h-full object-cover object-center scale-100 transition-transform duration-[12000ms] ease-out hover:scale-105"
          loading="lazy"
          decoding="async"
          width="1800"
          height="1200"
        />

        {/* Luminous Warm Light Gradients for Crisp Clean Elegance */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#FFFDF9] via-[#FFFDF9]/65 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFFDF9]/95 via-[#FFFDF9]/60 to-transparent" />
        <div className="absolute inset-0 bg-[#FFF5F7]/30 mix-blend-soft-light" />

        {/* Soft Golden & Rose Ambient Glows */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#FFB400]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-16 w-80 h-80 bg-[#EC407A]/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Top Bar: Brand Pill & Live Status */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-[#F0E5DF] text-[#242124] shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#EC407A] animate-pulse"></span>
          <span className="text-[11.5px] tracking-[0.25em] uppercase font-semibold text-[#242124]">
            Dhanvikk Floral Atelier
          </span>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-[#EFE7E1] text-[#242124] shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span className="text-[11px] tracking-wider uppercase font-medium text-[#555555]">
            Daily Fresh Harvest
          </span>
        </div>
      </div>

      {/* Center Section: Editorial Copy & Floating Testimonial Chip */}
      <div className="relative z-10 max-w-xl my-auto py-8">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF0F4] border border-[#F2D7DE] text-[#C2185B] mb-5 shadow-xs">
          <Award className="w-3.5 h-3.5 text-[#C2185B]" />
          <span className="text-[11.5px] tracking-[0.2em] uppercase font-bold">
            {badge}
          </span>
        </div>

        {/* Majestic Serif Headline */}
        <h2 className="text-3xl xl:text-4xl 2xl:text-[44px] font-bold text-[#1F191D] leading-[1.18] font-['Poppins'] tracking-tight">
          {title}
        </h2>

        {/* Subtitle */}
        <p className="mt-3.5 text-[#555053] text-[14px] xl:text-[15px] leading-relaxed font-normal font-['Poppins'] max-w-lg">
          {subtitle}
        </p>

        {/* Floating Glassmorphism Testimonial Card */}
        {testimonial && (
          <div className="mt-7 p-4 sm:p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-[#EFE7DE] shadow-[0_12px_32px_rgba(194,24,91,0.06)] max-w-md transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center gap-1 text-[#F59E0B] mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
              ))}
              <span className="text-[11px] text-[#666666] ml-2 font-semibold">5.0 Star Patron Rating</span>
            </div>
            <p className="text-[13px] text-[#242124] italic font-normal leading-relaxed">
              {testimonial.quote}
            </p>
            <div className="mt-3 flex items-center justify-between border-t border-[#F2ECE6] pt-2.5">
              <div>
                <p className="text-[12px] font-bold text-[#242124]">{testimonial.author}</p>
                <p className="text-[11px] text-[#C2185B] font-medium">{testimonial.role}</p>
              </div>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Verified Patron ✓
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Feature Badges Bar */}
      <div className="relative z-10 pt-5 border-t border-[#EFE7DE] grid grid-cols-3 gap-3">
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/70 backdrop-blur-sm border border-[#F2ECE6]">
          <div className="w-8 h-8 rounded-lg bg-[#FFF0F4] border border-[#F2D7DE] flex items-center justify-center text-[#C2185B] flex-shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11.5px] font-bold text-[#242124] leading-tight">100% Fresh</p>
            <p className="text-[10px] text-[#777777] font-medium leading-tight mt-0.5">Farm-fresh harvest</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/70 backdrop-blur-sm border border-[#F2ECE6]">
          <div className="w-8 h-8 rounded-lg bg-[#FFF0F4] border border-[#F2D7DE] flex items-center justify-center text-[#C2185B] flex-shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11.5px] font-bold text-[#242124] leading-tight">Cold-Chain</p>
            <p className="text-[10px] text-[#777777] font-medium leading-tight mt-0.5">Chilled express van</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/70 backdrop-blur-sm border border-[#F2ECE6]">
          <div className="w-8 h-8 rounded-lg bg-[#FFF0F4] border border-[#F2D7DE] flex items-center justify-center text-[#C2185B] flex-shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11.5px] font-bold text-[#242124] leading-tight">Hand-Tied</p>
            <p className="text-[10px] text-[#777777] font-medium leading-tight mt-0.5">Satin luxury box</p>
          </div>
        </div>
      </div>
    </div>
  );
}
