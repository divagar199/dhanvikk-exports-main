import React from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { Carousel_001 } from '../v1/skiper47';

export const OCCASIONS = [
  {
    id: 'birthday',
    label: 'Birthday',
    subtitle: 'Vibrant celebratory blooms & confetti roses',
    link: '/category/birthday',
    bgColor: '#F5C2A0',
    image: '/images/occasions/birthday_gift.webp',
    tag: 'Celebration',
  },
  {
    id: 'anniversary',
    label: 'Anniversary',
    subtitle: 'Timeless ruby roses & grand romantic bouquets',
    link: '/category/anniversary',
    bgColor: '#F8B6C3',
    image: '/images/occasions/anniversary_gift.webp',
    tag: 'Everlasting Love',
  },
  {
    id: 'congratulations',
    label: 'Congratulations',
    subtitle: 'Majestic lilies & triumph celebration stems',
    link: '/category/congratulations',
    bgColor: '#9EBED9',
    image: '/images/occasions/congratulations_gift.webp',
    tag: 'Milestones',
  },
  {
    id: 'best-wishes',
    label: 'Best Wishes',
    subtitle: 'Healing orchids & uplifting fragrant florals',
    link: '/category/get-well',
    bgColor: '#D5C8F2',
    image: '/images/occasions/best_wishes_gift.webp',
    tag: 'Thoughtful',
  },
  {
    id: 'new-born',
    label: 'New Born',
    subtitle: 'Gentle pastel carnations & baby celebration bundles',
    link: '/category/all?occasion=new-born',
    bgColor: '#FCE6A2',
    image: '/images/occasions/newborn_gift.webp',
    tag: 'Pure Joy',
  },
  {
    id: 'romance',
    label: 'Romance & Love',
    subtitle: 'Velvet crimson blooms & eternal preserved stems',
    link: '/category/romance',
    bgColor: '#F7BCB4',
    image: '/images/occasions/romance_gift.webp',
    tag: 'Romantic Elegance',
  },
];

export default function PreciousOccasionsSection() {
  return (
    <section className="w-full py-12 sm:py-16 bg-gradient-to-b from-white via-[#FFFDF9] to-white relative overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#FFF0F4]/50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-4 sm:mb-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFF0F4] border border-[#FCC1C5]/50 text-[#C2185B] text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#EC407A]" />
            <span>Hand-Arranged Floral Celebrations</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-['Poppins'] text-[#242124] tracking-tight">
            Flowers For Every Precious Occasion
          </h2>

          <p className="text-xs sm:text-sm text-[#777777] mt-2 leading-relaxed">
            Discover handcrafted bouquets, eternal stems, and bespoke botanical arrangements curated for life's unforgettable milestones.
          </p>
        </div>

        {/* Skiper47 3D Perspective Coverflow Carousel */}
        <Carousel_001
          items={OCCASIONS}
          autoplay={true}
          autoplayDelay={3200}
          loop={true}
          showNavigation={true}
          showPagination={true}
        />
      </div>
    </section>
  );
}
