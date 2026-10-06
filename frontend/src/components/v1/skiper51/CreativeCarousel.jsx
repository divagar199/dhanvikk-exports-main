import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCreative, Autoplay, Pagination, Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/effect-creative';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

/**
 * Skiper51 Creative Carousel 002 (Carousel_005)
 * Utilizes Swiper's EffectCreative for smooth, depth-rich slide transitions.
 */
export function Carousel_005({
  slides = [],
  children,
  autoplay = true,
  autoplayDelay = 4500,
  loop = true,
  showPagination = true,
  showNavigation = false,
  creativeEffect,
  className = '',
  paginationColor = '#EC407A',
}) {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const defaultCreativeEffect = {
    prev: {
      shadow: false,
      translate: ['-15%', 0, -150],
      opacity: 0,
    },
    next: {
      translate: ['100%', 0, 0],
      opacity: 1,
    },
  };

  return (
    <div className={`relative w-full h-full skiper51-creative-carousel ${className}`}>
      <Swiper
        modules={[EffectCreative, Autoplay, Pagination, Navigation]}
        effect="creative"
        grabCursor={true}
        loop={loop}
        speed={750}
        creativeEffect={creativeEffect || defaultCreativeEffect}
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
                dynamicBullets: true,
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
        className="w-full h-full select-none"
      >
        {children ? (
          children
        ) : (
          slides.map((slide, index) => (
            <SwiperSlide key={slide.id || index} className="w-full h-full">
              {typeof slide.render === 'function' ? slide.render() : slide.content}
            </SwiperSlide>
          ))
        )}
      </Swiper>

      {/* Optional Navigation Arrows */}
      {showNavigation && (
        <>
          <button
            ref={prevRef}
            type="button"
            aria-label="Previous Slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-[#242124] shadow-md border border-white/60 hover:text-[#EC407A] hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            ref={nextRef}
            type="button"
            aria-label="Next Slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-[#242124] shadow-md border border-white/60 hover:text-[#EC407A] hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
}

export default Carousel_005;
