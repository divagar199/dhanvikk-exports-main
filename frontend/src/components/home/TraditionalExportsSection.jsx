import React, { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import official Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { 
  ChevronLeft, 
  ChevronRight, 
  ShoppingBag, 
  MessageCircle, 
  Check, 
  Flame, 
  Plane,
  X,
  Building2
} from 'lucide-react';
import { addItem } from '../../store/slices/cartSlice';
import { toast } from 'sonner';
import { useCurrency } from '../../context/CurrencyContext';
import { getProductImageUrl } from '../../utils/imageUrl';

export const PROMO_EXPORT_PRODUCTS = [
  {
    id: 'promo-jasmine-string',
    name: 'Jasmine String',
    pricePerKg: 650,
    originalPricePerKg: 800,
    priceAEDPerKg: 30,
    originalAEDPerKg: 38,
    discount: '18% OFF',
    tag: 'BESTSELLER EXPORT',
    image: '/images/exports/jasmine-string.webp',
  },
  {
    id: 'promo-mullai',
    name: 'Mullai',
    pricePerKg: 550,
    originalPricePerKg: 700,
    priceAEDPerKg: 25,
    originalAEDPerKg: 32,
    discount: '21% OFF',
    tag: 'FARM FRESH',
    image: '/images/exports/mullai.webp',
  },
  {
    id: 'promo-lotus',
    name: 'Lotus',
    pricePerKg: 450,
    originalPricePerKg: 550,
    priceAEDPerKg: 20,
    originalAEDPerKg: 26,
    discount: '18% OFF',
    tag: 'SACRED GRADE',
    image: '/images/exports/lotus.webp',
  },
  {
    id: 'promo-marigold',
    name: 'Marigold',
    pricePerKg: 180,
    originalPricePerKg: 250,
    priceAEDPerKg: 9,
    originalAEDPerKg: 12,
    discount: '28% OFF',
    tag: 'BULK FAVORITE',
    image: '/images/exports/marigold.webp',
  },
  {
    id: 'promo-cut-roses',
    name: 'Cut Roses',
    pricePerKg: 480,
    originalPricePerKg: 600,
    priceAEDPerKg: 22,
    originalAEDPerKg: 28,
    discount: '20% OFF',
    tag: 'PREMIUM STEMS',
    image: '/images/exports/cut-roses.webp',
  },
  {
    id: 'promo-loose-chrysanthemum',
    name: 'Loose Chrysanthemum',
    pricePerKg: 240,
    originalPricePerKg: 320,
    priceAEDPerKg: 12,
    originalAEDPerKg: 16,
    discount: '25% OFF',
    tag: 'PUJA SPECIAL',
    image: '/images/exports/loose-chrysanthemum.webp',
  },
  {
    id: 'promo-betel-leaf',
    name: 'Betel Leaf',
    pricePerKg: 320,
    originalPricePerKg: 400,
    priceAEDPerKg: 15,
    originalAEDPerKg: 19,
    discount: '20% OFF',
    tag: 'FRESH HARVEST',
    image: '/images/exports/betel-leaf.webp',
  },
  {
    id: 'promo-garland',
    name: 'Garland',
    pricePerKg: 850,
    originalPricePerKg: 1100,
    priceAEDPerKg: 38,
    originalAEDPerKg: 50,
    discount: '22% OFF',
    tag: 'CEREMONIAL',
    image: '/images/exports/garland.webp',
  },
  {
    id: 'promo-coconut-leaf-basket',
    name: 'Hand Made Coconut Leaf Basket',
    pricePerKg: 350,
    originalPricePerKg: 450,
    priceAEDPerKg: 16,
    originalAEDPerKg: 21,
    discount: '22% OFF',
    tag: 'ECO ARTISAN',
    image: '/images/exports/coconut-leaf-basket.webp',
  },
];

export default function TraditionalExportsSection() {
  const { currency, formatPrice } = useCurrency();
  const [addedIds, setAddedIds] = useState([]);
  const [inquiryModalItem, setInquiryModalItem] = useState(null);
  const [bulkQty, setBulkQty] = useState('25');
  const [destination, setDestination] = useState('Dubai / UAE');

  const swiperInstanceRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const dispatch = useDispatch();

  const handleAddToCart = (product) => {
    dispatch(
      addItem({
        id: product.id,
        name: `${product.name} (1 kg)`,
        price: product.pricePerKg,
        originalPrice: product.originalPricePerKg,
        image: product.image,
        category: 'Export Promotions',
        inStock: true,
        stock: 100,
      })
    );

    setAddedIds((prev) => [...prev, product.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== product.id));
    }, 1500);

    toast.success(`Added ${product.name} (1 kg) to cart 🌸`);
  };

  const handleSendWhatsAppInquiry = (product) => {
    const unitPrice =
      currency === 'AED'
        ? `${product.priceAEDPerKg} AED/kg`
        : currency === 'INR'
        ? `₹${product.pricePerKg}/kg`
        : `${formatPrice(product.pricePerKg)}/kg`;
    const message = encodeURIComponent(
      `Hello Dhanvikk Blooms! I am interested in an EXPORT / BULK ORDER:\n\n` +
      `📦 Product: ${product.name}\n` +
      `🏷️ Promo Rate: ${unitPrice}\n` +
      `⚖️ Estimated Quantity: ${bulkQty} kg\n` +
      `✈️ Destination: ${destination}\n\n` +
      `Please provide cargo availability, flight schedule & best bulk quote.`
    );
    window.open(`https://wa.me/919108916328?text=${message}`, '_blank');
    setInquiryModalItem(null);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Promotion Header Strip */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-[#C2185B] text-xs font-bold uppercase tracking-wider mb-2">
            <Flame className="w-3.5 h-3.5 text-[#EC407A]" />
            <span>Export Bulk Deals • Special Promotion</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-['Poppins'] text-[#242124]">
            Export Promotions & Bulk Wholesale
          </h2>
          <p className="text-xs sm:text-sm text-[#777777] mt-1">
            Exclusive wholesale rates per kg • Daily chilled air-cargo supply for UAE, GCC & global bulk buyers
          </p>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-1.5 self-start md:self-end">
          <button
            type="button"
            onClick={() => swiperInstanceRef.current?.slidePrev()}
            disabled={isBeginning}
            className={`w-9 h-9 rounded-full border border-[#E9E2E5] flex items-center justify-center transition-all ${
              !isBeginning
                ? 'bg-white hover:bg-[#FFF3F6] hover:border-[#FCC1C5] text-[#242124] shadow-xs hover:scale-105 cursor-pointer'
                : 'bg-white/50 text-gray-300 border-gray-100 cursor-not-allowed'
            }`}
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => swiperInstanceRef.current?.slideNext()}
            disabled={isEnd}
            className={`w-9 h-9 rounded-full border border-[#E9E2E5] flex items-center justify-center transition-all ${
              !isEnd
                ? 'bg-white hover:bg-[#FFF3F6] hover:border-[#FCC1C5] text-[#242124] shadow-xs hover:scale-105 cursor-pointer'
                : 'bg-white/50 text-gray-300 border-gray-100 cursor-not-allowed'
            }`}
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Official Swiper Component */}
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
          spaceBetween={20}
          slidesPerView={1.15}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          breakpoints={{
            540: {
              slidesPerView: 1.8,
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 2.6,
              spaceBetween: 24,
            },
            1024: {
              slidesPerView: 3.5,
              spaceBetween: 24,
            },
            1280: {
              slidesPerView: 4,
              spaceBetween: 24,
            },
          }}
          pagination={{
            clickable: true,
            el: '.exports-custom-pagination',
            bulletClass: 'inline-block w-2 h-2 rounded-full bg-gray-300 transition-all cursor-pointer mx-1',
            bulletActiveClass: '!w-7 !bg-[#C2185B] !rounded-full',
          }}
          className="py-2 pb-6"
        >
          {PROMO_EXPORT_PRODUCTS.map((product) => {
            const isAdded = addedIds.includes(product.id);
            const currentPrice =
              currency === 'AED'
                ? `${product.priceAEDPerKg} AED`
                : currency === 'INR'
                ? `₹${product.pricePerKg}`
                : formatPrice(product.pricePerKg);
            const originalPrice =
              currency === 'AED'
                ? `${product.originalAEDPerKg} AED`
                : currency === 'INR'
                ? `₹${product.originalPricePerKg}`
                : formatPrice(product.originalPricePerKg);

            return (
              <SwiperSlide key={product.id} className="h-auto">
                <div className="h-full bg-white rounded-3xl border border-[#F2ECE6] overflow-hidden flex flex-col justify-between hover:shadow-xl hover:shadow-[#C2185B]/10 hover:border-[#FCC1C5] transition-all duration-300 group select-none">
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-[#FAF7F2]">
                    <img
                      src={getProductImageUrl(product.image)}
                      alt={`${product.name} - GI-Tagged Temple & Export Flower per KG | Dhanvikk Blooms`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />

                    {/* Promo Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-[#C2185B] text-white shadow-xs">
                        {product.tag}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#C2185B] border border-[#FCC1C5] shadow-xs">
                        {product.discount}
                      </span>
                    </div>

                    {/* Cargo badge */}
                    <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-medium backdrop-blur-xs flex items-center gap-1">
                      <Plane className="w-3 h-3 text-rose-300" /> Air Cargo
                    </span>
                  </div>

                  {/* Product Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-[#242124] font-['Poppins'] line-clamp-1 group-hover:text-[#C2185B] transition-colors">
                        {product.name}
                      </h3>

                      {/* Price per KG */}
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-xl sm:text-2xl font-black text-[#242124] font-mono">
                          {currentPrice}
                        </span>
                        <span className="text-xs font-semibold text-[#888888] font-sans">
                          / kg
                        </span>
                        <span className="text-xs text-[#999999] line-through font-mono ml-auto">
                          {originalPrice}
                        </span>
                      </div>
                    </div>

                    {/* Selling Actions: Add to Cart & Bulk Inquire */}
                    <div className="grid grid-cols-2 gap-2 mt-5 pt-3 border-t border-[#F7F2ED]">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        className={`h-10 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isAdded
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                            : 'bg-[#FAF7F2] hover:bg-[#F3EDE4] text-[#242124] border border-[#E9E2E5]'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5 text-[#C2185B]" />
                            <span>Add Cart</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setInquiryModalItem(product)}
                        className="h-10 px-2 rounded-xl text-xs font-semibold bg-[#C2185B] hover:bg-[#A01346] text-white transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Bulk Inquire</span>
                      </button>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Custom Pagination Indicator Dots */}
        <div className="exports-custom-pagination flex items-center justify-center mt-3" />
      </div>

      {/* Clean Bulk Inquiry Modal */}
      {inquiryModalItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/20 relative animate-in fade-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setInquiryModalItem(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-[#242124] flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  src={getProductImageUrl(inquiryModalItem.image)}
                  alt={`${inquiryModalItem.name} - Wholesale Export Flower Cargo | Dhanvikk Blooms`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#C2185B] uppercase tracking-wider">
                  Bulk Export Order
                </span>
                <h3 className="text-lg font-bold text-[#242124]">
                  {inquiryModalItem.name}
                </h3>
                <p className="text-xs font-mono font-bold text-[#242124]">
                  {currency === 'AED'
                    ? `${inquiryModalItem.priceAEDPerKg} AED/kg`
                    : currency === 'INR'
                    ? `₹${inquiryModalItem.pricePerKg}/kg`
                    : `${formatPrice(inquiryModalItem.pricePerKg)}/kg`}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Estimated Quantity:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['10 kg', '25 kg', '50 kg', '100+ kg'].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setBulkQty(q.replace(' kg', '').replace('+', ''))}
                      className={`py-2 rounded-lg text-center font-bold border transition-all cursor-pointer ${
                        bulkQty === q.replace(' kg', '').replace('+', '')
                          ? 'bg-[#C2185B] text-white border-[#C2185B]'
                          : 'bg-[#FAF7F2] text-[#242124] border-gray-200 hover:border-[#FCC1C5]'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Destination:
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-[#FAF7F2] text-xs font-medium focus:outline-hidden focus:border-[#C2185B]"
                >
                  <option value="Dubai / UAE">Dubai / UAE (DXB Chilled Air Cargo)</option>
                  <option value="Abu Dhabi / UAE">Abu Dhabi / UAE (AUH Cargo)</option>
                  <option value="Oman">Oman (Muscat MCT / Salalah Cargo)</option>
                  <option value="Singapore">Singapore (SIN Changi Direct Dispatch)</option>
                  <option value="Malaysia">Malaysia (KUL Direct ASEAN Cargo)</option>
                  <option value="Sri Lanka">Sri Lanka (CMB Colombo Cargo)</option>
                  <option value="Europe">Europe (Amsterdam AMS / Paris CDG / Frankfurt)</option>
                  <option value="United Kingdom">United Kingdom (London Heathrow)</option>
                  <option value="USA">USA (Chilled Cargo)</option>
                  <option value="India Domestic">India Domestic (Cold-Chain)</option>
                </select>
              </div>

              <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100 flex items-center gap-2 text-[11px] text-[#C2185B]">
                <Building2 className="w-4 h-4 flex-shrink-0" />
                <span>Custom phytosanitary certificate & temperature logs provided with export dispatch.</span>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={() => handleSendWhatsAppInquiry(inquiryModalItem)}
                className="w-full py-3 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#20ba59] text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send Bulk Export Inquiry via WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleAddToCart(inquiryModalItem);
                  setInquiryModalItem(null);
                }}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-[#242124] transition-all cursor-pointer"
              >
                Add 1 kg Sample to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
