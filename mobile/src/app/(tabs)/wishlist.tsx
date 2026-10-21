import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '@/store/useStore';
import { getProducts } from '@/services/products';
import { ProductCard } from '@/components/ProductCard';
import { colors, radius, shadows, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { BrandHeaderTitle } from '@/components/BrandHeaderTitle';
import type { Product } from '@/types/models';

export default function WishlistTab() {
  const insets = useSafeAreaInsets();
  const { columns, cardWidth, maxContentWidth } = useResponsive();
  const [refreshing, setRefreshing] = useState(false);
  const syncWithServer = useStore((s) => s.syncWithServer);
  const wishlistIds = useStore((s) => s.wishlist);
  const cart = useStore((s) => s.cart);
  const cartCount = cart.reduce((t, i) => t + (i.quantity || 1), 0);

  const { data = [], isLoading, refetch } = useQuery<Product[]>({
    queryKey: ['products-all'],
    queryFn: () => getProducts({ limit: 100 }),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetch(), syncWithServer()]);
    } finally {
      setRefreshing(false);
    }
  };

  const savedProducts = data.filter((p) => {
    const candidates = [p.id, p._id, p.slug].filter(Boolean).map(String);
    return candidates.some((cand) => wishlistIds.includes(cand));
  });

  return (
    <View style={[s.page, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Botanical Gallery Header */}
      <View style={[s.header, { maxWidth: maxContentWidth, width: '100%', alignSelf: 'center' }]}>
        <View style={s.headerLeft}>
          <Pressable
            style={({ pressed }) => [
              s.backBtn,
              pressed && { opacity: 0.7, transform: [{ scale: 0.92 }] },
            ]}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'))}
            hitSlop={8}
            accessibilityLabel="Back to Home"
          >
            <Ionicons name="arrow-back" size={22} color={colors.ink} />
          </Pressable>
          <BrandHeaderTitle />
        </View>

        <Pressable
          style={({ pressed }) => [
            s.cartBtn,
            pressed && { opacity: 0.7, transform: [{ scale: 0.92 }] },
          ]}
          onPress={() => router.push('/cart')}
          accessibilityLabel="Shopping Cart"
        >
          <Ionicons name="cart-outline" size={22} color={colors.ink} />
          {cartCount > 0 && (
            <View style={s.cartBadge}>
              <Text style={s.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <FlatList
        key={`wishlist-tab-grid-${columns}`}
        data={savedProducts}
        numColumns={columns}
        keyExtractor={(p) => p.id || p._id || p.slug}
        columnWrapperStyle={[s.grid, { gap: 12 }]}
        contentContainerStyle={[
          s.content,
          {
            paddingBottom: Math.max(insets.bottom, 16) + 115,
            maxWidth: maxContentWidth,
            width: '100%',
            alignSelf: 'center',
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={s.empty}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[s.emptySub, { marginTop: 14 }]}>Fetching your saved arrangements…</Text>
            </View>
          ) : (
            <View style={s.empty}>
              <View style={s.emptyIconCircle}>
                <Ionicons name="heart-outline" size={46} color={colors.primary} />
              </View>
              <Text style={s.emptyTitle}>Your Wishlist is Empty</Text>
              <Text style={s.emptySub}>
                Save your favorite highland roses, lilies, and pooja blooms to revisit anytime.
              </Text>

              <Pressable style={s.shopBtn} onPress={() => router.push('/(tabs)/shop')}>
                <Text style={s.shopBtnText}>Explore Florilegium</Text>
                <Ionicons name="arrow-forward" size={15} color={colors.white} />
              </Pressable>
            </View>
          )
        }
        renderItem={({ item }) => <ProductCard product={item} cardWidth={cardWidth} />}
      />
    </View>
  );
}

const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...(shadows?.soft || {}),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    gap: 2,
  },
  headerSup: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.secondary,
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  cartBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  cartBadgeText: {
    color: colors.white,
    fontSize: 9.5,
    fontWeight: '900',
  },
  content: {
    padding: spacing.md,
  },
  grid: {
    justifyContent: 'space-between',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 90,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.softBlush,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.ink,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    maxWidth: 280,
  },
  shopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 22,
    paddingVertical: 12,
    ...(shadows?.soft || {}),
  },
  shopBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});
