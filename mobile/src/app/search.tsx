import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Clock, TrendingUp, Search as SearchIcon } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius } from '../theme';
import { AppText } from '../components/AppText';
import { SearchBar } from '../components/SearchBar';
import { ProductCard } from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { productService } from '../services/productService';
import { useResponsive } from '../hooks/useResponsive';
import { Product } from '../types';

const POPULAR_SEARCHES = [
  'Ecuadorian Red Roses',
  'Anniversary Bouquet',
  'Birthday Flowers',
  'Forever Roses',
  'Orchids in Ceramic',
  'Velvet Hat Box',
];

export default function SearchScreen() {
  const router = useRouter();
  const { gridItemWidth } = useResponsive();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Red Roses',
    'Lilies',
  ]);

  // Debounce search by 350ms to prevent excessive API requests
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchTerm.trim());
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data, isLoading } = useQuery({
    queryKey: ['searchProducts', debouncedQuery],
    queryFn: () => productService.getProducts({ search: debouncedQuery }),
    enabled: debouncedQuery.length >= 2,
  });

  const products = data?.products || [];

  const handleSelectQuery = (query: string) => {
    setSearchTerm(query);
    if (!recentSearches.includes(query)) {
      setRecentSearches([query, ...recentSearches.slice(0, 4)]);
    }
  };

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: '/product/[id]',
      params: { id: product.id || product._id || product.slug },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Search Bar with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.searchBarWrapper}>
          <SearchBar
            value={searchTerm}
            onChangeText={setSearchTerm}
            onClear={() => setSearchTerm('')}
            autoFocus
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {debouncedQuery.length < 2 ? (
          <View>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Clock size={16} color={Colors.textSecondary} />
                  <AppText variant="caption" color={Colors.textSecondary} weight="semiBold" style={{ marginLeft: 6 }}>
                    RECENT SEARCHES
                  </AppText>
                </View>
                <View style={styles.tagsContainer}>
                  {recentSearches.map((item, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => handleSelectQuery(item)}
                      style={styles.searchTag}
                    >
                      <AppText variant="bodySm" color={Colors.text}>
                        {item}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Popular Floral Searches */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <TrendingUp size={16} color={Colors.primaryDeep} />
                <AppText variant="caption" color={Colors.primaryDeep} weight="semiBold" style={{ marginLeft: 6 }}>
                  TRENDING IN BLOOM
                </AppText>
              </View>
              <View style={styles.tagsContainer}>
                {POPULAR_SEARCHES.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleSelectQuery(item)}
                    style={styles.popularTag}
                  >
                    <SearchIcon size={14} color={Colors.primary} style={{ marginRight: 6 }} />
                    <AppText variant="bodySm" color={Colors.text}>
                      {item}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        ) : isLoading ? (
          <View style={styles.grid}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={[styles.gridItem, { width: gridItemWidth }]}>
                <ProductCardSkeleton />
              </View>
            ))}
          </View>
        ) : products.length === 0 ? (
          <EmptyState
            title="No matching blooms found"
            description={`We couldn't find flowers matching "${debouncedQuery}". Try searching for roses, orchids, or gift boxes.`}
            actionTitle="Clear Search"
            onAction={() => setSearchTerm('')}
          />
        ) : (
          <View>
            <View style={styles.resultsInfo}>
              <AppText variant="bodySm" color={Colors.textSecondary}>
                Found {products.length} {products.length === 1 ? 'bloom' : 'blooms'} for &ldquo;{debouncedQuery}&rdquo;
              </AppText>
            </View>
            <View style={styles.grid}>
              {products.map((product) => (
                <View
                  key={product.id || product._id}
                  style={[styles.gridItem, { width: gridItemWidth }]}
                >
                  <ProductCard product={product} onPress={handleProductPress} />
                </View>
              ))}
            </View>
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
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarWrapper: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.lg,
    paddingBottom: 40,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  searchTag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.chip,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  popularTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.chip,
    backgroundColor: Colors.palePink,
    borderWidth: 1,
    borderColor: '#F8BBD0',
  },
  resultsInfo: {
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {},
});
