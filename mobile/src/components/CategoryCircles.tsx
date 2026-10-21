import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { colors, radius, shadows, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';

export interface CategoryItem {
  id: string;
  name: string;
  badge?: string;
  image: string;
}

export const CATEGORIES_DATA: CategoryItem[] = [
  {
    id: 'Roses',
    name: 'Roses',
    badge: 'Dawn Cut',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'Lilies',
    name: 'Lilies',
    badge: 'Casablanca',
    image: 'https://images.unsplash.com/photo-1533616688419-b7a585564566?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'Bouquets',
    name: 'Bouquets',
    badge: 'Handcrafted',
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'Seasonal Flowers',
    name: 'Seasonal',
    badge: 'Highland',
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'Plants',
    name: 'Plants',
    badge: 'Botanical',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'Gift Bundles',
    name: 'Gift Sets',
    badge: 'Curated',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'Traditional',
    name: 'Sanctum',
    badge: 'Jasmine',
    image: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'Orchids',
    name: 'Orchids',
    badge: 'Exotic',
    image: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=400&q=80',
  },
];

export function CategoryCircles({
  onSelectCategory,
  selectedCategory,
}: {
  onSelectCategory?: (category: string) => void;
  selectedCategory?: string;
}) {
  const handlePress = (catId: string) => {
    if (onSelectCategory) {
      onSelectCategory(catId);
    } else {
      router.push({
        pathname: '/(tabs)/shop',
        params: { category: catId },
      });
    }
  };

  const { isTablet } = useResponsive();

  return (
    <View style={[s.container, isTablet && s.containerTablet]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          s.scrollContent,
          isTablet && { justifyContent: 'center', minWidth: '100%' },
        ]}
      >
        {CATEGORIES_DATA.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <Pressable
              key={cat.id}
              style={({ pressed }) => [
                s.item,
                pressed && { opacity: 0.8, transform: [{ scale: 0.93 }] },
              ]}
              onPress={() => handlePress(cat.id)}
            >
              <View style={[s.circleOuterRing, isSelected && s.circleOuterRingSelected]}>
                <View style={s.circleInnerRing}>
                  <Image
                    source={{ uri: cat.image }}
                    style={s.image}
                    contentFit="cover"
                    transition={100}
                    cachePolicy="memory-disk"
                    priority="high"
                  />
                </View>
              </View>
              <Text
                style={[s.label, isSelected && s.labelSelected]}
                numberOfLines={1}
              >
                {cat.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineLight,
  },
  containerTablet: {
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
    borderRadius: radius.md,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: colors.lineLight,
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 14,
  },
  item: {
    alignItems: 'center',
    width: 68,
  },
  circleOuterRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    padding: 2.5,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...(shadows?.soft || {}),
  },
  circleOuterRingSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.primaryLight,
    ...(shadows?.card || {}),
  },
  circleInnerRing: {
    width: 53,
    height: 53,
    borderRadius: 26.5,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainer,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  label: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.inkLight,
    marginTop: 7,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  labelSelected: {
    color: colors.ink,
    fontWeight: '900',
  },
});
