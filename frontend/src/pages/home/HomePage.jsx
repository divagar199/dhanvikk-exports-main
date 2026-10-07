import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Heart,
  Star,
  Truck,
  ShieldCheck,
  Flower2,
  ArrowRight,
  Check,
  Clock,
  Award,
  Gift,
  CheckCircle2,
  ChevronRight,
  Flame,
  Search,
  X,
  SlidersHorizontal,
} from 'lucide-react';

import SEO from '../../components/common/SEO';
import FaqAndGeoSection, { STORE_FAQS } from '../../components/home/FaqAndGeoSection';
import AnnouncementBar from '../../components/navigation/AnnouncementBar';
import Navbar from '../../components/navigation/Navbar';
import SubNav from '../../components/navigation/SubNav';
import CartDrawer from '../../components/cart/CartDrawer';
import Button from '../../components/common/Button';
import GiftsForEveryoneSection from '../../components/home/GiftsForEveryoneSection';
import CuratedCollectionsSection from '../../components/home/CuratedCollectionsSection';
import TraditionalExportsSection from '../../components/home/TraditionalExportsSection';
import GlobalServiceableCountries from '../../components/home/GlobalServiceableCountries';
import HauteFloristryPromise from '../../components/home/HauteFloristryPromise';
import BotanicalPlantsSection from '../../components/home/BotanicalPlantsSection';
import PreciousOccasionsSection from '../../components/home/PreciousOccasionsSection';
import CategorySplitShowcase from '../../components/home/CategorySplitShowcase';
import TestimonialsSwiper from '../../components/home/TestimonialsSwiper';
import Footer from '../../components/navigation/Footer';

import { productService } from '../../services/productService';
import { addItem } from '../../store/slices/cartSlice';
import { toast } from 'sonner';
import { useCurrency } from '../../context/CurrencyContext';
import { Carousel_005, SwiperSlide } from '../../components/v1/skiper51';
import { Sparkles, Zap } from 'lucide-react';
import { getProductImageUrl } from '../../utils/imageUrl';

export default function HomePage() {
  const { formatPrice } = useCurrency();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategoryFilter, setSearchCategoryFilter] = useState('All');
  const [addedIds, setAddedIds] = useState([]);
  const searchResultsRef = useRef(null);

  // Dynamic Hero Section CMS Settings (Managed via Admin Dashboard -> Hero Section)
  const [heroSettings, setHeroSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('dhanvikk_hero_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      badge: 'Spring Floristry Edit 2026',
      headline: 'Elegance In Every Petal.',
      subHeadline: 'Delivered Today.',
      description: 'Directly imported highland Ecuadorian roses & exotic lilies, crafted by master florists with complimentary handwritten cards.',
      buttonText: 'Shop Spring Roses',
      buttonLink: '/category/roses',
      secondaryButtonText: 'Browse Occasions',
      secondaryButtonLink: '/category/occasions',
      imageUrl: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=85',
    };
  });

  // Listen for admin changes to hero settings
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('dhanvikk_hero_settings');
        if (saved) setHeroSettings(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated } = useSelector((state) => state.auth);

  // Fetch products from MongoDB API
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const data = await productService.getAllProducts();
        if (isMounted) {
          setProducts(data);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = (q) => {
    setSearchQuery(q);
    setSearchCategoryFilter('All');
    if (q && q.trim()) {
      setTimeout(() => {
        searchResultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  // Comprehensive filter matching across names, categories, styles, tags, and occasions
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;

    return products.filter((prod) => {
      const name = (prod.name || '').toLowerCase();
      const category = (prod.category || '').toLowerCase();
      const subCategory = (prod.subCategory || '').toLowerCase();
      const flowerType = (prod.flowerType || '').toLowerCase();
      const tag = (prod.tag || '').toLowerCase();
      const badge = (prod.badge || '').toLowerCase();
      const occasion = (prod.occasion || '').toLowerCase();
      const description = (prod.description || '').toLowerCase();

      return (
        name.includes(q) ||
        category.includes(q) ||
        subCategory.includes(q) ||
        flowerType.includes(q) ||
        tag.includes(q) ||
        badge.includes(q) ||
        occasion.includes(q) ||
        description.includes(q)
      );
    });
  }, [products, searchQuery]);

  // Available categories within the filtered search results
  const availableSearchCategories = useMemo(() => {
    if (!searchQuery.trim() || filteredProducts.length === 0) return [];
    const cats = new Set(['All']);
    filteredProducts.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [searchQuery, filteredProducts]);

  // Final displayed products after category refinement
  const displayedSearchResults = useMemo(() => {
    if (searchCategoryFilter === 'All') return filteredProducts;
    return filteredProducts.filter((p) => p.category === searchCategoryFilter);
  }, [filteredProducts, searchCategoryFilter]);

  const handleAddToCart = (product) => {
    const cartProduct = {
      id: product._id || product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: Array.isArray(product.images) ? product.images[0] : (product.images || product.image),
      category: product.category,
      inStock: product.stock > 0,
      stock: product.stock,
    };

    dispatch(addItem(cartProduct));
    setAddedIds((prev) => [...prev, cartProduct.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== cartProduct.id));
    }, 1500);
    toast.success(`Added ${product.name} to cart 🌸`);
  };

  const handleBuyNow = (product) => {
    handleAddToCart(product);
    if (!isAuthenticated) {
      toast.info('Please sign in to confirm delivery address & pay securely via Razorpay 🌸');
      navigate('/login', {
        state: { from: { pathname: '/checkout' } },
      });
    } else {
      navigate('/checkout');
    }
  };

  return (
    <>
      <SEO
        title="Dhanvikk Blooms | Luxury Flowers, Bouquets & Gifting Atelier"
        description="Handcrafted luxury flower arrangements, Ecuadorian roses, Parisian velvet hatboxes, preserved forever roses, and celebration gift boxes with same-day temperature-controlled delivery across Bengaluru & international cold-chain air cargo."
        canonical="/"
        faq={STORE_FAQS}
        ogImage="/dhanvikk-brand-logo.png"
        ogImageAlt="Dhanvikk Blooms Luxury Florist Atelier Logo"
      />

      {/* Slide-over Cart Drawer */}
      <CartDrawer />

      <div className="min-h-screen bg-[#FFFDF9] text-[#242124] flex flex-col font-['Poppins']">
        {/* 1. Dhanvikk Blooms Announcement Bar */}
        <AnnouncementBar />

        {/* 2. Main Storefront Navbar */}
        <Navbar onSearch={handleSearch} searchQuery={searchQuery} />

        {/* 3. Sub-Nav Bar (Flowers, Occasion, Gift Bundles, Flower Boxes, Plants, Forever Roses - NO CAKES) */}
        <SubNav />
         {/* 8. Live Best Sellers & Defined Categories Split Catalog */}
         {/* Live Search Results Section (Shown dynamically when a search query is entered) */}
        {searchQuery.trim() && (
          <section
            id="search-results"
            ref={searchResultsRef}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full animate-in fade-in slide-in-from-top-4 duration-300 scroll-mt-24"
          >
            <div className="bg-gradient-to-br from-[#FFF5F7] via-[#FFFDF9] to-[#FAF7F2] border border-[#F2D7DE] rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F4ECE4]">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EC407A]/10 text-[#C2185B] text-xs font-bold uppercase tracking-wider">
                    <Search className="w-3.5 h-3.5 text-[#EC407A]" />
                    <span>Live Search Filter</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#242124]">
                    Curations matching <span className="text-[#EC407A]">"{searchQuery}"</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-[#777777]">
                    Found <span className="font-bold text-[#242124]">{displayedSearchResults.length}</span> {displayedSearchResults.length === 1 ? 'curation' : 'curations'} matching your query
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSearchCategoryFilter('All');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-[#FFF0F4] border border-[#FCC1C5] text-xs font-bold text-[#C2185B] transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear Search</span>
                  </button>
                </div>
              </div>

              {/* Matched Categories Filter Chips */}
              {availableSearchCategories.length > 1 && (
                <div className="py-4 flex items-center gap-2 overflow-x-auto scrollbar-none border-b border-[#F4ECE4]/60">
                  <span className="text-xs text-[#888888] font-semibold whitespace-nowrap flex items-center gap-1">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Filter by Category:</span>
                  </span>
                  {availableSearchCategories.map((cat) => {
                    const count = cat === 'All' 
                      ? filteredProducts.length 
                      : filteredProducts.filter((p) => p.category === cat).length;
                    const isSelected = searchCategoryFilter === cat;

                    return (
                      <button
                        key={cat}
                        onClick={() => setSearchCategoryFilter(cat)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#EC407A] text-white shadow-xs scale-102'
                            : 'bg-white hover:bg-[#FFF3F6] text-[#555555] hover:text-[#EC407A] border border-[#EAE2D8]'
                        }`}
                      >
                        <span>{cat}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-[#F2ECE6] text-[#777777]'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Product Results Grid */}
              {displayedSearchResults.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-6">
                  {displayedSearchResults.map((product) => {
                    const prodId = product._id || product.id;
                    const imgUrl = getProductImageUrl(product.images || product.image);
                    const isAdded = addedIds.includes(prodId);

                    return (
                      <div
                        key={prodId}
                        className="group flex flex-col justify-between bg-white rounded-2xl sm:rounded-3xl border border-[#F4ECE4] hover:border-[#EC407A]/50 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden"
                      >
                        <div className="relative aspect-square overflow-hidden bg-[#FAF7F2]">
                          <img
                            src={imgUrl}
                            alt={`${product.name} - Luxury ${product.category || 'Flower Arrangement'} | Dhanvikk Blooms`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                            decoding="async"
                          />
                          {product.tag && (
                            <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#242124]/85 backdrop-blur-xs text-white text-[10px] font-bold tracking-wider uppercase">
                              {product.tag}
                            </span>
                          )}
                          <Link to={`/product/${prodId}`} className="absolute inset-0 z-5" />
                        </div>

                        <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[#EC407A] block truncate">
                              {product.category || 'Luxury Floristry'}
                            </span>
                            <Link to={`/product/${prodId}`}>
                              <h3 className="text-xs sm:text-sm font-bold text-[#242124] hover:text-[#EC407A] transition-colors line-clamp-1">
                                {product.name}
                              </h3>
                            </Link>
                          </div>

                          <div className="pt-2 border-t border-[#F7F2ED] flex items-center justify-between gap-1">
                            <div>
                              <span className="text-sm sm:text-base font-extrabold text-[#C2185B] font-mono">
                                {formatPrice(product.price)}
                              </span>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-[11px] text-[#999999] line-through font-mono ml-1.5 hidden sm:inline">
                                  {formatPrice(product.originalPrice)}
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAddToCart(product)}
                              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                isAdded
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-[#EC407A] hover:bg-[#C2185B] text-white shadow-xs'
                              }`}
                            >
                              {isAdded ? 'Added ✓' : 'Add'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center space-y-3">
                  <Flower2 className="w-12 h-12 text-[#FCC1C5] mx-auto" />
                  <h3 className="text-base font-bold text-[#242124]">
                    No curations found in category "{searchCategoryFilter}" for "{searchQuery}"
                  </h3>
                  <p className="text-xs text-[#777777] max-w-sm mx-auto">
                    Try switching back to "All Categories" or search for broader botanical names like "Roses", "Bouquets", or "Hatboxes".
                  </p>
                  <button
                    onClick={() => setSearchCategoryFilter('All')}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#EC407A] hover:bg-[#C2185B] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <span>View All Matching Items ({filteredProducts.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              </div>
            </section>
          )}

        {/* 4. Editorial Hero Banners (Dhanvikk 3-Column Layout) */}
        {/* 4. Editorial Hero Banners (Dhanvikk 3-Place Layout with Skiper51 Creative Carousels) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            {/* Primary Left Main Banner (Place 1) - Skiper51 Creative Carousel */}
            <div className="lg:col-span-8 relative rounded-3xl overflow-hidden shadow-sm border border-[#F7F2ED] min-h-[400px] sm:min-h-[460px] bg-white">
              <Carousel_005
                autoplayDelay={5000}
                showNavigation={true}
                showPagination={true}
                className="h-full rounded-3xl overflow-hidden"
              >
                {/* Place 1 - Slide 1 (Exact User Design & Dynamic CMS Settings) */}
                <SwiperSlide className="w-full h-full">
                  <div className="relative w-full h-full bg-gradient-to-r from-[#FFF0F4] via-[#FFF8F9] to-[#FAF7F2] flex items-center p-6 sm:p-12 overflow-hidden">
                    <div className="relative z-10 max-w-lg space-y-4">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 border border-[#FCC1C5] text-[#C2185B] text-xs font-bold tracking-wider uppercase shadow-2xs">
                        <Flame className="w-3.5 h-3.5 text-[#EC407A]" />
                        <span>{heroSettings.badge || 'Spring Floristry Edit 2026'}</span>
                      </div>

                      <h1 className="text-3xl sm:text-5xl font-bold font-['Poppins'] text-[#242124] leading-[1.15]">
                        {heroSettings.headline || 'Elegance In Every Petal.'} <br />
                        <span className="text-[#EC407A] italic font-normal">{heroSettings.subHeadline || 'Delivered Today.'}</span>
                      </h1>

                      <p className="text-xs sm:text-sm text-[#777777] font-normal leading-relaxed">
                        {heroSettings.description || 'Directly imported highland Ecuadorian roses & exotic lilies, crafted by master florists with complimentary handwritten cards.'}
                      </p>

                      <div className="pt-2 flex flex-wrap items-center gap-3">
                        <Link
                          to={heroSettings.buttonLink || '/category/roses'}
                          className="px-6 py-3 rounded-full bg-[#EC407A] hover:bg-[#C2185B] text-white text-xs sm:text-sm font-semibold transition-all shadow-md hover:shadow-lg hover:shadow-[#EC407A]/25 flex items-center gap-2 group"
                        >
                          <span>{heroSettings.buttonText || 'Shop Spring Roses'}</span>
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>

                        <Link
                          to={heroSettings.secondaryButtonLink || '/category/occasions'}
                          className="px-6 py-3 rounded-full bg-white hover:bg-[#FFF3F6] text-[#EC407A] hover:text-[#C2185B] text-xs sm:text-sm font-semibold border border-[#E9E2E5] transition-all"
                        >
                          <span>{heroSettings.secondaryButtonText || 'Browse Occasions'}</span>
                        </Link>
                      </div>
                    </div>

                    <div className="hidden sm:block absolute right-0 bottom-0 top-0 w-2/5 pointer-events-none">
                      <img
                        src={heroSettings.imageUrl || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=85'}
                        alt="Dhanvikk Blooms Luxury Fresh Rose Arrangements Handcrafted by Master Florists"
                        className="w-full h-full object-cover rounded-l-full shadow-lg border-l-4 border-white opacity-95"
                        loading="lazy"
                        decoding="async"
                        width="800"
                        height="600"
                      />
                    </div>
                  </div>
                </SwiperSlide>

                {/* Place 1 - Slide 2 (New Stock Arrival Promotion) */}
                <SwiperSlide className="w-full h-full">
                  <div className="relative w-full h-full bg-gradient-to-r from-[#FFF5F8] via-[#FFF9FA] to-[#F7F3EE] flex items-center p-6 sm:p-12 overflow-hidden">
                    <div className="relative z-10 max-w-lg space-y-4">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 border border-[#FCC1C5] text-[#C2185B] text-xs font-bold tracking-wider uppercase shadow-2xs">
                        <Sparkles className="w-3.5 h-3.5 text-[#EC407A]" />
                        <span>New Harvest Arrival 2026</span>
                      </div>

                      <h2 className="text-3xl sm:text-5xl font-bold font-['Poppins'] text-[#242124] leading-[1.15]">
                        Royal Imperial Orchids & <br />
                        <span className="text-[#C2185B] italic font-normal">Exotic Garden Lilies.</span>
                      </h2>

                      <p className="text-xs sm:text-sm text-[#777777] font-normal leading-relaxed">
                        Chilled morning cargo air-flown directly from high-altitude estates across India & Ecuador. Limited farm-fresh harvest available today.
                      </p>

                      <div className="pt-2 flex flex-wrap items-center gap-3">
                        <Link
                          to="/category/flowers"
                          className="px-6 py-3 rounded-full bg-[#EC407A] hover:bg-[#C2185B] text-white text-xs sm:text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2 group"
                        >
                          <span>Explore New Harvest</span>
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>

                        <Link
                          to="/category/all"
                          className="px-6 py-3 rounded-full bg-white hover:bg-[#FFF3F6] text-[#EC407A] hover:text-[#C2185B] text-xs sm:text-sm font-semibold border border-[#E9E2E5] transition-all"
                        >
                          <span>Curated Bouquets</span>
                        </Link>
                      </div>
                    </div>

                    <div className="hidden sm:block absolute right-0 bottom-0 top-0 w-2/5 pointer-events-none">
                      <img
                        src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=85"
                        alt="Royal Imperial Orchids and Garden Lilies New Stock"
                        className="w-full h-full object-cover rounded-l-full shadow-lg border-l-4 border-white opacity-95"
                        loading="lazy"
                        decoding="async"
                        width="800"
                        height="600"
                      />
                    </div>
                  </div>
                </SwiperSlide>

                {/* Place 1 - Slide 3 (Midnight Romance & Grand Celebration Promotion) */}
                <SwiperSlide className="w-full h-full">
                  <div className="relative w-full h-full bg-gradient-to-r from-[#FFF0F4] via-[#FDF5F8] to-[#F5ECE8] flex items-center p-6 sm:p-12 overflow-hidden">
                    <div className="relative z-10 max-w-lg space-y-4">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 border border-[#FCC1C5] text-[#C2185B] text-xs font-bold tracking-wider uppercase shadow-2xs">
                        <Zap className="w-3.5 h-3.5 text-[#EC407A]" />
                        <span>Signature Romance Edit</span>
                      </div>

                      <h2 className="text-3xl sm:text-5xl font-bold font-['Poppins'] text-[#242124] leading-[1.15]">
                        Grand 100-Stem Crimson Passion. <br />
                        <span className="text-[#EC407A] italic font-normal">Midnight Surprise Delivery.</span>
                      </h2>

                      <p className="text-xs sm:text-sm text-[#777777] font-normal leading-relaxed">
                        Turn extraordinary moments into unforgettable memories with our signature Parisian velvet wrapping and embossed gold wax seal.
                      </p>

                      <div className="pt-2 flex flex-wrap items-center gap-3">
                        <Link
                          to="/category/roses"
                          className="px-6 py-3 rounded-full bg-[#EC407A] hover:bg-[#C2185B] text-white text-xs sm:text-sm font-semibold transition-all shadow-md hover:shadow-lg hover:shadow-[#EC407A]/25 flex items-center gap-2 group"
                        >
                          <span>Shop Grand Bouquets</span>
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>

                        <Link
                          to="/category/gifts"
                          className="px-6 py-3 rounded-full bg-white hover:bg-[#FFF3F6] text-[#EC407A] hover:text-[#C2185B] text-xs sm:text-sm font-semibold border border-[#E9E2E5] transition-all"
                        >
                          <span>Reserve Gift Bundles</span>
                        </Link>
                      </div>
                    </div>

                    <div className="hidden sm:block absolute right-0 bottom-0 top-0 w-2/5 pointer-events-none">
                      <img
                        src="https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=800&q=85"
                        alt="Signature Grand Crimson Velvet 100 Stems Arrangement"
                        className="w-full h-full object-cover rounded-l-full shadow-lg border-l-4 border-white opacity-95"
                        loading="lazy"
                        decoding="async"
                        width="800"
                        height="600"
                      />
                    </div>
                  </div>
                </SwiperSlide>
              </Carousel_005>
            </div>

            {/* Right Side Editorial Pair (Places 2 & 3) */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {/* Place 2: Velvet Flower Boxes Carousel (Top Right Card) */}
              <div className="rounded-3xl overflow-hidden border border-[#F7F2ED] shadow-sm h-1/2 min-h-[210px] bg-white">
                <Carousel_005
                  autoplayDelay={4200}
                  showNavigation={false}
                  showPagination={true}
                  className="h-full"
                >
                  {/* Place 2 - Slide 1 (Exact User Design: Velvet Flower Boxes) */}
                  <SwiperSlide className="w-full h-full">
                    <Link
                      to="/category/flower-boxes"
                      className="group relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#FFF3F6] via-[#FFF8FA] to-[#FAF7F2] p-6 flex flex-col justify-between h-full w-full select-none"
                    >
                      <div className="relative z-10 space-y-1">
                        <span className="text-[10px] font-bold text-[#C2185B] uppercase tracking-wider bg-white/90 px-2.5 py-0.5 rounded-full inline-block shadow-2xs">
                          SAVE UP TO 20%
                        </span>
                        <h3 className="text-xl font-bold font-['Poppins'] text-[#242124]">
                          Velvet Flower Boxes
                        </h3>
                        <p className="text-xs text-[#777777]">Signature Parisian hatboxes filled with garden blooms</p>
                      </div>

                      <div className="relative z-10 flex items-center text-xs font-bold text-[#EC407A] group-hover:text-[#C2185B] gap-1">
                        <span>Explore Boxes</span>
                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>

                      <img
                        src="https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=400&q=80"
                        alt="Signature Velvet Flower Box Parisian Hatbox Floral Arrangement"
                        className="absolute right-0 bottom-0 w-36 h-36 object-cover rounded-tl-full opacity-90 group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                        width="144"
                        height="144"
                      />
                    </Link>
                  </SwiperSlide>

                  {/* Place 2 - Slide 2 (New Stock: Crystal Acrylic Cases) */}
                  <SwiperSlide className="w-full h-full">
                    <Link
                      to="/category/flower-boxes"
                      className="group relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#FFF8F2] via-[#FFF3EC] to-[#FAF7F2] p-6 flex flex-col justify-between h-full w-full select-none"
                    >
                      <div className="relative z-10 space-y-1">
                        <span className="text-[10px] font-bold text-[#C2185B] uppercase tracking-wider bg-white/90 px-2.5 py-0.5 rounded-full inline-block shadow-2xs">
                          NEW ARRIVAL 2026
                        </span>
                        <h3 className="text-xl font-bold font-['Poppins'] text-[#242124]">
                          Crystal Acrylic Cases
                        </h3>
                        <p className="text-xs text-[#777777]">Glass-clear displays with secret pull-out keepsake drawer</p>
                      </div>

                      <div className="relative z-10 flex items-center text-xs font-bold text-[#EC407A] group-hover:text-[#C2185B] gap-1">
                        <span>Shop Acrylic Boxes</span>
                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>

                      <img
                        src="https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=400&q=80"
                        alt="Luxury Acrylic Bloom Case with Keepsake Drawer"
                        className="absolute right-0 bottom-0 w-36 h-36 object-cover rounded-tl-full opacity-90 group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                        width="144"
                        height="144"
                      />
                    </Link>
                  </SwiperSlide>

                  {/* Place 2 - Slide 3 (Limited Edition: Heart Parisian Bloom Tins) */}
                  <SwiperSlide className="w-full h-full">
                    <Link
                      to="/category/flower-boxes"
                      className="group relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#FAF0F8] via-[#FFF3FA] to-[#FAF7F2] p-6 flex flex-col justify-between h-full w-full select-none"
                    >
                      <div className="relative z-10 space-y-1">
                        <span className="text-[10px] font-bold text-[#C2185B] uppercase tracking-wider bg-white/90 px-2.5 py-0.5 rounded-full inline-block shadow-2xs">
                          LIMITED HARVEST
                        </span>
                        <h3 className="text-xl font-bold font-['Poppins'] text-[#242124]">
                          Heart Parisian Tins
                        </h3>
                        <p className="text-xs text-[#777777]">Velvet heart-shaped boxes with scented morning garden roses</p>
                      </div>

                      <div className="relative z-10 flex items-center text-xs font-bold text-[#EC407A] group-hover:text-[#C2185B] gap-1">
                        <span>Shop Limited Hearts</span>
                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>

                      <img
                        src="https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=400&q=80"
                        alt="Heart Parisian Bloom Velvet Tins Limited Harvest"
                        className="absolute right-0 bottom-0 w-36 h-36 object-cover rounded-tl-full opacity-90 group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                        width="144"
                        height="144"
                      />
                    </Link>
                  </SwiperSlide>
                </Carousel_005>
              </div>

              {/* Place 3: Preserved Forever Domes Carousel (Bottom Right Card) */}
              <div className="rounded-3xl overflow-hidden border border-[#F7F2ED] shadow-sm h-1/2 min-h-[210px] bg-white">
                <Carousel_005
                  autoplayDelay={4700}
                  showNavigation={false}
                  showPagination={true}
                  className="h-full"
                >
                  {/* Place 3 - Slide 1 (Exact User Design: Preserved Forever Domes) */}
                  <SwiperSlide className="w-full h-full">
                    <Link
                      to="/category/forever-roses"
                      className="group relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#FAF7F2] via-[#FFFDF9] to-[#F5EFE8] p-6 flex flex-col justify-between h-full w-full select-none"
                    >
                      <div className="relative z-10 space-y-1">
                        <span className="text-[10px] font-bold text-[#242124] uppercase tracking-wider bg-white/90 px-2.5 py-0.5 rounded-full inline-block shadow-2xs">
                          LASTS 3+ YEARS
                        </span>
                        <h3 className="text-xl font-bold font-['Poppins'] text-[#242124]">
                          Preserved Forever Domes
                        </h3>
                        <p className="text-xs text-[#777777]">Natural Ecuadorian roses in luxury glass bell domes</p>
                      </div>

                      <div className="relative z-10 flex items-center text-xs font-bold text-[#242124] group-hover:text-[#EC407A] gap-1">
                        <span>Shop Forever Roses</span>
                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>

                      <img
                        src="https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=400&q=80"
                        alt="Preserved Forever Roses in Crystal Bell Dome Lasting 3 Years"
                        className="absolute right-0 bottom-0 w-36 h-36 object-cover rounded-tl-full opacity-90 group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                        width="144"
                        height="144"
                      />
                    </Link>
                  </SwiperSlide>

                  {/* Place 3 - Slide 2 (New Luxury Stock: 24K Gold-Dipped Roses) */}
                  <SwiperSlide className="w-full h-full">
                    <Link
                      to="/category/forever-roses"
                      className="group relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#FFFDF0] via-[#FDF8E4] to-[#FAF7F2] p-6 flex flex-col justify-between h-full w-full select-none"
                    >
                      <div className="relative z-10 space-y-1">
                        <span className="text-[10px] font-bold text-[#C2185B] uppercase tracking-wider bg-white/90 px-2.5 py-0.5 rounded-full inline-block shadow-2xs">
                          AUTHENTIC 24K GOLD
                        </span>
                        <h3 className="text-xl font-bold font-['Poppins'] text-[#242124]">
                          24K Gold-Dipped Roses
                        </h3>
                        <p className="text-xs text-[#777777]">Real Ecuadorian roses hand-dipped in authentic 24K gold</p>
                      </div>

                      <div className="relative z-10 flex items-center text-xs font-bold text-[#C2185B] group-hover:text-[#EC407A] gap-1">
                        <span>Explore Gold Roses</span>
                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>

                      <img
                        src="https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=400&q=80"
                        alt="24K Gold Dipped Forever Rose Keepsake in Luxury Velvet Case"
                        className="absolute right-0 bottom-0 w-36 h-36 object-cover rounded-tl-full opacity-90 group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                        width="144"
                        height="144"
                      />
                    </Link>
                  </SwiperSlide>

                  {/* Place 3 - Slide 3 (New Ambient Bestseller: Celestial Fairy LED Domes) */}
                  <SwiperSlide className="w-full h-full">
                    <Link
                      to="/category/forever-roses"
                      className="group relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#F4F1FA] via-[#FAF7FD] to-[#FAF7F2] p-6 flex flex-col justify-between h-full w-full select-none"
                    >
                      <div className="relative z-10 space-y-1">
                        <span className="text-[10px] font-bold text-[#242124] uppercase tracking-wider bg-white/90 px-2.5 py-0.5 rounded-full inline-block shadow-2xs">
                          FAIRY LED AMBIENT
                        </span>
                        <h3 className="text-xl font-bold font-['Poppins'] text-[#242124]">
                          Celestial Glowing Domes
                        </h3>
                        <p className="text-xs text-[#777777]">Warm starlight illumination woven with everlasting preserved roses</p>
                      </div>

                      <div className="relative z-10 flex items-center text-xs font-bold text-[#242124] group-hover:text-[#EC407A] gap-1">
                        <span>View Glowing Domes</span>
                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>

                      <img
                        src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80"
                        alt="Celestial Fairy LED Illuminated Preserved Roses in Dome"
                        className="absolute right-0 bottom-0 w-36 h-36 object-cover rounded-tl-full opacity-90 group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                        width="144"
                        height="144"
                      />
                    </Link>
                  </SwiperSlide>
                </Carousel_005>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Key Metrics / Trust Strip */}
        <section className="bg-white border-y border-[#F7F2ED] py-6 px-4 sm:px-6 lg:px-8 my-4">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-black text-[#EC407A] font-mono">50K+</span>
              <span className="text-xs font-semibold text-[#242124] mt-0.5">Happy Clients</span>
              <span className="text-[11px] text-[#777777]">Across UAE & India</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-black text-[#EC407A] font-mono">99.8%</span>
              <span className="text-xs font-semibold text-[#242124] mt-0.5">On-Time Dispatches</span>
              <span className="text-[11px] text-[#777777]">Temperature Controlled</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-black text-[#EC407A] font-mono">24H</span>
              <span className="text-xs font-semibold text-[#242124] mt-0.5">Freshness Guarantee</span>
              <span className="text-[11px] text-[#777777]">Direct Farm Harvest</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-black text-[#EC407A] font-mono">500+</span>
              <span className="text-xs font-semibold text-[#242124] mt-0.5">Bespoke Designs</span>
              <span className="text-[11px] text-[#777777]">Master Florists</span>
            </div>
          </div>
        </section>
        {/* 7.6. Global Serviceable Countries Marquee Ticker (USA, UK, UAE, Canada, Russia, Singapore, Malaysia, Australia) */}
        <GlobalServiceableCountries />

        {/* 6.5. Gifts for Everyone (By Recipient 3D Avatars) */}
        <GiftsForEveryoneSection />

        {/* 7.5. Highlighted Heritage & Sacred Floral Exports (9 Highlighted Items) */}
        <TraditionalExportsSection />

        {/* 10. Haute Floristry Promise - 3 Zigzag Editorial Sections with Indian Visuals */}
        <HauteFloristryPromise />

        {/* 7. Curated Collections - Haute Floristry Formats */}
        <CuratedCollectionsSection />
        

       
         {/* 9. Flowers For Every Precious Occasion - Exact Reference Design with Themed Pastel Cards */}
        <PreciousOccasionsSection />

        {/* 9.5. Living Botanical Plants & Indoor Greens Section */}
        <BotanicalPlantsSection />

        

        {/* 10.5 Botanical FAQ & Geographic Service Corridors (AEO & GEO Powerhouse) */}
        <FaqAndGeoSection />

        {/* 11. Customer Testimonials Swiper Carousel */}
        <TestimonialsSwiper />

        {/* 12. Haute Couture Master Footer */}
        <Footer />
      </div>
    </>
  );
}
