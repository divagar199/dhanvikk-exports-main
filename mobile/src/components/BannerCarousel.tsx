import { useState, useRef, useEffect } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { colors, radius } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 24;

export interface BannerItem {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  offer: string;
  image: string;
  routeCategory?: string;
}

const BANNERS: BannerItem[] = [
  {
    id: '1',
    badge: 'SPRING FLORAL EDIT',
    title: 'Highland Ecuadorian Roses',
    subtitle: 'Imported fresh daily & hand-tied',
    offer: 'FLAT 30% OFF',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=85',
    routeCategory: 'Roses',
  },
  {
    id: '2',
    badge: 'EXPRESS METRO DISPATCH',
    title: 'Same Day Delivery by 7 PM',
    subtitle: 'Guaranteed farm-fresh blooms to your door',
    offer: 'FREE SHIPPING',
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1000&q=85',
    routeCategory: 'Bouquets',
  },
  {
    id: '3',
    badge: 'HERITAGE EXPORTS',
    title: 'Madurai Jasmine & Pooja Blooms',
    subtitle: 'Direct farm plucked for poojas & celebrations',
    offer: 'FROM ₹399',
    image: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=1000&q=85',
    routeCategory: 'Traditional',
  },
  {
    id: '4',
    badge: 'ROYAL ORCHIDS & HAMPERS',
    title: 'Curated Gift Collections',
    subtitle: 'With gourmet treats and handwritten card',
    offer: 'UP TO 40% OFF',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=85',
    routeCategory: 'Hampers',
  },
];

export function BannerCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (activeIndex + 1) % BANNERS.length;
      setActiveIndex(nextIndex);
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 4500);

    return () => clearInterval(timer);
  }, [activeIndex]);

  const onScroll = (event: any) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / (BANNER_WIDTH + 12));
    if (index >= 0 && index < BANNERS.length && index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  return (
    <View style={s.container}>
      <FlatList
        ref={flatListRef}
        data={BANNERS}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled={false}
        snapToInterval={BANNER_WIDTH + 12}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.listContent}
        onMomentumScrollEnd={onScroll}
        renderItem={({ item }) => (
          <Pressable
            style={s.card}
            onPress={() =>
              router.push({
                pathname: '/(tabs)/shop',
                params: { category: item.routeCategory },
              })
            }
          >
            <Image
              source={{ uri: item.image }}
              style={s.image}
              contentFit="cover"
            />
            <View style={s.overlay}>
              <View style={s.topRow}>
                <View style={s.badge}>
                  <Text style={s.badgeText}>{item.badge}</Text>
                </View>
                <View style={s.offerPill}>
                  <Text style={s.offerText}>{item.offer}</Text>
                </View>
              </View>

              <View style={s.bottomContent}>
                <Text style={s.title}>{item.title}</Text>
                <Text style={s.subtitle}>{item.subtitle}</Text>
                <View style={s.shopBtn}>
                  <Text style={s.shopBtnText}>Shop Now →</Text>
                </View>
              </View>
            </View>
          </Pressable>
        )}
      />

      <View style={s.dotsContainer}>
        {BANNERS.map((_, i) => (
          <View
            key={i}
            style={[s.dot, i === activeIndex ? s.dotActive : s.dotInactive]}
          />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    paddingVertical: 10,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: 12,
    gap: 12,
  },
  card: {
    width: BANNER_WIDTH,
    height: 180,
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.ink,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.38)',
    padding: 14,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  offerPill: {
    backgroundColor: colors.dealOrange,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  offerText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '900',
  },
  bottomContent: {
    gap: 4,
  },
  title: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 22,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    lineHeight: 15,
  },
  shopBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginTop: 4,
  },
  shopBtnText: {
    color: colors.primaryDeep,
    fontSize: 11,
    fontWeight: '900',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  dot: {
    height: 5,
    borderRadius: 3,
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.primary,
  },
  dotInactive: {
    width: 6,
    backgroundColor: colors.line,
  },
});
