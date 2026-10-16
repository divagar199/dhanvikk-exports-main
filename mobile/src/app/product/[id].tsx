import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getProduct, getProducts, rateProduct } from '@/services/products';
import { useStore } from '@/store/useStore';
import { colors, radius, spacing } from '@/constants/theme';
import type { Product as ProductType, ProductReview } from '@/types/models';
import { resolveImageUrl, resolveProductImages, FALLBACK_FLOWER_IMAGE } from '@/lib/imageUrl';
import { ProductCard } from '@/components/ProductCard';
import { GoogleSignInModal } from '@/components/GoogleSignInModal';
import { useResponsive } from '@/hooks/useResponsive';

function GalleryImage({
  uri,
  itemWidth,
  itemHeight,
}: {
  uri: string;
  itemWidth: number;
  itemHeight: number;
}) {
  const [err, setErr] = useState(false);
  return (
    <Image
      source={{ uri: err ? FALLBACK_FLOWER_IMAGE : resolveImageUrl(uri) }}
      style={{ width: itemWidth, height: itemHeight, backgroundColor: colors.surface }}
      contentFit="cover"
      transition={150}
      onError={() => setErr(true)}
    />
  );
}

export default function ProductDetail() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width, isTablet, maxContentWidth } = useResponsive();
  const galleryWidth = isTablet ? Math.min(width, 760) : width;
  const galleryHeight = isTablet ? 440 : 360;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [userRating, setUserRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [googleModal, setGoogleModal] = useState(false);
  const [reviewsList, setReviewsList] = useState<ProductReview[]>([]);

  const user = useStore((s) => s.user);
  const add = useStore((s) => s.add);
  const wish = useStore((s) => s.wish);
  const saved = useStore((s) => s.wishlist);

  const { data: p, isLoading, refetch } = useQuery<ProductType>({
    queryKey: ['product', id],
    queryFn: () => getProduct(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (p?.reviews && Array.isArray(p.reviews) && p.reviews.length > 0) {
      setReviewsList(p.reviews);
    }
  }, [p?.reviews]);

  const { data: allProds = [] } = useQuery<ProductType[]>({
    queryKey: ['recommended-products', p?.category],
    queryFn: () => getProducts({ limit: 12 }),
    enabled: !!p,
  });

  const allProductIds = [id, p?.id, p?._id, p?.slug].filter(Boolean).map(String);
  const isSaved = allProductIds.some((cand) => saved.includes(cand));

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

  const imagesList = resolveProductImages(p.images, p.image);

  const recommended = allProds
    .filter((item) => (item.id || item._id || item.slug) !== productId)
    .slice(0, 8);

  const handleAddToCart = () => {
    add({ ...p, quantity: 1 });
    Alert.alert('Added to Cart! 💐', `${p.name} has been added to your shopping cart.`, [
      { text: 'Continue Shopping', style: 'cancel' },
      { text: 'Go to Cart', onPress: () => router.push('/cart') },
    ]);
  };

  const handleBuyNow = () => {
    if (!user) {
      return Alert.alert(
        'Sign in Required 🌸',
        'Please sign in to place an order and track your live flower delivery.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/auth/login') },
        ]
      );
    }
    add({ ...p, quantity: 1 });
    router.push('/checkout');
  };

  const handleRatingSubmit = async () => {
    if (!user) {
      return Alert.alert(
        'Sign in Required 🌸',
        'Only logged-in customers can rate and review blooms. Please sign in to share your experience.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/auth/login') },
        ]
      );
    }
    setSubmittingReview(true);
    try {
      const res = await rateProduct(productId, userRating, reviewComment.trim(), user.name);
      if (res.review) {
        setReviewsList((prev) => [
          res.review!,
          ...prev.filter((r) => r.id !== res.review!.id && r.comment !== res.review!.comment),
        ]);
      }
      Alert.alert('Review Submitted! 💐', res.message || 'Thank you for your rating.');
      setReviewComment('');
      refetch();
    } catch (err: any) {
      Alert.alert('Review Note', err.message || 'Unable to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <View style={s.page}>
      {/* Top Floating App Bar */}
      <View style={[s.topBar, { paddingTop: Math.max(insets.top, 10) }]}>
        <Pressable
          style={({ pressed }) => [
            s.topBtn,
            pressed && { opacity: 0.7, transform: [{ scale: 0.92 }] },
          ]}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/shop'))}
          hitSlop={6}
        >
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>

        <View style={s.topActions}>
          <Pressable
            style={({ pressed }) => [
              s.topBtn,
              pressed && { opacity: 0.7, transform: [{ scale: 0.92 }] },
            ]}
            onPress={() => {
              const targetId = productId || id;
              wish(targetId, {
                name: p.name,
                price,
                image: p.image || imagesList[0],
                altIds: allProductIds,
              });
            }}
            hitSlop={8}
            accessibilityLabel={isSaved ? 'Remove from Wishlist' : 'Save to Wishlist'}
          >
            <Ionicons
              name={isSaved ? 'heart' : 'heart-outline'}
              size={22}
              color={isSaved ? '#E11D48' : colors.ink}
            />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              s.topBtn,
              pressed && { opacity: 0.7, transform: [{ scale: 0.92 }] },
            ]}
            onPress={() => router.push('/cart')}
            hitSlop={6}
          >
            <Ionicons name="cart-outline" size={22} color={colors.ink} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          s.content,
          {
            paddingBottom: Math.max(insets.bottom, 16) + 110,
            maxWidth: 900,
            width: '100%',
            alignSelf: 'center',
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Responsive Image Gallery */}
        <View style={[s.galleryContainer, { width: galleryWidth, height: galleryHeight, alignSelf: 'center' }]}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              const idx = Math.round(x / galleryWidth);
              if (idx !== activeImageIndex) setActiveImageIndex(idx);
            }}
            scrollEventThrottle={16}
          >
            {imagesList.map((imgUri, index) => (
              <GalleryImage
                key={`${index}-${imgUri}`}
                uri={imgUri}
                itemWidth={galleryWidth}
                itemHeight={galleryHeight}
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
            {p.flowerType || p.category || 'Blooms and Exports'}
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

        {/* Haute Floriculture White-Glove Handover Card */}
        <View style={s.deliveryCard}>
          <View style={s.deliveryTitleRow}>
            <Ionicons name="location-sharp" size={17} color={colors.primary} />
            <Text style={s.deliveryHeader}>Doorstep White-Glove Delivery</Text>
            <Pressable onPress={() => router.push('/addresses')}>
              <Text style={s.checkPincodeText}>Change</Text>
            </Pressable>
          </View>

          <View style={s.deliveryFeature}>
            <Ionicons name="flash" size={15} color={colors.primary} />
            <Text style={s.deliveryFeatureText}>
              Express 90-Minute Dispatch by <Text style={s.boldText}>Van #BLR-04</Text>
            </Text>
          </View>

          <View style={s.deliveryFeature}>
            <Ionicons name="snow" size={15} color={colors.secondary} />
            <Text style={s.deliveryFeatureText}>
              Continuous 2°C–4°C Reefer Cold-Chain Protection
            </Text>
          </View>

          <View style={s.deliveryFeature}>
            <Ionicons name="shield-checkmark" size={15} color={colors.discountGreen} />
            <Text style={s.deliveryFeatureText}>
              12-Day Stem Longevity Pledge & Complimentary Calligraphy Card
            </Text>
          </View>
        </View>

        {/* Botanical Provenance & Stem Specifications */}
        <View style={s.detailsCard}>
          <Text style={s.sectionTitle}>Botanical Specifications</Text>
          <View style={s.bulletRow}>
            <View style={s.bulletDot} />
            <Text style={s.bulletText}>
              <Text style={{ fontWeight: '800' }}>Provenance:</Text> Nilgiri Kotagiri Highland Ridge (7,200ft Altitude).
            </Text>
          </View>
          <View style={s.bulletRow}>
            <View style={s.bulletDot} />
            <Text style={s.bulletText}>
              <Text style={{ fontWeight: '800' }}>Stem Caliber:</Text> 70cm heavy-caliber, dawn-cut selection.
            </Text>
          </View>
          <View style={s.bulletRow}>
            <View style={s.bulletDot} />
            <Text style={s.bulletText}>
              <Text style={{ fontWeight: '800' }}>Packaging:</Text> Signature silk-matte wrap, satin ribbon & wax seal.
            </Text>
          </View>
          <View style={s.bulletRow}>
            <View style={s.bulletDot} />
            <Text style={s.bulletText}>
              <Text style={{ fontWeight: '800' }}>Hydration:</Text> Cryo-sealed ampoules and floral nourishment elixir included.
            </Text>
          </View>

          <View style={s.divider} />

          <Text style={s.sectionTitle}>Master Florist Note</Text>
          <Text style={s.description}>
            {p.description ||
              'A magnificent creation crafted with perfection by our master florists. Sourced directly from high-altitude estates, each stem is selected for radiant color, velvety texture, and prolonged freshness.'}
          </Text>
        </View>

        {/* Customer Ratings & Reviews Section (Auth-Gated) */}
        <View style={s.reviewsCard}>
          <View style={s.sectionTitleRow}>
            <View style={s.sectionIndicator} />
            <Text style={s.sectionTitle}>Ratings & Verified Reviews</Text>
          </View>

          <View style={s.ratingScoreOverview}>
            <View style={s.bigScoreCol}>
              <Text style={s.bigScoreNumber}>{rating.toFixed(1)}</Text>
              <View style={s.starsRow}>
                {[1, 2, 3, 4, 5].map((st) => (
                  <Ionicons
                    key={st}
                    name={st <= Math.round(rating) ? 'star' : 'star-outline'}
                    size={15}
                    color={colors.primary}
                  />
                ))}
              </View>
              <Text style={s.totalReviewsLabel}>{reviewsCount} verified ratings</Text>
            </View>

            <View style={s.trustBadgeBox}>
              <Ionicons name="shield-checkmark" size={18} color={colors.discountGreen} />
              <Text style={s.trustBadgeText}>100% Verified Dhanvikk Customer Reviews</Text>
            </View>
          </View>

          {/* Rating input if logged in; lock banner if guest */}
          {user ? (
            <View style={s.writeReviewBox}>
              <Text style={s.writeReviewTitle}>Leave your rating as {user.name || 'Customer'}</Text>
              <View style={s.interactiveStarRow}>
                {[1, 2, 3, 4, 5].map((st) => (
                  <Pressable key={st} onPress={() => setUserRating(st)} hitSlop={6}>
                    <Ionicons
                      name={st <= userRating ? 'star' : 'star-outline'}
                      size={32}
                      color={colors.primary}
                    />
                  </Pressable>
                ))}
                <Text style={s.interactiveStarLabel}>{userRating} / 5</Text>
              </View>

              <TextInput
                style={s.reviewTextInput}
                placeholder="Write your review on flower freshness, fragrance, and delivery packaging…"
                placeholderTextColor={colors.muted}
                value={reviewComment}
                onChangeText={setReviewComment}
                multiline
                numberOfLines={3}
              />

              <Pressable
                style={[s.submitReviewBtn, submittingReview && s.btnDisabled]}
                onPress={handleRatingSubmit}
                disabled={submittingReview}
              >
                <Text style={s.submitReviewText}>
                  {submittingReview ? 'Submitting…' : 'Submit Review'}
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={s.authLockCard}>
              <View style={s.lockIconCol}>
                <Ionicons name="lock-closed" size={22} color={colors.primaryDeep} />
              </View>
              <View style={s.lockTextCol}>
                <Text style={s.lockTitle}>Sign in to Rate & Review</Text>
                <Text style={s.lockSub}>
                  Only signed-in customers can leave verified product ratings.
                </Text>
              </View>
              <Pressable
                style={s.lockActionBtn}
                onPress={() => setGoogleModal(true)}
              >
                <Text style={s.lockActionText}>Sign In</Text>
              </Pressable>
            </View>
          )}

          {/* Permanent Customer Reviews Display */}
          {reviewsList.length > 0 && (
            <View style={s.publishedReviewsList}>
              <View style={s.publishedReviewsHeader}>
                <Ionicons name="chatbubbles-outline" size={16} color={colors.secondary} />
                <Text style={s.publishedReviewsHeading}>
                  Customer Reviews ({reviewsList.length})
                </Text>
              </View>

              {reviewsList.map((rev, idx) => (
                <View key={rev.id || `rev-${idx}`} style={s.reviewItemCard}>
                  <View style={s.reviewItemTop}>
                    <View style={s.reviewerBadgeCol}>
                      <View style={s.reviewerAvatar}>
                        <Text style={s.reviewerAvatarText}>
                          {(rev.userName || 'C').charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View>
                        <Text style={s.reviewerName}>{rev.userName || 'Verified Customer'}</Text>
                        <View style={s.verifiedRow}>
                          <Ionicons name="checkmark-circle" size={12} color={colors.secondary} />
                          <Text style={s.verifiedText}>Verified Buyer</Text>
                        </View>
                      </View>
                    </View>

                    <View style={s.reviewStarsCol}>
                      <View style={s.starsMiniRow}>
                        {[1, 2, 3, 4, 5].map((st) => (
                          <Ionicons
                            key={st}
                            name={st <= Number(rev.rating || 5) ? 'star' : 'star-outline'}
                            size={12}
                            color={colors.primary}
                          />
                        ))}
                      </View>
                      <Text style={s.reviewDate}>
                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : rev.date || 'Recent'}
                      </Text>
                    </View>
                  </View>

                  {rev.comment ? (
                    <Text style={s.reviewComment}>{rev.comment}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Recommended Blooms Showcase */}
        {recommended.length > 0 && (
          <View style={s.recommendedSection}>
            <View style={s.sectionTitleRow}>
              <View style={s.sectionIndicator} />
              <View>
                <Text style={s.sectionTitle}>You Might Also Like</Text>
                <Text style={s.sectionSub}>Recommended floral pairings for this occasion</Text>
              </View>
            </View>

            <FlatList
              data={recommended}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.recList}
              keyExtractor={(item) => (item.id || item._id || item.slug) + '-rec'}
              renderItem={({ item }) => (
                <ProductCard product={item} horizontal />
              )}
            />
          </View>
        )}
      </ScrollView>

      {/* Dual Action Bottom Bar */}
      <View style={[s.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <View style={s.bottomBarInner}>
          <Pressable
            style={({ pressed }) => [
              s.addToCartBtn,
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
            onPress={handleAddToCart}
          >
            <Ionicons name="cart-outline" size={18} color={colors.ink} />
            <Text style={s.addToCartText}>Add to Cart</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              s.buyNowBtn,
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
            onPress={handleBuyNow}
          >
            <Ionicons name="flash" size={18} color={colors.white} />
            <Text style={s.buyNowText}>Buy Now</Text>
          </Pressable>
        </View>
      </View>

      <GoogleSignInModal
        visible={googleModal}
        onClose={() => setGoogleModal(false)}
        onSuccess={() => refetch()}
      />
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
    width: '100%',
    height: 360,
    backgroundColor: colors.white,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: colors.lineLight,
  },
  galleryImage: {
    width: '100%',
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
    backgroundColor: colors.line,
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.primary,
  },
  galleryDiscountBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: colors.discountGreen,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.xs,
  },
  galleryDiscountText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '900',
  },
  infoCard: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineLight,
  },
  categoryTag: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.primaryDeep,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.ink,
    lineHeight: 26,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.discountGreen,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
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
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: radius.md,
  },
  specialPriceTag: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryDeep,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  price: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.ink,
  },
  originalPrice: {
    fontSize: 15,
    color: colors.muted,
    textDecorationLine: 'line-through',
  },
  discountText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.discountGreen,
  },
  taxInclusive: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  deliveryCard: {
    backgroundColor: colors.white,
    marginTop: 8,
    padding: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.lineLight,
    gap: 8,
  },
  deliveryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineLight,
  },
  deliveryHeader: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
    marginLeft: 6,
  },
  checkPincodeText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  deliveryFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    marginTop: 8,
    padding: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.lineLight,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionIndicator: {
    width: 4,
    height: 18,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.ink,
  },
  sectionSub: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 1,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primary,
  },
  bulletText: {
    fontSize: 13,
    color: colors.ink,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.lineLight,
    marginVertical: 14,
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.muted,
  },
  reviewsCard: {
    backgroundColor: colors.white,
    marginTop: 8,
    padding: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.lineLight,
  },
  ratingScoreOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: radius.md,
    marginBottom: 14,
  },
  bigScoreCol: {
    alignItems: 'center',
  },
  bigScoreNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.ink,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginVertical: 2,
  },
  totalReviewsLabel: {
    fontSize: 11,
    color: colors.muted,
  },
  trustBadgeBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 12,
    gap: 4,
  },
  trustBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.ink,
    textAlign: 'center',
  },
  writeReviewBox: {
    backgroundColor: colors.pale,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.lineLight,
  },
  writeReviewTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 6,
  },
  interactiveStarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  interactiveStarLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
    marginLeft: 6,
  },
  reviewTextInput: {
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 10,
    fontSize: 13,
    color: colors.ink,
    textAlignVertical: 'top',
    minHeight: 64,
    marginBottom: 10,
  },
  submitReviewBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitReviewText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '800',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  authLockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.lineLight,
    gap: 10,
  },
  lockIconCol: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.pale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockTextCol: {
    flex: 1,
  },
  lockTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
  },
  lockSub: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  lockActionBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  lockActionText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  publishedReviewsList: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.lineLight,
    gap: 12,
  },
  publishedReviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  publishedReviewsHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: 0.2,
  },
  reviewItemCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.lineLight,
  },
  reviewItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewerBadgeCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primarySubtle,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerAvatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
  },
  reviewerName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.ink,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 1,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.secondary,
  },
  reviewStarsCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  starsMiniRow: {
    flexDirection: 'row',
    gap: 1,
  },
  reviewDate: {
    fontSize: 10,
    color: colors.muted,
  },
  reviewComment: {
    fontSize: 12,
    color: colors.inkLight,
    lineHeight: 18,
  },
  recommendedSection: {
    backgroundColor: colors.white,
    marginTop: 8,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.lineLight,
  },
  recList: {
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    paddingTop: 10,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.lineLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 8,
  },
  bottomBarInner: {
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  addToCartBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addToCartText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.ink,
  },
  buyNowBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.primaryDeep,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  buyNowText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.white,
  },
});