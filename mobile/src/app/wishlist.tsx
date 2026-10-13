import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '@/store/useStore';
import { getProducts } from '@/services/products';
import { ProductCard } from '@/components/ProductCard';
import { colors, spacing } from '@/constants/theme';
import type { Product } from '@/types/models';

export default function Wishlist() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const syncWithServer = useStore((s) => s.syncWithServer);
  const wishlistIds = useStore((s) => s.wishlist);

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
    const id = p.id || p._id || p.slug;
    return wishlistIds.includes(id);
  });

  return (
    <View style={[s.page, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={s.header}>
        <Pressable
          style={s.backBtn}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/account'))}
        >
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={s.headerTitle}>Saved Blooms</Text>
        <View style={{ width: 38 }} />
      </View>

      <FlatList
        data={savedProducts}
        numColumns={2}
        keyExtractor={(p) => p.id || p._id || p.slug}
        columnWrapperStyle={s.grid}
        contentContainerStyle={[s.content, { paddingBottom: 60 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={s.subHeader}>
            <Text style={s.subTitle}>
              {savedProducts.length} {savedProducts.length === 1 ? 'bloom' : 'blooms'} saved in your wishlist
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={s.empty}>
            <View style={s.emptyIconCircle}>
              <Ionicons name="heart-outline" size={44} color={colors.primary} />
            </View>
            <Text style={s.emptyTitle}>Your wishlist is empty</Text>
            <Text style={s.emptySub}>
              Tap the heart icon on any floral arrangement to save it here for later.
            </Text>

            <Pressable style={s.shopBtn} onPress={() => router.push('/(tabs)/shop')}>
              <Text style={s.shopBtnText}>Browse collection</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => <ProductCard product={item} />}
      />
    </View>
  );
}

const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.ink,
  },
  subHeader: {
    marginBottom: 14,
  },
  subTitle: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: '600',
  },
  content: {
    padding: spacing.lg,
  },
  grid: {
    justifyContent: 'space-between',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  shopBtn: {
    backgroundColor: colors.primary,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  shopBtnText: {
    color: colors.white,
    fontWeight: '900',
  },
});