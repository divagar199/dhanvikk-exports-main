import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Sprout, 
  Sun, 
  Droplets, 
  Wind, 
  Star, 
  ShoppingBag, 
  Check, 
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Heart
} from 'lucide-react';
import { addItem } from '../../store/slices/cartSlice';
import { toggleWishlist, isProductInWishlist } from '../../store/slices/wishlistSlice';
import { toast } from 'sonner';
import { useCurrency } from '../../context/CurrencyContext';

export const BOTANICAL_PLANTS = [
  {
    id: 'plant-monstera',
    name: 'Monstera Deliciosa (Swiss Cheese Plant)',
    category: 'Statement Foliage',
    filter: 'air-purifying',
    tag: 'NASA CERTIFIED',
    tagColor: 'bg-emerald-600 text-white',
    price: 1999,
    originalPrice: 2499,
    rating: 4.9,
    reviews: 64,
    light: 'Bright Indirect',
    water: 'Once Weekly',
    benefit: 'High Oxygen Producer',
    desc: 'Lush tropical split-leaf beauty potted in a matte ceramic planter with natural moss pole support.',
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'plant-fiddle-leaf',
    name: 'Fiddle Leaf Fig (Ficus Lyrata)',
    category: 'Architectural Indoor',
    filter: 'statement',
    tag: 'BEST SELLER',
    tagColor: 'bg-[#C2185B] text-white',
    price: 2499,
    originalPrice: 3199,
    rating: 4.9,
    reviews: 82,
    light: 'Filtered Sun',
    water: 'Every 8-10 Days',
    benefit: 'Architectural Elegance',
    desc: 'Grand sculptural violin-shaped foliage potted in hand-finished terracotta urn with drainage saucer.',
    image: 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'plant-snake-plant',
    name: 'Sansevieria Laurentii (Snake Plant)',
    category: 'Low Maintenance',
    filter: 'easy-care',
    tag: '24H OXYGEN',
    tagColor: 'bg-emerald-700 text-white',
    price: 999,
    originalPrice: 1299,
    rating: 5.0,
    reviews: 110,
    light: 'Any Light / Low',
    water: 'Every 2 Weeks',
    benefit: 'Absorbs Toxins',
    desc: 'Vertical golden-bordered spears. Unbeatable bedroom air cleaner and nearly indestructible.',
    image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'plant-peace-lily',
    name: 'Spathiphyllum Deluxe (Peace Lily)',
    category: 'Flowering Houseplant',
    filter: 'air-purifying',
    tag: 'AIR PURIFIER',
    tagColor: 'bg-teal-700 text-white',
    price: 1299,
    originalPrice: 1699,
    rating: 4.8,
    reviews: 53,
    light: 'Medium / Indirect',
    water: 'When Top Soil Dries',
    benefit: 'Humidity Balancer',
    desc: 'Deep glossy foliage crowned with pure white porcelain spathes that bloom for months.',
    image: 'https://images.unsplash.com/photo-1517191434949-5e90cd67d2b6?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'plant-bonsai-ficus',
    name: 'Ginseng Ficus Microcarpa Bonsai',
    category: 'Artisanal Living Art',
    filter: 'bonsai-vastu',
    tag: '8-YEAR AGED',
    tagColor: 'bg-[#B45309] text-white',
    price: 3499,
    originalPrice: 4299,
    rating: 4.9,
    reviews: 41,
    light: 'Bright Light',
    water: 'Twice Weekly',
    benefit: 'Zen & Focus',
    desc: 'Sculptural exposed root system with thick canopy cultivated by master bonsai artisans.',
    image: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'plant-money-tree',
    name: 'Pachira Aquatica (Money Tree Bonsai)',
    category: 'Prosperity & Vastu',
    filter: 'bonsai-vastu',
    tag: 'VASTU AUSPICIOUS',
    tagColor: 'bg-emerald-600 text-white',
    price: 1899,
    originalPrice: 2299,
    rating: 5.0,
    reviews: 79,
    light: 'Indirect Sun',
    water: 'Weekly',
    benefit: 'Wealth & Serenity',
    desc: 'Five-stem braided trunk representing elements of balance and financial abundance.',
    image: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'plant-areca-palm',
    name: 'Chrysalidocarpus (Areca Butterfly Palm)',
    category: 'Tropical Statement',
    filter: 'statement',
    tag: 'TROPICAL OASIS',
    tagColor: 'bg-emerald-800 text-white',
    price: 1699,
    originalPrice: 2099,
    rating: 4.8,
    reviews: 38,
    light: 'Bright Filtered',
    water: 'Keep Moist',
    benefit: 'Natural Humidifier',
    desc: 'Graceful feathery fountain fronds that bring a resort-like tropical serenity indoors.',
    image: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'plant-succulent-bowl',
    name: 'Artisan Haworthia & Jade Succulent Urn',
    category: 'Desktop Greenery',
    filter: 'easy-care',
    tag: 'EASY CARE',
    tagColor: 'bg-stone-700 text-white',
    price: 899,
    originalPrice: 1199,
    rating: 4.9,
    reviews: 67,
    light: 'Partial Sun / Desk',
    water: 'Every 20 Days',
    benefit: 'Drought Tolerant',
    desc: 'Curated constellation of zebra haworthias and miniature jade plants with volcanic river pebbles.',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80'
  }
];

export default function BotanicalPlantsSection() {
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState('all');
  const [addedIds, setAddedIds] = useState([]);
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);

  const handleToggleWishlist = (e, plant) => {
    e.preventDefault();
    e.stopPropagation();
    const isSaved = isProductInWishlist(wishlistItems, plant);
    dispatch(toggleWishlist(plant));
    if (isSaved) {
      toast('Removed from wishlist', { icon: '🤍' });
    } else {
      toast.success(`${plant.name} saved to wishlist ❤️`);
    }
  };

  const filteredPlants = activeTab === 'all'
    ? BOTANICAL_PLANTS
    : BOTANICAL_PLANTS.filter(p => p.filter === activeTab);

  const handleAddToCart = (plant) => {
    dispatch(addItem({
      _id: plant.id,
      id: plant.id,
      name: plant.name,
      price: plant.price,
      originalPrice: plant.originalPrice,
      image: plant.image,
      category: 'plants',
      quantity: 1,
    }));

    setAddedIds(prev => [...prev, plant.id]);
    toast.success(`Added ${plant.name} to cart 🪴`);

    setTimeout(() => {
      setAddedIds(prev => prev.filter(id => id !== plant.id));
    }, 2500);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full font-['Poppins']">
      {/* 1. Header with Badge & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10 pb-4 border-b border-[#F4ECE4]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2 shadow-2xs">
            <Sprout className="w-3.5 h-3.5 text-emerald-600" />
            <span>Botanical Living Greens</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1E2319] tracking-tight">
            Air-Purifying & Vastu Indoor Plants
          </h2>

          <p className="text-xs sm:text-sm text-[#777777] mt-1.5 max-w-xl leading-relaxed">
            Curated lush indoor foliage, auspicious bonsais, and architectural statement planters potted in artisanal ceramic urns with guaranteed root vitality.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/category/plants"
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-400 text-xs font-bold text-emerald-900 transition-all shadow-xs hover:shadow-md"
          >
            <span>View All Living Plants</span>
            <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* 2. Filter Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
        {[
          { id: 'all', label: 'All Plants' },
          { id: 'air-purifying', label: 'Air Purifying (NASA)' },
          { id: 'bonsai-vastu', label: 'Bonsai & Vastu Prosper' },
          { id: 'easy-care', label: 'Easy Care & Low Light' },
          { id: 'statement', label: 'Statement Architectural' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-[#555555] hover:bg-emerald-50/60 border border-[#EBE3DC]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Plants Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredPlants.map((plant) => {
          const isAdded = addedIds.includes(plant.id);
          const discount = Math.round(((plant.originalPrice - plant.price) / plant.originalPrice) * 100);

          return (
            <div
              key={plant.id}
              className="group bg-white rounded-3xl border border-[#EFE9E4] overflow-hidden flex flex-col justify-between hover:shadow-xl hover:shadow-emerald-900/10 hover:border-emerald-300 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Top Plant Image with Badges */}
              <div className="relative aspect-[4/3] overflow-hidden bg-[#F6F8F5]">
                <img
                  src={plant.image}
                  alt={`${plant.name} - Living Botanical Plant in Ceramic Planter | Dhanvikk Blooms`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                  loading="lazy"
                  decoding="async"
                />

                {/* Highlight Tag */}
                <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-xs backdrop-blur-xs ${plant.tagColor}`}>
                  {plant.tag}
                </span>

                {/* Wishlist Button */}
                {(() => {
                  const inWishlist = isProductInWishlist(wishlistItems, plant);
                  return (
                    <button
                      type="button"
                      onClick={(e) => handleToggleWishlist(e, plant)}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-xs z-10 cursor-pointer ${
                        inWishlist
                          ? 'bg-white text-[#E11D48] shadow-md ring-1 ring-red-200 scale-105'
                          : 'bg-white/90 text-[#777777] hover:text-[#E11D48] hover:bg-white'
                      }`}
                      aria-label={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
                      title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
                    >
                      <Heart
                        className={`w-4 h-4 transition-all duration-200 ${
                          inWishlist ? 'fill-[#E11D48] text-[#E11D48] scale-110' : ''
                        }`}
                      />
                    </button>
                  );
                })()}

                {/* Pot Included Badge */}
                <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] text-white font-medium">
                  Ceramic Pot Included
                </span>
              </div>

              {/* Plant Details & Care Specs */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  {/* Rating & Care Spec Badges */}
                  <div className="flex items-center justify-between text-xs text-[#777777] mb-2">
                    <div className="flex items-center gap-1 text-[#FFB400]">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="font-bold text-[#242124]">{plant.rating}</span>
                      <span className="text-[11px] text-[#888888]">({plant.reviews})</span>
                    </div>

                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {plant.benefit}
                    </span>
                  </div>

                  {/* Plant Title */}
                  <h3 className="font-bold text-[15px] text-[#242124] leading-snug line-clamp-1 group-hover:text-emerald-700 transition-colors">
                    {plant.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-[#777777] line-clamp-2 mt-1 leading-relaxed">
                    {plant.desc}
                  </p>

                  {/* Care Strip: Light & Water */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#F4ECE4] text-[11px] text-[#555555]">
                    <div className="flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <span className="truncate">{plant.light}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                      <span className="truncate">{plant.water}</span>
                    </div>
                  </div>
                </div>

                {/* Price & Action Button */}
                <div className="mt-4 pt-3 border-t border-[#F4ECE4]">
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-lg font-bold text-[#242124] font-mono">
                      {formatPrice(plant.price)}
                    </span>
                    <span className="text-xs text-[#777777] line-through font-mono">
                      {formatPrice(plant.originalPrice)}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600">
                      Save {discount}%
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddToCart(plant)}
                    className="w-full h-10 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-98"
                  >
                    {isAdded ? (
                      <span className="inline-flex items-center gap-1 text-emerald-200">
                        <Check className="w-4 h-4" /> Added to Cart
                      </span>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add Living Plant</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Plant Guarantee & Health Assurance Banner */}
      <div className="mt-10 rounded-2xl bg-gradient-to-r from-[#F0FDF4] via-[#F4FBF7] to-[#ECFDF5] border border-emerald-100 p-5 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="flex flex-col items-center">
          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1.5">
            <Sprout className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-[#242124]">Pot & Soil Included</span>
          <span className="text-[11px] text-[#666666]">Premium aerated organic blend</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1.5">
            <Wind className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-[#242124]">NASA Air-Clean Certified</span>
          <span className="text-[11px] text-[#666666]">Purifies VOCs & carbon indoor</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-[#242124]">30-Day Root Guarantee</span>
          <span className="text-[11px] text-[#666666]">Free replacement if roots fail</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1.5">
            <Droplets className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-[#242124]">Zero-Shock Transit</span>
          <span className="text-[11px] text-[#666666]">Climate-safe hydration packaging</span>
        </div>
      </div>
    </section>
  );
}
