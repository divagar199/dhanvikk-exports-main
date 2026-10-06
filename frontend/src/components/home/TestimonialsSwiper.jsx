import React, { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Quote, 
  BadgeCheck
} from 'lucide-react';

export const PATRON_REVIEWS = [
  {
    id: 'rev-1',
    name: 'Fatima Al Mansoori',
    city: 'Dubai Marina, UAE',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
    rating: 5,
    date: 'Delivered Yesterday',
    verified: true,
    product: 'Crimson Royal Bouquet',
    comment: 'The Crimson Royal bouquet was breathtaking! Delivered right at midnight in flawless chilled condition with the handwritten card. Outstanding service for anniversary surprises in Dubai.',
  },
  {
    id: 'rev-2',
    name: 'Vikram Sengupta',
    city: 'Bandra, Mumbai',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    rating: 5,
    date: 'Verified Patron',
    verified: true,
    product: 'Preserved Forever Roses Dome',
    comment: 'The Forever Roses dome still looks like it was cut this morning after 6 months. Dhanvikk Blooms has the most luxurious packaging and attention to detail I have seen in luxury floristry.',
  },
  {
    id: 'rev-3',
    name: 'Aisha K.',
    city: 'Downtown Dubai',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    rating: 5,
    date: 'Verified UAE Order',
    verified: true,
    product: 'Signature Velvet Hatbox',
    comment: 'Seamless checkout via Razorpay and the customer support on WhatsApp was prompt and courteous. 10/10 floristry. Will always be my go-to for luxury flower gifts.',
  },
  {
    id: 'rev-4',
    name: 'Dr. Arjun Nair',
    city: 'Indiranagar, Bengaluru',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    rating: 5,
    date: '2 Days Ago',
    verified: true,
    product: 'Madurai Malli & Lotus Export Hamper',
    comment: 'Ordered fresh temple flowers and jasmine strings for our housewarming puja. The aroma filled the entire home and the flowers stayed fresh for days. Truly ceremonial grade.',
  },
  {
    id: 'rev-5',
    name: 'Eleanor Vance',
    city: 'London / Singapore Changi',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
    rating: 5,
    date: 'International Client',
    verified: true,
    product: 'Pastel Orchid Symphony',
    comment: 'Sent flowers to family across continents. Flawless tracking, pristine temperature-controlled cold chain dispatch, and the recipient was moved to tears. Simply exceptional.',
  },
];

export default function TestimonialsSwiper() {
  const swiperInstanceRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F4] border border-[#FCC1C5] text-[#C2185B] text-xs font-bold uppercase tracking-wider mb-2 shadow-2xs">
            <Quote className="w-3.5 h-3.5 text-[#EC407A]" />
            <span>Client Praise & Stories</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold font-['Poppins'] text-[#242124]">
            What Our Patrons Say
          </h2>
          <p className="text-xs sm:text-sm text-[#777777] mt-1.5 max-w-xl leading-relaxed">
            Verified reviews from floral gifting clients and international floral cargo patrons
          </p>
        </div>

        {/* Aggregate Score & Swiper Navigation Controls */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Aggregate Badge */}
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-[#EBE3DC] shadow-xs">
            <div className="flex text-[#FFB400]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <span className="text-xs font-bold text-[#242124]">4.98 / 5.0</span>
            <span className="text-[11px] text-[#888888] border-l border-gray-200 pl-2">
              1,200+ Reviews
            </span>
          </div>

          {/* Prev / Next Arrows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => swiperInstanceRef.current?.slidePrev()}
              disabled={isBeginning}
              className={`w-10 h-10 rounded-full border border-[#E8DFD8] flex items-center justify-center transition-all ${
                !isBeginning
                  ? 'bg-white hover:bg-[#FFF3F6] hover:border-[#FCC1C5] text-[#242124] shadow-xs hover:scale-105 cursor-pointer'
                  : 'bg-white/50 text-gray-300 border-gray-100 cursor-not-allowed'
              }`}
              aria-label="Previous Review"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => swiperInstanceRef.current?.slideNext()}
              disabled={isEnd}
              className={`w-10 h-10 rounded-full border border-[#E8DFD8] flex items-center justify-center transition-all ${
                !isEnd
                  ? 'bg-white hover:bg-[#FFF3F6] hover:border-[#FCC1C5] text-[#242124] shadow-xs hover:scale-105 cursor-pointer'
                  : 'bg-white/50 text-gray-300 border-gray-100 cursor-not-allowed'
              }`}
              aria-label="Next Review"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Official NPM Swiper Component */}
      <div className="relative">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          onSwiper={(swiper) => {
            swiperInstanceRef.current = swiper;
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          onSlideChange={(swiper) => {
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          spaceBetween={24}
          slidesPerView={1}
          autoplay={{
            delay: 4500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          breakpoints={{
            640: {
              slidesPerView: 1.5,
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 24,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 24,
            },
          }}
          pagination={{
            clickable: true,
            el: '.testimonials-custom-pagination',
            bulletClass: 'inline-block w-2 h-2 rounded-full bg-gray-300 transition-all cursor-pointer mx-1',
            bulletActiveClass: '!w-7 !bg-[#C2185B] !rounded-full',
          }}
          className="py-4 pb-6"
        >
          {PATRON_REVIEWS.map((review) => (
            <SwiperSlide key={review.id} className="h-auto">
              <div className="h-full bg-white rounded-3xl p-6 sm:p-7 border border-[#F0E8E1] hover:border-[#FCC1C5] hover:shadow-xl hover:shadow-[#C2185B]/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative group select-none">
                {/* Top Row: Stars + Product Tag */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-[#FFB400]">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFF0F4] text-[#C2185B] border border-[#FCE4EC]">
                      {review.product}
                    </span>
                  </div>

                  {/* Decorative Subtle Quote Icon */}
                  <div className="relative mb-2">
                    <Quote className="w-7 h-7 text-[#FCC1C5]/40 absolute -top-2 -left-1 pointer-events-none" />
                    <p className="text-xs sm:text-sm text-[#444444] leading-relaxed italic relative z-10 pl-5">
                      "{review.comment}"
                    </p>
                  </div>
                </div>

                {/* Bottom Row: User Avatar, Name, Location & Verified Check */}
                <div className="mt-6 pt-4 border-t border-[#F7F2ED] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-[#EAE2DA] bg-[#FAF7F2] shadow-2xs flex-shrink-0">
                      <img
                        src={review.avatar}
                        alt={`${review.name} - Verified Dhanvikk Blooms Patron`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        width="40"
                        height="40"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-bold text-[#242124] font-['Poppins']">
                          {review.name}
                        </h4>
                        {review.verified && (
                          <BadgeCheck className="w-4 h-4 text-emerald-600 fill-emerald-50" />
                        )}
                      </div>
                      <span className="text-[11px] text-[#777777] block">
                        {review.city}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Verified</span>
                  </span>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Swiper Pagination Dots */}
        <div className="testimonials-custom-pagination flex items-center justify-center mt-4" />
      </div>
    </section>
  );
}
