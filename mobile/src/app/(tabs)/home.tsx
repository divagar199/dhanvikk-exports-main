import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getProducts } from '@/services/products';
import { Header } from '@/components/Header';
import { CategoryCircles } from '@/components/CategoryCircles';
import { BannerCarousel } from '@/components/BannerCarousel';
import { TrustBadges } from '@/components/TrustBadges';
import { DealOfTheDay } from '@/components/DealOfTheDay';
import { OccasionsGrid } from '@/components/OccasionsGrid';
import { ProductCard } from '@/components/ProductCard';
import { colors, radius, spacing } from '@/constants/theme';
import type { Product } from '@/types/models';
import { useResponsive } from '@/hooks/useResponsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FILTER_TABS = ['All Stems', 'Royal Ooty Roses', 'Casablanca Lilies', 'Sanctum & Pooja', 'Bestsellers', 'Under ₹1,999'];

export default function Home() {
  const insets = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = useState('All Stems');
  const { columns, cardWidth, isTablet, maxContentWidth } = useResponsive();

  const { data: products = [], isLoading, refetch } = useQuery<Product[]>({
    queryKey: ['featured-products'],
    queryFn: () => getProducts({ limit: 40 }),
  });

  const filteredProducts = products.filter((p) => {
    if (selectedTab === 'All Stems') return true;
    if (selectedTab === 'Bestsellers') return p.isBestSeller || (p.rating || 0) >= 4.7;
    if (selectedTab === 'Royal Ooty Roses') {
      const name = (p.name || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      return name.includes('rose') || cat.includes('rose');
    }
    if (selectedTab === 'Casablanca Lilies') {
      const name = (p.name || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      return name.includes('lily') || name.includes('lilies') || cat.includes('lily') || cat.includes('lilies');
    }
    if (selectedTab === 'Sanctum & Pooja') {
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
      <Header />

      <FlatList
        key={`home-grid-${columns}`}
        data={filteredProducts}
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
        renderItem={({ item }) => <ProductCard product={item} cardWidth={cardWidth} />}
        ListHeaderComponent={
          <>
            {/* Circular Category Story Bubbles */}
            <CategoryCircles />

            {/* Haute Floriculture Editorial Showcase */}
            <BannerCarousel />

            {/* Sanctity & Longevity Guarantees */}
            <TrustBadges />

            {/* The Daily Harvest Reserve */}
            <DealOfTheDay products={products} />

            {/* Occasions of Grandeur & VIP Concierge */}
            <OccasionsGrid />

            {/* Curated Florilegium with Luxury Filters */}
            <View style={s.sectionHeader}>
              <View style={s.titleRow}>
                <View style={s.titleIndicator} />
                <View>
                  <Text style={s.sectionTitle}>Curated Highland Florilegium</Text>
                  <Text style={s.sectionSubtitle}>Dawn cuts from our Kotagiri & Ooty estates, graded for Bangalore white-glove delivery</Text>
                </View>
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
                      {active && (
                        <Ionicons name="sparkles" size={11} color={colors.white} style={{ marginRight: 4 }} />
                      )}
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
        ListFooterComponent={
          <View style={s.footerTrust}>
            <View style={s.footerIcon}>
              <Ionicons name="shield-checkmark" size={26} color={colors.white} />
            </View>
            <Text style={s.footerTitle}>The Dhanvikk Blooms and Exports Pledge</Text>
            <Text style={s.footerSub}>
              Over 10,000+ estate blooms hand-delivered in continuous 2°C–4°C reefer sanctity. Each creation arrives with botanical longevity elixir and your personalized wax-sealed calligraphy inscription.
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
    backgroundColor: colors.canvas,
  },
  content: {
    paddingBottom: 95,
  },
  sectionHeader: {
    backgroundColor: colors.white,
    marginTop: 8,
    paddingTop: 14,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderColor: colors.lineLight,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 10,
    gap: 8,
  },
  titleIndicator: {
    width: 3.5,
    height: 20,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.ink,
    letterSpacing: 0.2,
  },
  sectionSubtitle: {
    fontSize: 10.5,
    color: colors.muted,
    marginTop: 1,
  },
  tabsList: {
    paddingHorizontal: 14,
    gap: 8,
    marginTop: 4,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.line,
  },
  tabPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDeep,
  },
  tabText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.ink,
  },
  tabTextActive: {
    color: colors.white,
    fontWeight: '800',
  },
  grid: {
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    backgroundColor: colors.canvas,
  },
  footerTrust: {
    backgroundColor: colors.white,
    margin: 12,
    marginTop: 16,
    padding: 20,
    borderRadius: radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 3,
    borderTopColor: colors.primary,
  },
  footerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.white,
  },
  footerTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0.3,
  },
  footerSub: {
    fontSize: 11.5,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    maxWidth: 300,
  },
});