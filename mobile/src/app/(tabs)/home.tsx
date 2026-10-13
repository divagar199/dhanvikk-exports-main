import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getProducts } from '@/services/products';
import { FlipkartHeader } from '@/components/FlipkartHeader';
import { CategoryCircles } from '@/components/CategoryCircles';
import { BannerCarousel } from '@/components/BannerCarousel';
import { TrustBadges } from '@/components/TrustBadges';
import { DealOfTheDay } from '@/components/DealOfTheDay';
import { OccasionsGrid } from '@/components/OccasionsGrid';
import { ProductCard } from '@/components/ProductCard';
import { colors, radius, spacing } from '@/constants/theme';
import type { Product } from '@/types/models';

const FILTER_TABS = ['All Blooms', 'Bestsellers', 'Premium Roses', 'Garlands & Pooja', 'Under ₹1,999'];

export default function Home() {
  const [selectedTab, setSelectedTab] = useState('All Blooms');

  const { data: products = [], isLoading, refetch } = useQuery<Product[]>({
    queryKey: ['featured-products'],
    queryFn: () => getProducts({ limit: 40 }),
  });

  const filteredProducts = products.filter((p) => {
    if (selectedTab === 'All Blooms') return true;
    if (selectedTab === 'Bestsellers') return p.isBestSeller || (p.rating || 0) >= 4.7;
    if (selectedTab === 'Premium Roses') {
      const name = (p.name || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      return name.includes('rose') || cat.includes('rose');
    }
    if (selectedTab === 'Garlands & Pooja') {
      const name = (p.name || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      return (
        name.includes('jasmine') ||
        name.includes('marigold') ||
        name.includes('pooja') ||
        name.includes('garland') ||
        cat.includes('traditional')
      );
    }
    if (selectedTab === 'Under ₹1,999') return (p.price || 0) <= 1999;
    return true;
  });

  return (
    <View style={s.page}>
      <FlipkartHeader />

      <FlatList
        data={filteredProducts}
        numColumns={2}
        keyExtractor={(p) => p.id || p._id || p.slug}
        columnWrapperStyle={s.grid}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={refetch}
        ListHeaderComponent={
          <>
            {/* Circular Category Story Bubbles */}
            <CategoryCircles />

            {/* Flipkart Promotional Banner Carousel */}
            <BannerCarousel />

            {/* Value Propositions / Trust Badges */}
            <TrustBadges />

            {/* Flash Deal of the Day with Countdown Timer */}
            <DealOfTheDay products={products} />

            {/* Shop by Occasion Showcase */}
            <OccasionsGrid />

            {/* Trending Section with Filter Tabs */}
            <View style={s.sectionHeader}>
              <View style={s.titleRow}>
                <View style={s.titleIndicator} />
                <Text style={s.sectionTitle}>Trending Floral Collection</Text>
              </View>

              <FlatList
                data={FILTER_TABS}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.tabsList}
                keyExtractor={(item) => item}
                renderItem={({ item }) => {
                  const active = selectedTab === item;
                  return (
                    <Pressable
                      style={[s.tabPill, active && s.tabPillActive]}
                      onPress={() => setSelectedTab(item)}
                    >
                      <Text style={[s.tabText, active && s.tabTextActive]}>
                        {item}
                      </Text>
                    </Pressable>
                  );
                }}
              />
            </View>
          </>
        }
        renderItem={({ item }) => <ProductCard product={item} />}
        ListFooterComponent={
          <View style={s.footerTrust}>
            <View style={s.footerIcon}>
              <Ionicons name="ribbon-outline" size={28} color={colors.primaryDeep} />
            </View>
            <Text style={s.footerTitle}>Dhanvikk Haute Floristry</Text>
            <Text style={s.footerSub}>
              Over 10,000+ bouquets delivered with complimentary handwritten cards & temperature-controlled luxury vans.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 90,
  },
  sectionHeader: {
    backgroundColor: colors.white,
    marginTop: 6,
    paddingTop: 14,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderColor: colors.lineLight,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 10,
    gap: 8,
  },
  titleIndicator: {
    width: 4,
    height: 18,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.ink,
  },
  tabsList: {
    paddingHorizontal: 12,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.line,
  },
  tabPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
  },
  tabTextActive: {
    color: colors.white,
  },
  grid: {
    paddingHorizontal: 8,
    justifyContent: 'space-between',
    backgroundColor: colors.background,
  },
  footerTrust: {
    backgroundColor: colors.white,
    margin: 12,
    padding: 20,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lineLight,
  },
  footerIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.pale,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  footerTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.ink,
  },
  footerSub: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
});