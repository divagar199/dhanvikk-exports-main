import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import SEO from '../../components/common/SEO';
import {
  Heart,
  Star,
  Truck,
  ShieldCheck,
  Calendar,
  Clock,
  MessageSquare,
  Check,
  ArrowRight,
  ChevronRight,
  Flower2,
  Share2,
} from 'lucide-react';

import AnnouncementBar from '../../components/navigation/AnnouncementBar';
import Navbar from '../../components/navigation/Navbar';
import SubNav from '../../components/navigation/SubNav';
import CartDrawer from '../../components/cart/CartDrawer';
import Button from '../../components/common/Button';
import Breadcrumb from '../../components/common/Breadcrumb';
import Footer from '../../components/navigation/Footer';

import { productService } from '../../services/productService';
import { addItem, openCart } from '../../store/slices/cartSlice';
import { toggleWishlist, isProductInWishlist } from '../../store/slices/wishlistSlice';
import { toast } from 'sonner';
import { useCurrency } from '../../context/CurrencyContext';

export default function ProductDetailPage() {
  const { formatPrice } = useCurrency();
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const inWishlist = isProductInWishlist(wishlistItems, product);

  const handleToggleWishlist = () => {
    if (!product) return;
    const isSaved = isProductInWishlist(wishlistItems, product);
    dispatch(toggleWishlist(product));
    if (isSaved) {
      toast('Removed from wishlist', { icon: '🤍' });
    } else {
      toast.success(`${product.name} saved to wishlist ❤️`);
    }
  };

  // Delivery configuration states
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [deliverySlot, setDeliverySlot] = useState('Standard (2:00 PM - 6:00 PM)');
  const [cardMessage, setCardMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadProduct() {
      try {
        setLoading(true);
        const data = await productService.getProductByIdOrSlug(id);
        if (isMounted) {
          setProduct(data);
          setActiveImageIndex(0);
        }
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const images = useMemo(() => {
    if (!product) {
      return ['https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80'];
    }
    return Array.isArray(product.images)
      ? product.images
      : typeof product.images === 'string' && product.images.includes(' ')
      ? product.images.split(' ')
      : [product.images || product.image || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80'];
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    const cartItem = {
      id: product._id || product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: images[0],
      deliveryDate,
      deliverySlot,
      cardMessage,
      senderName,
      inStock: product.stock > 0,
      stock: product.stock,
    };

    dispatch(addItem(cartItem));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    toast.success(`Added ${product.name} to cart 🌸`);
  };

  const handleInstantBuy = () => {
    handleAddToCart();
    if (!isAuthenticated) {
      toast.info('Please sign in to proceed to Razorpay checkout 🌸');
      navigate('/login', {
        state: { from: { pathname: '/checkout' } },
      });
    } else {
      navigate('/checkout');
    }
  };

  // Schema.org Product, Offer & AggregateRating for Search & Answer Engines
  const productSchema = useMemo(() => {
    if (!product) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: images.map((img) =>
        img.startsWith('http') ? img : `https://dhanvikkexports.com${img}`
      ),
      description: product.description,
      sku: product.id || product._id,
      mpn: product.id || product._id,
      brand: {
        '@type': 'Brand',
        name: 'Dhanvikk Blooms',
      },
      category: product.category,
      offers: {
        '@type': 'Offer',
        url: `https://dhanvikkexports.com/product/${product.slug || product.id}`,
        priceCurrency: 'INR',
        price: product.price,
        priceValidUntil: '2027-12-31',
        availability:
          product.stock > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: {
          '@type': 'Organization',
          name: 'Dhanvikk Blooms And Exports',
        },
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating || 4.9,
        reviewCount: product.reviewsCount || 48,
        bestRating: 5,
        worstRating: 1,
      },
    };
  }, [product, images]);

  const productFaqs = useMemo(() => {
    if (!product) return [];
    return [
      {
        question: `How should I care for ${product.name} to maximize freshness?`,
        answer:
          product.specifications?.careGuide ||
          'Keep arrangement in a cool room away from direct heat and sunlight. Replenish oasis floral foam with 50ml cool water every 2 days. For forever roses, do not water.',
      },
      {
        question: `What are the stem count and arrangement specifications for ${product.name}?`,
        answer: `${product.name} features ${product.specifications?.stemCount || 'artisan-selected luxury stems'}, arranged in ${product.specifications?.boxOrVase || 'Dhanvikk signature Parisian keepsake packaging'}. Dimensions: ${product.specifications?.dimensions || 'Ø 22cm x H 35cm'}.`,
      },
      {
        question: `Is same-day delivery available for ${product.name}?`,
        answer:
          'Yes, orders placed before 7:00 PM are delivered same-day in temperature-controlled cold-chain vehicles across Bengaluru. Express 2-hour delivery is also available at checkout.',
      },
    ];
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Flower2 className="w-8 h-8 text-[#EC407A] animate-spin" />
          <span className="text-xs text-[#777777]">Loading floral details...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold font-['Poppins'] text-[#242124]">Blooms Not Found</h2>
        <p className="text-xs text-[#777777] mt-2 mb-4">The floral design you are looking for is currently unavailable.</p>
        <Link to="/" className="px-5 py-2.5 rounded-full bg-[#EC407A] text-white text-xs font-semibold">
          Return to Storefront
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${product.name} | Luxury ${product.category || 'Flowers'} Dhanvikk Blooms`}
        description={product.description}
        canonical={`/product/${product.slug || product.id}`}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          {
            name: product.category || 'Collections',
            url: `/category/${product.category?.toLowerCase() || 'flowers'}`,
          },
          { name: product.name, url: `/product/${product.slug || product.id}` },
        ]}
        faq={productFaqs}
        jsonLd={productSchema}
        ogType="product"
        ogImage={images[0] || '/dhanvikk-brand-logo.png'}
        ogImageAlt={`${product.name} - Handcrafted Luxury ${product.category} by Dhanvikk Blooms`}
      />

      <CartDrawer />

      <div className="min-h-screen bg-[#FFFDF9] text-[#242124] flex flex-col font-['Poppins']">
        <AnnouncementBar />
        <Navbar />
        <SubNav />

        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 w-full">
          <Breadcrumb
            items={[
              { label: 'Home', path: '/' },
              {
                label: product.category || 'Flowers',
                path: `/category/${product.category?.toLowerCase() || 'flowers'}`,
              },
              { label: product.name },
            ]}
          />
        </div>

        {/* Product Master Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left: Gallery (5 Cols) */}
            <div className="lg:col-span-6 space-y-4">
              {/* Main Active Image */}
              <div className="relative rounded-3xl overflow-hidden bg-white border border-[#F7F2ED] shadow-sm aspect-square">
                <img
                  src={images[activeImageIndex] || images[0]}
                  alt={`${product.name} - Luxury ${product.category || 'Floral Arrangement'} by Dhanvikk Blooms`}
                  className="w-full h-full object-cover transition-all duration-300"
                  loading="lazy"
                  decoding="async"
                />

                {product.tag && (
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#242124]/90 text-white text-[11px] tracking-wider uppercase font-bold">
                    {product.tag}
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm z-10 cursor-pointer ${
                    inWishlist
                      ? 'bg-white text-[#E11D48] shadow-md ring-2 ring-red-100 scale-105'
                      : 'bg-white/90 text-[#777777] hover:text-[#E11D48] hover:bg-white'
                  }`}
                  aria-label={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
                  title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
                >
                  <Heart
                    className={`w-5 h-5 transition-all duration-200 ${
                      inWishlist ? 'fill-[#E11D48] text-[#E11D48] scale-110' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Thumbnails row if multiple images exist */}
              {images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                        activeImageIndex === idx ? 'border-[#EC407A] scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} - Botanical Gallery Detail View ${idx + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Details & Delivery Slots (6 Cols) */}
            <div className="lg:col-span-6 space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FFF3F6] text-[#C2185B] text-[10px] font-bold uppercase tracking-wider">
                    {product.flowerType || 'Luxury Bloom'}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-[#FFB400]">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-bold text-[#242124]">{product.rating || 4.9}</span>
                    <span className="text-[#777777]">({product.reviewsCount || 52} customer reviews)</span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold font-['Poppins'] text-[#242124]">
                  {product.name}
                </h1>

                {/* Price Display */}
                <div className="mt-3 flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-bold text-[#242124] font-mono">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-[#777777] line-through font-mono">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                  {product.originalPrice && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </span>
                  )}
                </div>

                {/* Stock Indicator */}
                <p className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>In Stock ({product.stock} arrangements available for immediate harvest)</span>
                </p>

                <p className="mt-4 text-xs sm:text-sm text-[#777777] leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Delivery Customizer Box */}
              <div className="bg-white rounded-3xl p-5 border border-[#F7F2ED] shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#242124] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#EC407A]" />
                  <span>Choose Delivery Date & Time Slot</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#777777] mb-1">
                      Delivery Date
                    </label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full h-10 px-3 rounded-xl bg-[#FAF7F2] border border-[#E9E2E5] text-xs text-[#242124] focus:outline-none focus:border-[#EC407A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#777777] mb-1">
                      Delivery Slot
                    </label>
                    <select
                      value={deliverySlot}
                      onChange={(e) => setDeliverySlot(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-[#FAF7F2] border border-[#E9E2E5] text-xs text-[#242124] focus:outline-none focus:border-[#EC407A] cursor-pointer"
                    >
                      <option value="Morning (9:00 AM - 1:00 PM)">Morning (9:00 AM - 1:00 PM)</option>
                      <option value="Standard (2:00 PM - 6:00 PM)">Standard (2:00 PM - 6:00 PM)</option>
                      <option value="Express 2-Hour Delivery">Express 2-Hour Delivery (+{formatPrice(199)})</option>
                      <option value="Midnight Special (11:30 PM - 12:30 AM)">Midnight Special (11:30 PM - 12:30 AM)</option>
                    </select>
                  </div>
                </div>

                {/* Free Greeting Card Textbox */}
                <div className="pt-2 border-t border-[#F7F2ED] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-[#242124] flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#EC407A]" />
                      <span>Complimentary Greeting Card Message</span>
                    </label>
                    <span className="text-[10px] text-[#777777]">Free printed gift card</span>
                  </div>

                  <textarea
                    rows="2"
                    placeholder="Write your personal romantic or celebration note here..."
                    value={cardMessage}
                    onChange={(e) => setCardMessage(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#FAF7F2] border border-[#E9E2E5] text-xs text-[#242124] placeholder:text-[#777777]/60 focus:outline-none focus:border-[#EC407A]"
                  />

                  <input
                    type="text"
                    placeholder="From / Sender's Name (e.g. With Love, Divya)"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-[#FAF7F2] border border-[#E9E2E5] text-xs text-[#242124] placeholder:text-[#777777]/60 focus:outline-none focus:border-[#EC407A]"
                  />
                </div>
              </div>

              {/* Action CTA Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleAddToCart}
                  className="h-12 text-xs sm:text-sm font-semibold"
                >
                  {added ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-600">
                      <Check className="w-4 h-4" /> Added to Bag
                    </span>
                  ) : (
                    'Add to Cart'
                  )}
                </Button>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleInstantBuy}
                  className="h-12 text-xs sm:text-sm font-semibold"
                >
                  Proceed to Checkout
                </Button>
              </div>

              {/* Trust Features */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#F7F2ED] text-xs text-[#777777]">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#EC407A]" />
                  <span>Cold-chain insulated dispatch</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#EC407A]" />
                  <span>Razorpay verified encryption</span>
                </div>
              </div>
            </div>
          </div>

          {/* Botanical Specifications & Features Section (AEO/GEO Structured Information) */}
          <section className="mt-14 pt-12 border-t border-[#F2ECE6]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Botanical Specs & Features */}
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#C2185B]">
                    Atelier Craftsmanship
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold font-['Poppins'] text-[#242124] mt-0.5">
                    Botanical Specifications & Details
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-2xl bg-white border border-[#EFE7DE] shadow-2xs">
                    <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider block">
                      Stem Count
                    </span>
                    <p className="text-xs font-semibold text-[#242124] mt-1">
                      {product.specifications?.stemCount || '24 to 36 Luxury Stems'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-[#EFE7DE] shadow-2xs">
                    <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider block">
                      Arrangement Dimensions
                    </span>
                    <p className="text-xs font-semibold text-[#242124] mt-1">
                      {product.specifications?.dimensions || 'Ø 22cm x H 35cm'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-[#EFE7DE] shadow-2xs">
                    <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider block">
                      Vase / Keepsake Box
                    </span>
                    <p className="text-xs font-semibold text-[#242124] mt-1">
                      {product.specifications?.boxOrVase || 'Signature Parisian Velvet Cylinder'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-[#EFE7DE] shadow-2xs">
                    <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider block">
                      Cold-Chain Transit
                    </span>
                    <p className="text-xs font-semibold text-[#242124] mt-1">
                      Chilled 2°C – 4°C Monitored
                    </p>
                  </div>
                </div>

                {/* Features Checkmarks */}
                {product.features && product.features.length > 0 && (
                  <div className="p-5 rounded-2xl bg-[#FFF9FA] border border-[#FCD9E0] space-y-2.5">
                    <h3 className="text-xs font-bold text-[#C2185B] uppercase tracking-wider">
                      Signature Highlights
                    </h3>
                    <ul className="space-y-2">
                      {product.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2 text-xs text-[#444444]">
                          <Check className="w-3.5 h-3.5 text-[#C2185B] flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Right Column: Care Guide & Product FAQs (AEO Answering Box) */}
              <div className="lg:col-span-6 space-y-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#C2185B]">
                    Care & Questions
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold font-['Poppins'] text-[#242124] mt-0.5">
                    Care Guide & Common Questions
                  </h2>
                </div>

                {productFaqs.map((faqItem, fIdx) => (
                  <div
                    key={fIdx}
                    className="p-5 rounded-2xl bg-white border border-[#EFE7DE] shadow-2xs space-y-2"
                  >
                    <h3 className="text-xs sm:text-sm font-bold text-[#242124] flex items-center gap-2">
                      <Flower2 className="w-3.5 h-3.5 text-[#EC407A] flex-shrink-0" />
                      <span>{faqItem.question}</span>
                    </h3>
                    <p className="text-xs text-[#666666] leading-relaxed pl-5.5">
                      {faqItem.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Haute Couture Master Footer */}
        <Footer />
      </div>
    </>
  );
}
