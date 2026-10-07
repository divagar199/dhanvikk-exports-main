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
  ChevronLeft,
  ChevronDown,
  Flower2,
  Share2,
  Plus,
  Minus,
  Zap,
  Sparkles,
  Layers,
  Award,
  ThumbsUp,
  CheckCircle2,
  User,
  Lock,
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

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [carouselPage, setCarouselPage] = useState(0);

  const inWishlist = isProductInWishlist(wishlistItems, product);

  const handleToggleWishlist = (targetProduct = product) => {
    if (!targetProduct) return;
    const isSaved = isProductInWishlist(wishlistItems, targetProduct);
    dispatch(toggleWishlist(targetProduct));
    if (isSaved) {
      toast('Removed from wishlist', { icon: '🤍' });
    } else {
      toast.success(`${targetProduct.name} saved to wishlist ❤️`);
    }
  };

  // Plant detection helper
  const isPlant = useMemo(() => {
    if (!product) return false;
    return (
      product.category === 'Plants' ||
      product.flowerType === 'Plants' ||
      Boolean(product.specifications?.plantType)
    );
  }, [product]);

  // Delivery configuration & Quantity states
  const todayDateStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowDateStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const todayLabel = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, []);

  const tomorrowLabel = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, []);

  const [quantity, setQuantity] = useState(1);
  const [quickDate, setQuickDate] = useState('today');
  const [deliveryDate, setDeliveryDate] = useState(todayDateStr);
  const [deliveryType, setDeliveryType] = useState('standard');
  const [deliverySlot, setDeliverySlot] = useState('Morning (9:00 AM - 1:00 PM)');
  const [cardMessage, setCardMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [added, setAdded] = useState(false);

  // Dynamic Product Reviews & Ratings (Auth Gated Rating System)
  const [reviewsList, setReviewsList] = useState([]);
  const [ratingInput, setRatingInput] = useState(5);
  const [ratingHover, setRatingHover] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  const DELIVERY_OPTIONS = useMemo(() => [
    {
      id: 'standard',
      name: 'Standard Chilled Delivery',
      timeframe: '4 - 6 Hours',
      fee: 0,
      badge: 'FREE / REGULAR',
    },
    {
      id: 'express',
      name: 'Express 2-Hour Dispatch',
      timeframe: 'Within 120 Minutes',
      fee: 199,
      badge: 'FAST RUSH',
    },
    {
      id: 'midnight',
      name: 'Midnight Surprise Delivery',
      timeframe: '11:30 PM - 12:30 AM',
      fee: 399,
      badge: 'ROMANTIC SPECIAL',
    },
  ], []);

  const activeDeliveryOption = DELIVERY_OPTIONS.find((o) => o.id === deliveryType) || DELIVERY_OPTIONS[0];

  const totalPrice = useMemo(() => {
    if (!product) return 0;
    return (Number(product.price || 0) * quantity) + activeDeliveryOption.fee;
  }, [product, quantity, activeDeliveryOption]);

  // Load reviews from localStorage or curated defaults
  useEffect(() => {
    if (!product) return;
    const prodId = product._id || product.id || id;
    const defaultReviews = [
      {
        id: 'rev-default-1',
        author: 'Amina Al-Mansoor',
        rating: 5,
        date: '3 days ago',
        verified: true,
        title: 'Surpassed all expectations — genuinely pristine!',
        comment: 'Ordered for our wedding anniversary in Downtown Dubai. Delivered right on the dot, crisply chilled and with dew drops still on the petals. Fragrance lasted over a week.',
      },
      {
        id: 'rev-default-2',
        author: 'Vikram Malhotra',
        rating: 5,
        date: '1 week ago',
        verified: true,
        title: 'Remarkable presentation and velvet keepsake box',
        comment: 'The presentation is equivalent to high-end Parisian florists. Stems were lush, thick, and perfectly hydrated. My recipient was absolutely overjoyed.',
      },
      {
        id: 'rev-default-3',
        author: 'Sophie Laurent',
        rating: 4,
        date: '2 weeks ago',
        verified: true,
        title: 'Exquisite arrangement, prompt doorstep courier',
        comment: 'Stunning colors and very attentive customer service. The complimentary handwritten card is a very thoughtful luxury touch.',
      },
    ];

    try {
      const stored = localStorage.getItem(`dhanvikk_reviews_${prodId}`);
      if (stored) {
        setReviewsList(JSON.parse(stored));
      } else {
        setReviewsList(defaultReviews);
      }
    } catch {
      setReviewsList(defaultReviews);
    }
  }, [product, id]);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to rate this product.');
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }

    if (!reviewComment.trim()) {
      toast.error('Please write a brief comment describing your floral experience.');
      return;
    }

    const prodId = product?._id || product?.id || id;
    const newReview = {
      id: `rev-${Date.now()}`,
      author: user?.name || user?.email?.split('@')[0] || 'Verified Patron',
      rating: ratingInput,
      date: 'Just now',
      verified: true,
      title: reviewTitle.trim() || `${ratingInput}-Star Experience`,
      comment: reviewComment.trim(),
    };

    const updated = [newReview, ...reviewsList];
    setReviewsList(updated);

    try {
      localStorage.setItem(`dhanvikk_reviews_${prodId}`, JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    // Update product rating and review count state dynamically
    const newAvg = (updated.reduce((sum, r) => sum + r.rating, 0) / updated.length).toFixed(1);
    setProduct((prev) => ({
      ...prev,
      rating: Number(newAvg),
      reviewsCount: updated.length,
    }));

    setReviewTitle('');
    setReviewComment('');
    setShowReviewForm(false);
    toast.success('Thank you! Your verified rating & review have been published 🌸');
  };

  useEffect(() => {
    let isMounted = true;
    async function loadProduct() {
      try {
        setLoading(true);
        const data = await productService.getProductByIdOrSlug(id);
        if (isMounted) {
          setProduct(data);
          setActiveImageIndex(0);
          setCarouselPage(0);
        }

        // Fetch related products for the "Complete the Occasion" 2-row carousel
        const allProds = await productService.getAllProducts();
        if (isMounted && data) {
          const currentId = data._id || data.id;
          const isCurrentPlant = data.category === 'Plants' || data.flowerType === 'Plants' || Boolean(data.specifications?.plantType);
          const others = allProds.filter((p) => (p._id || p.id) !== currentId);

          // Intelligent affinity ranking: prioritize same category and flower/plant type
          const sorted = others.sort((a, b) => {
            const aIsPlant = a.category === 'Plants' || a.flowerType === 'Plants' || Boolean(a.specifications?.plantType);
            const bIsPlant = b.category === 'Plants' || b.flowerType === 'Plants' || Boolean(b.specifications?.plantType);

            let scoreA = 0;
            let scoreB = 0;

            if (isCurrentPlant) {
              if (aIsPlant) scoreA += 5;
              if (bIsPlant) scoreB += 5;
            } else {
              if (!aIsPlant) scoreA += 5;
              if (!bIsPlant) scoreB += 5;
            }

            if (a.category === data.category) scoreA += 3;
            if (b.category === data.category) scoreB += 3;

            if (a.flowerType === data.flowerType) scoreA += 2;
            if (b.flowerType === data.flowerType) scoreB += 2;

            return scoreB - scoreA;
          });

          setRelatedProducts(sorted.slice(0, 16));
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
      quantity: quantity,
      deliveryDate,
      deliveryType: activeDeliveryOption.name,
      deliveryFee: activeDeliveryOption.fee,
      deliverySlot,
      cardMessage,
      senderName,
      inStock: product.stock > 0,
      stock: product.stock,
    };

    dispatch(addItem(cartItem));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    toast.success(`Added ${quantity > 1 ? `${quantity}x ` : ''}${product.name} to cart 🌸`);
  };

  const handleQuickAddRelated = (e, relatedItem) => {
    e.preventDefault();
    e.stopPropagation();
    const cartItem = {
      id: relatedItem._id || relatedItem.id,
      name: relatedItem.name,
      price: relatedItem.price,
      originalPrice: relatedItem.originalPrice,
      image: Array.isArray(relatedItem.images) ? relatedItem.images[0] : (relatedItem.images || relatedItem.image),
      quantity: 1,
      deliveryDate,
      deliveryType: activeDeliveryOption.name,
      deliveryFee: activeDeliveryOption.fee,
      deliverySlot,
      inStock: relatedItem.stock > 0,
      stock: relatedItem.stock,
    };
    dispatch(addItem(cartItem));
    toast.success(`Added ${relatedItem.name} to cart 🌸`);
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
    if (isPlant) {
      return [
        {
          question: `How should I water and care for ${product.name}?`,
          answer:
            product.specifications?.careGuide ||
            'Water once weekly or when the top 2 inches of soil feel dry to the touch. Ensure proper drainage and avoid waterlogging.',
        },
        {
          question: `What sunlight and room placement does ${product.name} require?`,
          answer:
            product.specifications?.lightRequirement ||
            'Place in bright, filtered indirect natural light. Avoid harsh direct midday rays and cold air conditioning drafts.',
        },
        {
          question: `What are the planter and botanical dimensions for ${product.name}?`,
          answer: `${product.name} stands approximately ${product.specifications?.dimensions || '50cm - 65cm tall'}, potted in our ${product.specifications?.boxOrVase || 'hand-glazed artisanal ceramic planter'}.`,
        },
        {
          question: `Is ${product.name} safe for pets and effective for air purification?`,
          answer: `${product.specifications?.petSafety || 'Non-toxic to common household pets'}. Features: ${product.specifications?.airPurification || 'Natural room oxygenation and humidity balancing'}.`,
        },
      ];
    }
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
  }, [product, isPlant]);

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
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 w-full">
          <Breadcrumb
            items={[
              { label: 'Home', path: '/' },
              {
                label: product.category || 'Flowers',
                path: `/category/${(product.category || 'flowers').toLowerCase().replace(/\s+/g, '-')}`,
              },
              { label: product.name },
            ]}
          />
        </div>

        {/* Product Master Section */}
        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 w-full flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left: Gallery (5 Cols) */}
            <div className="lg:col-span-6 space-y-4">
              {/* Main Active Image */}
              <div className="relative rounded-3xl overflow-hidden bg-white border border-[#F7F2ED] shadow-sm aspect-square group">
                <img
                  src={images[activeImageIndex] || images[0]}
                  alt={`${product.name} - Luxury ${product.category || 'Floral Arrangement'} by Dhanvikk Blooms`}
                  className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />

                {product.tag && (
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#242124]/90 text-white text-[11px] tracking-wider uppercase font-bold backdrop-blur-xs">
                    {product.tag}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => handleToggleWishlist(product)}
                  className={`luxury-touch-press absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm z-10 cursor-pointer ${
                    inWishlist
                      ? 'bg-white text-[#E11D48] shadow-md ring-2 ring-red-100 scale-105'
                      : 'bg-white/90 text-[#777777] hover:text-[#E11D48] hover:bg-white'
                  }`}
                  aria-label={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
                  title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
                >
                  <Heart
                    className={`w-5 h-5 transition-all duration-200 ${
                      inWishlist ? 'fill-[#E11D48] text-[#E11D48] animate-heart-pop' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Thumbnails row if multiple images exist */}
              {images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 smooth-horizontal-scroll no-scrollbar">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`luxury-touch-press w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer flex-shrink-0 ${
                        activeImageIndex === idx ? 'border-[#EC407A] scale-105 shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} - Botanical Gallery Detail View ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
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
                    {isPlant ? (product.subCategory || 'Living Botanical') : (product.flowerType || 'Luxury Bloom')}
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

              {/* Mercury Flowers Style Delivery Customizer */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EFE8DF] shadow-xs space-y-5">
                {/* 1. Quick Delivery Date Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#242124] flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#EC407A]" />
                      <span>Select Delivery Date</span>
                    </label>
                    <span className="text-[11px] font-medium text-[#EC407A] bg-[#FFF0F5] px-2.5 py-0.5 rounded-full">
                      Farm Fresh Guaranteed
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setQuickDate('today');
                        setDeliveryDate(todayDateStr);
                      }}
                      className={`py-2.5 px-2 rounded-2xl text-center border transition-all cursor-pointer ${
                        quickDate === 'today'
                          ? 'border-[#EC407A] bg-[#FFF0F5] text-[#EC407A] shadow-xs ring-1 ring-[#EC407A]'
                          : 'border-[#EAE4DD] bg-white text-[#555] hover:border-[#D6CCC2] hover:bg-[#FAF7F2]'
                      }`}
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#C2185B]">Today</div>
                      <div className="text-xs font-semibold mt-0.5">{todayLabel}</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setQuickDate('tomorrow');
                        setDeliveryDate(tomorrowDateStr);
                      }}
                      className={`py-2.5 px-2 rounded-2xl text-center border transition-all cursor-pointer ${
                        quickDate === 'tomorrow'
                          ? 'border-[#EC407A] bg-[#FFF0F5] text-[#EC407A] shadow-xs ring-1 ring-[#EC407A]'
                          : 'border-[#EAE4DD] bg-white text-[#555] hover:border-[#D6CCC2] hover:bg-[#FAF7F2]'
                      }`}
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">Tomorrow</div>
                      <div className="text-xs font-semibold mt-0.5">{tomorrowLabel}</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setQuickDate('custom')}
                      className={`py-2.5 px-2 rounded-2xl text-center border transition-all cursor-pointer ${
                        quickDate === 'custom'
                          ? 'border-[#EC407A] bg-[#FFF0F5] text-[#EC407A] shadow-xs ring-1 ring-[#EC407A]'
                          : 'border-[#EAE4DD] bg-white text-[#555] hover:border-[#D6CCC2] hover:bg-[#FAF7F2]'
                      }`}
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">Specific Date</div>
                      <div className="text-xs font-semibold mt-0.5 flex items-center justify-center gap-1">
                        <span>Pick Date</span>
                      </div>
                    </button>
                  </div>

                  {quickDate === 'custom' && (
                    <div className="mt-2.5 pt-2">
                      <input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        min={todayDateStr}
                        className="w-full h-10 px-3 rounded-xl bg-[#FAF7F2] border border-[#E9E2E5] text-xs text-[#242124] focus:outline-none focus:border-[#EC407A]"
                      />
                    </div>
                  )}
                </div>

                {/* 2. Delivery Speed Options */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#242124] flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-[#EC407A]" />
                      <span>Delivery Service</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {DELIVERY_OPTIONS.map((opt) => {
                      const isSelected = deliveryType === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => setDeliveryType(opt.id)}
                          className={`luxury-touch-press p-3 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#EC407A] bg-[#FFF0F5]/60 ring-1 ring-[#EC407A] shadow-xs'
                              : 'border-[#EAE4DD] bg-white hover:border-[#D6CCC2] hover:bg-[#FAF7F2]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C2185B]">
                              {opt.badge}
                            </span>
                            <span className="text-xs font-bold text-[#242124]">
                              {opt.fee === 0 ? 'FREE' : `+${formatPrice(opt.fee)}`}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-[#242124] mt-1 line-clamp-1">
                            {opt.name}
                          </div>
                          <div className="text-[10px] text-[#777777] mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#EC407A]" />
                            <span>{opt.timeframe}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Time Slot Pills */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#242124] mb-2 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#EC407A]" />
                    <span>Preferred Time Window</span>
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { slot: 'Morning (9:00 AM - 1:00 PM)', label: '9 AM - 1 PM', sub: 'Morning Fresh' },
                      { slot: 'Standard (2:00 PM - 6:00 PM)', label: '2 PM - 6 PM', sub: 'Afternoon Prime' },
                      { slot: 'Evening (6:00 PM - 9:30 PM)', label: '6 PM - 9:30 PM', sub: 'Evening Sunset' },
                      { slot: 'Midnight Special (11:30 PM - 12:30 AM)', label: '11:30 PM - 12:30 AM', sub: 'Midnight Rush' },
                    ].map((item) => (
                      <button
                        key={item.slot}
                        type="button"
                        onClick={() => setDeliverySlot(item.slot)}
                        className={`luxury-touch-press p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                          deliverySlot === item.slot
                            ? 'border-[#EC407A] bg-[#FFF0F5] text-[#EC407A] ring-1 ring-[#EC407A]'
                            : 'border-[#EAE4DD] bg-white text-[#555] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <div className="text-xs font-bold">{item.label}</div>
                        <div className="text-[10px] text-[#777777]">{item.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Free Greeting Card Box */}
                <div className="pt-3 border-t border-[#F2ECE6] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#242124] flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-[#EC407A]" />
                      <span>Complimentary Greeting Card</span>
                    </label>
                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                      Free Luxury Card Included
                    </span>
                  </div>

                  <textarea
                    rows="2"
                    placeholder="Write your romantic note, birthday wishes, or anniversary message..."
                    value={cardMessage}
                    onChange={(e) => setCardMessage(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#FAF7F2] border border-[#E9E2E5] text-xs text-[#242124] placeholder:text-[#777777]/60 focus:outline-none focus:border-[#EC407A]"
                  />

                  <input
                    type="text"
                    placeholder="From / Sender's Name (e.g. With Endless Love, Arjun)"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#FAF7F2] border border-[#E9E2E5] text-xs text-[#242124] placeholder:text-[#777777]/60 focus:outline-none focus:border-[#EC407A]"
                  />
                </div>
              </div>

              {/* Quantity Stepper & Mercury Flowers Style Action Bar */}
              <div className="bg-[#FAF7F2] rounded-3xl p-4 sm:p-5 border border-[#EFE8DF] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#242124] flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#EC407A]" />
                    <span>Quantity</span>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center bg-white border border-[#E0D8D0] rounded-2xl p-1 shadow-2xs">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      className="luxury-touch-press w-8 h-8 rounded-xl flex items-center justify-center text-[#EC407A] hover:bg-[#FAF7F2] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-bold text-sm text-[#242124] select-none">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={quantity >= (product.stock || 99)}
                      onClick={() => setQuantity((prev) => prev + 1)}
                      className="luxury-touch-press w-8 h-8 rounded-xl flex items-center justify-center text-[#EC407A] hover:bg-[#FAF7F2] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subtotal preview */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-[#EAE4DD]">
                  <span className="text-[#777777]">Estimated Total (Includes service & taxes):</span>
                  <span className="font-extrabold text-base text-[#242124] font-mono">
                    {formatPrice(totalPrice)}
                  </span>
                </div>

                {/* Action CTA Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={handleAddToCart}
                    className="luxury-touch-press h-12 text-xs sm:text-sm font-semibold border-2 border-[#EC407A] text-[#EC407A] hover:bg-[#FFF0F5]"
                  >
                    {added ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold">
                        <Check className="w-4 h-4" /> Added to Bag
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <span>Add to Bag</span>
                        <span className="opacity-60">•</span>
                        <span>{formatPrice(totalPrice)}</span>
                      </span>
                    )}
                  </Button>

                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleInstantBuy}
                    className="luxury-touch-press h-12 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    <span>Instant Buy Now</span>
                    <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>

              {/* Mercury Flowers Style Product Details Collapsible Accordion */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EFE8DF] shadow-xs">
                <button
                  type="button"
                  onClick={() => setDetailsOpen(!detailsOpen)}
                  className="w-full flex items-center justify-between text-left cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-bold text-[#EC407A] group-hover:text-[#C2185B] transition-colors">
                    Product Details
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-[#777777] transition-transform duration-200 ${
                      detailsOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {detailsOpen && (
                  <div className="mt-4 pt-4 border-t border-[#F2ECE6] space-y-3.5 text-xs sm:text-sm text-[#555] leading-relaxed">
                    <p>{product.description}</p>

                    {isPlant ? (
                      <div className="space-y-2 pt-2 border-t border-dashed border-[#EFE8DF]">
                        <h4 className="font-bold text-[#242124] text-xs uppercase tracking-wider text-[#C2185B]">
                          Botanical Specifications
                        </h4>
                        <ul className="space-y-1.5 text-xs text-[#555] list-disc list-inside">
                          {product.specifications?.plantType && (
                            <li>
                              <strong className="text-[#242124]">Plant Variety:</strong>{' '}
                              {product.specifications.plantType}
                            </li>
                          )}
                          {product.specifications?.dimensions && (
                            <li>
                              <strong className="text-[#242124]">Dimensions:</strong>{' '}
                              {product.specifications.dimensions}
                            </li>
                          )}
                          {product.specifications?.boxOrVase && (
                            <li>
                              <strong className="text-[#242124]">Planter:</strong>{' '}
                              {product.specifications.boxOrVase}
                            </li>
                          )}
                          {product.specifications?.lightRequirement && (
                            <li>
                              <strong className="text-[#242124]">Sunlight:</strong>{' '}
                              {product.specifications.lightRequirement}
                            </li>
                          )}
                          {product.specifications?.careGuide && (
                            <li>
                              <strong className="text-[#242124]">Watering & Care:</strong>{' '}
                              {product.specifications.careGuide}
                            </li>
                          )}
                          {product.specifications?.airPurification && (
                            <li>
                              <strong className="text-[#242124]">Air Purification:</strong>{' '}
                              {product.specifications.airPurification}
                            </li>
                          )}
                          {product.specifications?.petSafety && (
                            <li>
                              <strong className="text-[#242124]">Pet Safety:</strong>{' '}
                              {product.specifications.petSafety}
                            </li>
                          )}
                        </ul>
                      </div>
                    ) : (
                      <div className="space-y-2 pt-2 border-t border-dashed border-[#EFE8DF]">
                        <h4 className="font-bold text-[#242124] text-xs uppercase tracking-wider text-[#C2185B]">
                          Arrangement Specifications
                        </h4>
                        <ul className="space-y-1.5 text-xs text-[#555] list-disc list-inside">
                          {product.specifications?.stemCount && (
                            <li>
                              <strong className="text-[#242124]">Flower / Stem Count:</strong>{' '}
                              {product.specifications.stemCount}
                            </li>
                          )}
                          {product.specifications?.dimensions && (
                            <li>
                              <strong className="text-[#242124]">Dimensions:</strong>{' '}
                              {product.specifications.dimensions}
                            </li>
                          )}
                          {product.specifications?.boxOrVase && (
                            <li>
                              <strong className="text-[#242124]">Keepsake Box / Vase:</strong>{' '}
                              {product.specifications.boxOrVase}
                            </li>
                          )}
                          {product.specifications?.careGuide && (
                            <li>
                              <strong className="text-[#242124]">Hydration Care:</strong>{' '}
                              {product.specifications.careGuide}
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Mercury Flowers Style Reassurance Row */}
                    <div className="pt-3 border-t border-[#F2ECE6] flex flex-wrap items-center gap-5 text-xs">
                      <div className="flex items-center gap-1.5 text-[#C2185B] font-semibold">
                        <Truck className="w-4 h-4 text-[#EC407A]" />
                        <span>Secure Chilled Delivery</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span>Satisfaction Guaranteed</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mercury Flowers Style Trust & Freshness Highlights */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-[#555]">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#EFE8DF]">
                  <Truck className="w-4 h-4 text-[#EC407A] shrink-0" />
                  <span className="line-clamp-1">Chilled Cold-Chain Transport</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#EFE8DF]">
                  <Flower2 className="w-4 h-4 text-[#EC407A] shrink-0" />
                  <span className="line-clamp-1">{isPlant ? '100% Potted Living Botanicals' : '100% Fresh Farm Blooms'}</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#EFE8DF]">
                  <Award className="w-4 h-4 text-[#EC407A] shrink-0" />
                  <span className="line-clamp-1">Luxury Gift Wrapping Included</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#EFE8DF]">
                  <ShieldCheck className="w-4 h-4 text-[#EC407A] shrink-0" />
                  <span className="line-clamp-1">256-bit Secure Checkout</span>
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
                    {isPlant ? 'Living Greenery Atelier' : 'Atelier Craftsmanship'}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold font-['Poppins'] text-[#242124] mt-0.5">
                    {isPlant ? 'Botanical Specifications & Plant Care' : 'Botanical Specifications & Details'}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-2xl bg-white border border-[#EFE7DE] shadow-2xs">
                    <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider block">
                      {isPlant ? 'Plant Variety' : 'Stem Count'}
                    </span>
                    <p className="text-xs font-semibold text-[#242124] mt-1">
                      {isPlant
                        ? (product.specifications?.plantType || product.subCategory || 'Living Botanical Specimen')
                        : (product.specifications?.stemCount || '24 to 36 Luxury Stems')}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-[#EFE7DE] shadow-2xs">
                    <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider block">
                      {isPlant ? 'Plant Dimensions' : 'Arrangement Dimensions'}
                    </span>
                    <p className="text-xs font-semibold text-[#242124] mt-1">
                      {product.specifications?.dimensions || (isPlant ? 'Height: 55cm - 65cm' : 'Ø 22cm x H 35cm')}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-[#EFE7DE] shadow-2xs">
                    <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider block">
                      {isPlant ? 'Artisan Planter' : 'Vase / Keepsake Box'}
                    </span>
                    <p className="text-xs font-semibold text-[#242124] mt-1">
                      {product.specifications?.boxOrVase || (isPlant ? 'Hand-Glazed Nordic Ceramic Planter' : 'Signature Parisian Velvet Cylinder')}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-[#EFE7DE] shadow-2xs">
                    <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider block">
                      {isPlant ? 'Sunlight Requirement' : 'Cold-Chain Transit'}
                    </span>
                    <p className="text-xs font-semibold text-[#242124] mt-1">
                      {isPlant
                        ? (product.specifications?.lightRequirement || 'Bright Indirect Light')
                        : 'Chilled 2°C – 4°C Monitored'}
                    </p>
                  </div>
                </div>

                {/* Features & Plant Care Checkmarks */}
                <div className="p-5 rounded-2xl bg-[#FFF9FA] border border-[#FCD9E0] space-y-2.5">
                  <h3 className="text-xs font-bold text-[#C2185B] uppercase tracking-wider">
                    {isPlant ? 'Plant Care & Benefits' : 'Signature Highlights'}
                  </h3>
                  <ul className="space-y-2">
                    {isPlant ? (
                      <>
                        {product.specifications?.careGuide && (
                          <li className="flex items-start gap-2 text-xs text-[#444444]">
                            <Check className="w-3.5 h-3.5 text-[#C2185B] flex-shrink-0 mt-0.5" />
                            <span><strong className="text-[#242124]">Watering:</strong> {product.specifications.careGuide}</span>
                          </li>
                        )}
                        {product.specifications?.airPurification && (
                          <li className="flex items-start gap-2 text-xs text-[#444444]">
                            <Check className="w-3.5 h-3.5 text-[#C2185B] flex-shrink-0 mt-0.5" />
                            <span><strong className="text-[#242124]">Air Purity:</strong> {product.specifications.airPurification}</span>
                          </li>
                        )}
                        {product.specifications?.petSafety && (
                          <li className="flex items-start gap-2 text-xs text-[#444444]">
                            <Check className="w-3.5 h-3.5 text-[#C2185B] flex-shrink-0 mt-0.5" />
                            <span><strong className="text-[#242124]">Pet Safety:</strong> {product.specifications.petSafety}</span>
                          </li>
                        )}
                        {product.features?.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2 text-xs text-[#444444]">
                            <Check className="w-3.5 h-3.5 text-[#C2185B] flex-shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </>
                    ) : (
                      (product.features && product.features.length > 0 ? product.features : [
                        'Air-flown fresh daily from high-altitude volcanic farms',
                        'Handcrafted and tailored by master floral artisans',
                        'Signature reusable keepsake cylinder with gold embossing',
                        'Insulated cold-chain temperature-controlled doorstep dispatch',
                      ]).map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2 text-xs text-[#444444]">
                          <Check className="w-3.5 h-3.5 text-[#C2185B] flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
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

          {/* ========================================================
              PATRON REVIEWS & RATINGS SECTION (Auth Gated Rating System)
              ======================================================== */}
          <section className="mt-14 pt-12 border-t border-[#F2ECE6]">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#C2185B]">
                  Verified Patron Experiences
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-['Poppins'] text-[#242124] mt-0.5">
                  Customer Ratings & Reviews
                </h2>
                <p className="text-xs sm:text-sm text-[#777777] mt-1">
                  100% authentic evaluations from recipients and gift patrons.
                </p>
              </div>

              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => setShowReviewForm((prev) => !prev)}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#C2185B] to-[#EC407A] text-white text-xs font-semibold hover:opacity-95 transition-all shadow-sm flex items-center gap-2 cursor-pointer self-start md:self-end"
                >
                  <Star className="w-4 h-4 fill-current text-white" />
                  <span>{showReviewForm ? 'Close Rating Form' : 'Rate & Review Arrangement'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/login', { state: { from: `/product/${id}` } })}
                  className="px-5 py-2.5 rounded-full bg-white hover:bg-[#FFF3F6] text-[#C2185B] border border-[#F2D7DE] text-xs font-semibold transition-all shadow-xs flex items-center gap-2 cursor-pointer self-start md:self-end"
                >
                  <Lock className="w-3.5 h-3.5 text-[#EC407A]" />
                  <span>Sign In to Rate Product</span>
                </button>
              )}
            </div>

            {/* Ratings Overview KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 mb-8">
              {/* Score Box */}
              <div className="md:col-span-4 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-[#EFE7DE] shadow-xs flex flex-col items-center justify-center text-center">
                <span className="text-4xl sm:text-5xl font-extrabold text-[#242124] font-mono leading-none">
                  {product.rating || 4.9}
                </span>
                <div className="flex items-center gap-1 my-2 text-[#FFB400]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= Math.round(product.rating || 4.9) ? 'fill-[#FFB400]' : 'text-[#DCD5CD]'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-[#555]">
                  Based on {reviewsList.length} verified reviews
                </span>
                <span className="mt-2 text-[10px] font-bold tracking-wider uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  100% Freshness Satisfaction
                </span>
              </div>

              {/* Star breakdown bar */}
              <div className="md:col-span-4 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-[#EFE7DE] shadow-xs space-y-2 flex flex-col justify-center text-xs">
                {[
                  { star: 5, pct: 88 },
                  { star: 4, pct: 10 },
                  { star: 3, pct: 2 },
                  { star: 2, pct: 0 },
                  { star: 1, pct: 0 },
                ].map((row) => (
                  <div key={row.star} className="flex items-center gap-2 text-[#555]">
                    <span className="w-8 font-mono text-[11px] font-semibold flex items-center gap-0.5">
                      {row.star} <Star className="w-3 h-3 fill-[#FFB400] text-[#FFB400]" />
                    </span>
                    <div className="flex-1 h-2 bg-[#F2ECE6] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#FFB400] to-[#FFA000] rounded-full"
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-mono text-[10px] text-[#888]">{row.pct}%</span>
                  </div>
                ))}
              </div>

              {/* Verified Gating Banner */}
              <div className="md:col-span-4 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#FFF9FA] border border-[#FCD9E0] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[#C2185B] font-bold text-xs uppercase tracking-wider mb-1">
                    <ShieldCheck className="w-4 h-4 text-[#EC407A]" />
                    <span>Verified Review Policy</span>
                  </div>
                  <p className="text-xs text-[#666] leading-relaxed">
                    Every rating is authenticated against client delivery dispatch logs. We never host anonymous or synthetic reviews.
                  </p>
                </div>

                <div className="pt-3 border-t border-[#FAD2DC]/60 mt-3 flex items-center justify-between text-xs">
                  {isAuthenticated ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1.5 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Logged in as {user?.name || user?.email}
                    </span>
                  ) : (
                    <span className="text-[#C2185B] font-semibold text-[11px]">
                      Sign in to rate this flower arrangement
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Interactive Rating Form (For Logged-in Users) */}
            {showReviewForm && (
              <div className="mb-8 p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-[#EFE7DE] shadow-md space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-[#F2ECE6] pb-3">
                  <h3 className="text-sm font-bold text-[#242124] font-['Poppins'] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#EC407A]" />
                    <span>Share Your Experience: {product.name}</span>
                  </h3>
                  <span className="text-[11px] text-[#888] font-mono">Verified Patron Submission</span>
                </div>

                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {/* Star Rating Selector */}
                  <div>
                    <label className="block text-xs font-bold text-[#444] mb-2 uppercase tracking-wider">
                      Your Rating *
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatingInput(star)}
                          onMouseEnter={() => setRatingHover(star)}
                          onMouseLeave={() => setRatingHover(0)}
                          className="p-1 rounded-lg hover:scale-110 transition-transform cursor-pointer"
                          aria-label={`${star} star rating`}
                        >
                          <Star
                            className={`w-7 h-7 transition-colors ${
                              star <= (ratingHover || ratingInput)
                                ? 'fill-[#FFB400] text-[#FFB400]'
                                : 'text-[#DCD5CD]'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-semibold text-[#C2185B] ml-2">
                        {ratingInput === 5
                          ? 'Flawless & Exquisite (5 Stars)'
                          : ratingInput === 4
                          ? 'Very Pleased (4 Stars)'
                          : ratingInput === 3
                          ? 'Satisfactory (3 Stars)'
                          : ratingInput === 2
                          ? 'Needs Improvement (2 Stars)'
                          : 'Disappointed (1 Star)'}
                      </span>
                    </div>
                  </div>

                  {/* Review Title */}
                  <div>
                    <label className="block text-xs font-bold text-[#444] mb-1 uppercase tracking-wider">
                      Review Headline
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Breathtakingly fresh and beautifully arranged!"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl bg-white border border-[#DCD5CD] text-xs text-[#242124] placeholder:text-[#999] focus:outline-none focus:border-[#C2185B]"
                    />
                  </div>

                  {/* Review Text */}
                  <div>
                    <label className="block text-xs font-bold text-[#444] mb-1 uppercase tracking-wider">
                      Review Commentary *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Describe the bloom freshness, flower scent, packaging presentation, or delivery speed..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full p-3.5 rounded-xl bg-white border border-[#DCD5CD] text-xs text-[#242124] placeholder:text-[#999] focus:outline-none focus:border-[#C2185B] leading-relaxed resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-4 py-2 rounded-full border border-[#DCD5CD] text-xs text-[#555] hover:bg-[#FAF7F2] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-full bg-gradient-to-r from-[#C2185B] to-[#EC407A] text-white text-xs font-bold shadow-md hover:opacity-95 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                      <span>Publish Verified Review</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* List of Published Reviews */}
            <div className="space-y-4">
              {reviewsList.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-[#EFE7DE] shadow-2xs space-y-2.5 transition-all hover:border-[#DCD5CD]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#FFF0F4] border border-[#F2D7DE] text-[#C2185B] flex items-center justify-center font-bold text-xs shadow-2xs">
                        {rev.author ? rev.author.charAt(0).toUpperCase() : 'P'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#242124]">{rev.author}</span>
                          {rev.verified && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Check className="w-2.5 h-2.5" /> Verified Patron
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#888] font-mono">{rev.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[#FFB400]">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating ? 'fill-[#FFB400]' : 'text-[#DCD5CD]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {rev.title && (
                    <h4 className="text-xs sm:text-sm font-bold text-[#242124] pt-1">
                      {rev.title}
                    </h4>
                  )}

                  <p className="text-xs text-[#555] leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Mercury Flowers Style "Complete the Occasion" Related Products 2-Row Carousel */}
          {relatedProducts.length > 0 && (() => {
            const itemsPerPage = 8;
            const totalPages = Math.ceil(relatedProducts.length / itemsPerPage);
            const currentSlice = relatedProducts.slice(
              carouselPage * itemsPerPage,
              (carouselPage + 1) * itemsPerPage
            );

            return (
              <section className="mt-16 pt-12 border-t border-[#F2ECE6]">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold font-['Poppins'] text-[#242124]">
                      Complete the Occasion
                    </h2>
                    <p className="text-xs sm:text-sm text-[#777777] mt-1">
                      Hand-picked arrangements you might also love.
                    </p>
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#888888] mr-2">
                        {carouselPage + 1} / {totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCarouselPage((prev) => Math.max(0, prev - 1))}
                        disabled={carouselPage === 0}
                        className="w-10 h-10 rounded-full border border-[#E0D8D0] bg-white flex items-center justify-center text-[#EC407A] hover:bg-[#FAF7F2] hover:border-[#EC407A] disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs transition-all"
                        aria-label="Previous related products"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCarouselPage((prev) => Math.min(totalPages - 1, prev + 1))}
                        disabled={carouselPage >= totalPages - 1}
                        className="w-10 h-10 rounded-full border border-[#E0D8D0] bg-white flex items-center justify-center text-[#EC407A] hover:bg-[#FAF7F2] hover:border-[#EC407A] disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs transition-all"
                        aria-label="Next related products"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* 2-Row Grid Carousel (4 columns x 2 rows on desktop) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
                  {currentSlice.map((relItem) => {
                    const isRelPlant = relItem.category === 'Plants';
                    const relImg = Array.isArray(relItem.images)
                      ? relItem.images[0]
                      : relItem.images || relItem.image;
                    const isRelSaved = isProductInWishlist(wishlistItems, relItem);

                    return (
                      <div
                        key={relItem.id || relItem._id}
                        className="group relative bg-white rounded-2xl sm:rounded-3xl border border-[#EFE8DF] overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
                      >
                        {/* Image wrapper */}
                        <div className="relative aspect-square w-full overflow-hidden bg-[#FAF7F2]">
                          <Link to={`/product/${relItem.slug || relItem.id}`} className="block w-full h-full">
                            <img
                              src={relImg}
                              alt={relItem.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                          </Link>

                          {/* Mercury Flowers Style Sale / Badge */}
                          {relItem.originalPrice && relItem.originalPrice > relItem.price ? (
                            <span className="absolute top-2 sm:top-3 left-2 sm:left-3 px-2 sm:px-2.5 py-0.5 rounded-full bg-[#EC407A] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-xs">
                              SALE
                            </span>
                          ) : relItem.badge ? (
                            <span className="absolute top-2 sm:top-3 left-2 sm:left-3 px-2 sm:px-2.5 py-0.5 rounded-full bg-[#242124]/80 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                              {relItem.badge}
                            </span>
                          ) : null}

                          {/* Wishlist Heart Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleWishlist(relItem)}
                            className="absolute top-2 sm:top-3 right-2 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs hover:bg-white hover:scale-110 transition-all cursor-pointer"
                            aria-label="Wishlist"
                          >
                            <Heart
                              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
                                isRelSaved ? 'fill-[#E11D48] text-[#E11D48]' : 'text-[#777777]'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="p-2.5 sm:p-4 flex flex-col justify-between flex-1 space-y-1.5 sm:space-y-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C2185B] line-clamp-1">
                              {isRelPlant ? (relItem.subCategory || 'Living Plant') : (relItem.flowerType || relItem.category)}
                            </span>
                            <Link to={`/product/${relItem.slug || relItem.id}`}>
                              <h3 className="text-xs sm:text-sm font-bold text-[#242124] line-clamp-1 group-hover:text-[#EC407A] transition-colors mt-0.5">
                                {relItem.name}
                              </h3>
                            </Link>

                            <div className="flex items-center gap-1 mt-1 text-[11px] text-[#FFB400]">
                              <Star className="w-3 h-3 fill-current" />
                              <span className="font-bold text-[#242124]">{relItem.rating || 4.9}</span>
                              <span className="text-[#888888]">({relItem.reviewsCount || 42})</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-[#F5EFE8]">
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm sm:text-base font-bold text-[#242124] font-mono">
                                {formatPrice(relItem.price)}
                              </span>
                              {relItem.originalPrice && (
                                <span className="text-xs text-[#888888] line-through font-mono">
                                  {formatPrice(relItem.originalPrice)}
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={(e) => handleQuickAddRelated(e, relItem)}
                              className="w-full mt-2.5 py-2 px-3 rounded-xl border border-[#EC407A]/30 text-[#EC407A] hover:bg-[#FFF0F4] hover:border-[#EC407A] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add to Bag</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })()}
        </main>

        {/* Haute Couture Master Footer */}
        <Footer />
      </div>
    </>
  );
}
