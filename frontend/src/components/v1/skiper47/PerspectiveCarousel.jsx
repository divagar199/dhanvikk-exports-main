import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProductImageUrl } from '../../../utils/imageUrl';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

/**
 * Skiper47 3D Perspective Coverflow Carousel
 * Features 3D depth, centered slide scale, customizable navigation, and smooth autoplay.
 */
export function Carousel_001({
  items = [],
  autoplay = true,
  autoplayDelay = 3000,
  loop = true,
  spaceBetween = 30,
  showNavigation = true,
  showPagination = true,
  className = '',
}) {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  return (
    <div className={`relative w-full skiper47-perspective-carousel ${className}`}>
      {/* 3D Coverflow Swiper */}
      <Swiper
        modules={[EffectCoverflow, Pagination, Navigation, Autoplay]}
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView="auto"
        initialSlide={1}
        loop={loop}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 140,
          modifier: 1.8,
          scale: 0.9,
          slideShadows: false,
        }}
        autoplay={
          autoplay
            ? {
                delay: autoplayDelay,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : false
        }
        pagination={
          showPagination
            ? {
                clickable: true,
                el: '.skiper47-pagination',
                bulletClass: 'skiper47-bullet',
                bulletActiveClass: 'skiper47-bullet-active',
              }
            : false
        }
        navigation={
          showNavigation
            ? {
                prevEl: prevRef.current,
                nextEl: nextRef.current,
              }
            : false
        }
        onBeforeInit={(swiper) => {
          if (showNavigation && swiper.params.navigation) {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }
        }}
        className="w-full !py-8 !px-4 select-none"
      >
        {items.map((item, idx) => (
          <SwiperSlide
            key={item.id || idx}
            className="!w-[280px] sm:!w-[340px] md:!w-[380px] !h-[260px] sm:!h-[280px] transition-all duration-300"
          >
            {({ isActive }) => (
              <Link
                to={item.link}
                style={{ backgroundColor: item.bgColor }}
                className={`relative w-full h-full rounded-[32px] overflow-hidden block shadow-lg transition-all duration-500 group select-none border border-black/5 ${
                  isActive
                    ? 'ring-4 ring-[#EC407A]/40 shadow-2xl scale-100'
                    : 'opacity-85 scale-95 hover:opacity-100'
                }`}
              >
                {/* Background Image with Depth Zoom */}
                <img
                  src={getProductImageUrl(item.image)}
                  alt={item.label}
                  className="w-full h-full object-cover object-bottom transition-transform duration-700 ease-out group-hover:scale-108"
                  loading="lazy"
                />

                {/* Ambient Soft Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                {/* Top Badge: Occasion Tag */}
                {item.tag && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#242124] text-[10px] font-bold uppercase tracking-wider shadow-xs border border-white/50">
                      <Sparkles className="w-2.5 h-2.5 text-[#EC407A]" />
                      <span>{item.tag}</span>
                    </span>
                  </div>
                )}

                {/* Top-Left Occasion Title */}
                <div className="absolute top-5 left-6 z-10">
                  <div className="inline-flex items-center gap-2 text-[#1F1A17] font-bold text-2xl sm:text-3xl font-['Poppins'] tracking-tight group-hover:translate-x-1.5 transition-transform duration-300 drop-shadow-[0_1px_3px_rgba(255,255,255,0.85)]">
                    <span>{item.label}</span>
                    <span className="font-light text-xl text-[#C2185B]">&gt;</span>
                  </div>
                </div>

                {/* Bottom Floating Info Pill */}
                <div className="absolute bottom-4 left-5 right-5 z-10">
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-white/60 shadow-xs group-hover:bg-white transition-all">
                    <span className="text-xs font-semibold text-[#242124] truncate mr-2">
                      {item.subtitle || 'Explore Curated Bouquets'}
                    </span>
                    <div className="w-7 h-7 rounded-xl bg-[#EC407A] text-white flex items-center justify-center group-hover:bg-[#C2185B] transition-colors shrink-0">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Floating Custom Navigation Arrows */}
      {showNavigation && (
        <>
          <button
            ref={prevRef}
            type="button"
            aria-label="Previous Occasion"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/95 backdrop-blur-md text-[#EC407A] shadow-xl border border-[#EAE4DD] hover:border-[#FCC1C5] hover:text-[#C2185B] hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            ref={nextRef}
            type="button"
            aria-label="Next Occasion"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/95 backdrop-blur-md text-[#EC407A] shadow-xl border border-[#EAE4DD] hover:border-[#FCC1C5] hover:text-[#C2185B] hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Custom Pagination Bullets */}
      {showPagination && (
        <div className="skiper47-pagination flex items-center justify-center gap-2 mt-2" />
      )}
    </div>
  );
}

export default Carousel_001;
