import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, SlidersHorizontal, Search } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Shadows } from '../../theme';
import { AppText } from '../../components/AppText';
import { ProductCard } from '../../components/ProductCard';
import { ProductCardSkeleton } from '../../components/Skeleton';
import { EmptyState } from '../../components/EmptyState';
import { productService } from '../../services/productService';
import { useResponsive } from '../../hooks/useResponsive';
import { Product } from '../../types';

export default function CategoryDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { gridItemWidth } = useResponsive();

  const decodedCategory = decodeURIComponent(slug || 'Flowers');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['categoryProducts', decodedCategory],
    queryFn: () => productService.getProducts({ category: decodedCategory }),
    enabled: Boolean(decodedCategory),
  });

  const products = data?.products || [];

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: '/product/[id]',
      params: { id: product.id || product._id || product.slug },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.titleWrapper}>
          <AppText
            variant="caption"
            color={Colors.primaryDeep}
            weight="semiBold"
            style={styles.kicker}
          >
            BOTANICAL COLLECTION
          </AppText>
          <AppText variant="h1" color={Colors.text} numberOfLines={1}>
            {decodedCategory}
          </AppText>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/search')}
            accessibilityLabel="Search flowers"
          >
            <Search size={20} color={Colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/filters')}
            accessibilityLabel="Filter flowers"
          >
            <SlidersHorizontal size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.primary}
          />
        }
      >
        <View style={styles.countBar}>
          <AppText variant="bodySm" color={Colors.textSecondary}>
            Showing {products.length} {products.length === 1 ? 'curated design' : 'curated designs'}
          </AppText>
        </View>

        {isLoading ? (
          <View style={styles.grid}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={[styles.gridItem, { width: gridItemWidth }]}>
                <ProductCardSkeleton />
              </View>
            ))}
          </View>
        ) : products.length === 0 ? (
          <EmptyState
            title="No blooms in this collection"
            description={`We currently do not have stems catalogued under ${decodedCategory}. Explore our full flower edit.`}
            actionTitle="View all flowers"
            onAction={() => router.push('/(tabs)/shop')}
          />
        ) : (
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrapper: {
    flex: 1,
  },
  kicker: {
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: 40,
  },
  countBar: {
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {},
});
