import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { colors, radius } from '@/constants/theme';

export interface CategoryItem {
  id: string;
  name: string;
  tag?: string;
  image: string;
}

export const CATEGORIES_DATA: CategoryItem[] = [
  {
    id: 'Roses',
    name: 'Roses',
    tag: 'Popular',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'Bouquets',
    name: 'Bouquets',
    tag: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'Orchids',
    name: 'Orchids',
    tag: 'Exotic',
    image: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'Lilies',
    name: 'Lilies',
    image: 'https://images.unsplash.com/photo-1533616688419-b7a585564566?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'Traditional',
    name: 'Traditional',
    tag: 'Export',
    image: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'Hampers',
    name: 'Hampers',
    tag: 'Gifts',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'Plants',
    name: 'Plants',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'Luxury',
    name: 'Luxury',
    tag: 'VIP',
    image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=400&q=80',
  },
];

export function CategoryCircles({
  onSelectCategory,
  selectedCategory,
}: {
  onSelectCategory?: (category: string) => void;
  selectedCategory?: string;
}) {
  const handlePress = (catName: string) => {
    if (onSelectCategory) {
      onSelectCategory(catName);
    } else {
      router.push({
        pathname: '/(tabs)/shop',
        params: { category: catName },
      });
    }
  };

  return (
    <View style={s.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {CATEGORIES_DATA.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <Pressable
              key={cat.id}
              style={s.item}
              onPress={() => handlePress(cat.id)}
            >
              <View style={[s.circleWrapper, isSelected && s.circleSelected]}>
                <Image
                  source={{ uri: cat.image }}
                  style={s.image}
                  contentFit="cover"
                  transition={100}
                />
                {cat.tag && (
                  <View style={s.tagBadge}>
                    <Text style={s.tagText}>{cat.tag}</Text>
                  </View>
                )}
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineLight,
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 14,
  },
  item: {
    alignItems: 'center',
    width: 66,
  },
  circleWrapper: {
    width: 58,
    height: 58,
    borderRadius: 29,
    padding: 2,
    backgroundColor: colors.pale,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.lineLight,
    position: 'relative',
  },
  circleSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.blush,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  tagBadge: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: colors.primary,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  tagText: {
    color: colors.white,
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.ink,
    marginTop: 6,
    textAlign: 'center',
  },
  labelSelected: {
    color: colors.primaryDeep,
    fontWeight: '900',
  },
});
