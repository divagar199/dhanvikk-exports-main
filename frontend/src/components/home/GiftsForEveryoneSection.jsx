import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { getProductImageUrl } from '../../utils/imageUrl';

import 'swiper/css';
import 'swiper/css/navigation';

const RECIPIENTS = [
  {
    id: 'him',
    title: 'Him',
    image: '/images/gifts/him.webp',
    link: '/category/flowers?recipient=For+Him'
  },
  {
    id: 'her',
    title: 'Her',
    image: '/images/gifts/her.webp',
    link: '/category/flowers?recipient=For+Her'
  },
  {
    id: 'kids',
    title: 'Kids',
    image: '/images/gifts/kids.webp',
    link: '/category/flowers?recipient=Kids'
  },
  {
    id: 'friend',
    title: 'Friend',
    image: '/images/gifts/friend.webp',
    link: '/category/flowers?recipient=Friends'
  },
  {
    id: 'wife',
    title: 'Wife',
    image: '/images/gifts/wife.webp',
    link: '/category/flowers?recipient=For+Wife'
  },
  {
    id: 'husband',
    title: 'Husband',
    image: '/images/gifts/husband.webp',
    link: '/category/flowers?recipient=For+Husband'
  },
  {
    id: 'girlfriend',
    title: 'Girlfriend',
    image: '/images/gifts/her.webp',
    link: '/category/flowers?recipient=For+Her'
  },
  {
    id: 'boyfriend',
    title: 'Boyfriend',
    image: '/images/gifts/him.webp',
    link: '/category/flowers?recipient=For+Him'
  },
  {
    id: 'parents',
    title: 'Parents',
    image: '/images/gifts/wife.webp',
    link: '/category/flowers?recipient=Parents'
  },
  {
    id: 'family',
    title: 'Family',
    image: '/images/gifts/friend.webp',
    link: '/category/flowers?recipient=Family'
  }
];

export default function GiftsForEveryoneSection() {
  const swiperRef = useRef(null);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full font-['Poppins']">
      {/* Title Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1E2319] tracking-tight font-['Poppins']">
          Gifts for Everyone
        </h2>
      </div>

      {/* Cards Container with Swiper and Navigation */}
      <div className="relative group/carousel">
        <Swiper
          modules={[Navigation]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          navigation={{
            nextEl: '.gifts-next-btn',
            prevEl: '.gifts-prev-btn',
          }}
          grabCursor={true}
          resistance={true}
          resistanceRatio={0.85}
          spaceBetween={16}
          slidesPerView={2.2}
          breakpoints={{
            480: {
              slidesPerView: 2.8,
              spaceBetween: 16,
            },
            640: {
              slidesPerView: 3.5,
              spaceBetween: 18,
            },
            768: {
              slidesPerView: 4.2,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 5.2,
              spaceBetween: 22,
            },
            1280: {
              slidesPerView: 5.25,
              spaceBetween: 24,
            },
          }}
          className="pb-2 cursor-grab active:cursor-grabbing"
        >
          {RECIPIENTS.map((item) => (
            <SwiperSlide key={item.id}>
              <Link
                to={item.link}
                className="group flex flex-col items-center text-center select-none block transition-transform duration-300 hover:-translate-y-1"
              >
                {/* 3D Illustrated Character Card */}
                <div className="w-full aspect-[295/196] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#FFF5F6] border border-[#FDE6E9] shadow-xs group-hover:shadow-md transition-all duration-300">
                  <img
                    src={getProductImageUrl(item.image)}
                    alt={`Floral Gifts & Luxury Blooms for ${item.title} | Dhanvikk Blooms`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                {/* Recipient Label */}
                <span className="mt-3 text-sm sm:text-base font-semibold text-[#1E2319] group-hover:text-[#EC407A] transition-colors">
                  {item.title}
                </span>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Floating Right Navigation Button (matching theme) */}
        <button
          className="gifts-next-btn absolute -right-3 sm:-right-4 top-[38%] -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white shadow-[0_4px_16px_rgba(236,64,122,0.18)] border border-[#FCE4EC] flex items-center justify-center text-[#C2185B] hover:bg-[#FFF0F4] hover:border-[#EC407A] hover:scale-110 active:scale-95 transition-all cursor-pointer disabled:opacity-0 disabled:pointer-events-none"
          aria-label="Next gifts"
        >
          <ChevronRight className="w-5 h-5 text-[#C2185B]" />
        </button>

        {/* Floating Left Navigation Button */}
        <button
          className="gifts-prev-btn absolute -left-3 sm:-left-4 top-[38%] -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white shadow-[0_4px_16px_rgba(236,64,122,0.18)] border border-[#FCE4EC] flex items-center justify-center text-[#C2185B] hover:bg-[#FFF0F4] hover:border-[#EC407A] hover:scale-110 active:scale-95 transition-all cursor-pointer disabled:opacity-0 disabled:pointer-events-none"
          aria-label="Previous gifts"
        >
          <ChevronLeft className="w-5 h-5 text-[#C2185B]" />
        </button>
      </div>
    </section>
  );
}
