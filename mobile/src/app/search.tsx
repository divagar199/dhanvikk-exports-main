import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getProducts } from '@/services/products';
import { ProductCard } from '@/components/ProductCard';
import { colors, radius, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import type { Product } from '@/types/models';

export default function Search() {
  const insets = useSafeAreaInsets();
  const { columns, cardWidth, maxContentWidth } = useResponsive();
  const [q, setQ] = useState('');

  const { data = [], isLoading } = useQuery<Product[]>({
    queryKey: ['search', q],
    queryFn: () => getProducts({ search: q, limit: 100 }),
    enabled: q.trim().length > 0,
  });

  return (
    <View style={[s.page, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={[s.header, { maxWidth: maxContentWidth, width: '100%', alignSelf: 'center' }]}>
        <Pressable
          style={({ pressed }) => [
            s.backBtn,
            pressed && { opacity: 0.7, transform: [{ scale: 0.92 }] },
          ]}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'))}
        >
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>
        <View style={s.searchBar}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            autoFocus
            value={q}
            onChangeText={setQ}
            placeholder="Search flowers, bouquets, gifts…"
            placeholderTextColor={colors.muted}
            style={s.input}
          />
          {q.length > 0 && (
            <Pressable onPress={() => setQ('')} style={s.clearBtn}>
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          )}
        </View>
      </View>

      <FlatList
        key={`search-grid-${columns}`}
        data={q.trim().length > 0 ? data : []}
        numColumns={columns}
        columnWrapperStyle={s.grid}
        contentContainerStyle={[
          s.content,
          {
            paddingBottom: Math.max(insets.bottom, 20) + 40,
            maxWidth: maxContentWidth,
            width: '100%',
            alignSelf: 'center',
          },
        ]}
        keyExtractor={(p) => p.id || p._id || p.slug}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons
              name={q.trim().length === 0 ? 'search-outline' : 'alert-circle-outline'}
              size={48}
              color={colors.muted}
            />
            <Text style={s.emptyTitle}>
              {q.trim().length === 0
                ? 'Type to search the collection'
                : `No blooms found for "${q}"`}
            </Text>
            <Text style={s.emptySub}>
              {q.trim().length === 0
                ? 'Search by flower type (e.g., roses, lilies, orchids) or occasion.'
                : 'Try checking your spelling or searching for a broader term.'}
            </Text>
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
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    gap: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flex: 1,
    height: 44,
    backgroundColor: colors.pale,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.ink,
  },
  clearBtn: {
    padding: 2,
  },
  content: {
    padding: spacing.lg,
  },
  grid: {
    justifyContent: 'space-between',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 90,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink,
    marginTop: 14,
  },
  emptySub: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 30,
    lineHeight: 18,
  },
});