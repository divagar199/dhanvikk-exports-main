import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { Colors, Spacing, Radius, Shadows } from '../../theme';
import { AppText } from '../../components/AppText';
import { GrandLogo } from '../../components/GrandLogo';
import { useResponsive } from '../../hooks/useResponsive';

const CATEGORY_ITEMS = [
  {
    id: 'flowers',
    name: 'Fresh Flowers',
    kicker: 'SIGNATURE STEMS',
    description: 'Ecuadorian dark roses, Dutch lilies & rare orchids.',
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
    slug: 'Flowers',
  },
  {
    id: 'forever-roses',
    name: 'Forever Roses',
    kicker: 'PRESERVED LUXURY',
    description: 'Real natural roses preserved to bloom for 3 to 5 years.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    slug: 'Forever Roses',
  },
  {
    id: 'flower-boxes',
    name: 'Velvet Flower Boxes',
    kicker: 'PARISIAN COUTURE',
    description: 'Handcrafted French velvet and round hat boxes.',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
    slug: 'Flower Boxes',
  },
  {
    id: 'gift-bundles',
    name: 'Gift Bundles',
    kicker: 'CURATED CELEBRATIONS',
    description: 'Blossoms paired with luxury confections & greeting cards.',
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
    slug: 'Gift Bundles',
  },
  {
    id: 'hand-bouquets',
    name: 'Hand-Tied Bouquets',
    kicker: 'ARTISAN FLORISTRY',
    description: 'Layered botanical wrap tied with pure silk ribbon.',
    image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=800&q=80',
    slug: 'Hand Bouquets',
  },
  {
    id: 'plants',
    name: 'Botanical Plants',
    kicker: 'LIVING SCULPTURES',
    description: 'Rare Phalaenopsis orchids & indoor architectural foliage.',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80',
    slug: 'Plants',
  },
];

export default function CategoriesScreen() {
  const router = useRouter();
  const { isTablet, isLandscape, width, screenPadding, containerStyle } = useResponsive();
  const isMultiCol = isTablet || isLandscape;
  const cardGap = isTablet ? 20 : 16;
  const numCategoryCols = width >= 900 ? 3 : isMultiCol ? 2 : 1;
  const contentWidth = Math.min(width, 1140);
  const colWidth = numCategoryCols > 1
    ? Math.floor((contentWidth - screenPadding * 2 - (numCategoryCols - 1) * cardGap) / numCategoryCols)
    : '100%';

  const handleCategoryPress = (categorySlug: string) => {
    router.push({
      pathname: '/(tabs)/shop',
      params: { category: categorySlug },
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
          <GrandLogo layout="horizontal" size="xs" subtitleText="Blooms & Exports" />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isTablet && containerStyle,
          isMultiCol && { flexDirection: 'row', flexWrap: 'wrap', gap: cardGap },
        ]}
      >
        {CATEGORY_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.9}
            onPress={() => handleCategoryPress(item.slug)}
            style={[
              styles.card,
              isMultiCol && { width: colWidth, height: isTablet ? 230 : 200 },
            ]}
          >
            <Image
              source={{ uri: item.image }}
              style={styles.cardImage}
              contentFit="cover"
              transition={300}
            />
            <View style={styles.cardOverlay}>
              <View style={styles.cardContent}>
                <AppText variant="caption" color={Colors.white} weight="semiBold" style={styles.cardKicker}>
                  {item.kicker}
                </AppText>
                <AppText variant="h2" color={Colors.white} style={styles.cardTitle}>
                  {item.name}
                </AppText>
                <AppText variant="bodySm" color="rgba(255, 255, 255, 0.85)">
                  {item.description}
                </AppText>
              </View>

              <View style={styles.arrowCircle}>
                <ArrowRight size={20} color={Colors.white} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
    paddingBottom: Spacing.sm,
    minHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
  scrollContent: {
    padding: Spacing.screenPadding,
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    height: 180,
    borderRadius: Radius.card,
    overflow: 'hidden',
    position: 'relative',
    ...Shadows.md,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(36, 27, 31, 0.50)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.xl,
  },
  cardContent: {
    flex: 1,
    paddingRight: 16,
  },
  cardKicker: {
    letterSpacing: 1,
    marginBottom: 4,
    opacity: 0.9,
  },
  cardTitle: {
    marginBottom: 4,
  },
  arrowCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(233, 30, 99, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
