import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getProducts } from '@/services/products';
import { ProductCard } from '@/components/ProductCard';
import { colors, radius, shadows, spacing } from '@/constants/theme';
import type { Product } from '@/types/models';
import { useResponsive } from '@/hooks/useResponsive';
import { useStore } from '@/store/useStore';
import { BrandHeaderTitle } from '@/components/BrandHeaderTitle';

const CATEGORIES = [
  'All Stems',
  'Roses',
  'Lilies',
  'Bouquets',
  'Seasonal Flowers',
  'Plants',
  'Gift Bundles',
  'Traditional',
  'Orchids',
  'Luxury',
];

const SORT_OPTIONS = [
  { label: 'Curator Choice', value: 'popular' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Highest Graded (4.8+)', value: 'rating' },
];

export default function Shop() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ category?: string; occasion?: string }>();
  const { columns, cardWidth, isTablet, maxContentWidth } = useResponsive();

  const cart = useStore((s) => s.cart);
  const cartCount = cart.reduce((t, i) => t + (i.quantity || 1), 0);

  const [q, setQ] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(params.category || 'All Stems');
  const [activeOccasion, setActiveOccasion] = useState(params.occasion || '');
  const [sortBy, setSortBy] = useState('popular');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const { data = [], isLoading, refetch } = useQuery<Product[]>({
    queryKey: ['products', q],
    queryFn: () => getProducts({ search: q, limit: 100 }),
  });

  // Filter logic
  let filtered = data.filter((item) => {
    if (activeOccasion) {
      const occ = Array.isArray(item.occasion)
        ? item.occasion.join(' ').toLowerCase()
        : String(item.occasion || '').toLowerCase();
      const paramOcc = activeOccasion.toLowerCase();
      if (!occ.includes(paramOcc)) return false;
    }

    if (selectedCategory !== 'All Stems' && selectedCategory !== 'All') {
      const cat =
        typeof item.category === 'object' && item.category !== null
          ? String((item.category as any).name || '').toLowerCase()
          : String(item.category || item.flowerType || '').toLowerCase();
      const sel = selectedCategory.toLowerCase();
      if (!cat.includes(sel) && !String(item.name || '').toLowerCase().includes(sel)) {
        return false;
      }
    }

    if (q.trim()) {
      const query = q.toLowerCase();
      const name = (item.name || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      return name.includes(query) || desc.includes(query);
    }

    return true;
  });

  // Sort logic
  if (sortBy === 'price_asc') {
    filtered = [...filtered].sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sortBy === 'price_desc') {
    filtered = [...filtered].sort((a, b) => (b.price || 0) - (a.price || 0));
  } else if (sortBy === 'rating') {
    filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  const currentSortLabel = SORT_OPTIONS.find((s) => s.value === sortBy)?.label || 'Curator Choice';

  return (
    <View style={[s.page, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Atelier Florilegium Header */}
      <View style={s.topHeader}>
        <BrandHeaderTitle />
        <View style={s.headerRightWrap}>
          <View style={s.telemetryBadge}>
            <View style={s.telemetryDot} />
            <Text style={s.telemetryBadgeText}>Cold-Chain 3.2°C</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              s.cartIconBtn,
              pressed && { opacity: 0.7, transform: [{ scale: 0.92 }] },
            ]}
            onPress={() => router.push('/cart')}
            hitSlop={8}
            accessibilityLabel="Shopping Cart"
          >
            <Ionicons name="cart-outline" size={21} color={colors.ink} />
            {cartCount > 0 && (
              <View style={s.cartBadge}>
                <Text style={s.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* Luxury Search & Sort Row */}
      <View style={s.searchRow}>
        <View style={s.searchBar}>
          <Ionicons name="search" size={17} color={colors.muted} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search flowers, bouquets…"
            placeholderTextColor={colors.muted}
            style={s.input}
          />
          {q.length > 0 && (
            <Pressable onPress={() => setQ('')} hitSlop={6}>
              <Ionicons name="close-circle" size={17} color={colors.muted} />
            </Pressable>
          )}
        </View>

        <Pressable
          style={[s.sortBtn, showSortMenu && s.sortBtnActive]}
          onPress={() => setShowSortMenu(!showSortMenu)}
        >
          <Ionicons
            name="options-outline"
            size={18}
            color={showSortMenu ? colors.white : colors.primary}
          />
        </Pressable>
      </View>

      {/* Sort Dropdown Tray */}
      {showSortMenu && (
        <View style={s.sortTray}>
          <Text style={s.sortTrayTitle}>ARRANGE COLLECTION BY</Text>
          <View style={s.sortOptionsRow}>
            {SORT_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[s.sortOptionPill, sortBy === opt.value && s.sortOptionActive]}
                onPress={() => {
                  setSortBy(opt.value);
                  setShowSortMenu(false);
                }}
              >
                <Text
                  style={[s.sortOptionText, sortBy === opt.value && s.sortOptionTextActive]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Horizontal Category Chips */}
      <View style={s.chipsWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.categories}
        >
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <Pressable
                key={cat}
                style={[s.chip, active && s.chipActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                {active && (
                  <Ionicons name="sparkles" size={10} color={colors.white} style={{ marginRight: 4 }} />
                )}
                <Text style={[s.chipText, active && s.chipTextActive]}>{cat}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Subheader with stem count and active sort label */}
      <View style={s.metaBar}>
        <Text style={s.countText}>
          {filtered.length} {filtered.length === 1 ? 'botanical creation' : 'botanical creations'}
        </Text>
        <Pressable
          style={s.activeSortBadge}
          onPress={() => setShowSortMenu(true)}
        >
          <Text style={s.activeSortText}>{currentSortLabel}</Text>
          <Ionicons name="chevron-down" size={11} color={colors.primary} />
        </Pressable>
      </View>

      {/* Product Grid */}
      <FlatList
        key={`shop-grid-${columns}`}
        data={filtered}
        numColumns={columns}
        keyExtractor={(p) => p.id || p._id || p.slug}
        columnWrapperStyle={[s.grid, { gap: 12, paddingHorizontal: isTablet ? 24 : 10 }]}
        contentContainerStyle={[
          s.content,
          {
            paddingBottom: Math.max(insets.bottom, 16) + 115,
            maxWidth: maxContentWidth,
            width: '100%',
            alignSelf: 'center',
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={refetch}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
        ListEmptyComponent={
          <View style={s.empty}>
            <View style={s.emptyIconCircle}>
              <Ionicons name="flower-outline" size={36} color={colors.primary} />
            </View>
            <Text style={s.emptyTitle}>No stems found in this reserve</Text>
            <Text style={s.emptySub}>
              Try adjusting your search criteria or explore our complete floral library.
            </Text>
            <Pressable
              style={s.resetBtn}
              onPress={() => {
                setQ('');
                setSelectedCategory('All Stems');
                setActiveOccasion('');
              }}
            >
              <Text style={s.resetBtnText}>Reset Atelier Filters</Text>
            </Pressable>
          </View>
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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 8,
    backgroundColor: colors.white,
  },
  headerTitleWrap: {
    gap: 1,
  },
  headerSup: {
    fontSize: 8.5,
    fontWeight: '800',
    color: colors.secondary,
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  telemetryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: radius.pill,
    gap: 4,
  },
  telemetryDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.secondary,
  },
  telemetryBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.secondary,
  },
  headerRightWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cartIconBtn: {
    position: 'relative',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.primary,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1,
    borderColor: colors.white,
  },
  cartBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '900',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 10,
    backgroundColor: colors.white,
    gap: 8,
  },
  searchBar: {
    flex: 1,
    height: 42,
    backgroundColor: colors.canvas,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.ink,
  },
  sortBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDeep,
  },
  sortTray: {
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: colors.lineLight,
    ...(shadows?.soft || {}),
  },
  sortTrayTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.muted,
    marginBottom: 8,
    letterSpacing: 0.8,
  },
  sortOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sortOptionPill: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.line,
  },
  sortOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDeep,
  },
  sortOptionText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.ink,
  },
  sortOptionTextActive: {
    color: colors.white,
    fontWeight: '800',
  },
  chipsWrap: {
    backgroundColor: colors.white,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineLight,
  },
  categories: {
    paddingHorizontal: 14,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDeep,
  },
  chipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.ink,
  },
  chipTextActive: {
    color: colors.white,
    fontWeight: '800',
  },
  metaBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  countText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.muted,
  },
  activeSortBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeSortText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  content: {
    paddingBottom: 95,
  },
  grid: {
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 70,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySubtle,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.ink,
    marginTop: 4,
  },
  emptySub: {
    fontSize: 12.5,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    marginBottom: 20,
  },
  resetBtn: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primaryDeep,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radius.pill,
    ...(shadows?.soft || {}),
  },
  resetBtnText: {
    color: colors.white,
    fontWeight: '900',
    fontSize: 12.5,
    letterSpacing: 0.3,
  },
});