import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import {
  MapPin,
  Search,
  Bell,
  Flower2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  Heart,
  ShoppingBag,
  SlidersHorizontal,
  ChevronDown,
  Clock,
  Tag,
  Zap,
  CheckCircle2,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadows } from '../../theme';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { ProductCard } from '../../components/ProductCard';
import { SectionHeader } from '../../components/SectionHeader';
import { ProductCardSkeleton } from '../../components/Skeleton';
import { GrandLogo } from '../../components/GrandLogo';
import { productService } from '../../services/productService';
import { useUIStore } from '../../store/uiStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useCartStore } from '../../store/cartStore';
import { useResponsive } from '../../hooks/useResponsive';
import { Product } from '../../types';

// 16:9 Widescreen Hero Banners
const HERO_SLIDES = [
  {
    id: 'hero-1',
    kicker: 'FARM FRESH HARVEST',
    badge: 'UP TO 35% OFF',
    title: 'Hosur & Nilgiris Export Blooms.',
    subtitle: 'Direct farm-plucked fresh roses & luxury hand bouquets.',
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1280&q=85',
    primaryCta: 'Shop Blooms',
    primaryLink: '/(tabs)/shop',
    secondaryCta: 'Explore Deals',
    secondaryLink: '/(tabs)/categories',
  },
  {
    id: 'hero-2',
    kicker: 'WEDDING & TEMPLE SPECIALS',
    badge: 'DAILY HARVEST',
    title: 'Traditional Garlands & Fragrant Malli.',
    subtitle: 'Hand-crafted Madurai Jasmine, Sevvanthi & Royal Marigold.',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1280&q=85',
    primaryCta: 'Explore Garlands',
    primaryLink: '/(tabs)/shop',
    secondaryCta: 'Pooja Stems',
    secondaryLink: '/(tabs)/categories',
  },
  {
    id: 'hero-3',
    kicker: 'ETERNAL LUXURY',
    badge: '365 DAYS FRESH',
    title: 'Forever Roses in Velvet Hat Boxes.',
    subtitle: 'Naturally preserved blooms that flourish for years without water.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1280&q=85',
    primaryCta: 'Forever Edit',
    primaryLink: '/(tabs)/shop',
    secondaryCta: 'Care Guide',
    secondaryLink: '/about',
  },
  {
    id: 'hero-4',
    kicker: 'GOURMET CELEBRATIONS',
    badge: '2-HR EXPRESS',
    title: 'Artisanal Hampers & Exotic Orchids.',
    subtitle: 'Paired with fine chocolates, scented candles & gift cards.',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1280&q=85',
    primaryCta: 'Order Hampers',
    primaryLink: '/(tabs)/shop',
    secondaryCta: 'All Combos',
    secondaryLink: '/(tabs)/categories',
  },
];

// Flipkart-style Circular Category Bubbles
const QUICK_CATEGORIES = [
  { id: '1', name: 'All Blooms', query: '', badge: 'All', image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=300&q=80' },
  { id: '2', name: 'Roses', query: 'Roses', badge: 'Hot', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80' },
  { id: '3', name: 'Bouquets', query: 'Hand Bouquets', badge: 'Popular', image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=300&q=80' },
  { id: '4', name: 'Garlands', query: 'Flowers', badge: 'Weddings', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=300&q=80' },
  { id: '5', name: 'Forever 365', query: 'Forever Roses', badge: 'Luxury', image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=300&q=80' },
  { id: '6', name: 'Flower Boxes', query: 'Flower Boxes', badge: 'Best', image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=300&q=80' },
  { id: '7', name: 'Lilies', query: 'Lilies', badge: 'Rare', image: 'https://images.unsplash.com/photo-1533616688419-b7a585564566?auto=format&fit=crop&w=300&q=80' },
  { id: '8', name: 'Plants', query: 'Plants', badge: 'Green', image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=300&q=80' },
];

// Flipkart-style 2x2 Feature Tile Collections
const SPECIAL_COLLECTIONS = [
  {
    id: 'col-1',
    title: 'Wedding Garlands',
    subtitle: 'From ₹499',
    category: 'Flowers',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
    tag: 'MIN 25% OFF',
  },
  {
    id: 'col-2',
    title: 'Pooja & Mandir',
    subtitle: 'Under ₹299',
    category: 'Flowers',
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80',
    tag: 'FRESH HARVEST',
  },
  {
    id: 'col-3',
    title: 'Velvet Hat Boxes',
    subtitle: 'Min 30% Off',
    category: 'Flower Boxes',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80',
    tag: 'SIGNATURE',
  },
  {
    id: 'col-4',
    title: 'Exotic Orchids',
    subtitle: 'Direct Exports',
    category: 'Roses',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    tag: 'EXPORT GRADE',
  },
];

const OCCASIONS = [
  { id: '1', name: 'Birthday', image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=300&q=80' },
  { id: '2', name: 'Anniversary', image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=300&q=80' },
  { id: '3', name: 'Love & Romance', image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=300&q=80' },
  { id: '4', name: 'Congratulations', image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=300&q=80' },
  { id: '5', name: 'Thank You', image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=300&q=80' },
  { id: '6', name: 'Wedding', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=300&q=80' },
];

const TRENDING_SEARCH_PILLS = [
  'Red Roses',
  'Exotic Bouquets',
  'Temple Jasmine',
  'Wedding Garlands',
  'Forever 365',
  'Luxury Hampers',
];

export default function HomeScreen() {
  const router = useRouter();
  const { deliveryLocation } = useUIStore();
  const { items: wishlistItems } = useWishlistStore();

  const [scrolled, setScrolled] = useState(false);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  const { width, height, isLandscape, gridItemWidth } = useResponsive();

  // Responsive Hero Banner sizing (proportioned for both portrait & landscape)
  const heroCardWidth = isLandscape
    ? Math.min(Math.round(height * 0.55 * (16 / 9)), width - Spacing.screenPadding * 2)
    : Math.min(width - Spacing.screenPadding * 2, 720);
  const heroCardHeight = isLandscape
    ? Math.min(Math.round(height * 0.55), 260)
    : Math.min(Math.round((heroCardWidth * 9) / 16), 340);

  const heroScrollRef = useRef<ScrollView>(null);
  const autoPlayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-play Swiper Carousel every 4.2 seconds
  useEffect(() => {
    autoPlayTimerRef.current = setInterval(() => {
      setActiveHeroIndex((prev) => {
        const next = (prev + 1) % HERO_SLIDES.length;
        heroScrollRef.current?.scrollTo({
          x: next * (heroCardWidth + 12),
          animated: true,
        });
        return next;
      });
    }, 4200);

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [heroCardWidth]);

  // Flash deal live countdown timer
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 47, seconds: 19 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 3, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { getItemCount } = useCartStore();
  const cartCount = getItemCount();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('');
  const [activeFeedTab, setActiveFeedTab] = useState<'all' | 'bestsellers' | 'deals' | 'budget'>('all');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getProducts(),
  });

  const products = data?.products || [];
  const bestSellers = products.filter((p) => p.isBestSeller || (p.rating && p.rating >= 4.8)).slice(0, 8);
  const flashDeals = products.slice(0, 6);

  // Flipkart-style interactive filtered product feed
  const displayedProducts = React.useMemo(() => {
    let list = [...products];

    // Filter by circular category bubble selection
    if (activeCategoryFilter) {
      const lower = activeCategoryFilter.toLowerCase();
      const filtered = list.filter((p) => {
        const cat = (p.category || '').toLowerCase();
        const sub = (p.subCategory || '').toLowerCase();
        const flower = (p.flowerType || '').toLowerCase();
        const name = (p.name || '').toLowerCase();
        return (
          cat.includes(lower) ||
          sub.includes(lower) ||
          flower.includes(lower) ||
          name.includes(lower)
        );
      });
      if (filtered.length > 0) list = filtered;
    }

    // Filter by feed tabs
    if (activeFeedTab === 'bestsellers') {
      list = list.filter((p) => p.isBestSeller || (p.rating && p.rating >= 4.8));
    } else if (activeFeedTab === 'deals') {
      list = list.filter(
        (p) =>
          (p.originalPrice && p.originalPrice > p.price) ||
          p.tag?.toLowerCase().includes('off') ||
          p.tag?.toLowerCase().includes('sale') ||
          p.tag?.toLowerCase().includes('deal')
      );
    } else if (activeFeedTab === 'budget') {
      list = [...list].sort((a, b) => a.price - b.price);
    }

    return list;
  }, [products, activeCategoryFilter, activeFeedTab]);

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: '/product/[id]',
      params: { id: product.id || product._id || product.slug },
    });
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    if (y > 10 && !scrolled) {
      setScrolled(true);
    } else if (y <= 10 && scrolled) {
      setScrolled(false);
    }
  };

  const onHeroScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const idx = Math.round(offsetX / (heroCardWidth + 12));
    if (idx >= 0 && idx < HERO_SLIDES.length && idx !== activeHeroIndex) {
      setActiveHeroIndex(idx);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* 1. Flipkart-style Top App Bar / Navbar */}
      <View style={[styles.headerContainer, scrolled && styles.headerScrolled]}>
        {/* Row 1: Brand Logo + Assured Badge + Location Picker + Actions */}
        <View style={styles.headerTopRow}>
          <View style={styles.brandWithBadge}>
            <GrandLogo
              layout="horizontal"
              size="sm"
              subtitleText="EXPORTS"
              onPress={() => router.push('/(tabs)/home')}
            />
            <View style={styles.assuredBadge}>
              <Sparkles size={9} color={Colors.gold} />
              <AppText variant="caption" color={Colors.white} weight="bold" style={styles.assuredBadgeText}>
                Assured
              </AppText>
            </View>
          </View>

          {/* Right Group: Location Pill + Action Buttons */}
          <View style={styles.headerRightGroup}>
            {/* Location Delivery Selector Pill */}
            <TouchableOpacity
              style={styles.locationPill}
              onPress={() => router.push('/addresses')}
              accessibilityRole="button"
              accessibilityLabel={`Deliver to ${deliveryLocation}`}
            >
              <MapPin size={12} color={Colors.primary} />
              <View style={styles.locationTextWrap}>
                <AppText variant="caption" color={Colors.textSecondary} style={styles.deliverToCaption}>
                  Deliver to
                </AppText>
                <AppText variant="caption" weight="semiBold" color={Colors.text} numberOfLines={1} style={styles.locationCity}>
                  {deliveryLocation || 'Select Area'}
                </AppText>
              </View>
              <ChevronDown size={11} color={Colors.textSecondary} />
            </TouchableOpacity>

            {/* Action Icons: Wishlist & Bag */}
            <TouchableOpacity
              style={styles.actionIconBtn}
              onPress={() => router.push('/wishlist')}
              accessibilityRole="button"
              accessibilityLabel="Wishlist"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Heart size={18} color={Colors.text} strokeWidth={1.8} />
              {wishlistItems.length > 0 && (
                <View style={styles.badgePip}>
                  <AppText variant="caption" color={Colors.white} weight="semiBold" style={{ fontSize: 9 }}>
                    {wishlistItems.length}
                  </AppText>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionIconBtn}
              onPress={() => router.push('/(tabs)/cart')}
              accessibilityRole="button"
              accessibilityLabel="Cart"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ShoppingBag size={18} color={Colors.text} strokeWidth={1.8} />
              {cartCount > 0 && (
                <View style={[styles.badgePip, { backgroundColor: Colors.primaryDeep }]}>
                  <AppText variant="caption" color={Colors.white} weight="semiBold" style={{ fontSize: 9 }}>
                    {cartCount}
                  </AppText>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Row 2: Flipkart-style Prominent Search Pill */}
        <View style={styles.searchRow}>
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => router.push('/search')}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Search fresh roses, jasmine, pooja flowers, bouquets"
          >
            <Search size={18} color={Colors.primary} strokeWidth={2} style={styles.searchIcon} />
            <AppText variant="bodySm" color={Colors.textSecondary} style={styles.searchPlaceholder}>
              Search roses, jasmine, pooja flowers, bouquets...
            </AppText>
            <View style={styles.filterChipButton}>
              <SlidersHorizontal size={14} color={Colors.primaryDeep} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Row 3: Flipkart-style Live Offer Ticker */}
        <View style={styles.offerTickerStrip}>
          <Sparkles size={11} color={Colors.gold} />
          <AppText variant="caption" weight="bold" color={Colors.primaryDeep} style={styles.tickerLead}>
            DHANVIKK ASSURED
          </AppText>
          <View style={styles.tickerDot} />
          <AppText variant="caption" color={Colors.text} style={styles.tickerText} numberOfLines={1}>
            Direct Farm Harvest · 2-Hr Express in TN & BLR · Code: BLOOMFIRST
          </AppText>
        </View>

        {/* Row 4: Trending Search Quick Tags */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trendingTagsScroll}
        >
          {TRENDING_SEARCH_PILLS.map((tag, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.trendingTag}
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/shop',
                  params: { query: tag },
                })
              }
            >
              <AppText variant="caption" color={Colors.text} weight="medium">
                {tag}
              </AppText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.primary}
          />
        }
      >
        {/* 2. Flipkart-style Circular Category Stories Row with Active Highlight */}
        <View style={styles.categoryStoriesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryStoriesScroll}
          >
            {QUICK_CATEGORIES.map((cat) => {
              const isSelected =
                (cat.name === 'All Blooms' && !activeCategoryFilter) ||
                activeCategoryFilter.toLowerCase() === cat.name.toLowerCase() ||
                (cat.query && activeCategoryFilter.toLowerCase() === cat.query.toLowerCase());

              return (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryStoryItem}
                  onPress={() => {
                    if (cat.name === 'All Blooms') {
                      setActiveCategoryFilter('');
                    } else {
                      setActiveCategoryFilter((prev) =>
                        prev.toLowerCase() === cat.name.toLowerCase() ? '' : cat.name
                      );
                    }
                  }}
                  activeOpacity={0.85}
                >
                  <View
                    style={[
                      styles.categoryStoryRing,
                      isSelected && styles.categoryStoryRingActive,
                    ]}
                  >
                    <Image
                      source={{ uri: cat.image }}
                      style={styles.categoryStoryImage}
                      contentFit="cover"
                    />
                    {cat.badge ? (
                      <View style={styles.categoryBadgeChip}>
                        <AppText variant="caption" color={Colors.white} weight="bold" style={styles.categoryBadgeText}>
                          {cat.badge}
                        </AppText>
                      </View>
                    ) : null}
                  </View>
                  <AppText
                    variant="caption"
                    color={isSelected ? Colors.primaryDeep : Colors.text}
                    align="center"
                    numberOfLines={1}
                    weight={isSelected ? 'bold' : 'medium'}
                    style={styles.categoryStoryLabel}
                  >
                    {cat.name}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 3. 16:9 Widescreen Hero Carousel Swiper */}
        <View style={styles.heroSection}>
          <ScrollView
            ref={heroScrollRef}
            horizontal
            pagingEnabled={false}
            snapToInterval={heroCardWidth + 12}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            onScroll={onHeroScroll}
            scrollEventThrottle={16}
            contentContainerStyle={styles.heroScrollContent}
          >
            {HERO_SLIDES.map((slide) => (
              <View
                key={slide.id}
                style={[
                  styles.heroCard,
                  { width: heroCardWidth, height: heroCardHeight },
                ]}
              >
                <Image
                  source={{ uri: slide.image }}
                  style={styles.heroImage}
                  contentFit="cover"
                  transition={260}
                />

                {/* 16:9 Cinematic Vignette & Bottom Text Overlay */}
                <View style={styles.heroOverlay}>
                  {/* Top Badge Tag */}
                  <View style={styles.heroTopRow}>
                    <View style={styles.heroBadge}>
                      <Sparkles size={11} color={Colors.gold} />
                      <AppText
                        variant="caption"
                        color={Colors.white}
                        weight="semiBold"
                        style={styles.heroBadgeText}
                      >
                        {slide.kicker}
                      </AppText>
                    </View>

                    {slide.badge ? (
                      <View style={styles.heroDiscountPill}>
                        <AppText variant="caption" color={Colors.primaryDeep} weight="semiBold" style={{ fontSize: 10 }}>
                          {slide.badge}
                        </AppText>
                      </View>
                    ) : null}
                  </View>

                  {/* Headline & CTA */}
                  <View style={styles.heroBottomContent}>
                    <AppText
                      variant="h2"
                      serif={true}
                      color={Colors.white}
                      numberOfLines={1}
                      style={styles.heroTitle}
                    >
                      {slide.title}
                    </AppText>
                    <AppText
                      variant="caption"
                      color="rgba(255, 255, 255, 0.9)"
                      numberOfLines={1}
                      style={styles.heroSub}
                    >
                      {slide.subtitle}
                    </AppText>

                    <View style={styles.heroActionsRow}>
                      <TouchableOpacity
                        style={styles.heroPrimaryCta}
                        onPress={() => router.push(slide.primaryLink as any)}
                        activeOpacity={0.88}
                      >
                        <AppText variant="caption" color={Colors.white} weight="semiBold">
                          {slide.primaryCta}
                        </AppText>
                        <ArrowRight size={13} color={Colors.white} style={{ marginLeft: 4 }} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.heroSecondaryCta}
                        onPress={() => router.push(slide.secondaryLink as any)}
                        activeOpacity={0.8}
                      >
                        <AppText variant="caption" color={Colors.white} weight="medium">
                          {slide.secondaryCta} →
                        </AppText>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Flipkart-style Swiper Pagination Indicators */}
          <View style={styles.heroPagination}>
            {HERO_SLIDES.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.heroDot,
                  activeHeroIndex === idx && styles.heroDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* 4. Flipkart-style Deals of the Day Flash Strip */}
        <View style={styles.flashDealsSection}>
          <View style={styles.dealHeaderRow}>
            <View style={styles.dealTitleGroup}>
              <View style={styles.flashFlameCircle}>
                <Zap size={14} color={Colors.primary} />
              </View>
              <View>
                <AppText variant="h3" weight="semiBold" color={Colors.text}>
                  Deals of the Day
                </AppText>
                <View style={styles.timerRow}>
                  <Clock size={12} color={Colors.primaryDeep} />
                  <AppText variant="caption" color={Colors.primaryDeep} weight="semiBold" style={{ marginLeft: 4 }}>
                    Ends in {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
                  </AppText>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => router.push('/(tabs)/shop')}
              style={styles.viewAllDealsBtn}
            >
              <AppText variant="caption" color={Colors.primaryDeep} weight="semiBold">
                View All →
              </AppText>
            </TouchableOpacity>
          </View>

          {/* Horizontal Snap Scroll for Flash Deals */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={166}
            decelerationRate="fast"
            contentContainerStyle={styles.dealsCarouselContent}
          >
            {isLoading
              ? [0, 1, 2].map((i) => (
                  <View key={`deal-skeleton-${i}`} style={styles.carouselCardWrapper}>
                    <ProductCardSkeleton />
                  </View>
                ))
              : (flashDeals.length > 0 ? flashDeals : products.slice(0, 5)).map((product) => (
                  <View key={`deal-${product.id || product._id}`} style={styles.carouselCardWrapper}>
                    <ProductCard product={product} onPress={handleProductPress} />
                  </View>
                ))}
          </ScrollView>
        </View>

        {/* 5. Flipkart 2x2 Feature Tile Grid ("Special Collections") */}
        <View style={styles.section}>
          <SectionHeader
            title="Special Collections"
            kicker="Export Specials & Essentials"
            actionText="View all"
            onAction={() => router.push('/(tabs)/categories')}
          />
          <View style={styles.specialGrid}>
            {SPECIAL_COLLECTIONS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.specialTile}
                activeOpacity={0.9}
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/shop',
                    params: { category: item.category },
                  })
                }
              >
                <Image source={{ uri: item.image }} style={styles.specialTileImage} contentFit="cover" />
                <View style={styles.specialTileOverlay}>
                  <View style={styles.specialTileTag}>
                    <AppText variant="caption" color={Colors.white} weight="bold" style={styles.specialTileTagText}>
                      {item.tag}
                    </AppText>
                  </View>
                  <AppText variant="bodySm" weight="bold" color={Colors.white} numberOfLines={1}>
                    {item.title}
                  </AppText>
                  <AppText variant="caption" color="#FFE082" weight="semiBold">
                    {item.subtitle}
                  </AppText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 6. Promotional Coupon Banner (Flipkart-style Offer Strip) */}
        <TouchableOpacity
          style={styles.promoCouponStrip}
          onPress={() => router.push('/(tabs)/shop')}
          activeOpacity={0.9}
        >
          <View style={styles.promoTagCircle}>
            <Tag size={16} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="caption" color={Colors.primaryDeep} weight="semiBold">
              FLAT ₹200 OFF ON FIRST ORDER
            </AppText>
            <AppText variant="caption" color={Colors.textSecondary} style={{ fontSize: 11 }}>
              {'Use Code: '}
              <AppText variant="caption" weight="semiBold" color={Colors.text} style={{ fontSize: 11 }}>BLOOMFIRST</AppText>
              {' · Free Express Delivery'}
            </AppText>
          </View>
          <AppButton
            title="CLAIM"
            variant="secondary"
            size="small"
            onPress={() => router.push('/(tabs)/shop')}
            style={styles.claimBtn}
          />
        </TouchableOpacity>

        {/* 7. Curated for Occasions */}
        <View style={styles.section}>
          <SectionHeader
            title="Curated for Occasions"
            kicker="Celebration Moments"
            actionText="View all"
            onAction={() => router.push('/(tabs)/shop')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.occasionsScroll}
          >
            {OCCASIONS.map((occ) => (
              <TouchableOpacity
                key={occ.id}
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/shop',
                    params: { occasion: occ.name },
                  })
                }
                style={styles.occasionItem}
                accessibilityRole="button"
                accessibilityLabel={occ.name}
              >
                <View style={styles.occasionCircle}>
                  <Image
                    source={{ uri: occ.image }}
                    style={styles.occasionImage}
                    contentFit="cover"
                  />
                </View>
                <AppText
                  variant="caption"
                  color={Colors.text}
                  align="center"
                  numberOfLines={1}
                  style={styles.occasionName}
                >
                  {occ.name}
                </AppText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 8. Most Cherished Blooms / Best Sellers Snap Carousel */}
        <View style={styles.section}>
          <SectionHeader
            title="Most Cherished Blooms"
            kicker="Client Favorites"
            actionText="See all"
            onAction={() => router.push('/(tabs)/shop')}
          />
          {isLoading ? (
            <View style={styles.loadingRow}>
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={166}
              decelerationRate="fast"
              contentContainerStyle={styles.carouselContainer}
            >
              {(bestSellers.length > 0 ? bestSellers : products.slice(0, 5)).map((product) => (
                <View key={`bestseller-${product.id || product._id}`} style={styles.carouselCardWrapper}>
                  <ProductCard product={product} onPress={handleProductPress} />
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* 9. Editorial Magazine Spread Cards */}
        <View style={styles.section}>
          <SectionHeader
            title="The Editorial Spread"
            kicker="Curated Perspectives"
          />
          <View style={[styles.editorialSpreadContainer, isLandscape && { flexDirection: 'row', gap: 16 }]}>
            {/* For Her */}
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/shop',
                  params: { recipient: 'For Her' },
                })
              }
              style={[styles.editorialCard, isLandscape && { flex: 1 }]}
            >
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1000&q=80',
                }}
                style={styles.editorialImage}
                contentFit="cover"
              />
              <View style={styles.editorialOverlay}>
                <AppText variant="caption" color={Colors.white} weight="semiBold" style={{ letterSpacing: 1.5 }}>
                  COLLECTION N° 01
                </AppText>
                <AppText variant="h1" serif={true} color={Colors.white} style={styles.editorialTitle}>
                  For Her: Pastel Poetry & Peonies
                </AppText>
                <View style={styles.editorialLinkRow}>
                  <AppText variant="button" color={Colors.white} weight="semiBold">
                    Explore the edit
                  </AppText>
                  <ArrowRight size={16} color={Colors.white} style={{ marginLeft: 6 }} />
                </View>
              </View>
            </TouchableOpacity>

            {/* For Him */}
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/shop',
                  params: { recipient: 'For Him' },
                })
              }
              style={[styles.editorialCard, isLandscape ? { flex: 1 } : { marginTop: 16 }]}
            >
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=1000&q=80',
                }}
                style={styles.editorialImage}
                contentFit="cover"
              />
              <View style={styles.editorialOverlay}>
                <AppText variant="caption" color={Colors.white} weight="semiBold" style={{ letterSpacing: 1.5 }}>
                  COLLECTION N° 02
                </AppText>
                <AppText variant="h1" serif={true} color={Colors.white} style={styles.editorialTitle}>
                  For Him: Architectural Botanicals
                </AppText>
                <View style={styles.editorialLinkRow}>
                  <AppText variant="button" color={Colors.white} weight="semiBold">
                    Discover curation
                  </AppText>
                  <ArrowRight size={16} color={Colors.white} style={{ marginLeft: 6 }} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* 10. Flipkart-style Main Product Feed with Filter Tabs */}
        <View style={styles.section}>
          <SectionHeader
            title={activeCategoryFilter ? `${activeCategoryFilter} Collection` : 'Fresh Harvest Daily'}
            kicker="Direct from farms"
            actionText={`View All (${displayedProducts.length || products.length})`}
            onAction={() => router.push('/(tabs)/shop')}
          />

          {/* Flipkart Filter Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.feedTabsScroll}
          >
            {[
              { id: 'all', label: 'All Blooms' },
              { id: 'bestsellers', label: '⭐ Best Sellers' },
              { id: 'deals', label: '⚡ Flash Deals' },
              { id: 'budget', label: '💰 Budget Deals' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.feedTabChip,
                  activeFeedTab === tab.id && styles.feedTabChipActive,
                ]}
                onPress={() => setActiveFeedTab(tab.id as any)}
                activeOpacity={0.8}
              >
                <AppText
                  variant="caption"
                  weight={activeFeedTab === tab.id ? 'bold' : 'medium'}
                  color={activeFeedTab === tab.id ? Colors.white : Colors.text}
                >
                  {tab.label}
                </AppText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* 2-Column Responsive Product Grid */}
          <View style={styles.grid}>
            {isLoading
              ? [0, 1, 2, 3].map((i) => (
                  <View key={`fresh-skeleton-${i}`} style={[styles.gridItem, { width: gridItemWidth }]}>
                    <ProductCardSkeleton />
                  </View>
                ))
              : displayedProducts.slice(0, 14).map((product) => (
                  <View
                    key={`fresh-${product.id || product._id}`}
                    style={[styles.gridItem, { width: gridItemWidth }]}
                  >
                    <ProductCard product={product} onPress={handleProductPress} />
                  </View>
                ))}
          </View>

          {!isLoading && displayedProducts.length > 14 && (
            <View style={{ paddingHorizontal: Spacing.screenPadding, marginTop: Spacing.md }}>
              <AppButton
                title={`Explore All ${displayedProducts.length} Blooms →`}
                variant="outline"
                size="normal"
                fullWidth
                onPress={() => router.push('/(tabs)/shop')}
              />
            </View>
          )}
        </View>

        {/* 11. Dhanvikk Trust Reassurance Pillars */}
        <View style={styles.trustGridContainer}>
          <View style={styles.trustItem}>
            <View style={styles.trustIconCircle}>
              <Flower2 size={18} color={Colors.primary} />
            </View>
            <AppText variant="caption" weight="semiBold" color={Colors.text} align="center" style={{ marginTop: 6 }}>
              100% Farm Fresh
            </AppText>
            <AppText variant="caption" color={Colors.textSecondary} align="center" style={{ fontSize: 10 }}>
              Hosur & Nilgiris growers
            </AppText>
          </View>

          <View style={styles.trustItem}>
            <View style={styles.trustIconCircle}>
              <Truck size={18} color={Colors.primary} />
            </View>
            <AppText variant="caption" weight="semiBold" color={Colors.text} align="center" style={{ marginTop: 6 }}>
              2-Hr Express
            </AppText>
            <AppText variant="caption" color={Colors.textSecondary} align="center" style={{ fontSize: 10 }}>
              Chilled cold-chain
            </AppText>
          </View>

          <View style={styles.trustItem}>
            <View style={styles.trustIconCircle}>
              <ShieldCheck size={18} color={Colors.primary} />
            </View>
            <AppText variant="caption" weight="semiBold" color={Colors.text} align="center" style={{ marginTop: 6 }}>
              Safe Payments
            </AppText>
            <AppText variant="caption" color={Colors.textSecondary} align="center" style={{ fontSize: 10 }}>
              Razorpay, UPI & COD
            </AppText>
          </View>
        </View>

        {/* 12. Indian Floral Export Heritage Brand Story Footer */}
        <View style={styles.brandStorySection}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
            }}
            style={styles.storyImage}
            contentFit="cover"
          />
          <View style={styles.storyContent}>
            <AppText variant="caption" color={Colors.primaryDeep} weight="semiBold" style={{ letterSpacing: 1.2 }}>
              OUR HERITAGE & ETHOS
            </AppText>
            <AppText variant="h2" serif={true} style={styles.storyHeading}>
              Direct farm exports. Peak Indian floristry.
            </AppText>
            <AppText variant="bodySm" color={Colors.textSecondary} style={styles.storyText}>
              Every stem is conditioned in climate-controlled sanctuaries within hours of harvest from our growers in Hosur, Nilgiris & Tamil Nadu.
            </AppText>
            <TouchableOpacity onPress={() => router.push('/about')} style={styles.storyLink}>
              <AppText variant="button" color={Colors.primaryDeep} weight="semiBold">
                Read our story →
              </AppText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom padding */}
        <View style={{ height: 48 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // Flipkart-style Navbar Container
  headerContainer: {
    backgroundColor: Colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    paddingTop: 8,
    paddingBottom: 8,
    zIndex: 20,
  },
  headerScrolled: {
    ...Shadows.sm,
    backgroundColor: Colors.surface,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: 10,
    minHeight: 40,
  },
  brandWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  assuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryDeep,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.chip,
    gap: 3,
  },
  assuredBadgeText: {
    fontSize: 9.5,
    letterSpacing: 0.3,
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.surface,
    paddingHorizontal: 9,
    paddingVertical: 4,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  locationTextWrap: {
    maxWidth: 90,
    justifyContent: 'center',
  },
  deliverToCaption: {
    fontSize: 8.5,
    lineHeight: 11,
  },
  locationCity: {
    fontSize: 10.5,
    lineHeight: 13,
  },
  actionIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgePip: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.primary,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notifDot: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  // Flipkart-style Search Bar Row
  searchRow: {
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: 6,
  },
  searchBar: {
    height: 44,
    backgroundColor: Colors.surface,
    borderRadius: Radius.input,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 13,
  },
  filterChipButton: {
    backgroundColor: Colors.tintedSurface,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Live Offer Ticker Strip
  offerTickerStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3F6',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: 6,
    marginHorizontal: Spacing.screenPadding,
    borderRadius: Radius.chip,
    marginBottom: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FCE4EC',
  },
  tickerLead: {
    fontSize: 10,
    letterSpacing: 0.6,
  },
  tickerDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textSecondary,
  },
  tickerText: {
    flex: 1,
    fontSize: 10.5,
  },
  // Trending Tags
  trendingTagsScroll: {
    paddingHorizontal: Spacing.screenPadding,
    gap: 8,
    paddingVertical: 2,
  },
  trendingTag: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.chip,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  // Scroll Content
  scrollContent: {
    paddingTop: 10,
  },
  // Flipkart-style Category Stories
  categoryStoriesContainer: {
    marginBottom: 16,
  },
  categoryStoriesScroll: {
    paddingHorizontal: Spacing.screenPadding,
    gap: 14,
  },
  categoryStoryItem: {
    alignItems: 'center',
    width: 66,
  },
  categoryStoryRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    padding: 2,
    backgroundColor: Colors.surface,
    marginBottom: 4,
    ...Shadows.sm,
  },
  categoryStoryRingActive: {
    borderColor: Colors.primaryDeep,
    borderWidth: 2.5,
    backgroundColor: Colors.blush,
    transform: [{ scale: 1.05 }],
  },
  categoryBadgeChip: {
    position: 'absolute',
    bottom: -4,
    alignSelf: 'center',
    backgroundColor: Colors.primaryDeep,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: Radius.chip,
    borderWidth: 1,
    borderColor: Colors.white,
  },
  categoryBadgeText: {
    fontSize: 8,
    letterSpacing: 0.3,
  },
  categoryStoryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 29,
  },
  categoryStoryLabel: {
    fontSize: 11,
  },
  // 16:9 Hero Carousel Section
  heroSection: {
    marginBottom: 20,
  },
  heroScrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    gap: 12,
  },
  heroCard: {
    borderRadius: Radius.card,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.blush,
    ...Shadows.md,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'rgba(28, 20, 24, 0.42)',
    justifyContent: 'space-between',
    padding: 14,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(233, 30, 99, 0.88)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.chip,
    alignSelf: 'flex-start',
  },
  heroBadgeText: {
    marginLeft: 4,
    letterSpacing: 0.8,
    fontSize: 10,
  },
  heroDiscountPill: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.chip,
  },
  heroBottomContent: {
    gap: 4,
  },
  heroTitle: {
    color: Colors.white,
    fontSize: 20,
    lineHeight: 24,
  },
  heroSub: {
    fontSize: 11,
    marginBottom: 6,
  },
  heroActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroPrimaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.button,
  },
  heroSecondaryCta: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  heroPagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
  },
  heroDot: {
    width: 6,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.border,
  },
  heroDotActive: {
    width: 22,
    backgroundColor: Colors.primary,
  },
  // Flash Deals Section
  flashDealsSection: {
    marginBottom: Spacing.section,
    backgroundColor: Colors.tintedSurface,
    paddingVertical: 14,
    borderRadius: Radius.card,
    marginHorizontal: Spacing.screenPadding,
    borderWidth: 1,
    borderColor: '#FCE4EC',
  },
  dealHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  dealTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flashFlameCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  viewAllDealsBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dealsCarouselContent: {
    paddingHorizontal: Spacing.screenPadding,
    gap: 12,
  },
  // Promotional Offer Strip
  promoCouponStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.screenPadding,
    padding: 12,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    gap: 10,
    marginBottom: Spacing.section,
    ...Shadows.sm,
  },
  promoTagCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.tintedSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  claimBtn: {
    paddingHorizontal: 10,
    minHeight: 34,
  },
  // Section Spacing
  section: {
    marginBottom: Spacing.section,
  },
  occasionsScroll: {
    paddingHorizontal: Spacing.screenPadding,
    gap: 14,
  },
  occasionItem: {
    alignItems: 'center',
    width: 76,
  },
  occasionCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    backgroundColor: Colors.blush,
    marginBottom: 6,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  occasionImage: {
    width: '100%',
    height: '100%',
  },
  occasionName: {
    fontSize: 12,
  },
  // Special Collections 2x2 Grid
  specialGrid: {
    paddingHorizontal: Spacing.screenPadding,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  specialTile: {
    width: '48.5%',
    height: 140,
    borderRadius: Radius.card,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.blush,
    ...Shadows.sm,
  },
  specialTileImage: {
    width: '100%',
    height: '100%',
  },
  specialTileOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'rgba(28, 20, 24, 0.42)',
    justifyContent: 'flex-end',
    padding: 10,
  },
  specialTileTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.primaryDeep,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.chip,
  },
  specialTileTagText: {
    fontSize: 8.5,
    letterSpacing: 0.5,
  },
  // Bento Block
  bentoContainer: {
    marginHorizontal: Spacing.screenPadding,
    flexDirection: 'row',
    gap: 12,
    height: 250,
  },
  bentoLarge: {
    flex: 1.2,
    borderRadius: Radius.card,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.blush,
  },
  bentoRightCol: {
    flex: 1,
    flexDirection: 'column',
    gap: 12,
  },
  bentoSmall: {
    flex: 1,
    borderRadius: Radius.card,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.blush,
  },
  bentoImage: {
    width: '100%',
    height: '100%',
  },
  bentoScrim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(36, 27, 31, 0.46)',
    padding: 12,
  },
  // Carousel Container
  carouselContainer: {
    paddingHorizontal: Spacing.screenPadding,
    gap: 12,
  },
  carouselCardWrapper: {
    width: 154,
  },
  loadingRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.screenPadding,
    gap: 12,
  },
  // Editorial Spread
  editorialSpreadContainer: {
    paddingHorizontal: Spacing.screenPadding,
  },
  editorialCard: {
    height: 200,
    borderRadius: Radius.card,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.blush,
  },
  editorialImage: {
    width: '100%',
    height: '100%',
  },
  editorialOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'rgba(36, 27, 31, 0.44)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  editorialTitle: {
    marginVertical: 4,
    fontSize: 18,
    lineHeight: 24,
  },
  editorialLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  // Flipkart-style Feed Filter Tabs
  feedTabsScroll: {
    paddingHorizontal: Spacing.screenPadding,
    gap: 8,
    marginBottom: 12,
  },
  feedTabChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.chip,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  feedTabChipActive: {
    backgroundColor: Colors.primaryDeep,
    borderColor: Colors.primaryDeep,
  },
  // Grid
  grid: {
    paddingHorizontal: Spacing.screenPadding,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {},
  // Trust Grid Container
  trustGridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.screenPadding,
    padding: 14,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.section,
    ...Shadows.sm,
  },
  trustItem: {
    flex: 1,
    alignItems: 'center',
  },
  trustIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.tintedSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Brand Story Footer
  brandStorySection: {
    marginHorizontal: Spacing.screenPadding,
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  storyImage: {
    width: '100%',
    height: 140,
  },
  storyContent: {
    padding: Spacing.cardPadding,
  },
  storyHeading: {
    marginVertical: 6,
    color: Colors.text,
    fontSize: 20,
    lineHeight: 26,
  },
  storyText: {
    lineHeight: 20,
    marginBottom: 12,
  },
  storyLink: {
    alignSelf: 'flex-start',
  },
});
