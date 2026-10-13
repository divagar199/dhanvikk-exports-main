import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Heart,
  Star,
  ArrowRight,
  Check,
  Flower2,
  Sparkles,
  Grid,
  Layers,
  ChevronRight,
} from 'lucide-react';
import Button from '../common/Button';
import { addItem } from '../../store/slices/cartSlice';
import { toggleWishlist, isProductInWishlist } from '../../store/slices/wishlistSlice';
import { toast } from 'sonner';
import { useCurrency } from '../../context/CurrencyContext';
import { DEFINED_CATEGORIES } from '../../data/categories';
import { getProductImageUrl } from '../../utils/imageUrl';

// Exclude Flower Boxes, Forever Roses, Plants, and Gift Bundles from main page showcase as requested
const EXCLUDED_CATEGORY_IDS = ['Flower Boxes', 'Forever Roses', 'Plants', 'Gift Bundles'];
const SHOWCASE_CATEGORIES = DEFINED_CATEGORIES.filter(
  (cat) => !EXCLUDED_CATEGORY_IDS.includes(cat.id)
);

const STEM_FILTERS = [
  { id: 'ALL', label: 'All Stems', icon: '🌸' },
  { id: 'ROSES', label: 'Ecuadorian Roses', icon: '🌹' },
  { id: 'TULIPS_LILIES', label: 'Tulips & Lilies', icon: '🌷' },
  { id: 'SUNFLOWERS', label: 'Sunflowers', icon: '🌻' },
  { id: 'SAMEDAY', label: 'Same-Day Delivery', icon: '⚡' },
];

export default function CategorySplitShowcase({ products = [], loading = false }) {
  const { formatPrice } = useCurrency();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);

  const [activeStemFilter, setActiveStemFilter] = useState('ALL');
  const [addedIds, setAddedIds] = useState([]);

  const handleToggleWishlist = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const isSaved = isProductInWishlist(wishlistItems, product);
    dispatch(toggleWishlist(product));
    if (isSaved) {
      toast('Removed from wishlist', { icon: '🤍' });
    } else {
      toast.success(`${product.name} saved to wishlist ❤️`);
    }
  };

  const handleAddToCart = (product) => {
    const prodId = product._id || product.id;
    const cartProduct = {
      id: prodId,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: getProductImageUrl(product.images || product.image),
      category: product.category,
      inStock: (product.stock || 0) > 0,
      stock: product.stock || 20,
    };

    dispatch(addItem(cartProduct));
    setAddedIds((prev) => [...prev, prodId]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== prodId));
    }, 1500);
    toast.success(`Added ${product.name} to cart 🌸`);
  };

  const handleBuyNow = (product) => {
    handleAddToCart(product);
    if (!isAuthenticated) {
      toast.info('Please sign in to proceed to fast checkout & delivery address 🌸');
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  // Helper to categorize products strictly excluding boxes, forever roses, plants, and hampers
  const getProductsForCategory = (catId) => {
    return products.filter((p) => {
      const pCat = (p.category || '').toLowerCase();
      const pSub = (p.subCategory || '').toLowerCase();
      const pName = (p.name || '').toLowerCase();
      const target = catId.toLowerCase();

      // Ensure excluded categories never slip into flowers
      const isExcluded =
        pCat.includes('box') || pSub.includes('box') || pName.includes('box') || pName.includes('hatbox') ||
        pCat.includes('forever') || pSub.includes('glass dome') || pName.includes('forever') || pName.includes('dome') ||
        pCat.includes('plant') || pSub.includes('plant') || pCat.includes('orchid') || pName.includes('plant') ||
        pCat.includes('gift') || pCat.includes('bundle') || pCat.includes('hamper') || pSub.includes('hamper') || pName.includes('bundle');

      if (isExcluded) return false;

      if (target === 'flowers') {
        return (
          pCat === 'flowers' ||
          pCat === 'roses' ||
          pCat === 'bouquets' ||
          (!pCat.includes('traditional') && !pCat.includes('sacred'))
        );
      }
      if (target === 'traditional') {
        return pCat.includes('traditional') || pCat.includes('sacred') || pSub.includes('export') || pName.includes('jasmine') || pName.includes('marigold');
      }

      return pCat === target;
    });
  };

  // Filter fresh flower stems by selected pill
  const filterStemProducts = (prods) => {
    if (activeStemFilter === 'ALL') return prods;
    if (activeStemFilter === 'ROSES') {
      return prods.filter((p) => {
        const n = (p.name || '').toLowerCase();
        const f = (p.flowerType || '').toLowerCase();
        return n.includes('rose') || f.includes('rose');
      });
    }
    if (activeStemFilter === 'TULIPS_LILIES') {
      return prods.filter((p) => {
        const n = (p.name || '').toLowerCase();
        const f = (p.flowerType || '').toLowerCase();
        return n.includes('tulip') || n.includes('lil') || f.includes('tulip') || f.includes('lil');
      });
    }
    if (activeStemFilter === 'SUNFLOWERS') {
      return prods.filter((p) => {
        const n = (p.name || '').toLowerCase();
        const f = (p.flowerType || '').toLowerCase();
        return n.includes('sunflower') || f.includes('sunflower');
      });
    }
    if (activeStemFilter === 'SAMEDAY') {
      return prods.filter((p) => (p.stock || 0) > 0);
    }
    return prods;
  };

  if (loading) {
    return (
      <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
        <Flower2 className="w-9 h-9 text-[#EC407A] animate-spin" />
        <p className="text-sm font-semibold text-[#777777]">Loading defined floral categories & catalog...</p>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-[#F7F2ED]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF0F4] border border-[#FCC1C5] text-[#C2185B] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#EC407A]" />
            <span>Master Floristry Collection</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold font-['Poppins'] text-[#242124]">
            Luxury Roses & Fresh Stems
          </h2>
          <p className="text-xs sm:text-sm text-[#777777] mt-1.5 max-w-2xl leading-relaxed">
            Every bloom is air-shipped in temperature-controlled chambers directly from high-altitude farms in Ecuador, Holland, and Bangalore.
          </p>
        </div>

        <Link
          to="/category/roses"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#EC407A] hover:text-[#C2185B] bg-white px-5 py-2.5 rounded-full border border-[#FCC1C5] hover:shadow-xs transition-all self-start md:self-end"
        >
          <span>Explore All Bouquets</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Fresh Flower Stem Quick Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-8">
        {STEM_FILTERS.map((pill) => {
          const isSelected = activeStemFilter === pill.id;
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => setActiveStemFilter(pill.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-[#EC407A] text-white shadow-md shadow-[#EC407A]/25'
                  : 'bg-white border border-[#E9E2E5] text-[#242124] hover:border-[#FCC1C5] hover:bg-[#FFF3F6]'
              }`}
            >
              <span>{pill.icon}</span>
              <span>{pill.label}</span>
            </button>
          );
        })}
      </div>

      {/* Flagship Curated Floral Showcase (Excluding flower boxes, forever roses, plants, and hampers) */}
      <div className="space-y-16">
        {SHOWCASE_CATEGORIES.map((cat) => {
          const rawCatProducts = getProductsForCategory(cat.id);
          const catProducts = filterStemProducts(rawCatProducts);
          if (rawCatProducts.length === 0) return null;

          // Strictly 2 rows on standard 4-column layout (8 items)
          const visibleProducts = catProducts.slice(0, 8);

          return (
            <div
              key={cat.id}
              id={`category-block-${cat.slug}`}
              className="w-full"
            >
              {/* Product Grid for Fresh Blooms - Strictly 2 Rows */}
              {catProducts.length === 0 ? (
                <div className="py-12 text-center bg-white/70 rounded-2xl p-6 border border-[#F4ECE4]">
                  <Flower2 className="w-8 h-8 text-[#EC407A] mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-semibold text-[#777777]">No stems matching this filter right now.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {visibleProducts.map((product) => renderProductCard(product))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );

  function renderProductCard(product) {
    const prodId = product._id || product.id;
    const isAdded = addedIds.includes(prodId);
    const displayImage = getProductImageUrl(product.images || product.image);
    const discount = product.originalPrice
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

    return (
      <div
        key={prodId}
        className="group bg-white rounded-3xl border border-[#F7F2ED] overflow-hidden flex flex-col justify-between hover:shadow-xl hover:shadow-[#EC407A]/10 hover:border-[#FCC1C5] transition-all duration-300"
      >
        {/* Top Image & Badges */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[#FAF7F2]">
          <Link to={`/product/${product.slug || prodId}`}>
            <img
              src={displayImage}
              alt={`${product.name} - Handcrafted ${product.category || 'Luxury Floristry'} | Dhanvikk Blooms`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80';
              }}
            />
          </Link>

          {/* Tag Badge */}
          {product.tag && (
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#242124]/85 text-white text-[10px] tracking-wider uppercase font-bold">
              {product.tag}
            </span>
          )}

          {/* Category Tag Top Right */}
          <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-white/90 text-[10px] text-[#242124] font-semibold shadow-xs">
            {product.category || 'Luxury'}
          </span>

          {/* Wishlist Button */}
          {(() => {
            const inWishlist = isProductInWishlist(wishlistItems, product);
            return (
              <button
                type="button"
                onClick={(e) => handleToggleWishlist(e, product)}
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

          {/* Stock Level Indicator */}
          <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-white/90 text-[10px] text-[#C2185B] font-semibold font-mono">
            {(product.stock || 0) > 0 ? `${product.stock} in stock` : 'Restocking Soon'}
          </span>
        </div>

        {/* Card Body */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* Rating */}
            <div className="flex items-center gap-1.5 text-xs text-[#777777] mb-1.5">
              <div className="flex items-center text-[#FFB400]">
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="font-bold text-[#242124]">{product.rating || 4.9}</span>
              <span>({product.reviewsCount || 48})</span>
              <span className="mx-1">•</span>
              <span className="text-[10px] text-emerald-600 font-semibold">Same-Day</span>
            </div>

            {/* Title */}
            <Link to={`/product/${product.slug || prodId}`}>
              <h4 className="font-bold text-[15px] text-[#242124] leading-snug line-clamp-1 group-hover:text-[#EC407A] transition-colors">
                {product.name}
              </h4>
            </Link>

            {/* Description */}
            <p className="text-xs text-[#777777] line-clamp-2 mt-1 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Pricing and Action Buttons */}
          <div className="mt-4 pt-3 border-t border-[#F7F2ED]">
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-lg font-bold text-[#242124] font-mono">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-[#777777] line-through font-mono">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {discount > 0 && (
                <span className="text-[11px] font-bold text-emerald-600">
                  Save {discount}%
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleAddToCart(product)}
                className="h-10 text-xs font-semibold"
              >
                {isAdded ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600">
                    <Check className="w-3.5 h-3.5" /> Added
                  </span>
                ) : (
                  'Add to Cart'
                )}
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => handleBuyNow(product)}
                className="h-10 text-xs font-semibold"
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
