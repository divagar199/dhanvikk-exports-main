import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const OCCASIONS = [
  {
    id: 'birthday',
    label: 'Birthday',
    link: '/category/birthday',
    bgColor: '#F5C2A0',
    image: '/images/occasions/birthday_gift.jpg',
  },
  {
    id: 'anniversary',
    label: 'Anniversary',
    link: '/category/anniversary',
    bgColor: '#F8B6C3',
    image: '/images/occasions/anniversary_gift.jpg',
  },
  {
    id: 'congratulations',
    label: 'Congratulations',
    link: '/category/congratulations',
    bgColor: '#9EBED9',
    image: '/images/occasions/congratulations_gift.jpg',
  },
  {
    id: 'best-wishes',
    label: 'Best Wishes',
    link: '/category/get-well',
    bgColor: '#D5C8F2',
    image: '/images/occasions/best_wishes_gift.jpg',
  },
  {
    id: 'new-born',
    label: 'New Born',
    link: '/category/all?occasion=new-born',
    bgColor: '#FCE6A2',
    image: '/images/occasions/newborn_gift.jpg',
  },
  {
    id: 'romance',
    label: 'Romance',
    link: '/category/romance',
    bgColor: '#F7BCB4',
    image: '/images/occasions/romance_gift.jpg',
  },
];

export default function PreciousOccasionsSection() {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 15);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15);
  };

  useEffect(() => {
    checkScroll();
    const currentRef = scrollRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', checkScroll, { passive: true });
    }
    window.addEventListener('resize', checkScroll);
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', checkScroll);
      }
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="w-full py-10 sm:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Clean & Bold like Reference Image */}
        <div className="mb-5 sm:mb-7">
          <h2 className="text-2xl sm:text-3xl font-bold font-['Poppins'] text-[#1A1A1A] tracking-tight">
            Flowers For Every Precious Occasion
          </h2>
        </div>

        {/* Carousel Container with Floating Circular Arrow Button */}
        <div className="relative group/carousel">
          {/* Floating Left Arrow (matches reference floating button style) */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => handleScroll('left')}
              aria-label="Previous occasions"
              className="absolute left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white text-[#1F1A17] shadow-xl border border-black/5 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Floating Right Arrow (matches exact circular button in reference image) */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => handleScroll('right')}
              aria-label="Next occasions"
              className="absolute right-2 sm:-right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white text-[#1F1A17] shadow-xl border border-black/5 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Smooth Horizontal Scroll Track */}
          <div
            ref={scrollRef}
            className="flex items-center gap-4 sm:gap-5 overflow-x-auto scrollbar-none scroll-smooth pb-3 pt-1 px-1 -mx-1"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {OCCASIONS.map((occ) => (
              <Link
                key={occ.id}
                to={occ.link}
                style={{
                  backgroundColor: occ.bgColor,
                  scrollSnapAlign: 'start',
                }}
                className="group relative flex-shrink-0 w-[270px] sm:w-[305px] md:w-[325px] h-[195px] sm:h-[215px] rounded-[24px] sm:rounded-[28px] overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 select-none block"
              >
                {/* Background Image Seamlessly Integrated */}
                <img
                  src={occ.image}
                  alt={`${occ.label} Luxury Flowers & Celebration Floral Gifts | Dhanvikk Blooms`}
                  className="w-full h-full object-cover object-bottom group-hover:scale-104 transition-transform duration-500 ease-out"
                  loading="lazy"
                  decoding="async"
                />

                {/* Top-Left Occasion Title with '>' exactly matching reference design */}
                <div className="absolute top-4 left-5 sm:top-5 sm:left-6 z-10">
                  <span className="inline-flex items-center gap-1.5 text-[#1F1A17] font-bold text-xl sm:text-2xl font-['Poppins'] tracking-tight group-hover:translate-x-1 transition-transform duration-300 drop-shadow-[0_1px_2px_rgba(255,255,255,0.7)]">
                    <span>{occ.label}</span>
                    <span className="font-normal text-xl sm:text-2xl text-[#1F1A17]">&gt;</span>
                  </span>
                </div>

                {/* Subtle border outline for crispness */}
                <div className="absolute inset-0 rounded-[24px] sm:rounded-[28px] border border-black/5 pointer-events-none" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
