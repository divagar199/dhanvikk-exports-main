import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Search,
  User,
  ShoppingBag,
  Menu,
  X,
  LogOut,
  Package,
  Shield,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Flower2,
  Tag,
  Star,
  Layers,
  ArrowUpRight,
  ChevronRight,
} from 'lucide-react';
import Logo from '../common/Logo';
import { openCart } from '../../store/slices/cartSlice';
import { logoutUser, logoutImmediate } from '../../store/slices/authSlice';
import { toast } from 'sonner';
import { useCurrency } from '../../context/CurrencyContext';
import { productService } from '../../services/productService';
import { SEARCH_CATEGORIES, TRENDING_SEARCHES } from '../../data/searchIndex';
import { getProductImageUrl } from '../../utils/imageUrl';
import { CountrySelectDialog, CountryFlag, SKIPER_COUNTRIES } from '../v1/skiper20';

export default function Navbar({ onSearch, searchQuery = '' }) {
  const {
    currency,
    setCurrency,
    currencies,
    formatPrice,
    selectedCountry,
    openCurrencyDialog,
    isCurrencyDialogOpen,
    closeCurrencyDialog,
  } = useCurrency();
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(searchQuery || urlQuery);
  const [allProducts, setAllProducts] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isRegionDialogOpen, setIsRegionDialogOpen] = useState(false);

  const currentCountryObj = useMemo(() => {
    return (
      SKIPER_COUNTRIES.find(
        (c) => c.code.toUpperCase() === (selectedCountry || 'AE').toUpperCase()
      ) ||
      SKIPER_COUNTRIES.find((c) => c.currency === currency) ||
      SKIPER_COUNTRIES[0]
    );
  }, [selectedCountry, currency]);

  const searchContainerRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const inputRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items: cartItems } = useSelector((state) => state.cart);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Sync with external searchQuery changes
  useEffect(() => {
    if (searchQuery !== undefined && searchQuery !== query) {
      setQuery(searchQuery);
    }
  }, [searchQuery]);

  // Pre-load products for lightning-fast client-side auto-complete
  useEffect(() => {
    let isMounted = true;
    async function fetchProducts() {
      try {
        const prods = await productService.getAllProducts();
        if (isMounted && Array.isArray(prods)) {
          setAllProducts(prods);
        }
      } catch (err) {
        console.warn('Navbar products fetch note:', err);
      }
    }
    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle outside click to close search suggestions dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target) &&
        (!mobileSearchRef.current || !mobileSearchRef.current.contains(e.target))
      ) {
        setIsSearchFocused(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSearchFocused(false);
        setUserDropdownOpen(false);
      }
    };

    window.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Identify matching categories based on user query
  const matchingCategories = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];
    return SEARCH_CATEGORIES.filter((cat) => {
      return (
        cat.name.toLowerCase().includes(trimmed) ||
        cat.description.toLowerCase().includes(trimmed) ||
        cat.badge.toLowerCase().includes(trimmed) ||
        cat.keywords.some((k) => k.toLowerCase().includes(trimmed) || trimmed.includes(k.toLowerCase()))
      );
    }).slice(0, 3);
  }, [query]);

  // Identify matching product names & attributes
  const matchingProducts = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];
    return allProducts
      .filter((prod) => {
        const name = (prod.name || '').toLowerCase();
        const category = (prod.category || '').toLowerCase();
        const subCategory = (prod.subCategory || '').toLowerCase();
        const flowerType = (prod.flowerType || '').toLowerCase();
        const tag = (prod.tag || '').toLowerCase();
        const occasion = (prod.occasion || '').toLowerCase();
        const description = (prod.description || '').toLowerCase();

        return (
          name.includes(trimmed) ||
          category.includes(trimmed) ||
          subCategory.includes(trimmed) ||
          flowerType.includes(trimmed) ||
          tag.includes(trimmed) ||
          occasion.includes(trimmed) ||
          description.includes(trimmed)
        );
      })
      .slice(0, 5);
  }, [query, allProducts]);

  const totalMatchesCount = matchingCategories.length + matchingProducts.length;

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    setIsSearchFocused(false);
    
    if (onSearch) {
      onSearch(trimmed);
    } else if (trimmed) {
      navigate(`/category/flowers?q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/category/flowers');
    }
  };

  const handleClearSearch = (e) => {
    e.stopPropagation();
    setQuery('');
    if (onSearch) onSearch('');
    inputRef.current?.focus();
  };

  const handleTrendingClick = (term) => {
    setQuery(term);
    setIsSearchFocused(false);
    if (onSearch) {
      onSearch(term);
    } else {
      navigate(`/category/flowers?q=${encodeURIComponent(term)}`);
    }
  };

  const handleCategorySelect = (slug) => {
    setIsSearchFocused(false);
    navigate(`/category/${slug}`);
  };

  const handleProductSelect = (productId) => {
    setIsSearchFocused(false);
    navigate(`/product/${productId}`);
  };

  const handleLogout = async () => {
    sessionStorage.setItem('dhanvikk_logged_out', 'true');
    dispatch(logoutImmediate());
    try {
      await dispatch(logoutUser());
    } catch (e) {
      console.warn('Logout note:', e);
    }
    setUserDropdownOpen(false);
    toast.success('Signed out successfully');
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  return (
    <header className="sticky-mobile-nav sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#F0EBE5] transition-all font-['Poppins'] shadow-2xs">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-6">
        {/* Mobile menu toggle & Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-[#242124] hover:text-[#EC407A] rounded-lg focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>

          <Logo />
        </div>

        {/* Center: Search Bar with Autocomplete Dropdown */}
        <div ref={searchContainerRef} className="relative hidden md:flex flex-1 max-w-md lg:max-w-lg mx-2 lg:mx-6">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888] pointer-events-none" />
            
            <input
              ref={inputRef}
              type="text"
              placeholder="Search luxury flowers, bouquets & gifts..."
              value={query}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => {
                const val = e.target.value;
                setQuery(val);
                if (!isSearchFocused) setIsSearchFocused(true);
                if (onSearch) onSearch(val);
              }}
              className="w-full h-10 pl-10 pr-24 bg-[#FAF7F2] hover:bg-[#F5EFEB] border border-[#E8E1DA] rounded-full text-xs text-[#242124] placeholder:text-[#888888] focus:bg-white focus:outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#C2185B]/10 transition-all shadow-2xs"
            />

            {/* Clear Input Button */}
            {query.trim().length > 0 && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-18 top-1/2 -translate-y-1/2 p-1 text-[#888888] hover:text-[#242124] rounded-full hover:bg-black/5 transition-colors"
                title="Clear query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-full bg-[#242124] hover:bg-[#C2185B] text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              Search
            </button>
          </form>

          {/* Live Search Suggestions & Category Match Dropdown */}
          {isSearchFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-[#F0E4D8] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              
              {/* Case 1: Query is entered (Filter by Categories and Names) */}
              {query.trim().length > 0 ? (
                <div className="max-h-[480px] overflow-y-auto divide-y divide-[#F7F2ED]">
                  
                  {/* Category Matches Section */}
                  {matchingCategories.length > 0 && (
                    <div className="p-3.5 bg-[#FFF9FA]">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#C2185B] mb-2 px-1">
                        <Tag className="w-3.5 h-3.5" />
                        <span>Matching Categories & Collections</span>
                      </div>
                      <div className="space-y-1">
                        {matchingCategories.map((cat) => (
                          <div
                            key={cat.slug}
                            onClick={() => handleCategorySelect(cat.slug)}
                            className="group flex items-center justify-between p-2 rounded-2xl hover:bg-white hover:shadow-xs border border-transparent hover:border-[#FCC1C5] transition-all cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-lg w-7 h-7 flex items-center justify-center rounded-lg bg-[#FFF0F4] border border-[#FCC1C5]/50 flex-shrink-0">
                                {cat.icon}
                              </span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-[#242124] group-hover:text-[#EC407A] transition-colors">
                                    {cat.name}
                                  </span>
                                  <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-[#EC407A]/10 text-[#C2185B]">
                                    {cat.badge}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#777777] line-clamp-1">
                                  {cat.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#EC407A] opacity-0 group-hover:opacity-100 transition-opacity pr-1">
                              <span>Explore</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product Matches Section */}
                  {matchingProducts.length > 0 ? (
                    <div className="p-3.5">
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#777777] mb-2 px-1">
                        <div className="flex items-center gap-1.5">
                          <Flower2 className="w-3.5 h-3.5 text-[#EC407A]" />
                          <span>Matching Floral Curations</span>
                        </div>
                        <span className="text-[10px] text-[#999999] lowercase font-normal">
                          {matchingProducts.length} suggestions
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        {matchingProducts.map((prod) => {
                          const prodId = prod._id || prod.id;
                          const imgUrl = getProductImageUrl(prod.images || prod.image);

                          return (
                            <div
                              key={prodId}
                              onClick={() => handleProductSelect(prodId)}
                              className="group flex items-center justify-between p-2 rounded-2xl hover:bg-[#FFF7F9] border border-transparent hover:border-[#F2D7DE] transition-all cursor-pointer"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <img
                                  src={imgUrl}
                                  alt={`${prod.name} - Luxury ${prod.category || 'Flower Arrangement'}`}
                                  className="w-12 h-12 rounded-xl object-cover border border-[#F0E4D8] flex-shrink-0 group-hover:scale-105 transition-transform"
                                  loading="lazy"
                                  decoding="async"
                                />
                                <div className="min-w-0">
                                  <h4 className="text-xs font-semibold text-[#242124] group-hover:text-[#EC407A] transition-colors truncate">
                                    {prod.name}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] text-[#888888] px-1.5 py-0.2 rounded-md bg-[#FAF7F2] border border-[#EFE7DE]">
                                      {prod.category || 'Luxury Flowers'}
                                    </span>
                                    {prod.rating && (
                                      <span className="flex items-center text-[10px] text-amber-600 font-medium">
                                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 mr-0.5" />
                                        {prod.rating}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right flex-shrink-0 pl-2">
                                <span className="text-xs font-bold text-[#C2185B] font-mono block">
                                  {formatPrice(prod.price)}
                                </span>
                                <span className="text-[9px] text-emerald-600 font-medium block">
                                  Fresh Cut
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : matchingCategories.length === 0 ? (
                    /* No exact match fallback */
                    <div className="p-6 text-center">
                      <Flower2 className="w-8 h-8 text-[#FCC1C5] mx-auto mb-2" />
                      <p className="text-xs font-semibold text-[#242124]">
                        No exact curations found for "{query}"
                      </p>
                      <p className="text-[11px] text-[#888888] mt-1 max-w-xs mx-auto">
                        Try searching by botanical name like <span className="font-semibold text-[#C2185B]">Roses</span>, <span className="font-semibold text-[#C2185B]">Hatboxes</span>, <span className="font-semibold text-[#C2185B]">Orchids</span>, or <span className="font-semibold text-[#C2185B]">Birthday</span>.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
                        {['Roses', 'Flower Boxes', 'Forever Roses', 'Gift Bundles'].map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => handleTrendingClick(item)}
                            className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#FFF3F6] text-[#C2185B] hover:bg-[#EC407A] hover:text-white transition-all"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* View All Search Results Footer */}
                  <div 
                    onClick={handleSearchSubmit}
                    className="p-3 bg-[#FAF7F2] hover:bg-[#FFF3F6] flex items-center justify-between text-xs font-bold text-[#C2185B] cursor-pointer transition-colors"
                  >
                    <span>
                      View all results for "{query}" {totalMatchesCount > 0 ? `(${totalMatchesCount} matches)` : ''}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ) : (
                /* Case 2: Query is empty (Trending Searches & Direct Category Jump) */
                <div className="p-4 space-y-4">
                  {/* Trending Searches */}
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#777777] mb-2 px-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#EC407A]" />
                      <span>Popular Trending Searches</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {TRENDING_SEARCHES.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleTrendingClick(item)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#FAF7F2] hover:bg-[#FFF3F6] text-[#333333] hover:text-[#C2185B] border border-[#EAE2D8] hover:border-[#FCC1C5] transition-all cursor-pointer"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Category Icons */}
                  <div className="pt-3 border-t border-[#F7F2ED]">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#777777] mb-2.5 px-1">
                      <Layers className="w-3.5 h-3.5 text-[#EC407A]" />
                      <span>Explore By Category & Style</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {SEARCH_CATEGORIES.slice(0, 6).map((cat) => (
                        <div
                          key={cat.slug}
                          onClick={() => handleCategorySelect(cat.slug)}
                          className="flex items-center gap-2 p-2 rounded-xl hover:bg-[#FFF3F6] border border-[#F4ECE4] hover:border-[#FCC1C5] transition-all cursor-pointer"
                        >
                          <span className="text-base">{cat.icon}</span>
                          <span className="font-semibold text-[#242124] text-[11px] truncate">
                            {cat.name.split('&')[0]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Action Icons & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          {/* Skiper20 UniSwap Country & Auto-Currency Selector Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsRegionDialogOpen(true);
                openCurrencyDialog();
              }}
              className="luxury-touch-press group inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full bg-[#FAF7F2] hover:bg-white border border-[#E8E1DA] hover:border-[#D0C6BD] text-xs font-semibold text-[#242124] transition-all shadow-2xs hover:shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C2185B]/20"
              title="Select Delivery Region & Auto-change Currency"
              aria-label={`Current delivery region: ${currentCountryObj.name}, currency: ${currency}. Click to change.`}
            >
              <CountryFlag
                code={currentCountryObj.code}
                name={currentCountryObj.name}
                flag={currentCountryObj.flag}
                className="w-5 h-3.5 rounded-[2px] object-cover shrink-0 shadow-2xs"
              />
              <span className="font-bold text-[#242124] group-hover:text-[#C2185B] transition-colors tracking-tight">
                {currency}
              </span>
              <span className="text-[10px] text-[#777777] font-medium hidden md:inline">
                ({currentCountryObj.currencySymbol})
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#888888] group-hover:text-[#242124] transition-transform duration-200 group-hover:translate-y-0.5 flex-shrink-0" />
            </button>
          </div>

          {/* Customer / Admin Dropdown */}
          <div className="relative">
            {isAuthenticated ? (
              <div>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="luxury-touch-press flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-full hover:bg-[#FAF7F2] border border-transparent hover:border-[#E8E1DA] transition-all cursor-pointer"
                >
                  <span className="w-7 h-7 rounded-full bg-[#FFF0F4] border border-[#FCC1C5] text-[#C2185B] flex items-center justify-center font-bold text-xs shadow-2xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                  </span>
                  <span className="hidden sm:inline text-xs font-semibold text-[#242124] max-w-[85px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#888888] transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#F0EBE5] py-2 z-50 animate-modal-pop">
                    <div className="px-4 py-2 border-b border-[#F7F2ED]">
                      <p className="text-xs font-semibold text-[#242124] truncate">{user?.name}</p>
                      <p className="text-[11px] text-[#777777] truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF0F4] text-[#C2185B] uppercase tracking-wider">
                        {user?.role}
                      </span>
                    </div>

                    <Link
                      to="/account"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#242124] hover:bg-[#FFF3F6] hover:text-[#EC407A] transition-colors"
                    >
                      <Package className="w-4 h-4 text-[#777777]" />
                      <span>My Orders & Address</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#C2185B] font-semibold bg-[#FFF3F6]/50 hover:bg-[#FFF3F6] transition-colors"
                      >
                        <Shield className="w-4 h-4 text-[#EC407A]" />
                        <span>Admin Console & Stock</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="luxury-touch-press inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-full text-xs font-semibold text-[#242124] hover:text-[#C2185B] hover:bg-[#FAF7F2] border border-transparent hover:border-[#E8E1DA] transition-all"
              >
                <User className="w-4 h-4 text-[#C2185B]" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}
          </div>

          {/* Cart Drawer Trigger */}
          <button
            type="button"
            onClick={() => dispatch(openCart())}
            className="luxury-touch-press relative inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#242124] hover:bg-[#C2185B] text-white transition-all shadow-2xs hover:shadow-xs cursor-pointer group"
            aria-label="View shopping cart"
          >
            <ShoppingBag className="w-4 h-4 group-hover:scale-105 transition-transform" />
            <span className="text-xs font-semibold hidden sm:inline">Cart</span>
            <span className={`w-5 h-5 rounded-full bg-white text-[#242124] group-hover:text-[#C2185B] text-[11px] font-bold flex items-center justify-center font-mono transition-all ${totalCartCount > 0 ? 'animate-badge-glow' : ''}`}>
              {totalCartCount}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown if toggled */}
      {mobileMenuOpen && (
        <div ref={mobileSearchRef} className="lg:hidden border-t border-[#F7F2ED] bg-white px-4 py-4 space-y-3 max-h-[calc(100dvh-4rem)] overflow-y-auto">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777]" />
            <input
              type="text"
              placeholder="Search flowers, boxes, hampers..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (onSearch) onSearch(e.target.value);
              }}
              className="w-full h-10 pl-10 pr-16 bg-[#FAF7F2] border border-[#E9E2E5] rounded-full text-xs text-[#242124] focus:outline-none focus:border-[#EC407A]"
            />
            {query.trim().length > 0 && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-[#888888]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-full bg-[#242124] text-white text-[10px] font-semibold"
            >
              Go
            </button>
          </form>

          {/* Mobile Live Autocomplete Dropdown (Mercury Flowers Style Search Experience) */}
          {query.trim().length > 0 && (
            <div className="bg-[#FFFDFB] rounded-2xl p-3 border border-[#F0E4D8] space-y-3 max-h-[360px] overflow-y-auto shadow-inner">
              {matchingCategories.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#C2185B] mb-1.5 px-1">
                    <Tag className="w-3 h-3" />
                    <span>Categories & Collections</span>
                  </div>
                  <div className="space-y-1">
                    {matchingCategories.map((cat) => (
                      <div
                        key={cat.slug}
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleCategorySelect(cat.slug);
                        }}
                        className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#EAE4DD] active:bg-[#FFF0F5] transition-colors cursor-pointer shadow-2xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{cat.icon}</span>
                          <span className="text-xs font-semibold text-[#242124]">{cat.name}</span>
                        </div>
                        <span className="text-[10px] text-[#EC407A] font-bold bg-[#EC407A]/10 px-2 py-0.5 rounded-full">
                          {cat.badge}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchingProducts.length > 0 ? (
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#777777] mb-1.5 px-1">
                    <Sparkles className="w-3 h-3 text-[#EC407A]" />
                    <span>Matching Blooms ({matchingProducts.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchingProducts.slice(0, 5).map((prod) => (
                      <div
                        key={prod._id || prod.id}
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleProductSelect(prod._id || prod.id);
                        }}
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-[#EAE4DD] active:bg-[#FFF0F5] transition-colors cursor-pointer shadow-2xs"
                      >
                        <img
                          src={getProductImageUrl(prod.image || prod.images?.[0])}
                          alt={prod.name}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-[#EAE4DD]"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-[#242124] truncate">{prod.name}</h4>
                          <span className="text-xs font-bold text-[#EC407A]">{formatPrice(prod.price)}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#777777] flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : matchingCategories.length === 0 ? (
                <div className="text-center py-4 text-xs text-[#777777]">
                  No bouquets found for "{query}".
                </div>
              ) : null}
            </div>
          )}

          {/* Quick Category Shortcuts on Mobile */}
          <div className="grid grid-cols-2 gap-2 text-xs font-medium pt-2">
            <Link
              to="/category/roses"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-[#FFF3F6] text-[#C2185B] font-semibold text-center"
            >
              🌹 Roses Collection
            </Link>
            <Link
              to="/category/occasions"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-[#FFF3F6] text-[#C2185B] font-semibold text-center"
            >
              🎉 Occasions
            </Link>
            <Link
              to="/category/flower-boxes"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-[#FAF7F2] text-[#242124] text-center"
            >
              🎁 Flower Boxes
            </Link>
            <Link
              to="/category/forever-roses"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-[#FAF7F2] text-[#242124] text-center"
            >
              ✨ Forever Roses
            </Link>
          </div>

          {/* Mobile Currency Switcher */}
          {/* Mobile Skiper20 Region & Currency Button */}
          <div className="pt-3 border-t border-[#F7F2ED] flex items-center justify-between text-xs">
            <span className="text-[#777777] font-medium">Delivery Region:</span>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setIsRegionDialogOpen(true);
                openCurrencyDialog();
              }}
              className="flex items-center gap-2 bg-[#FAF7F2] hover:bg-[#FFF3F6] border border-[#E9E2E5] hover:border-[#FCC1C5] px-3 py-1.5 rounded-xl text-xs font-bold text-[#242124] transition-all cursor-pointer shadow-2xs"
            >
              <CountryFlag
                code={currentCountryObj.code}
                name={currentCountryObj.name}
                flag={currentCountryObj.flag}
                className="w-5 h-3.5 rounded-[2px] object-cover shrink-0 shadow-2xs"
              />
              <span>{currentCountryObj.name.split(' ')[0]}</span>
              <span className="text-[11px] text-[#EC407A] font-extrabold bg-[#FFF0F4] px-1.5 py-0.5 rounded-md">
                {currency}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#777777]" />
            </button>
          </div>
        </div>
      )}

      {/* Skiper20 UniSwap Country & Auto-Currency Selection Dialog */}
      <CountrySelectDialog
        isOpen={isRegionDialogOpen || isCurrencyDialogOpen}
        onClose={() => {
          setIsRegionDialogOpen(false);
          closeCurrencyDialog();
        }}
      />
    </header>
  );
}
