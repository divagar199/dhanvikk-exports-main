import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import {
  ArrowLeft,
  Heart,
  Share2,
  ShieldCheck,
  Truck,
  Flower2,
  Check,
  Info,
  ShoppingBag,
  Zap,
} from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadows } from '../../theme';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { AppChip } from '../../components/AppChip';
import { Price } from '../../components/Price';
import { Rating } from '../../components/Rating';
import { Badge } from '../../components/Badge';
import { ProductCard } from '../../components/ProductCard';
import { SectionHeader } from '../../components/SectionHeader';
import { Skeleton } from '../../components/Skeleton';
import { ErrorState } from '../../components/ErrorState';
import { productService } from '../../services/productService';
import { getProductImageUrl } from '../../utils/imageUrl';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useUIStore } from '../../store/uiStore';
import { useResponsive } from '../../hooks/useResponsive';
import { Product } from '../../types';

const DATE_OPTIONS = ['Today', 'Tomorrow', 'In 2 Days', 'In 3 Days'];
const TIME_SLOTS = [
  'Morning (9 AM - 1 PM)',
  'Afternoon (1 PM - 5 PM)',
  'Evening (5 PM - 9 PM)',
];

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height, isLandscape } = useResponsive();

  const galleryHeight = isLandscape
    ? Math.min(Math.round(height * 0.65), 360)
    : Math.round(height * 0.58);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedSlot, setSelectedSlot] = useState('Evening (5 PM - 9 PM)');
  const [addedAnimation, setAddedAnimation] = useState(false);

  const { addToCart } = useCartStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const { showToast, deliveryLocation } = useUIStore();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(id!),
    enabled: Boolean(id),
  });

  const { data: allProductsData } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getProducts(),
  });

  const product = data?.product;
  const prodId = product ? (product.id || product._id || '') : '';
  const isFav = prodId ? isInWishlist(prodId) : false;

  const inCart = useCartStore((state) =>
    state.items.some((item) => (item.product.id || item.product._id) === prodId)
  );
  const cartItem = useCartStore((state) =>
    state.items.find((item) => (item.product.id || item.product._id) === prodId)
  );

  const relatedProducts = (allProductsData?.products || [])
    .filter((p: Product) => (p.id || p._id) !== prodId)
    .slice(0, 5);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, 1, selectedDate, selectedSlot);
    setAddedAnimation(true);
    const newQty = (cartItem?.quantity || 0) + 1;
    showToast(
      inCart
        ? `Added another ${product.name} to bag (${newQty} in bag)`
        : `${product.name} added to your bag`,
      'success'
    );
    setTimeout(() => {
      setAddedAnimation(false);
    }, 1200);
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (!inCart) {
      addToCart(product, 1, selectedDate, selectedSlot);
    }
    router.push('/checkout');
  };

  const handleShare = async () => {
    if (!product) return;
    try {
      await Share.share({
        message: `Look at this luxury floral arrangement: ${product.name} on Dhanvikk Blooms!`,
        title: product.name,
      });
    } catch {
      // Ignored
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Skeleton height={galleryHeight} borderRadius={0} />
        <View style={styles.skeletonContent}>
          <Skeleton width="40%" height={16} style={{ marginBottom: 12 }} />
          <Skeleton width="90%" height={26} style={{ marginBottom: 16 }} />
          <Skeleton width="50%" height={28} style={{ marginBottom: 24 }} />
          <Skeleton width="100%" height={100} borderRadius={Radius.card} />
        </View>
      </View>
    );
  }

  if (isError || !product) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <ErrorState
          title="Product Not Available"
          message="We could not find this luxury floral arrangement. It might be seasonal or resting."
          onRetry={refetch}
        />
      </SafeAreaView>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1000&q=80'];

  const hasDiscount = Boolean(product?.originalPrice && product.originalPrice > product.price);
  const discountPercent = hasDiscount
    ? Math.round((((product!.originalPrice! - product!.price) / product!.originalPrice!) * 100))
    : 0;
  const isBestseller = Boolean(product?.isBestSeller);
  const isNew = Boolean(product?.isNewArrival || product?.tag === 'NEW');
  const tagUpper = (product?.tag || '').toUpperCase();
  const isOfferTag = Boolean(
    !hasDiscount &&
      product?.tag &&
      product.tag !== 'NEW' &&
      (tagUpper.includes('SALE') ||
        tagUpper.includes('OFF') ||
        tagUpper.includes('DEAL') ||
        tagUpper.includes('SPECIAL'))
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Immersive Gallery Section (proportioned for portrait and landscape) */}
        <View style={[styles.galleryContainer, { width, height: galleryHeight }]}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const offsetX = e.nativeEvent.contentOffset.x;
              const index = Math.round(offsetX / width);
              setActiveImageIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {images.map((imgUri: string, idx: number) => (
              <Image
                key={idx}
                source={{ uri: getProductImageUrl(imgUri) }}
                style={[styles.galleryImage, { width }]}
                contentFit="cover"
              />
            ))}
          </ScrollView>

          {/* Floating Translucent Controls (44px hit areas) */}
          <SafeAreaView style={styles.floatingHeader} edges={['top']}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.floatingButton}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ArrowLeft size={20} color={Colors.text} strokeWidth={1.8} />
            </TouchableOpacity>

            <View style={styles.headerRightBtns}>
              <TouchableOpacity
                onPress={handleShare}
                style={styles.floatingButton}
                accessibilityRole="button"
                accessibilityLabel="Share arrangement"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Share2 size={18} color={Colors.text} strokeWidth={1.8} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => toggleWishlist(product)}
                style={styles.floatingButton}
                accessibilityRole="button"
                accessibilityLabel={isFav ? 'Remove from wishlist' : 'Save to wishlist'}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Heart
                  size={19}
                  color={isFav ? Colors.primary : Colors.text}
                  fill={isFav ? Colors.primary : 'transparent'}
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Pagination Dots inside the image */}
          {images.length > 1 && (
            <View style={styles.paginationDots}>
              {images.map((_: any, idx: number) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    activeImageIndex === idx && styles.activeDot,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Content Sheet: overlaps image by 24px with radius 28 top corners */}
        <View style={styles.contentSheet}>
          {/* Top Badges Row (Offers & Status) */}
          {(discountPercent > 0 || isOfferTag || isBestseller || isNew) && (
            <View style={styles.badgeRow}>
              {discountPercent > 0 ? (
                <Badge label={`${discountPercent}% OFF`} variant="success" />
              ) : isOfferTag ? (
                <Badge label={product.tag!} variant="success" />
              ) : null}

              {isBestseller ? (
                <Badge label="Bestseller" variant="gold" />
              ) : isNew ? (
                <Badge label="New" variant="primary" />
              ) : null}
            </View>
          )}

          {/* 1. Flower Type & Name */}
          <AppText variant="caption" color={Colors.primaryDeep} weight="semiBold" style={styles.categoryKicker}>
            {product.flowerType?.toUpperCase() || product.category?.toUpperCase() || 'LUXURY FLORAL'}
          </AppText>

          <AppText variant="h1" serif={true} style={styles.title}>
            {product.name}
          </AppText>

          {/* 2. Rating & Price */}
          <View style={styles.ratingAndPriceRow}>
            <Price
              price={product.price}
              originalPrice={product.originalPrice}
              size="large"
            />

            {product.rating && product.rating > 0 ? (
              <Rating rating={product.rating} reviewsCount={product.reviewsCount || 16} size={15} />
            ) : null}
          </View>

          {/* 3. Delivery Card (date & slot chips) */}
          <View style={styles.deliveryCard}>
            <View style={styles.deliveryCardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Truck size={18} color={Colors.primary} />
                <AppText variant="bodySm" weight="semiBold">
                  Hand-Delivered to:
                </AppText>
              </View>
              <AppText variant="caption" color={Colors.primaryDeep} weight="semiBold">
                {deliveryLocation}
              </AppText>
            </View>

            {/* Date Chips */}
            <AppText variant="caption" color={Colors.textSecondary} style={{ marginTop: 12, marginBottom: 8 }}>
              Select Delivery Date
            </AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
              {DATE_OPTIONS.map((date) => (
                <AppChip
                  key={date}
                  label={date}
                  selected={selectedDate === date}
                  onPress={() => setSelectedDate(date)}
                  style={{ marginRight: 8 }}
                />
              ))}
            </ScrollView>

            {/* Preferred Time Slot */}
            <AppText variant="caption" color={Colors.textSecondary} style={{ marginTop: 14, marginBottom: 8 }}>
              Preferred Time Slot
            </AppText>
            <View style={styles.slotsGrid}>
              {TIME_SLOTS.map((slot) => (
                <AppChip
                  key={slot}
                  label={slot}
                  selected={selectedSlot === slot}
                  onPress={() => setSelectedSlot(slot)}
                  style={{ width: '100%', marginBottom: 6 }}
                />
              ))}
            </View>

            {/* Inline Guidance Helper Text */}
            <View style={styles.inlineGuide}>
              <Info size={14} color={Colors.primaryDeep} />
              <AppText variant="caption" color={Colors.primaryDeep} style={{ marginLeft: 6, flex: 1 }}>
                Stems conditioned on morning of {selectedDate.toLowerCase()} for arrival during {selectedSlot.split(' ')[0].toLowerCase()} hours.
              </AppText>
            </View>
          </View>

          {/* 4. Description */}
          <View style={styles.descriptionSection}>
            <AppText variant="h3" style={{ marginBottom: 8 }}>
              Botanical Story
            </AppText>
            <AppText variant="body" color={Colors.textSecondary} style={styles.descriptionText}>
              {product.description ||
                'Master-crafted arrangement assembled with freshly harvested long-stem blooms. Wrapped in waterproof matte packaging with temperature-controlled hydration pack.'}
            </AppText>
          </View>

          {/* 5. Details Table (Specifications) */}
          <View style={styles.specsCard}>
            <View style={styles.specItem}>
              <AppText variant="caption" color={Colors.textSecondary}>
                Bloom Variety
              </AppText>
              <AppText variant="bodySm" weight="semiBold">
                {product.flowerType || 'Ecuadorian Roses'}
              </AppText>
            </View>
            <View style={styles.specDivider} />
            <View style={styles.specItem}>
              <AppText variant="caption" color={Colors.textSecondary}>
                Arrangement
              </AppText>
              <AppText variant="bodySm" weight="semiBold">
                {product.subCategory || 'Hand-Tied'}
              </AppText>
            </View>
            <View style={styles.specDivider} />
            <View style={styles.specItem}>
              <AppText variant="caption" color={Colors.textSecondary}>
                Stem Life
              </AppText>
              <AppText variant="bodySm" weight="semiBold">
                5-7 Days Fresh
              </AppText>
            </View>
          </View>

          {/* 6. Trust Row (3 small icons) */}
          <View style={styles.trustRow}>
            <View style={styles.trustItem}>
              <ShieldCheck size={22} color={Colors.primary} />
              <AppText variant="caption" weight="medium" align="center" style={{ marginTop: 4 }}>
                100% Freshness Guarantee
              </AppText>
            </View>
            <View style={styles.trustItem}>
              <Truck size={22} color={Colors.primary} />
              <AppText variant="caption" weight="medium" align="center" style={{ marginTop: 4 }}>
                Chilled Delivery Vans
              </AppText>
            </View>
            <View style={styles.trustItem}>
              <Flower2 size={22} color={Colors.primary} />
              <AppText variant="caption" weight="medium" align="center" style={{ marginTop: 4 }}>
                Master Florist Tied
              </AppText>
            </View>
          </View>

          {/* 7. Related Items */}
          {relatedProducts.length > 0 && (
            <View style={styles.relatedSection}>
              <SectionHeader
                title="Pair with Similar Blooms"
                kicker="Curated companions"
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relatedScroll}
              >
                {relatedProducts.map((relProd: Product) => (
                  <View key={relProd.id || relProd._id} style={styles.relatedCardWrapper}>
                    <ProductCard
                      product={relProd}
                      onPress={(p) =>
                        router.push({
                          pathname: '/product/[id]',
                          params: { id: p.id || p._id || p.slug },
                        })
                      }
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar: price left, Flipkart dual action buttons right */}
      <View style={[styles.stickyBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.priceContainer}>
          <AppText variant="caption" color={Colors.textSecondary}>
            Total Price
          </AppText>
          <AppText variant="h3" weight="semiBold" color={Colors.primaryDeep} style={{ fontVariant: ['tabular-nums'] }}>
            ₹{product.price.toLocaleString()}
          </AppText>
        </View>

        <View style={styles.actionButtonGroup}>
          <TouchableOpacity
            style={[styles.addCartBtn, (addedAnimation || inCart) && styles.addCartBtnActive]}
            onPress={handleAddToCart}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Add to Bag"
          >
            {addedAnimation || inCart ? (
              <Check size={16} color={Colors.primaryDeep} strokeWidth={2.5} />
            ) : (
              <ShoppingBag size={16} color={Colors.primaryDeep} />
            )}
            <AppText variant="caption" weight="bold" color={Colors.primaryDeep} numberOfLines={1}>
              {addedAnimation ? 'Added' : inCart ? `In Bag (${cartItem?.quantity || 1})` : 'Add to Bag'}
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buyNowBtn}
            onPress={handleBuyNow}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Buy Now"
          >
            <Zap size={16} color={Colors.white} fill={Colors.gold} />
            <AppText variant="caption" weight="bold" color={Colors.white}>
              Buy Now
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  skeletonContent: {
    padding: Spacing.xl,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  galleryContainer: {
    position: 'relative',
    backgroundColor: Colors.blush,
  },
  galleryImage: {
    height: '100%',
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    zIndex: 10,
  },
  floatingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.90)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  headerRightBtns: {
    flexDirection: 'row',
    gap: 10,
  },
  paginationDots: {
    position: 'absolute',
    bottom: 36,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  activeDot: {
    width: 18,
    backgroundColor: Colors.primary,
  },
  contentSheet: {
    marginTop: -24,
    backgroundColor: Colors.background,
    borderTopLeftRadius: Radius.bottomSheet,
    borderTopRightRadius: Radius.bottomSheet,
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.screenPadding,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  categoryKicker: {
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  title: {
    marginBottom: 8,
  },
  ratingAndPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  deliveryCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  deliveryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  chipsScroll: {
    paddingVertical: 2,
  },
  slotsGrid: {
    gap: 4,
  },
  inlineGuide: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.palePink,
    padding: Spacing.sm,
    borderRadius: Radius.input,
    marginTop: 10,
  },
  descriptionSection: {
    marginBottom: Spacing.xl,
  },
  descriptionText: {
    lineHeight: 24,
  },
  specsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  specItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  specDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.border,
  },
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.xl,
    paddingHorizontal: 8,
  },
  trustItem: {
    flex: 1,
    alignItems: 'center',
  },
  relatedSection: {
    marginBottom: Spacing.xl,
  },
  relatedScroll: {
    gap: 12,
  },
  relatedCardWrapper: {
    width: 154,
  },
  stickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    ...Shadows.lg,
  },
  priceContainer: {
    justifyContent: 'center',
    marginRight: 6,
  },
  actionButtonGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'flex-end',
  },
  addCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.blush,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: Radius.button,
    borderWidth: 1,
    borderColor: '#F8BBD0',
    flex: 1,
    maxWidth: 135,
  },
  addCartBtnActive: {
    backgroundColor: '#FCE4EC',
  },
  buyNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.primaryDeep,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Radius.button,
    flex: 1,
    maxWidth: 125,
    ...Shadows.sm,
  },
});
