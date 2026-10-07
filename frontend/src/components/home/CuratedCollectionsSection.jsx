import React, { useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { 
  ArrowUpRight, 
  Flower2, 
  Crown, 
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Truck,
  Gift,
  Sparkles,
  Clock,
  Star,
  Layers,
  Info,
  X,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

// Official Swiper Styles
import 'swiper/css';
import 'swiper/css/navigation';

export const COLLECTIONS = [
  {
    id: 'roses',
    atelierNo: '01',
    categoryKey: 'roses',
    name: 'Roses Atelier',
    shortName: 'Roses',
    count: '48 Formats',
    tag: 'Signature',
    tagAccent: 'from-rose-500 to-[#C2185B]',
    desc: 'Grand Ecuadorian Stems',
    specNote: '60cm Long Stems • Grade-A Cut',
    popularVibe: 'Red Naomi, Pink Mondial & White O’Hara',
    vaseLife: '10–14 Days with Flower Food',
    packaging: 'Luxe Embossed Wrap or Glass Flute',
    startingPriceINR: 2499,
    image: '/images/collections/roses.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=700&q=85',
    link: '/category/roses',
    details: 'Harvested at dawn from high-altitude equatorial slopes where intense sunlight yields extra-large blooms and ultra-thick velvety petals.'
  },
  {
    id: 'bouquets',
    atelierNo: '02',
    categoryKey: 'bouquets',
    name: 'Artisan Bouquets',
    shortName: 'Bouquets',
    count: '65 Formats',
    tag: 'Trending',
    tagAccent: 'from-[#EC407A] to-[#880E4F]',
    desc: 'Artisan Tied Silks',
    specNote: 'Multi-layered Botanical Florals',
    popularVibe: 'Garden Hydrangeas, Peonies & Eucalypt',
    vaseLife: '7–10 Days Farm Fresh',
    packaging: 'Water-Chambered Korean Silk Wraps',
    startingPriceINR: 1899,
    image: '/images/collections/bouquets.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=700&q=85',
    link: '/category/hand-bouquets',
    details: 'Harmonious color blocking and asymmetric architectural spirals hand-tied by senior floral artisans with imported Parisian grosgrain ribbons.'
  },
  {
    id: 'flower-boxes',
    atelierNo: '03',
    categoryKey: 'boxes',
    name: 'Velvet Hatboxes',
    shortName: 'Hatboxes',
    count: '32 Formats',
    tag: 'Haute Luxe',
    tagAccent: 'from-amber-500 to-amber-700',
    desc: 'Parisian Velvet Cylinders',
    specNote: 'Oasis Floral Foam Hydration',
    popularVibe: 'Dome-Arranged Garden Roses & Ranunculus',
    vaseLife: '8–12 Days Continuous Hydration',
    packaging: 'Velvet Cylinders with Gold Foil Seal',
    startingPriceINR: 3499,
    image: '/images/collections/flower-boxes.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=700&q=85',
    link: '/category/flower-boxes',
    details: 'Hand-crafted reusable velvet hatbox containers featuring water-sealed acoustic floral bases so your stems never require trimming or re-vasing.'
  },
  {
    id: 'forever-roses',
    atelierNo: '04',
    categoryKey: 'forever',
    name: 'Forever Roses',
    shortName: 'Forever',
    count: '18 Formats',
    tag: '1-Year Bloom',
    tagAccent: 'from-emerald-600 to-teal-800',
    desc: 'Preserved Gold Cylinders',
    specNote: '100% Real Preserved Blooms',
    popularVibe: 'Metallic Gold, Royal Red & Velvet Noir',
    vaseLife: '365+ Days (No Sunlight/Water Needed)',
    packaging: 'Acrylic Showcase & Gold Monogram Case',
    startingPriceINR: 3999,
    image: '/images/collections/forever-roses.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=700&q=85',
    link: '/category/forever-roses',
    details: 'Natural Ecuadorian roses harvested at peak majesty, treated with non-toxic natural plant humectants to maintain softness and radiance for over a year.'
  },
  {
    id: 'orchids',
    atelierNo: '05',
    categoryKey: 'orchids',
    name: 'Exotic Orchids',
    shortName: 'Orchids',
    count: '24 Formats',
    tag: 'Rare Harvest',
    tagAccent: 'from-purple-600 to-indigo-800',
    desc: 'Cascading Phalaenopsis',
    specNote: 'Multi-Spike Royal Stems',
    popularVibe: 'Snow White, Imperial Violet & Tiger Spots',
    vaseLife: '14–21 Days Long Bloom',
    packaging: 'Ceramic Planter & Bamboo Support Sticks',
    startingPriceINR: 2999,
    image: '/images/collections/orchids.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1566908829550-e6551b00979b?auto=format&fit=crop&w=700&q=85',
    link: '/category/orchids',
    details: 'Exquisite multi-stem Phalaenopsis and Cymbidium orchids cultivated in specialized humidity-controlled greenhouses for magnificent longevity.'
  },
  {
    id: 'gift-bundles',
    atelierNo: '06',
    categoryKey: 'bundles',
    name: 'Haute Gift Sets',
    shortName: 'Gift Sets',
    count: '30 Formats',
    tag: 'Grand Gifting',
    tagAccent: 'from-rose-600 to-red-900',
    desc: 'Champagne & Petals',
    specNote: 'Curated Artisan Pairings',
    popularVibe: 'Swiss Truffles, Scented Candles & Roses',
    vaseLife: 'Complete Sensory Experience',
    packaging: 'Embossed Gift Trunk with Satin Bow',
    startingPriceINR: 4499,
    image: '/images/collections/gift-bundles.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=700&q=85',
    link: '/category/gift-bundles',
    details: 'Comprehensive luxury celebrations combining freshly sculpted stem arrangements with European artisanal confectionery and keepsake notes.'
  }
];

const CATEGORY_TABS = [
  { id: 'all', label: 'All Collections' },
  { id: 'roses', label: 'Roses Atelier' },
  { id: 'bouquets', label: 'Hand Bouquets' },
  { id: 'boxes', label: 'Velvet Hatboxes' },
  { id: 'forever', label: 'Forever Roses' },
  { id: 'orchids', label: 'Exotic Orchids' },
  { id: 'bundles', label: 'Haute Gift Sets' },
];

export default function CuratedCollectionsSection() {
  const { formatPrice } = useCurrency();
  const swiperRef = useRef(null);
  const [activeTab, setActiveTab] = useState('all');
  const [quickViewItem, setQuickViewItem] = useState(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  // When clicking a tab, smoothly slide to the selected collection
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (swiperRef.current) {
      if (tabId === 'all') {
        swiperRef.current.slideTo(0);
      } else {
        const targetIndex = COLLECTIONS.findIndex((c) => c.categoryKey === tabId);
        if (targetIndex !== -1) {
          swiperRef.current.slideTo(targetIndex);
        }
      }
    }
  };

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full font-['Poppins'] overflow-hidden">
      {/* Background Decorative Floral Glow */}
      <div 
        className="pointer-events-none absolute -top-24 right-1/4 w-96 h-96 bg-gradient-to-br from-[#EC407A]/10 via-[#FCC1C5]/15 to-transparent rounded-full blur-3xl"
        aria-hidden="true" 
      />
      <div 
        className="pointer-events-none absolute -bottom-24 left-10 w-80 h-80 bg-gradient-to-tr from-[#FFF3F6] via-[#EC407A]/5 to-transparent rounded-full blur-2xl"
        aria-hidden="true" 
      />

      {/* 1. Haute Atelier Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-[#F4ECE4]">
        <div className="space-y-3 max-w-2xl">
          {/* Atelier Crest Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#FFF3F6] to-[#FFFDF9] border border-[#EC407A]/30 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EC407A] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EC407A]"></span>
            </span>
            <Flower2 className="w-3.5 h-3.5 text-[#C2185B]" />
            <span className="text-[11px] font-bold text-[#C2185B] tracking-[0.16em] uppercase whitespace-nowrap">
              Haute Floristry Atelier
            </span>
            <span className="text-black/30 font-light">•</span>
            <span className="text-[10px] font-semibold text-[#888888] tracking-wider uppercase hidden sm:inline whitespace-nowrap">
              Parisian & Dubai Standards
            </span>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#242124] tracking-tight font-['Poppins']">
              Curated Collections
            </h2>
            <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
              Explore our most coveted botanical silhouettes — sculpted daily by master floral couturiers using dawn-harvested Grade-A stems, conditioned in botanical chillers and adorned with signature satin wraps.
            </p>
          </div>
        </div>

        {/* Action Controls: Swiper Arrows & Full Catalog Link */}
        <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
          {/* Swiper Arrow Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              disabled={isBeginning}
              aria-label="Previous Collection"
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 border ${
                isBeginning 
                  ? 'border-[#EAE0D6] text-[#BBBBBB] bg-[#FAFAF7] cursor-not-allowed opacity-60' 
                  : 'border-[#E0D0C4] text-[#EC407A] bg-white hover:bg-[#FFF3F6] hover:border-[#EC407A] hover:text-[#C2185B] shadow-xs active:scale-95'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => swiperRef.current?.slideNext()}
              disabled={isEnd}
              aria-label="Next Collection"
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 border ${
                isEnd 
                  ? 'border-[#EAE0D6] text-[#BBBBBB] bg-[#FAFAF7] cursor-not-allowed opacity-60' 
                  : 'border-[#E0D0C4] text-[#EC407A] bg-white hover:bg-[#FFF3F6] hover:border-[#EC407A] hover:text-[#C2185B] shadow-xs active:scale-95'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Explore All Formats CTA */}
          <Link
            to="/category/flowers"
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#EC407A] hover:bg-[#C2185B] text-white text-xs font-bold transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-[#C2185B]/20 whitespace-nowrap"
          >
            <span>Explore All Formats</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-white/80 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* 2. Interactive Category Filter Pills */}
      <div className="relative z-10 mb-8 overflow-x-auto scrollbar-none pb-2">
        <div className="flex items-center gap-2 min-w-max">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-2 border whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-[#EC407A] to-[#C2185B] text-white border-transparent shadow-sm shadow-[#EC407A]/30 scale-102'
                    : 'bg-white hover:bg-[#FFF7F9] text-[#555555] hover:text-[#EC407A] border-[#E8DFD7] hover:border-[#EC407A]/40'
                }`}
              >
                {tab.id === 'all' && <Sparkles className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#EC407A]'}`} />}
                <span>{tab.label}</span>
                {tab.id === 'all' && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-[#F2ECE6] text-[#777777]'}`}>
                    {COLLECTIONS.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Luxury Haute Swiper Carousel */}
      <div className="relative z-10">
        <Swiper
          modules={[Navigation, Autoplay]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          onSlideChange={(swiper) => {
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          autoplay={{
            delay: 4500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          speed={600}
          grabCursor={true}
          resistance={true}
          resistanceRatio={0.85}
          spaceBetween={18}
          slidesPerView={1.2}
          breakpoints={{
            480: {
              slidesPerView: 1.8,
              spaceBetween: 18,
            },
            640: {
              slidesPerView: 2.4,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 3.3,
              spaceBetween: 22,
            },
            1280: {
              slidesPerView: 4.15,
              spaceBetween: 24,
            },
          }}
          className="!pb-6 !overflow-visible"
        >
          {COLLECTIONS.map((col) => {
            const isTabFocused = activeTab !== 'all' && col.categoryKey === activeTab;
            return (
              <SwiperSlide key={col.id} className="h-auto">
                <div 
                  className={`group relative flex flex-col justify-between h-[420px] sm:h-[460px] rounded-3xl overflow-hidden bg-[#1E1B1D] border transition-all duration-500 hover:-translate-y-2 select-none ${
                    isTabFocused 
                      ? 'border-[#EC407A] ring-2 ring-[#EC407A]/50 shadow-xl shadow-[#EC407A]/25' 
                      : 'border-[#F0E4D8] hover:border-[#EC407A]/70 shadow-sm hover:shadow-2xl hover:shadow-[#C2185B]/20'
                  }`}
                >
                  
                  {/* Background Floral Imagery with Smooth Luxury Zoom */}
                  <div className="absolute inset-0 z-0 overflow-hidden">
                    <img
                      src={col.image}
                      alt={`${col.name} - ${col.tagline || 'Luxury Botanical Collection'} | Dhanvikk Blooms`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = col.fallbackImage;
                      }}
                      className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                      loading="lazy"
                      decoding="async"
                    />

                    {/* Curated Luxury Gradients (Preserves Flower Radiance + Ensures Text Contrast) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#140D10] via-[#140D10]/55 via-45% to-black/25" />
                    
                    {/* Subtle Rose Velvet Hover Glow */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#C2185B]/15 to-[#EC407A]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Atelier Watermark Seal */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-15 transition-opacity duration-700">
                      <Flower2 className="w-36 h-36 text-white" strokeWidth={0.8} />
                    </div>
                  </div>

                  {/* Top Floating Glass Badges */}
                  <div className="relative z-10 p-3.5 sm:p-4 flex items-center justify-between gap-1.5 flex-wrap sm:flex-nowrap">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {/* Atelier Number Badge */}
                      <span className="text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded-full bg-black/55 backdrop-blur-md text-amber-200 border border-amber-300/30 whitespace-nowrap inline-flex items-center">
                        № {col.atelierNo}
                      </span>

                      {/* Haute Status Tag */}
                      <span className={`text-[9.5px] sm:text-[10px] font-bold tracking-wider uppercase px-2 sm:px-2.5 py-0.5 rounded-full shadow-xs bg-gradient-to-r ${col.tagAccent} text-white whitespace-nowrap inline-flex items-center`}>
                        {col.tag}
                      </span>
                    </div>

                    {/* Format Count & Quick Info Icon */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setQuickViewItem(col);
                        }}
                        title="Atelier Specifications"
                        className="w-7 h-7 rounded-full bg-black/45 hover:bg-[#EC407A] text-white/90 hover:text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] font-medium font-mono text-white/90 bg-black/45 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 whitespace-nowrap">
                        {col.count}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Editorial Content Card */}
                  <div className="relative z-10 p-4 sm:p-5 text-white flex flex-col justify-end space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-[#FCC1C5] font-semibold">
                        <Sparkles className="w-3 h-3 text-[#FFB400] flex-shrink-0" />
                        <span className="truncate">{col.desc}</span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold font-['Poppins'] text-white group-hover:text-[#FCC1C5] transition-colors leading-tight">
                        {col.name}
                      </h3>

                      {/* Atelier Craft Snippet */}
                      <p className="text-[11px] text-white/70 line-clamp-1 font-light tracking-wide pt-0.5">
                        {col.specNote}
                      </p>
                    </div>

                    {/* Price & Direct Shop CTA Bar */}
                    <div className="pt-2.5 border-t border-white/15 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-white/60 block">
                          Curations From
                        </span>
                        <span className="text-sm sm:text-base font-extrabold text-white font-mono">
                          {formatPrice(col.startingPriceINR)}
                        </span>
                      </div>

                      <Link
                        to={col.link}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-[#EC407A] text-white text-xs font-semibold backdrop-blur-md border border-white/25 hover:border-[#EC407A] transition-all duration-300 group/btn shadow-xs hover:shadow-md whitespace-nowrap"
                      >
                        <span>Discover</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-white group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>

                  {/* Clickable Card Overlay to Category */}
                  <Link 
                    to={col.link} 
                    className="absolute inset-0 z-5"
                    aria-label={`Explore ${col.name}`}
                  />
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {/* 4. Atelier Pillars of Trust (Elevated Luxury Feature Strip) */}
      <div className="relative z-10 mt-6 sm:mt-8 pt-8 border-t border-[#F4ECE4]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pillar 1 */}
          <div className="group flex items-start gap-3.5 p-4 rounded-2xl bg-white/70 hover:bg-white border border-[#F4ECE4] hover:border-[#EC407A]/40 transition-all duration-300 shadow-xs hover:shadow-md">
            <div className="w-10 h-10 rounded-xl bg-[#FFF3F6] border border-[#EC407A]/25 text-[#EC407A] flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:bg-[#EC407A] group-hover:text-white transition-all duration-300">
              <Truck className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-[#242124] tracking-tight">
                Insulated Cold-Chain Courier
              </h4>
              <p className="text-[11px] text-[#777777] leading-relaxed">
                14°C temperature-controlled transit ensures unblemished dawn freshness.
              </p>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="group flex items-start gap-3.5 p-4 rounded-2xl bg-white/70 hover:bg-white border border-[#F4ECE4] hover:border-[#EC407A]/40 transition-all duration-300 shadow-xs hover:shadow-md">
            <div className="w-10 h-10 rounded-xl bg-[#FFF3F6] border border-[#EC407A]/25 text-[#EC407A] flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:bg-[#EC407A] group-hover:text-white transition-all duration-300">
              <Gift className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-[#242124] tracking-tight">
                Haute Satin Ribbon Packaging
              </h4>
              <p className="text-[11px] text-[#777777] leading-relaxed">
                Embossed Parisian hatboxes, golden seals & handwritten calligraphy card.
              </p>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="group flex items-start gap-3.5 p-4 rounded-2xl bg-white/70 hover:bg-white border border-[#F4ECE4] hover:border-[#EC407A]/40 transition-all duration-300 shadow-xs hover:shadow-md">
            <div className="w-10 h-10 rounded-xl bg-[#FFF3F6] border border-[#EC407A]/25 text-[#EC407A] flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:bg-[#EC407A] group-hover:text-white transition-all duration-300">
              <Flower2 className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-[#242124] tracking-tight">
                100% Farm-Fresh Stem Guarantee
              </h4>
              <p className="text-[11px] text-[#777777] leading-relaxed">
                Grade-A stems direct from verified growers with 7-day vase life assurance.
              </p>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="group flex items-start gap-3.5 p-4 rounded-2xl bg-white/70 hover:bg-white border border-[#F4ECE4] hover:border-[#EC407A]/40 transition-all duration-300 shadow-xs hover:shadow-md">
            <div className="w-10 h-10 rounded-xl bg-[#FFF3F6] border border-[#EC407A]/25 text-[#EC407A] flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:bg-[#EC407A] group-hover:text-white transition-all duration-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-[#242124] tracking-tight">
                Certified Export House
              </h4>
              <p className="text-[11px] text-[#777777] leading-relaxed">
                Official phytosanitary cleared shipments for Dubai, UAE, GCC & global hubs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Quick View Haute Details Modal */}
      {quickViewItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setQuickViewItem(null)}
        >
          <div 
            className="relative w-full max-w-lg bg-[#FFFDF9] rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#F0E4D8] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Close Button */}
            <button
              onClick={() => setQuickViewItem(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#F4ECE4]/80 hover:bg-[#EC407A] hover:text-white text-[#555555] flex items-center justify-center transition-all duration-200"
              aria-label="Close details"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header info */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold font-mono tracking-widest px-2.5 py-0.5 rounded-full bg-[#EC407A]/10 text-[#C2185B] border border-[#EC407A]/25">
                ATELIER FORMAT #{quickViewItem.atelierNo}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/5 text-[#555555]">
                {quickViewItem.count}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-[#242124] font-['Poppins']">
              {quickViewItem.name}
            </h3>
            
            <p className="text-xs text-[#777777] mt-1 mb-4 leading-relaxed">
              {quickViewItem.details}
            </p>

            {/* Highlights Grid */}
            <div className="space-y-2.5 py-3 border-y border-[#F4ECE4] my-4 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-black/5">
                <span className="text-[#888888]">Botanical Cut</span>
                <span className="font-semibold text-[#242124]">{quickViewItem.specNote}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-black/5">
                <span className="text-[#888888]">Signature Varieties</span>
                <span className="font-semibold text-[#242124] text-right">{quickViewItem.popularVibe}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-black/5">
                <span className="text-[#888888]">Expected Freshness</span>
                <span className="font-semibold text-[#059669] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {quickViewItem.vaseLife}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#888888]">Atelier Presentation</span>
                <span className="font-semibold text-[#242124] text-right">{quickViewItem.packaging}</span>
              </div>
            </div>

            {/* Modal Bottom CTA */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-[10px] uppercase text-[#888888] block">Starting from</span>
                <span className="text-lg font-extrabold text-[#C2185B] font-mono">
                  {formatPrice(quickViewItem.startingPriceINR)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={quickViewItem.link}
                  onClick={() => setQuickViewItem(null)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#EC407A] to-[#C2185B] hover:from-[#C2185B] hover:to-[#880E4F] text-white text-xs font-bold transition-all shadow-md shadow-[#EC407A]/25"
                >
                  <span>View All Designs</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
