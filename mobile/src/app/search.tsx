import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getProducts } from '@/services/products';
import { ProductCard } from '@/components/ProductCard';
import { CATEGORIES_DATA } from '@/components/CategoryCircles';
import { colors, radius, shadows, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { VoiceSearchModal } from '@/components/VoiceSearchModal';
import { launchVoiceSearch } from '@/services/voiceSearch';
import type { Product } from '@/types/models';

const TRENDING_INQUIRIES = [
  { label: 'Crimson Roses', query: 'Rose', icon: 'rose-outline' },
  { label: 'Casablanca Lilies', query: 'Lily', icon: 'flower-outline' },
  { label: 'Luxury Bouquets', query: 'Bouquet', icon: 'gift-outline' },
  { label: 'Exotic Orchids', query: 'Orchid', icon: 'flower-outline' },
  { label: 'Sanctum Pooja', query: 'Traditional', icon: 'flame-outline' },
  { label: 'Nilgiri Harvest', query: 'Seasonal', icon: 'leaf-outline' },
  { label: 'Botanical Plants', query: 'Plants', icon: 'water-outline' },
  { label: 'Under ₹1,999', query: 'Roses', icon: 'pricetag-outline' },
];

const FALLBACK_SIGNATURE_BLOOMS: Product[] = [
  {
    id: 'roses-1',
    _id: 'roses-1',
    slug: 'royal-ooty-crimson-roses',
    name: 'Royal Crimson Velvet Rose Bouquet',
    category: 'Roses',
    flowerType: 'Roses',
    price: 1899,
    originalPrice: 2499,
    rating: 4.9,
    reviewsCount: 128,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80'],
    description: 'Fresh morning-harvested highland crimson roses.',
  },
  {
    id: 'lilies-1',
    _id: 'lilies-1',
    slug: 'casablanca-oriental-lilies',
    name: 'Casablanca Fragrant Lily Ensemble',
    category: 'Lilies',
    flowerType: 'Lilies',
    price: 2499,
    originalPrice: 3199,
    rating: 4.8,
    reviewsCount: 94,
    stock: 18,
    image: 'https://images.unsplash.com/photo-1533616688419-b7a585564566?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1533616688419-b7a585564566?auto=format&fit=crop&w=600&q=80'],
    description: 'Pristine white oriental lilies from Nilgiri micro-climates.',
  },
  {
    id: 'orchids-1',
    _id: 'orchids-1',
    slug: 'nilgiri-sunset-orchids',
    name: 'Nilgiri Exotic Purple Orchids',
    category: 'Orchids',
    flowerType: 'Orchids',
    price: 2899,
    originalPrice: 3599,
    rating: 4.9,
    reviewsCount: 86,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=600&q=80'],
    description: 'Rare high-altitude long-stemmed orchid blooms.',
  },
  {
    id: 'bouquets-1',
    _id: 'bouquets-1',
    slug: 'haute-floriculture-signature-bouquet',
    name: 'Haute Floriculture Signature Bouquet',
    category: 'Bouquets',
    flowerType: 'Bouquets',
    price: 3499,
    originalPrice: 4499,
    rating: 5.0,
    reviewsCount: 156,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80'],
    description: 'Master florists hand-arranged luxury bouquet.',
  },
  {
    id: 'traditional-1',
    _id: 'traditional-1',
    slug: 'sanctum-jasmine-marigold-pooja',
    name: 'Sanctum Madurai Jasmine & Marigold',
    category: 'Traditional',
    flowerType: 'Traditional',
    price: 899,
    originalPrice: 1199,
    rating: 4.9,
    reviewsCount: 210,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=600&q=80'],
    description: 'Fresh divine temple jasmine string and ceremonial marigolds.',
  },
  {
    id: 'seasonal-1',
    _id: 'seasonal-1',
    slug: 'highland-seasonal-carnations',
    name: 'Highland Sunset Pastel Carnations',
    category: 'Seasonal Flowers',
    flowerType: 'Carnations',
    price: 1499,
    originalPrice: 1999,
    rating: 4.7,
    reviewsCount: 64,
    stock: 20,
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=600&q=80'],
    description: 'Dewy multi-tonal carnations harvested at dawn.',
  },
];

export default function Search() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ q?: string }>();
  const { columns, cardWidth, maxContentWidth, isTablet } = useResponsive();
  const [q, setQ] = useState(params.q || '');
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  useEffect(() => {
    if (params.q) {
      setQ(params.q);
    }
  }, [params.q]);

  // Active search query
  const isSearching = q.trim().length > 0;
  const { data: searchResults = [], isLoading: isSearchLoading } = useQuery<Product[]>({
    queryKey: ['search', q],
    queryFn: () => getProducts({ search: q, limit: 100 }),
    enabled: isSearching,
  });

  // Featured / Popular products shown when search query is empty or for suggestions
  const { data: featuredProducts = [], isLoading: isFeaturedLoading } = useQuery<Product[]>({
    queryKey: ['featured-products'],
    queryFn: () => getProducts({ limit: 40 }),
    staleTime: 1000 * 60 * 5,
  });

  const effectiveFeatured = featuredProducts.length > 0 ? featuredProducts : FALLBACK_SIGNATURE_BLOOMS;
  const displayData = isSearching ? searchResults : effectiveFeatured;

  const handleSelectQuery = (text: string) => {
    setQ(text);
  };

  return (
    <View style={[s.page, { paddingTop: Math.max(insets.top, 12) }]}>
      {/* Top Search Bar */}
      <View style={[s.header, { maxWidth: maxContentWidth, width: '100%', alignSelf: 'center' }]}>
        <Pressable
          style={({ pressed }) => [
            s.backBtn,
            pressed && { opacity: 0.7, transform: [{ scale: 0.92 }] },
          ]}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'))}
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>

        <View style={s.searchBar}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            autoFocus={!params.q}
            value={q}
            onChangeText={setQ}
            placeholder="Search flowers, bouquets, gifts…"
            placeholderTextColor={colors.muted}
            style={s.input}
            returnKeyType="search"
          />
          {q.length > 0 && (
            <Pressable onPress={() => setQ('')} style={s.clearBtn} hitSlop={6} accessibilityLabel="Clear text">
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          )}
          <Pressable
            style={({ pressed }) => [
              s.micBtn,
              pressed && { opacity: 0.7, transform: [{ scale: 0.92 }] },
            ]}
            onPress={async () => {
              await launchVoiceSearch(
                (text) => setQ(text),
                () => setShowVoiceModal(true)
              );
            }}
            hitSlop={8}
            accessibilityLabel="Voice Search"
          >
            <Ionicons name="mic" size={19} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      <VoiceSearchModal
        visible={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onSelectQuery={handleSelectQuery}
      />

      <FlatList
        key={`search-grid-${columns}`}
        data={displayData}
        numColumns={columns}
        columnWrapperStyle={s.grid}
        contentContainerStyle={[
          s.content,
          {
            paddingBottom: Math.max(insets.bottom, 20) + 60,
            maxWidth: maxContentWidth,
            width: '100%',
            alignSelf: 'center',
          },
        ]}
        keyExtractor={(p) => p.id || p._id || p.slug}
        ListHeaderComponent={
          <>
            {/* If user is actively searching */}
            {isSearching ? (
              <View style={s.activeSearchHeader}>
                <View style={s.activeSearchInfo}>
                  <Text style={s.activeSearchTitle}>
                    {isSearchLoading ? 'Searching…' : `Results for "${q}"`}
                  </Text>
                  <Text style={s.activeSearchSubtitle}>
                    {isSearchLoading
                      ? 'Consulting atelier botanical inventory…'
                      : `${searchResults.length} floral ${searchResults.length === 1 ? 'item' : 'items'} found`}
                  </Text>
                </View>
                <Pressable
                  style={({ pressed }) => [
                    s.resetSearchBtn,
                    pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
                  ]}
                  onPress={() => setQ('')}
                >
                  <Ionicons name="close" size={14} color={colors.primary} />
                  <Text style={s.resetSearchText}>Show All</Text>
                </Pressable>
              </View>
            ) : (
              /* When search input is empty: Professional Products & Categories Showcase */
              <View style={s.discoveryContainer}>
                {/* 1. Trending Inquiries Pills */}
                <View style={s.sectionHeaderRow}>
                  <View style={s.sectionIconPill}>
                    <Ionicons name="trending-up" size={13} color={colors.primary} />
                  </View>
                  <Text style={s.sectionTitle}>TRENDING SPOKEN & SEARCHED</Text>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.trendingPillsScroll}
                >
                  {TRENDING_INQUIRIES.map((item) => (
                    <Pressable
                      key={item.label}
                      style={({ pressed }) => [
                        s.trendingPill,
                        pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
                      ]}
                      onPress={() => handleSelectQuery(item.query)}
                    >
                      <Ionicons name={item.icon as any} size={14} color={colors.primary} />
                      <Text style={s.trendingPillText}>{item.label}</Text>
                    </Pressable>
                  ))}
                </ScrollView>

                {/* 2. Explore Botanical Categories */}
                <View style={[s.sectionHeaderRow, { marginTop: spacing.lg }]}>
                  <View style={s.sectionIconPill}>
                    <Ionicons name="grid" size={13} color={colors.primary} />
                  </View>
                  <Text style={s.sectionTitle}>OUR BOTANICAL CATEGORIES</Text>
                  <View style={s.countBadge}>
                    <Text style={s.countBadgeText}>{CATEGORIES_DATA.length} Collections</Text>
                  </View>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.categoriesScroll}
                >
                  {CATEGORIES_DATA.map((cat) => (
                    <Pressable
                      key={cat.id}
                      style={({ pressed }) => [
                        s.categoryCard,
                        pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] },
                      ]}
                      onPress={() => handleSelectQuery(cat.id)}
                    >
                      <View style={s.categoryImageWrapper}>
                        <Image
                          source={{ uri: cat.image }}
                          style={s.categoryImage}
                          contentFit="cover"
                          transition={100}
                          cachePolicy="memory-disk"
                          priority="high"
                        />
                        {cat.badge && (
                          <View style={s.categoryBadge}>
                            <Text style={s.categoryBadgeText}>{cat.badge}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={s.categoryName} numberOfLines={1}>
                        {cat.name}
                      </Text>
                      <View style={s.categoryArrowRow}>
                        <Text style={s.categoryExploreText}>Explore</Text>
                        <Ionicons name="chevron-forward" size={12} color={colors.primary} />
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>

                {/* 3. Our Signature Products Header */}
                <View style={[s.sectionHeaderRow, { marginTop: spacing.xl, marginBottom: spacing.sm }]}>
                  <View style={s.sectionIconPill}>
                    <Ionicons name="flower" size={13} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.sectionTitle}>OUR SIGNATURE PRODUCTS</Text>
                    <Text style={s.sectionSubtitle}>
                      Cold-chain harvested daily from Ooty & Nilgiri ateliers
                    </Text>
                  </View>
                  <View style={s.countBadge}>
                    <Text style={s.countBadgeText}>
                      {isFeaturedLoading ? '…' : `${featuredProducts.length} Blooms`}
                    </Text>
                  </View>
                </View>

                {isFeaturedLoading && effectiveFeatured.length === 0 && (
                  <View style={s.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={s.loadingText}>Curating fresh botanical harvest…</Text>
                  </View>
                )}
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          isSearching && !isSearchLoading ? (
            <View style={s.noResultsBox}>
              <View style={s.noResultsIconBg}>
                <Ionicons name="search" size={28} color={colors.primary} />
              </View>
              <Text style={s.noResultsTitle}>No blooms found for "{q}"</Text>
              <Text style={s.noResultsSub}>
                We couldn't find an exact match in our current harvest. Try selecting one of our curated collections below:
              </Text>

              <View style={s.quickFallbackRow}>
                {['Roses', 'Lilies', 'Bouquets', 'Orchids'].map((alt) => (
                  <Pressable
                    key={alt}
                    style={({ pressed }) => [
                      s.fallbackPill,
                      pressed && { opacity: 0.8 },
                    ]}
                    onPress={() => setQ(alt)}
                  >
                    <Text style={s.fallbackPillText}>{alt}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : undefined
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
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 2,
  },
  micBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  grid: {
    justifyContent: 'space-between',
  },

  // Active search results header
  activeSearchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineLight,
    marginBottom: spacing.md,
  },
  activeSearchInfo: {
    flex: 1,
  },
  activeSearchTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink,
  },
  activeSearchSubtitle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  resetSearchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.pale,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.lineGold,
  },
  resetSearchText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },

  // Discovery Container (When search is empty)
  discoveryContainer: {
    marginBottom: spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  sectionIconPill: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: 0.8,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 1,
  },
  countBadge: {
    backgroundColor: colors.pale,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.lineLight,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },

  // Trending Inquiries Pills
  trendingPillsScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  trendingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.soft,
  },
  trendingPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink,
  },

  // Botanical Categories Horizontal Scroll
  categoriesScroll: {
    gap: 12,
    paddingVertical: 6,
  },
  categoryCard: {
    width: 108,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    ...shadows.soft,
  },
  categoryImageWrapper: {
    width: 92,
    height: 92,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.pale,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.white,
    textTransform: 'uppercase',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
    marginTop: 6,
    textAlign: 'center',
  },
  categoryArrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  categoryExploreText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
  },

  // Loading
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 12,
    color: colors.muted,
  },

  // No results
  noResultsBox: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noResultsIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  noResultsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink,
    textAlign: 'center',
  },
  noResultsSub: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  quickFallbackRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 16,
  },
  fallbackPill: {
    backgroundColor: colors.pale,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.lineGold,
  },
  fallbackPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
});