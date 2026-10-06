import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import SEO from '../../components/common/SEO';
import {
  Heart,
  Star,
  Check,
  Filter,
  SlidersHorizontal,
  ChevronRight,
  Flower2,
} from 'lucide-react';

import AnnouncementBar from '../../components/navigation/AnnouncementBar';
import Navbar from '../../components/navigation/Navbar';
import SubNav from '../../components/navigation/SubNav';
import CartDrawer from '../../components/cart/CartDrawer';
import Button from '../../components/common/Button';
import Breadcrumb from '../../components/common/Breadcrumb';
import Footer from '../../components/navigation/Footer';

import { productService } from '../../services/productService';
import { addItem } from '../../store/slices/cartSlice';
import { toggleWishlist, isProductInWishlist } from '../../store/slices/wishlistSlice';
import { toast } from 'sonner';
import { useCurrency } from '../../context/CurrencyContext';

export default function CategoryPage() {
  const { formatPrice } = useCurrency();
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlower, setSelectedFlower] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('All');
  const [sortBy, setSortBy] = useState('recommended');
  const [addedIds, setAddedIds] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);

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

  useEffect(() => {
    let isMounted = true;
    async function loadCategoryData() {
      try {
        setLoading(true);
        const data = await productService.getAllProducts();
        if (isMounted) setProducts(data);
      } catch (err) {
        console.error('Failed to load category products:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadCategoryData();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Clean title display
  const title = (slug || 'Flowers')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // Filter products by category/slug, flower, price, and search query
  const filteredProducts = products.filter((prod) => {
    // 1. Slug matching (relax if search query is explicitly provided)
    if (slug && slug !== 'flowers' && slug !== 'all' && !searchQuery) {
      const matchFlowerType = prod.flowerType && prod.flowerType.toLowerCase() === slug.toLowerCase();
      const matchCategory = prod.category && prod.category.toLowerCase().includes(slug.toLowerCase().replace(/s$/, ''));
      const matchOccasion = prod.occasion && prod.occasion.toLowerCase().includes(slug.toLowerCase());
      const matchSubCat = prod.subCategory && prod.subCategory.toLowerCase().includes(slug.toLowerCase());
      const matchName = prod.name && prod.name.toLowerCase().includes(slug.toLowerCase());

      if (!matchFlowerType && !matchCategory && !matchOccasion && !matchSubCat && !matchName) {
        return false;
      }
    }

    // 2. Search query matching across name, category, styles, occasions & tags
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        (prod.name && prod.name.toLowerCase().includes(q)) ||
        (prod.category && prod.category.toLowerCase().includes(q)) ||
        (prod.subCategory && prod.subCategory.toLowerCase().includes(q)) ||
        (prod.flowerType && prod.flowerType.toLowerCase().includes(q)) ||
        (prod.occasion && prod.occasion.toLowerCase().includes(q)) ||
        (prod.tag && prod.tag.toLowerCase().includes(q)) ||
        (prod.badge && prod.badge.toLowerCase().includes(q)) ||
        (prod.description && prod.description.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }

    // 3. Flower type filter
    if (selectedFlower !== 'All' && prod.flowerType !== selectedFlower) {
      return false;
    }

    // 4. Price range filter
    if (selectedPrice === 'under-2000' && prod.price >= 2000) return false;
    if (selectedPrice === '2000-4000' && (prod.price < 2000 || prod.price > 4000)) return false;
    if (selectedPrice === 'above-4000' && prod.price <= 4000) return false;

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return 0; // recommended
  });

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
      toast.info('Please sign in to proceed to checkout 🌸');
      navigate('/login', {
        state: { from: { pathname: '/checkout' } },
      });
    } else {
      navigate('/checkout');
    }
  };

  // Structured Data & AEO for Category Page
  const categoryFaqs = useMemo(() => {
    return [
      {
        question: `How fresh are flowers in the Dhanvikk ${title} collection?`,
        answer: `All blooms in our ${title} curation are air-flown fresh daily from high-altitude farms and conditioned in refrigerated cold chains to guarantee maximum vase life and vibrancy.`,
      },
      {
        question: `Do you offer same-day delivery for ${title}?`,
        answer: `Yes, same-day delivery is available for orders placed before 7:00 PM across Bengaluru, with express 2-hour delivery options available at checkout.`,
      },
      {
        question: `Can I include a personalized note with my ${title} gift?`,
        answer: `Every order includes a complimentary custom gift message card printed and nestled inside the luxury floral packaging.`,
      },
    ];
  }, [title]);

  const itemListSchema = useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `${title} Floral Collection | Dhanvikk Blooms`,
      numberOfItems: sortedProducts.length,
      itemListElement: sortedProducts.slice(0, 20).map((p, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: p.name,
        url: `https://dhanvikkexports.com/product/${p.slug || p.id}`,
        image: p.image?.startsWith('http') ? p.image : `https://dhanvikkexports.com${p.image || ''}`,
      })),
    };
  }, [title, sortedProducts]);

  return (
    <>
      <SEO
        title={searchQuery ? `Search Results for "${searchQuery}" | Dhanvikk Blooms` : `${title} Collection | Luxury Flowers Dhanvikk`}
        description={`Explore our luxury ${title} botanical collection. Farm-fresh stems, Parisian velvet hatbox presentations, and same-day doorstep delivery.`}
        canonical={`/category/${slug || 'flowers'}`}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/category/flowers' },
          { name: title, url: `/category/${slug || 'flowers'}` },
        ]}
        faq={categoryFaqs}
        jsonLd={itemListSchema}
        ogImage={sortedProducts[0]?.image || '/dhanvikk-brand-logo.png'}
        ogImageAlt={`${title} Floral Collection - Dhanvikk Blooms`}
      />

      <CartDrawer />

      <div className="min-h-screen bg-[#FFFDF9] text-[#242124] flex flex-col font-['Poppins']">
        <AnnouncementBar />
        <Navbar
          searchQuery={searchQuery}
          onSearch={(q) => {
            if (q && q.trim()) {
              navigate(`/category/${slug || 'flowers'}?q=${encodeURIComponent(q.trim())}`);
            } else {
              navigate(`/category/${slug || 'flowers'}`);
            }
          }}
        />
        <SubNav />

        {/* Category Header Banner */}
        <section className="bg-gradient-to-b from-[#FFF0F4] to-[#FFFDF9] border-b border-[#F7F2ED] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <Breadcrumb
              items={[
                { label: 'Home', path: '/' },
                { label: 'Collections', path: '/category/flowers' },
                { label: title },
              ]}
              className="mb-3"
            />

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold font-['Poppins'] text-[#242124]">
                  {title}
                </h1>
                <p className="text-xs sm:text-sm text-[#777777] mt-1 max-w-xl">
                  Artisanal arrangements hand-tied by master florists with temperature-controlled doorstep delivery.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#777777]">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-[#E9E2E5] rounded-full px-3 py-1.5 text-xs text-[#242124] focus:outline-none focus:border-[#EC407A] cursor-pointer shadow-2xs"
                >
                  <option value="recommended">Featured & Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Content Layout with Sidebar Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filter Sidebar */}
            <aside className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-3xl p-5 border border-[#F7F2ED] shadow-xs space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-[#F7F2ED]">
                  <SlidersHorizontal className="w-4 h-4 text-[#EC407A]" />
                  <span className="text-xs font-bold text-[#242124] uppercase tracking-wider">
                    Filter Selection
                  </span>
                </div>

                {/* Filter: Flower Type */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#242124]">Flower Variety</h4>
                  <div className="space-y-1 text-xs text-[#777777]">
                    {['All', 'Roses', 'Lilies', 'Tulips', 'Peonies', 'Orchids', 'Sunflowers'].map((f) => (
                      <label
                        key={f}
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer hover:bg-[#FFF3F6] transition-colors ${
                          selectedFlower === f ? 'bg-[#FFF3F6] text-[#C2185B] font-semibold' : ''
                        }`}
                      >
                        <span>{f}</span>
                        <input
                          type="radio"
                          name="flowerType"
                          checked={selectedFlower === f}
                          onChange={() => setSelectedFlower(f)}
                          className="accent-[#EC407A]"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Filter: Price Range */}
                <div className="space-y-2 pt-3 border-t border-[#F7F2ED]">
                  <h4 className="text-xs font-bold text-[#242124]">Price Bracket</h4>
                  <div className="space-y-1 text-xs text-[#777777]">
                    {[
                      { label: 'All Prices', val: 'All' },
                      { label: `Under ${formatPrice(2000)}`, val: 'under-2000' },
                      { label: `${formatPrice(2000)} - ${formatPrice(4000)}`, val: '2000-4000' },
                      { label: `Above ${formatPrice(4000)}`, val: 'above-4000' },
                    ].map((p) => (
                      <label
                        key={p.val}
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer hover:bg-[#FFF3F6] transition-colors ${
                          selectedPrice === p.val ? 'bg-[#FFF3F6] text-[#C2185B] font-semibold' : ''
                        }`}
                      >
                        <span>{p.label}</span>
                        <input
                          type="radio"
                          name="priceBracket"
                          checked={selectedPrice === p.val}
                          onChange={() => setSelectedPrice(p.val)}
                          className="accent-[#EC407A]"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Reset Filters */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFlower('All');
                    setSelectedPrice('All');
                  }}
                  className="w-full py-2 rounded-xl border border-[#E9E2E5] text-xs font-semibold text-[#777777] hover:text-[#242124] hover:bg-[#FAF7F2] transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </aside>

            {/* Products Listing Grid */}
            <main className="lg:col-span-3">
              {loading ? (
                <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                  <Flower2 className="w-8 h-8 text-[#EC407A] animate-spin" />
                  <p className="text-xs text-[#777777]">Loading floral creations...</p>
                </div>
              ) : sortedProducts.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-3xl border border-[#F7F2ED] p-8">
                  <Flower2 className="w-12 h-12 text-[#FCC1C5] mx-auto mb-3" />
                  <h3 className="text-base font-bold text-[#242124]">No blooms found for this filter</h3>
                  <p className="text-xs text-[#777777] mt-1 mb-4">
                    Try choosing a different flower variety or price bracket.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedFlower('All');
                      setSelectedPrice('All');
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {sortedProducts.map((product) => {
                    const prodId = product._id || product.id;
                    const isAdded = addedIds.includes(prodId);
                    const displayImage = Array.isArray(product.images)
                      ? product.images[0]
                      : (product.images || product.image);

                    return (
                      <div
                        key={prodId}
                        className="group bg-white rounded-3xl border border-[#F7F2ED] overflow-hidden flex flex-col justify-between hover:shadow-xl hover:shadow-[#EC407A]/10 hover:border-[#FCC1C5] transition-all duration-300"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden bg-[#FAF7F2]">
                          <Link to={`/product/${product.slug || prodId}`}>
                            <img
                              src={displayImage}
                              alt={`${product.name} - Handcrafted ${product.category || 'Luxury Floristry'} | Dhanvikk Blooms`}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                              decoding="async"
                            />
                          </Link>

                          {product.tag && (
                            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#242124]/85 text-white text-[10px] tracking-wider uppercase font-bold">
                              {product.tag}
                            </span>
                          )}

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

                          <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-white/90 text-[10px] text-[#C2185B] font-semibold font-mono">
                            {product.stock > 0 ? `${product.stock} in stock` : 'Restocking Soon'}
                          </span>
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 text-xs text-[#777777] mb-1.5">
                              <Star className="w-3.5 h-3.5 fill-[#FFB400] text-[#FFB400]" />
                              <span className="font-bold text-[#242124]">{product.rating || 4.9}</span>
                              <span>({product.reviewsCount || 42})</span>
                            </div>

                            <Link to={`/product/${product.slug || prodId}`}>
                              <h3 className="font-bold text-[15px] text-[#242124] leading-snug line-clamp-1 group-hover:text-[#EC407A] transition-colors">
                                {product.name}
                              </h3>
                            </Link>

                            <p className="text-xs text-[#777777] line-clamp-2 mt-1 leading-relaxed">
                              {product.description}
                            </p>
                          </div>

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
                  })}
                </div>
              )}
            </main>
          </div>
        </div>

        {/* Haute Couture Master Footer */}
        <Footer />
      </div>
    </>
  );
}
