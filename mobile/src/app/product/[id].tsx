import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getProduct } from '@/services/products';
import { useStore } from '@/store/useStore';
import { colors, spacing, radius } from '@/constants/theme';
import type { Product as ProductType } from '@/types/models';

export default function ProductDetail() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

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

  return (
    <View style={s.page}>
      <ScrollView
        contentContainerStyle={[
          s.content,
          { paddingBottom: Math.max(insets.bottom, 20) + 90 },
        ]}
      >
        <View style={s.heroContainer}>
          <Image
            source={{ uri: p.image || p.images?.[0] }}
            style={s.hero}
            contentFit="cover"
          />

          <View style={[s.topControls, { top: Math.max(insets.top, 16) }]}>
            <Pressable
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/shop'))}
              style={s.iconCircle}
            >
              <Ionicons name="arrow-back" size={20} color={colors.ink} />
            </Pressable>
            <Pressable
              onPress={() => wish(productId)}
              style={s.iconCircle}
            >
              <Ionicons
                name={isSaved ? 'heart' : 'heart-outline'}
                size={20}
                color={isSaved ? colors.primary : colors.ink}
              />
            </Pressable>
          </View>
        </View>

        <View style={s.info}>
          <Text style={s.category}>{p.flowerType || p.category || 'Luxury Floral'}</Text>
          <Text style={s.title}>{p.name}</Text>

          <View style={s.ratingRow}>
            <View style={s.stars}>
              <Ionicons name="star" size={15} color={colors.gold} />
              <Text style={s.ratingNum}>{(p.rating || 5.0).toFixed(1)}</Text>
            </View>
            <Text style={s.reviewsCount}>
              ({p.reviewsCount || 12} customer reviews)
            </Text>
          </View>

          <Text style={s.price}>₹{p.price.toLocaleString('en-IN')}</Text>

          <View style={s.divider} />

          <Text style={s.sectionHeader}>About This Bloom</Text>
          <Text style={s.description}>
            {p.description ||
              'Artisanally arranged fresh flowers picked from our premier botanical partners, conditioned with floral food and wrapped in signature Dhanvikk luxury paper.'}
          </Text>

          <View style={s.featuresCard}>
            <View style={s.featureRow}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.primaryDeep} />
              <View style={s.featureText}>
                <Text style={s.featureTitle}>100% Freshness Guarantee</Text>
                <Text style={s.featureSub}>Farm-fresh blossoms handpicked within 24 hours.</Text>
              </View>
            </View>

            <View style={s.featureRow}>
              <Ionicons name="car-outline" size={20} color={colors.primaryDeep} />
              <View style={s.featureText}>
                <Text style={s.featureTitle}>Complimentary Express Delivery</Text>
                <Text style={s.featureSub}>Delivered fresh in insulated, climate-controlled packaging.</Text>
              </View>
            </View>

            <View style={s.featureRow}>
              <Ionicons name="card-outline" size={20} color={colors.primaryDeep} />
              <View style={s.featureText}>
                <Text style={s.featureTitle}>Secure Payments</Text>
                <Text style={s.featureSub}>Verified checkout with Razorpay or Cash on Delivery.</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[s.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={s.priceBox}>
          <Text style={s.priceLabel}>Price</Text>
          <Text style={s.priceVal}>₹{p.price.toLocaleString('en-IN')}</Text>
        </View>
        <Pressable
          style={s.cta}
          onPress={() => {
            add({ ...p, quantity: 1 });
            router.push('/(tabs)/cart');
          }}
        >
          <Ionicons name="bag-add" size={18} color={colors.white} />
          <Text style={s.ctaText}>Add to Bag</Text>
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
  content: {
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
    color: colors.muted,
    fontSize: 14,
  },
  heroContainer: {
    position: 'relative',
    width: '100%',
    height: 400,
    backgroundColor: colors.blush,
  },
  hero: {
    width: '100%',
    height: '100%',
  },
  topControls: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  info: {
    padding: 20,
  },
  category: {
    color: colors.primaryDeep,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '900',
    color: colors.ink,
    marginTop: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.pale,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingNum: {
    fontWeight: '800',
    fontSize: 13,
    color: colors.ink,
  },
  reviewsCount: {
    fontSize: 13,
    color: colors.muted,
  },
  price: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.primaryDeep,
    marginTop: 14,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: 18,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.ink,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.muted,
  },
  featuresCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 16,
    marginTop: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
  },
  featureSub: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
    lineHeight: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  priceBox: {
    justifyContent: 'center',
  },
  priceLabel: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '700',
  },
  priceVal: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.ink,
  },
  cta: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaText: {
    color: colors.white,
    fontWeight: '900',
    fontSize: 15,
  },
});