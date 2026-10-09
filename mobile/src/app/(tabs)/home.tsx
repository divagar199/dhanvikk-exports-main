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
  SlidersHorizontal,
  ChevronDown,
  Clock,
  Tag,
  Zap,
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
import { useResponsive } from '../../hooks/useResponsive';
import { Product } from '../../types';

// 16:9 Widescreen Hero Banners
const HERO_SLIDES = [
  {
    id: 'hero-1',
    kicker: 'THE BOTANICAL EDIT',
    badge: 'UP TO 20% OFF',
    title: 'Curated blooms, delivered in 2 hours.',
    subtitle: 'Hand-picked Ecuadorian roses & artisanal arrangements.',
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1280&q=85',
    primaryCta: 'Shop Blooms',
    primaryLink: '/(tabs)/shop',
    secondaryCta: 'Explore gifts',
    secondaryLink: '/(tabs)/categories',
  },
  {
    id: 'hero-2',
    kicker: 'ETERNAL COUTURE',
    badge: '365 DAYS FRESH',
    title: 'Forever roses that endure all year.',
    subtitle: 'Preserved botanicals in signature presentation boxes.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1280&q=85',
    primaryCta: 'Explore Forever',
    primaryLink: '/(tabs)/shop',
    secondaryCta: 'Care guide',
    secondaryLink: '/about',
  },
  {
    id: 'hero-3',
    kicker: 'CELEBRATIONS & WEDDINGS',
    badge: 'LUXURY ATELIER',
    title: 'Grand moments, dressed in petals.',
    subtitle: 'Bespoke event styling and bridal floral collections.',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1280&q=85',
    primaryCta: 'View Ceremony',
    primaryLink: '/(tabs)/shop',
    secondaryCta: 'Bespoke Order',
    secondaryLink: '/help',
  },
  {
    id: 'hero-4',
    kicker: 'GOURMET COMBOS',
    badge: 'SAME-DAY EXPRESS',
    title: 'Exotic blooms & artisanal hampers.',
    subtitle: 'Belgian chocolates, scented soy candles & orchids.',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1280&q=85',
    primaryCta: 'Order Hampers',
    primaryLink: '/(tabs)/shop',
    secondaryCta: 'All Combos',
    secondaryLink: '/(tabs)/categories',
  },
];

// Flipkart-style Circular Category Bubbles
const QUICK_CATEGORIES = [
  { id: '1', name: 'All Blooms', query: '', image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=300&q=80' },
  { id: '2', name: 'Roses', query: 'Roses', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80' },
  { id: '3', name: 'Bouquets', query: 'Hand Bouquets', image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=300&q=80' },
  { id: '4', name: 'Forever 365', query: 'Forever Roses', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=300&q=80' },
  { id: '5', name: 'Flower Boxes', query: 'Flower Boxes', image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=300&q=80' },
  { id: '6', name: 'Lilies', query: 'Lilies', image: 'https://images.unsplash.com/photo-1533616688419-b7a585564566?auto=format&fit=crop&w=300&q=80' },
  { id: '7', name: 'Plants', query: 'Plants', image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=300&q=80' },
  { id: '8', name: 'Fresh Edit', query: 'Flowers', image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=300&q=80' },
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
  'Forever 365',
  'Luxury Hampers',
  '2-Hr Express',
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

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getProducts(),
  });

  const products = data?.products || [];
  const bestSellers = products.filter((p) => p.isBestSeller || (p.rating && p.rating >= 4.8)).slice(0, 8);
  const flashDeals = products.slice(0, 6);

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
        {/* Row 1: Brand Logo + Location Picker + Actions */}
        <View style={styles.headerTopRow}>
          {/* Logo on Left side, Dhanvikk Blooms text on Right side */}
          <GrandLogo
            layout="horizontal"
            size="sm"
            subtitleText="BLOOMS"
            onPress={() => router.push('/(tabs)/home')}
          />

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

            {/* Action Icons: Wishlist & Notifications */}
            <TouchableOpacity
              style={styles.actionIconBtn}
              onPress={() => router.push('/wishlist')}
              accessibilityRole="button"
              accessibilityLabel="Wishlist"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Heart size={19} color={Colors.text} strokeWidth={1.8} />
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
              onPress={() => router.push('/notifications')}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Bell size={19} color={Colors.text} strokeWidth={1.8} />
              <View style={styles.notifDot} />
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
            accessibilityLabel="Search flowers, luxury bouquets, hampers"
          >
            <Search size={18} color={Colors.primary} strokeWidth={2} style={styles.searchIcon} />
            <AppText variant="bodySm" color={Colors.textSecondary} style={styles.searchPlaceholder}>
              Search roses, bouquets, hampers...
            </AppText>
            <View style={styles.filterChipButton}>
              <SlidersHorizontal size={14} color={Colors.primaryDeep} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Row 3: Trending Search Quick Tags */}
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
        {/* 2. Flipkart-style Circular Category Stories Row */}
        <View style={styles.categoryStoriesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryStoriesScroll}
          >
            {QUICK_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryStoryItem}
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/shop',
                    params: cat.query ? { category: cat.query } : {},
                  })
                }
                activeOpacity={0.85}
              >
                <View style={styles.categoryStoryRing}>
                  <Image
                    source={{ uri: cat.image }}
                    style={styles.categoryStoryImage}
                    contentFit="cover"
                  />
                </View>
                <AppText
                  variant="caption"
                  color={Colors.text}
                  align="center"
                  numberOfLines={1}
                  weight="medium"
                  style={styles.categoryStoryLabel}
                >
                  {cat.name}
                </AppText>
              </TouchableOpacity>
            ))}
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
            {(flashDeals.length > 0 ? flashDeals : products.slice(0, 5)).map((product) => (
              <View key={`deal-${product.id || product._id}`} style={styles.carouselCardWrapper}>
                <ProductCard product={product} onPress={handleProductPress} />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 5. Promotional Coupon Banner (Flipkart-style Offer Strip) */}
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
              Use Code: <AppText weight="semiBold" color={Colors.text}>BLOOMFIRST</AppText> · Free Express Delivery
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

        {/* 6. Curated for Occasions */}
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

        {/* 7. Asymmetric Bento Block */}
        <View style={styles.section}>
          <SectionHeader
            title="Featured Collections"
            kicker="Botanical craftsmanship"
          />
          <View style={styles.bentoContainer}>
            {/* Large Bento Card */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/shop',
                  params: { category: 'Flowers' },
                })
              }
              style={styles.bentoLarge}
            >
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=800&q=80',
                }}
                style={styles.bentoImage}
                contentFit="cover"
              />
              <View style={styles.bentoScrim}>
                <AppText variant="caption" color={Colors.white} weight="semiBold" style={{ letterSpacing: 1 }}>
                  SIGNATURE ROSES
                </AppText>
                <AppText variant="h2" serif={true} color={Colors.white}>
                  Hand-Tied Bouquets
                </AppText>
              </View>
            </TouchableOpacity>

            {/* Stacked Small Bento Cards */}
            <View style={styles.bentoRightCol}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/shop',
                    params: { category: 'Forever Roses' },
                  })
                }
                style={styles.bentoSmall}
              >
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
                  }}
                  style={styles.bentoImage}
                  contentFit="cover"
                />
                <View style={styles.bentoScrim}>
                  <AppText variant="caption" color={Colors.white} weight="semiBold">
                    ETERNAL
                  </AppText>
                  <AppText variant="h3" color={Colors.white}>
                    Forever Roses
                  </AppText>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/shop',
                    params: { category: 'Gift Bundles' },
                  })
                }
                style={styles.bentoSmall}
              >
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80',
                  }}
                  style={styles.bentoImage}
                  contentFit="cover"
                />
                <View style={styles.bentoScrim}>
                  <AppText variant="caption" color={Colors.white} weight="semiBold">
                    GIFTING
                  </AppText>
                  <AppText variant="h3" color={Colors.white}>
                    Luxury Boxes
                  </AppText>
                </View>
              </TouchableOpacity>
            </View>
          </View>
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

        {/* 10. Fresh Harvest Arrivals 2-Column Grid */}
        <View style={styles.section}>
          <SectionHeader
            title="Fresh Harvest Daily"
            kicker="Direct from farms"
            actionText={`View All (${products.length || 199})`}
            onAction={() => router.push('/(tabs)/shop')}
          />
          <View style={styles.grid}>
            {products.slice(0, 12).map((product) => (
              <View
                key={`fresh-${product.id || product._id}`}
                style={[styles.gridItem, { width: gridItemWidth }]}
              >
                <ProductCard product={product} onPress={handleProductPress} />
              </View>
            ))}
          </View>

          {products.length > 12 && (
            <View style={{ paddingHorizontal: Spacing.screenPadding, marginTop: Spacing.md }}>
              <AppButton
                title={`Explore All ${products.length} Blooms →`}
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
              <Truck size={18} color={Colors.primary} />
            </View>
            <AppText variant="caption" weight="semiBold" color={Colors.text} align="center" style={{ marginTop: 6 }}>
              2-Hr Express
            </AppText>
            <AppText variant="caption" color={Colors.textSecondary} align="center" style={{ fontSize: 10 }}>
              Chilled transport
            </AppText>
          </View>

          <View style={styles.trustItem}>
            <View style={styles.trustIconCircle}>
              <Flower2 size={18} color={Colors.primary} />
            </View>
            <AppText variant="caption" weight="semiBold" color={Colors.text} align="center" style={{ marginTop: 6 }}>
              100% Farm Fresh
            </AppText>
            <AppText variant="caption" color={Colors.textSecondary} align="center" style={{ fontSize: 10 }}>
              7-day hydration guarantee
            </AppText>
          </View>

          <View style={styles.trustItem}>
            <View style={styles.trustIconCircle}>
              <ShieldCheck size={18} color={Colors.primary} />
            </View>
            <AppText variant="caption" weight="semiBold" color={Colors.text} align="center" style={{ marginTop: 6 }}>
              Safe Checkout
            </AppText>
            <AppText variant="caption" color={Colors.textSecondary} align="center" style={{ fontSize: 10 }}>
              UPI & cards verified
            </AppText>
          </View>
        </View>

        {/* 12. Quiet Brand Story Footer */}
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
              OUR ETHOS
            </AppText>
            <AppText variant="h2" serif={true} style={styles.storyHeading}>
              Direct farm exports. Zero compromise.
            </AppText>
            <AppText variant="bodySm" color={Colors.textSecondary} style={styles.storyText}>
              Every stem is conditioned in climate-controlled sanctuaries within hours of harvest in Ecuador and Holland.
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
