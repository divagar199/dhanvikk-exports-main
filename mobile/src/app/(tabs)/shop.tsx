import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getProducts } from '@/services/products';
import { ProductCard } from '@/components/ProductCard';
import { colors, radius, spacing } from '@/constants/theme';
import type { Product } from '@/types/models';

const CATEGORIES = [
  'All',
  'Roses',
  'Bouquets',
  'Orchids',
  'Lilies',
  'Traditional',
  'Hampers',
  'Plants',
  'Luxury',
];

const SORT_OPTIONS = [
  { label: 'Popularity', value: 'popular' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Rating 4.0+', value: 'rating' },
];

export default function Shop() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ category?: string; occasion?: string }>();

  const [q, setQ] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(params.category || 'All');
  const [activeOccasion, setActiveOccasion] = useState(params.occasion || '');
  const [sortBy, setSortBy] = useState('popular');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const { data = [], isLoading, refetch } = useQuery<Product[]>({
    queryKey: ['products', q],
    queryFn: () => getProducts({ search: q, limit: 100 }),
  });

  // Filter
  let filtered = data.filter((item) => {
    if (activeOccasion) {
      const occ = Array.isArray(item.occasion)
        ? item.occasion.join(' ').toLowerCase()
        : String(item.occasion || '').toLowerCase();
      const paramOcc = activeOccasion.toLowerCase();
      if (!occ.includes(paramOcc)) return false;
    }

    if (selectedCategory !== 'All') {
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

  // Sort
  if (sortBy === 'price_asc') {
    filtered = [...filtered].sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sortBy === 'price_desc') {
    filtered = [...filtered].sort((a, b) => (b.price || 0) - (a.price || 0));
  } else if (sortBy === 'rating') {
    filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  const currentSortLabel = SORT_OPTIONS.find((s) => s.value === sortBy)?.label || 'Popularity';

  return (
    <View style={[s.page, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Flipkart-Style Search Bar */}
      <View style={s.searchRow}>
        <View style={s.searchBar}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search roses, orchids, lilies, pooja flowers…"
            placeholderTextColor={colors.muted}
            style={s.input}
          />
          {q.length > 0 && (
            <Pressable onPress={() => setQ('')}>
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          )}
        </View>

        <Pressable
          style={s.sortBtn}
          onPress={() => setShowSortMenu(!showSortMenu)}
        >
          <Ionicons name="swap-vertical" size={18} color={colors.primaryDeep} />
        </Pressable>
      </View>

      {/* Sort Dropdown Tray */}
      {showSortMenu && (
        <View style={s.sortTray}>
          <Text style={s.sortTrayTitle}>SORT BY</Text>
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
                <Text style={[s.chipText, active && s.chipTextActive]}>{cat}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Subheader with count and active sort label */}
      <View style={s.metaBar}>
        <Text style={s.countText}>
          {filtered.length} {filtered.length === 1 ? 'item' : 'items'} found
        </Text>
        <Pressable
          style={s.activeSortBadge}
          onPress={() => setShowSortMenu(true)}
        >
          <Text style={s.activeSortText}>Sorted: {currentSortLabel}</Text>
        </Pressable>
      </View>

      {/* Product Grid */}
      <FlatList
        data={filtered}
        numColumns={2}
        keyExtractor={(p) => p.id || p._id || p.slug}
        columnWrapperStyle={s.grid}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={refetch}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="search-outline" size={48} color={colors.muted} />
            <Text style={s.emptyTitle}>No florals found</Text>
            <Text style={s.emptySub}>
              Try clearing your search query or picking a different category.
            </Text>
            <Pressable
              style={s.resetBtn}
              onPress={() => {
                setQ('');
                setSelectedCategory('All');
                setActiveOccasion('');
              }}
            >
              <Text style={s.resetBtnText}>Reset Filters</Text>
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: colors.white,
    gap: 8,
  },
  searchBar: {
    flex: 1,
    height: 42,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: colors.ink,
  },
  sortBtn: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: colors.pale,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  sortTray: {
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  sortTrayTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.muted,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  sortOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sortOptionPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.line,
  },
  sortOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sortOptionText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.ink,
  },
  sortOptionTextActive: {
    color: colors.white,
  },
  chipsWrap: {
    backgroundColor: colors.white,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineLight,
  },
  categories: {
    paddingHorizontal: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
  },
  chipTextActive: {
    color: colors.white,
  },
  metaBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.muted,
  },
  activeSortBadge: {
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.lineLight,
  },
  activeSortText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDeep,
  },
  content: {
    paddingBottom: 90,
  },
  grid: {
    paddingHorizontal: 8,
    justifyContent: 'space-between',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.ink,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  resetBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.pill,
  },
  resetBtnText: {
    color: colors.white,
    fontWeight: '900',
    fontSize: 13,
  },
});