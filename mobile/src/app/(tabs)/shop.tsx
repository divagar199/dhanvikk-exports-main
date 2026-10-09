import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, SlidersHorizontal, Search as SearchIcon } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadows } from '../../theme';
import { AppText } from '../../components/AppText';
import { AppChip } from '../../components/AppChip';
import { ProductCard } from '../../components/ProductCard';
import { ProductCardSkeleton } from '../../components/Skeleton';
import { GrandLogo } from '../../components/GrandLogo';
import { EmptyState } from '../../components/EmptyState';
import { productService } from '../../services/productService';
import { useResponsive } from '../../hooks/useResponsive';
import { Product } from '../../types';

const CATEGORIES = [
  'All',
  'Flowers',
  'Roses',
  'Hand Bouquets',
  'Flower Boxes',
  'Forever Roses',
  'Plants',
];

const SORT_OPTIONS: { label: string; value: 'recommended' | 'price-low' | 'price-high' | 'rating' }[] = [
  { label: 'Recommended', value: 'recommended' },
  { label: 'Price: Low to High', value: 'price-low' },
  { label: 'Price: High to Low', value: 'price-high' },
  { label: 'Best Rated', value: 'rating' },
];

export default function ShopScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string; occasion?: string; query?: string }>();
  const { gridItemWidth, isTablet, containerStyle, gridGap } = useResponsive();

  const [selectedCategory, setSelectedCategory] = useState<string>(params.category || 'All');
  const [selectedSort, setSelectedSort] = useState<'recommended' | 'price-low' | 'price-high' | 'rating'>('recommended');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['products', selectedCategory, selectedSort, params.occasion, params.query],
    queryFn: () =>
      productService.getProducts({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        occasion: params.occasion,
        search: params.query,
        sort: selectedSort,
      }),
  });

  const products = data?.products || [];

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: '/product/[id]',
      params: { id: product.id || product._id || product.slug },
    });
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/home');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, isTablet && containerStyle]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={19} color={Colors.text} strokeWidth={2} />
          </TouchableOpacity>
          <GrandLogo layout="horizontal" size="xs" subtitleText="BLOOMS" />
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/search')}
            accessibilityLabel="Search flowers"
          >
            <SearchIcon size={19} color={Colors.text} strokeWidth={1.8} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/filters')}
            accessibilityLabel="Filter flowers"
          >
            <SlidersHorizontal size={19} color={Colors.text} strokeWidth={1.8} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Horizontal Category Chips */}
      <View style={[styles.chipsContainer, isTablet && containerStyle]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          {CATEGORIES.map((cat) => (
            <AppChip
              key={cat}
              label={cat}
              selected={selectedCategory === cat}
              onPress={() => setSelectedCategory(cat)}
              style={{ marginRight: 8 }}
            />
          ))}
        </ScrollView>
      </View>

      {/* Count & Sort Bar */}
      <View style={[styles.subBar, isTablet && containerStyle]}>
        <AppText variant="caption" color={Colors.textSecondary} style={{ fontVariant: ['tabular-nums'] }}>
          Showing {products.length} {products.length === 1 ? 'bloom' : 'blooms'}
        </AppText>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortScroll}
        >
          {SORT_OPTIONS.map((sort) => {
            const isSortActive = selectedSort === sort.value;
            return (
              <TouchableOpacity
                key={sort.value}
                onPress={() => setSelectedSort(sort.value)}
                style={[styles.sortTag, isSortActive && styles.sortTagActive]}
              >
                <AppText
                  variant="caption"
                  color={isSortActive ? Colors.primaryDeep : Colors.textSecondary}
                  weight={isSortActive ? 'semiBold' : 'regular'}
                >
                  {sort.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Product Grid */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, isTablet && containerStyle]}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.primary}
          />
        }
      >
        {isLoading ? (
          <View style={[styles.grid, isTablet && { gap: gridGap }]}>
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <View key={idx} style={[styles.gridItem, { width: gridItemWidth }]}>
                <ProductCardSkeleton />
              </View>
            ))}
          </View>
        ) : products.length === 0 ? (
          <EmptyState
            title="No blooms found"
            description="We couldn't find flowers matching the selected filter. Try browsing our signature collections."
            actionTitle="Reset filters"
            onAction={() => setSelectedCategory('All')}
          />
        ) : (
          <View style={[styles.grid, isTablet && { gap: gridGap }]}>
            {products.map((product) => (
              <View
                key={product.id || product._id}
                style={[styles.gridItem, { width: gridItemWidth }]}
              >
                <ProductCard product={product} onPress={handleProductPress} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    minHeight: 52,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  chipsContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  chipsScroll: {
    paddingHorizontal: Spacing.screenPadding,
    gap: 8,
  },
  chip: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: Radius.chip,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  subBar: {
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sortScroll: {
    gap: 8,
  },
  sortTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.chip,
    backgroundColor: Colors.palePink,
  },
  sortTagActive: {
    backgroundColor: '#F8BBD0',
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.screenPadding,
    gap: 12,
  },
  gridItem: {},
});
