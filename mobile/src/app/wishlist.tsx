import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../theme';
import { AppText } from '../components/AppText';
import { ProductCard } from '../components/ProductCard';
import { EmptyState } from '../components/EmptyState';
import { useWishlistStore } from '../store/wishlistStore';
import { useResponsive } from '../hooks/useResponsive';
import { Product } from '../types';

export default function WishlistScreen() {
  const router = useRouter();
  const { items } = useWishlistStore();
  const { gridItemWidth } = useResponsive();

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

        <View style={styles.headerTitleContainer}>
          <AppText variant="h1" color={Colors.text}>
            Saved Blooms
          </AppText>
          <AppText variant="bodySm" color={Colors.textSecondary}>
            {items.length} {items.length === 1 ? 'favourite' : 'favourites'}
          </AppText>
        </View>
      </View>

      {items.length === 0 ? (
        <EmptyState
          title="Your collection is waiting"
          description="Save the blooms that speak to you by tapping the heart icon on any luxury arrangement."
          actionTitle="Explore the floral edit"
          onAction={() => router.push('/(tabs)/shop')}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.grid}>
            {items.map((product) => (
              <View
                key={product.id || product._id}
                style={[styles.gridItem, { width: gridItemWidth }]}
              >
                <ProductCard product={product} onPress={handleProductPress} />
              </View>
            ))}
          </View>
        </ScrollView>
      )}
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
    gap: 14,
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
  headerTitleContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.screenPadding,
    paddingBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {},
});
