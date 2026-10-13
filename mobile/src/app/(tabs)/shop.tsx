import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getProducts } from '@/services/products';
import { ProductCard } from '@/components/ProductCard';
import { colors, radius, spacing } from '@/constants/theme';
import type { Product } from '@/types/models';

const CATEGORIES = ['All', 'Roses', 'Bouquets', 'Orchids', 'Lilies', 'Luxury', 'Gifts'];

export default function Shop() {
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { data = [] } = useQuery<Product[]>({
    queryKey: ['products', q],
    queryFn: () => getProducts({ search: q, limit: 100 }),
  });

  const filtered = data.filter((item) => {
    if (selectedCategory === 'All') return true;
    const cat = (item.category || item.flowerType || '').toLowerCase();
    const name = (item.name || '').toLowerCase();
    const sel = selectedCategory.toLowerCase();
    return cat.includes(sel) || name.includes(sel);
  });

  return (
    <FlatList
      data={filtered}
      numColumns={2}
      keyExtractor={(p) => p.id || p._id || p.slug}
      columnWrapperStyle={s.grid}
      contentContainerStyle={[
        s.content,
        { paddingTop: Math.max(insets.top, 16), paddingBottom: 100 },
      ]}
      ListHeaderComponent={
        <>
          <Text style={s.title}>The flower edit</Text>
          <Text style={s.sub}>Fresh flowers, luxury arrangements and gifts.</Text>

          <View style={s.search}>
            <Ionicons name="search" size={20} color={colors.muted} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Search roses, gifts, occasions…"
              placeholderTextColor={colors.muted}
              style={s.input}
            />
            {q.length > 0 && (
              <Pressable onPress={() => setQ('')}>
                <Ionicons name="close-circle" size={18} color={colors.muted} />
              </Pressable>
            )}
          </View>

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

          <Text style={s.countText}>
            Showing {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
          </Text>
        </>
      }
      ListEmptyComponent={
        <View style={s.empty}>
          <Ionicons name="search-outline" size={44} color={colors.muted} />
          <Text style={s.emptyTitle}>No blooms matched your filter</Text>
          <Text style={s.emptySub}>Try searching for something else or pick a different category.</Text>
        </View>
      }
      renderItem={({ item }) => <ProductCard product={item} />}
    />
  );
}

const s = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.ink,
    marginTop: 8,
  },
  sub: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
  },
  search: {
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.ink,
  },
  categories: {
    gap: 8,
    paddingBottom: 14,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  chipTextActive: {
    color: colors.white,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.muted,
    marginBottom: 12,
  },
  grid: {
    justifyContent: 'space-between',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 6,
  },
});