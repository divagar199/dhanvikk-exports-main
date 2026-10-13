import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getProduct } from '@/services/products';
import { useStore } from '@/store/useStore';
import { colors, radius, spacing } from '@/constants/theme';
import type { Product as ProductType } from '@/types/models';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductDetail() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { data: p, isLoading } = useQuery<ProductType>({
    queryKey: ['product', id],
    queryFn: () => getProduct(id),
    enabled: !!id,
  });

  const add = useStore((s) => s.add);
  const wish = useStore((s) => s.wish);
  const saved = useStore((s) => s.wishlist);

  const isSaved = id ? saved.includes(id) : false;

  if (isLoading || !p) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={s.loadingText}>Unveiling floral arrangement…</Text>
      </View>
    );
  }

  const productId = p.id || p._id || p.slug;
  const price = p.price || 999;
  const originalPrice =
    p.originalPrice && p.originalPrice > price
      ? p.originalPrice
      : Math.round(price * 1.35);
  const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);
  const rating = p.rating || 4.8;
  const reviewsCount = p.reviewsCount || 128;

  const imagesList =
    p.images && p.images.length > 0
      ? p.images
      : [p.image || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'];

  const handleAddToCart = () => {
    add({ ...p, quantity: 1 });
    Alert.alert('Added to Bag! 💐', `${p.name} has been added to your shopping bag.`, [
      { text: 'Continue Shopping', style: 'cancel' },
      { text: 'Go to Bag', onPress: () => router.push('/(tabs)/cart') },
    ]);
  };

  const handleBuyNow = () => {
    add({ ...p, quantity: 1 });
    router.push('/checkout');
  };

  return (
    <View style={s.page}>
      {/* Top Floating App Bar */}
      <View style={[s.topBar, { paddingTop: Math.max(insets.top, 10) }]}>
        <Pressable
          style={s.topBtn}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/shop'))}
          hitSlop={6}
        >
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>

        <View style={s.topActions}>
          <Pressable
            style={s.topBtn}
            onPress={() => wish(productId)}
            hitSlop={6}
          >
            <Ionicons
              name={isSaved ? 'heart' : 'heart-outline'}
              size={22}
              color={isSaved ? colors.primary : colors.ink}
            />
          </Pressable>

          <Pressable
            style={s.topBtn}
            onPress={() => router.push('/(tabs)/cart')}
            hitSlop={6}
          >
            <Ionicons name="bag-handle-outline" size={22} color={colors.ink} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          s.content,
          { paddingBottom: Math.max(insets.bottom, 16) + 70 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Flipkart-Style Image Gallery */}
        <View style={s.galleryContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              const idx = Math.round(x / SCREEN_WIDTH);
              if (idx !== activeImageIndex) setActiveImageIndex(idx);
            }}
            scrollEventThrottle={16}
          >
            {imagesList.map((imgUri, index) => (
              <Image
                key={index}
                source={{ uri: imgUri }}
                style={s.galleryImage}
                contentFit="cover"
              />
            ))}
          </ScrollView>

          {/* Dots Indicator */}
          {imagesList.length > 1 && (
            <View style={s.dotsRow}>
              {imagesList.map((_, i) => (
                <View
                  key={i}
                  style={[s.dot, i === activeImageIndex && s.dotActive]}
                />
              ))}
            </View>
          )}

          {discountPercent > 0 && (
            <View style={s.galleryDiscountBadge}>
              <Text style={s.galleryDiscountText}>{discountPercent}% OFF</Text>
            </View>
          )}
        </View>

        {/* Product Information Card */}
        <View style={s.infoCard}>
          <Text style={s.categoryTag}>
            {p.flowerType || p.category || 'HAUTE FLORISTRY'}
          </Text>

          <Text style={s.title}>{p.name}</Text>

          {/* Flipkart Green Star Badge */}
          <View style={s.ratingRow}>
            <View style={s.ratingBadge}>
              <Text style={s.ratingText}>{rating.toFixed(1)}</Text>
              <Ionicons name="star" size={12} color={colors.white} />
            </View>
            <Text style={s.reviewsText}>
              {reviewsCount} Ratings & {Math.round(reviewsCount * 0.4)} Reviews
            </Text>
          </View>

          {/* Price Section */}
          <View style={s.priceBox}>
            <Text style={s.specialPriceTag}>Special Price</Text>
            <View style={s.priceRow}>
              <Text style={s.price}>₹{price.toLocaleString('en-IN')}</Text>
              <Text style={s.originalPrice}>₹{originalPrice.toLocaleString('en-IN')}</Text>
              <Text style={s.discountText}>{discountPercent}% off</Text>
            </View>
            <Text style={s.taxInclusive}>Inclusive of all taxes</Text>
          </View>
        </View>

        {/* Flipkart-Style Delivery Check Card */}
        <View style={s.deliveryCard}>
          <View style={s.deliveryTitleRow}>
            <Ionicons name="location-outline" size={18} color={colors.primaryDeep} />
            <Text style={s.deliveryHeader}>Deliver to Chennai - 600001</Text>
            <Pressable onPress={() => router.push('/addresses')}>
              <Text style={s.checkPincodeText}>Change</Text>
            </Pressable>
          </View>

          <View style={s.deliveryFeature}>
            <Ionicons name="flash" size={15} color={colors.dealOrange} />
            <Text style={s.deliveryFeatureText}>
              Express Delivery by <Text style={s.boldText}>Today, 7:00 PM</Text>
            </Text>
          </View>

          <View style={s.deliveryFeature}>
            <Ionicons name="cash-outline" size={15} color={colors.discountGreen} />
            <Text style={s.deliveryFeatureText}>
              Cash on Delivery & Razorpay UPI Available
            </Text>
          </View>

          <View style={s.deliveryFeature}>
            <Ionicons name="reload-outline" size={15} color={colors.primary} />
            <Text style={s.deliveryFeatureText}>
              24-Hour Freshness Replacement Guarantee
            </Text>
          </View>
        </View>

        {/* Product Details & Highlights */}
        <View style={s.detailsCard}>
          <Text style={s.sectionTitle}>Product Highlights</Text>
          <View style={s.bulletRow}>
            <View style={s.bulletDot} />
            <Text style={s.bulletText}>
              Stem count: Artisanally conditioned luxury stems.
            </Text>
          </View>
          <View style={s.bulletRow}>
            <View style={s.bulletDot} />
            <Text style={s.bulletText}>
              Packaging: Signature Dhanvikk matte wrap with satin ribbon.
            </Text>
          </View>
          <View style={s.bulletRow}>
            <View style={s.bulletDot} />
            <Text style={s.bulletText}>
              Complimentary: Handwritten note on luxury card stock.
            </Text>
          </View>
          <View style={s.bulletRow}>
            <View style={s.bulletDot} />
            <Text style={s.bulletText}>
              Freshness: Water-soaked foam base ensures maximum hydration in transit.
            </Text>
          </View>

          <View style={s.divider} />

          <Text style={s.sectionTitle}>Florist Description</Text>
          <Text style={s.description}>
            {p.description ||
              'A magnificent creation crafted with perfection by our master florists. Sourced directly from high-altitude estates, each stem is selected for radiant color, velvety texture, and prolonged freshness.'}
          </Text>
        </View>
      </ScrollView>

      {/* Flipkart-Style Dual Action Bottom Bar */}
      <View style={[s.bottomBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <Pressable style={s.addToBagBtn} onPress={handleAddToCart}>
          <Ionicons name="bag-handle-outline" size={18} color={colors.ink} />
          <Text style={s.addToBagText}>Add to Bag</Text>
        </Pressable>

        <Pressable style={s.buyNowBtn} onPress={handleBuyNow}>
          <Ionicons name="flash" size={18} color={colors.white} />
          <Text style={s.buyNowText}>Buy Now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.muted,
  },
  topBar: {
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.lineLight,
    zIndex: 10,
  },
  topBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  content: {},
  galleryContainer: {
    width: SCREEN_WIDTH,
    height: 360,
    backgroundColor: colors.white,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: colors.lineLight,
  },
  galleryImage: {
    width: SCREEN_WIDTH,
    height: 360,
  },
  dotsRow: {
    position: 'absolute',
    bottom: 12,
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
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.primary,
  },
  galleryDiscountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: colors.discountGreen,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  galleryDiscountText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '900',
  },
  infoCard: {
    backgroundColor: colors.white,
    padding: 14,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderColor: colors.lineLight,
  },
  categoryTag: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryDeep,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.ink,
    lineHeight: 24,
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.starGreen,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  ratingText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  reviewsText: {
    fontSize: 12,
    color: colors.muted,
  },
  priceBox: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.lineLight,
  },
  specialPriceTag: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.discountGreen,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 2,
  },
  price: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.ink,
  },
  originalPrice: {
    fontSize: 14,
    color: colors.mutedLight,
    textDecorationLine: 'line-through',
  },
  discountText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.discountGreen,
  },
  taxInclusive: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  deliveryCard: {
    backgroundColor: colors.white,
    padding: 14,
    marginBottom: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.lineLight,
  },
  deliveryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  deliveryHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
    flex: 1,
    marginLeft: 6,
  },
  checkPincodeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  deliveryFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  deliveryFeatureText: {
    fontSize: 12,
    color: colors.ink,
  },
  boldText: {
    fontWeight: '800',
  },
  detailsCard: {
    backgroundColor: colors.white,
    padding: 14,
    marginBottom: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.lineLight,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.ink,
    marginBottom: 10,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primaryDeep,
    marginTop: 6,
  },
  bulletText: {
    fontSize: 12,
    color: colors.inkLight,
    flex: 1,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: colors.lineLight,
    marginVertical: 12,
  },
  description: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    elevation: 8,
  },
  addToBagBtn: {
    flex: 1,
    height: 50,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRightWidth: 1,
    borderRightColor: colors.lineLight,
  },
  addToBagText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.ink,
  },
  buyNowBtn: {
    flex: 1,
    height: 50,
    backgroundColor: colors.dealOrange, // Classic Flipkart "Buy Now" orange
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  buyNowText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.white,
    textTransform: 'uppercase',
  },
});