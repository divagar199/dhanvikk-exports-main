import React, { useState, useEffect, useRef } from 'react';
import {
  Truck,
  Flower2,
  ShieldCheck,
  ThermometerSnowflake,
  MapPin,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Pause,
  Play,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PROMISES = [
  {
    id: 'cold-chain',
    tabTitle: 'Chilled Transit Fleet',
    tag: 'Chilled Transit Fleet',
    icon: Truck,
    badgeBg: 'bg-[#FFF0F4]',
    badgeBorder: 'border-[#FCC1C5]',
    badgeText: 'text-[#C2185B]',
    headingNormal: 'Cold-Chain Temperature',
    headingItalic: 'Controlled Logistics',
    description:
      'Specially equipped vans ensure petals arrive chilled, hydrated, and crisp without wilting.',
    bullets: [
      'Custom insulated humidity-lock containers prevent petal dehydration in warm transit.',
      'Real-time thermal tracking from our Bengaluru floral atelier right to your doorstep.',
      'Zero wilting guarantee with complimentary floral life hydration nutrients.',
    ],
    ctaText: 'Experience Chilled Freshness',
    ctaLink: '/category/flowers',
    ctaBg: 'bg-[#EC407A] hover:bg-[#C2185B]',
    image: '/images/features/cold-chain.webp',
    imageAlt: 'Cold-Chain Temperature Controlled Floral Delivery in India',
    badges: [
      {
        icon: ThermometerSnowflake,
        text: 'Chilled 2°C – 4°C Active Monitored',
        color: 'text-cyan-300',
        bg: 'bg-black/75',
      },
      {
        icon: CheckCircle2,
        text: 'Dew-Fresh Guarantee',
        color: 'text-emerald-400',
        bg: 'bg-emerald-950/80',
        hideOnMobile: true,
      },
    ],
  },
  {
    id: 'farm-sourcing',
    tabTitle: 'Direct Farm Sourcing',
    tag: 'Ethical Farm Harvest',
    icon: Flower2,
    badgeBg: 'bg-emerald-50',
    badgeBorder: 'border-emerald-200',
    badgeText: 'text-emerald-800',
    headingNormal: 'Direct Farm',
    headingItalic: 'Sourcing & Cultivation',
    description:
      'Direct imports from Ecuador, Holland, and Nilgiris for double the lifespan of standard blooms.',
    bullets: [
      'Cultivated at 2,240m elevation in mist-kissed Nilgiris & Ooty greenhouses for thick velvet petals.',
      'Dawn-cut harvesting ensures blooms spend minimum hours off the stem before curation.',
      'Fair-trade partnerships empowering local floral farmers and women artisan collectives.',
    ],
    ctaText: 'Browse Farm-Fresh Stems',
    ctaLink: '/category/roses',
    ctaBg: 'bg-[#C2185B] hover:bg-[#A01349]',
    image: '/images/features/farm-sourcing.webp',
    imageAlt: 'Direct Farm Sourcing in Nilgiris Ooty India',
    badges: [
      {
        icon: MapPin,
        text: 'Nilgiris & Ooty Highlands (2,240m)',
        color: 'text-rose-300',
        bg: 'bg-black/75',
      },
      {
        icon: Flower2,
        text: '2x Longer Vase Life',
        color: 'text-amber-300',
        bg: 'bg-amber-950/80',
        hideOnMobile: true,
      },
    ],
  },
  {
    id: 'security',
    tabTitle: 'Fintech Grade Security',
    tag: 'Fintech Grade Security',
    icon: ShieldCheck,
    badgeBg: 'bg-blue-50',
    badgeBorder: 'border-blue-200',
    badgeText: 'text-blue-800',
    headingNormal: 'Razorpay Secure',
    headingItalic: 'Encrypted Checkout',
    description:
      'Bank-grade encrypted gateway supporting Credit Cards, Debit Cards, UPI & Net Banking.',
    bullets: [
      'Instant 1-click UPI payments via Google Pay, PhonePe, Paytm, and BHIM.',
      'Global Visa, Mastercard, American Express, and RuPay card tokenization.',
      'Automated instant payment receipts and real-time SMS & email order notifications.',
    ],
    ctaText: 'Order with Confidence',
    ctaLink: '/category/flower-boxes',
    ctaBg: 'bg-[#EC407A] hover:bg-[#C2185B]',
    image: '/images/features/razorpay-checkout.webp',
    imageAlt: 'Razorpay Secure Checkout Indian Floral Boutique',
    badges: [
      {
        icon: ShieldCheck,
        text: 'Razorpay Verified Merchant',
        color: 'text-emerald-400',
        bg: 'bg-black/75',
      },
      {
        icon: CreditCard,
        text: '256-Bit SSL Encrypted',
        color: 'text-blue-300',
        bg: 'bg-blue-950/80',
        hideOnMobile: true,
      },
    ],
  },
];

const AUTO_ROTATE_DELAY = 5000; // 5 seconds per promise

export default function HauteFloristryPromise() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const activePromise = PROMISES[activeIndex];
  const IconComponent = activePromise.icon;

  // Auto-rotation timer with smooth progress bar
  useEffect(() => {
    if (isPaused) return;

    const intervalTime = 50; // update progress every 50ms
    const step = (intervalTime / AUTO_ROTATE_DELAY) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveIndex((current) => (current + 1) % PROMISES.length);
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPaused, activeIndex]);

  // Handle manual tab switch
  const handleSelectTab = (index) => {
    setActiveIndex(index);
    setProgress(0);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % PROMISES.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + PROMISES.length) % PROMISES.length);
    setProgress(0);
  };

  return (
    <section className="w-full py-12 sm:py-16 bg-gradient-to-b from-[#FFFDF9] via-white to-[#FFFDF9] border-y border-[#F2ECE6] relative overflow-hidden">
      {/* Background Subtle Floral Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#FFF0F4]/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-[#E9E2E5] text-[#C2185B] text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#EC407A]" />
            <span>The Dhanvikk Haute Floristry Promise</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-['Poppins'] text-[#242124] tracking-tight">
            Uncompromising Standards. <br className="hidden sm:inline" />
            From Nilgiris Soil to Your Doorstep.
          </h2>

          <p className="text-xs sm:text-sm text-[#777777] mt-2 leading-relaxed">
            Discover why discerning clients across Dubai, India, and the globe trust our cold-chain, ethical farms, and bank-grade checkout.
          </p>
        </div>

        {/* 3-in-1 Interactive Tabs with Animated Progress Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-8 sm:mb-10">
          {PROMISES.map((item, idx) => {
            const isCurrent = idx === activeIndex;
            const TabIcon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(idx)}
                className={`group relative px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-2xl sm:rounded-full border text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  isCurrent
                    ? 'bg-white border-[#EC407A] text-[#242124] shadow-md ring-2 ring-[#EC407A]/15'
                    : 'bg-[#FAF7F2] border-[#EAE4DD] text-[#666666] hover:bg-white hover:border-[#D5CDC5] hover:text-[#242124]'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    isCurrent
                      ? 'bg-[#FFF0F4] text-[#EC407A]'
                      : 'bg-white/80 text-[#888888] group-hover:text-[#EC407A]'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                </div>
                <span>{item.tabTitle}</span>

                {/* Active Progress Underline Bar */}
                {isCurrent && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#EC407A] rounded-full overflow-hidden"
                  >
                    <span
                      className="block h-full bg-[#C2185B] transition-all duration-100 ease-linear"
                      style={{ width: `${progress}%` }}
                    />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main 3-in-1 Unified Showcase Card (Auto-changing Image + Content) */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative bg-white rounded-3xl p-5 sm:p-10 border border-[#EFE7DE] shadow-lg overflow-hidden group/card"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Image with Smooth Cross-fade Animation */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-md border border-[#F2ECE6] bg-[#FAF7F2] aspect-[4/3] group/img">
                <img
                  key={activePromise.image}
                  src={activePromise.image}
                  alt={activePromise.imageAlt}
                  className="w-full h-full object-cover transition-all duration-700 ease-out group-hover/img:scale-105 animate-in fade-in duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />

                {/* Floating Dynamic Badges */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-semibold">
                  {activePromise.badges.map((badge, bIdx) => {
                    const BadgeIcon = badge.icon;
                    return (
                      <span
                        key={bIdx}
                        className={`${badge.bg} backdrop-blur-md px-3 sm:px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm text-[11px] sm:text-xs ${
                          badge.hideOnMobile ? 'hidden sm:flex' : 'flex'
                        }`}
                      >
                        <BadgeIcon className={`w-3.5 h-3.5 ${badge.color}`} />
                        <span>{badge.text}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Dynamic Content with Smooth Entrance Animation */}
            <div
              key={activePromise.id}
              className="lg:col-span-6 space-y-5 animate-in fade-in slide-in-from-right-3 duration-500"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full ${activePromise.badgeBg} border ${activePromise.badgeBorder} ${activePromise.badgeText} text-xs font-bold uppercase tracking-wider shadow-2xs`}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                  <span>{activePromise.tag}</span>
                </div>

                {/* Slide Counter / Pause Indicator */}
                <div className="flex items-center gap-2 text-xs font-mono text-[#888888]">
                  <span>0{activeIndex + 1} / 0{PROMISES.length}</span>
                  <button
                    type="button"
                    onClick={() => setIsPaused(!isPaused)}
                    className="p-1 rounded-md hover:bg-[#FAF7F2] text-[#888888] hover:text-[#242124] transition-colors"
                    title={isPaused ? 'Resume auto-play' : 'Pause auto-play'}
                  >
                    {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <h3 className="text-2xl sm:text-4xl font-bold font-['Poppins'] text-[#242124] leading-tight">
                {activePromise.headingNormal} <br />
                <span className="text-[#C2185B] italic font-normal">
                  {activePromise.headingItalic}
                </span>
              </h3>

              <p className="text-sm sm:text-base text-[#666666] leading-relaxed font-normal">
                {activePromise.description}
              </p>

              <ul className="space-y-3 pt-1 text-xs sm:text-sm text-[#444444]">
                {activePromise.bullets.map((bullet, bIdx) => (
                  <li key={bIdx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2 flex items-center gap-4">
                <Link
                  to={activePromise.ctaLink}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${activePromise.ctaBg} text-white text-xs sm:text-sm font-semibold transition-all shadow-md hover:shadow-lg`}
                >
                  <span>{activePromise.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Prev / Next Mini Controls */}
                <div className="flex items-center gap-1.5 ml-auto">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="w-9 h-9 rounded-full bg-[#FAF7F2] hover:bg-[#FFF0F4] text-[#EC407A] flex items-center justify-center transition-colors cursor-pointer border border-[#EAE4DD] hover:border-[#FCC1C5]"
                    aria-label="Previous guarantee"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-9 h-9 rounded-full bg-[#FAF7F2] hover:bg-[#FFF0F4] text-[#EC407A] flex items-center justify-center transition-colors cursor-pointer border border-[#EAE4DD] hover:border-[#FCC1C5]"
                    aria-label="Next guarantee"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
