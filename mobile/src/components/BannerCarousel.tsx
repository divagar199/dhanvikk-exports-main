import { useState, useRef, useEffect } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadows, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';

export interface BannerItem {
  id: string;
  badge: string;
  telemetry?: string;
  title: string;
  subtitle: string;
  offer: string;
  image: string;
  routeCategory?: string;
}

const BANNERS: BannerItem[] = [
  {
    id: '1',
    badge: 'EST. NILGIRIS • 7,200FT',
    telemetry: 'Reefer Fleet #BLR-04 • 3.2°C Cryo Active',
    title: 'Hand-Cut Highland Blooms',
    subtitle: 'Harvested at dawn in Kotagiri mist; delivered in unbroken cold-chain sanctity in 90 mins.',
    offer: 'HAUTE FLORILEGIUM',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=85',
    routeCategory: 'Roses',
  },
  {
    id: '2',
    badge: 'WHITE-GLOVE ATELIER',
    telemetry: '2°C–4°C Climate-Preserved Fleet',
    title: 'Dutch Red Naomi & Casablanca',
    subtitle: '70cm heavy-caliber stems backed by our 12-day floral longevity pledge.',
    offer: 'EXPRESS 90-MIN',
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1000&q=85',
    routeCategory: 'Bouquets',
  },
  {
    id: '3',
    badge: 'SACRED SANCTUM HARVEST',
    telemetry: 'Organic Dawn Pluck Protocol',
    title: 'Madurai Jasmine & Pooja Blooms',
    subtitle: 'Pristine traditional strands hand-knotted at sunrise for divine sanctums and celebrations.',
    offer: 'SACRED PURITY',
    image: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=1000&q=85',
    routeCategory: 'Traditional',
  },
  {
    id: '4',
    badge: 'VIP CONCIERGE ATELIER',
    telemetry: 'Bespoke Wax-Sealed Presentation',
    title: 'Velour Crystal Keepsake Sets',
    subtitle: 'Accompanied by hand-inked calligraphy card on Italian cotton cardstock & floral elixir.',
    offer: 'LUXURY GIFTING',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=85',
    routeCategory: 'Hampers',
  },
];

export function BannerCarousel() {
  const { width, isTablet } = useResponsive();
  const bannerWidth = isTablet ? Math.min(width - 48, 860) : Math.min(width - 24, 480);
  const bannerHeight = isTablet ? 230 : 195;
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (activeIndex + 1) % BANNERS.length;
      setActiveIndex(nextIndex);
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [activeIndex]);

  const onScroll = (event: any) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / (bannerWidth + 12));
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
        snapToInterval={bannerWidth + 12}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          s.listContent,
          isTablet && { justifyContent: 'center' }
        ]}
        onMomentumScrollEnd={onScroll}
        renderItem={({ item }) => (
          <Pressable
            style={[s.card, { width: bannerWidth, height: bannerHeight }]}
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
            {/* Elegant Vignette Gradient */}
            <View style={s.scrim} />

            <View style={s.overlay}>
              <View style={s.topRow}>
                <View style={s.badge}>
                  <Text style={s.badgeText}>{item.badge}</Text>
                </View>
                <View style={s.offerPill}>
                  <Ionicons name="shield-checkmark" size={11} color={colors.accent} style={{ marginRight: 3 }} />
                  <Text style={s.offerText}>{item.offer}</Text>
                </View>
              </View>

              {item.telemetry && (
                <View style={s.telemetryRibbon}>
                  <View style={s.telemetryDot} />
                  <Text style={s.telemetryText}>{item.telemetry}</Text>
                </View>
              )}

              <View style={s.bottomContent}>
                <Text style={s.title}>{item.title}</Text>
                <Text style={s.subtitle}>{item.subtitle}</Text>
                <View style={s.ctaRow}>
                  <View style={s.curateBtn}>
                    <Text style={s.curateBtnText}>Curate Bouquet</Text>
                    <Ionicons name="arrow-forward" size={13} color={colors.white} />
                  </View>
                  <View style={s.secondaryCta}>
                    <Ionicons name="speedometer-outline" size={12} color={colors.accent} />
                    <Text style={s.secondaryCtaText}>Cold-Chain Active</Text>
                  </View>
                </View>
              </View>
            </View>
          </Pressable>
        )}
      />

      {/* Luxury Dot Indicators */}
      <View style={s.pagination}>
        {BANNERS.map((_, i) => (
          <View
            key={i}
            style={[s.dot, activeIndex === i && s.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    marginVertical: 12,
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
  },
  listContent: {
    paddingHorizontal: 12,
    gap: 12,
  },
  card: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.lineGold,
    ...(shadows?.card || {}),
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(26, 10, 16, 0.52)',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    padding: 14,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    backgroundColor: 'rgba(253, 251, 247, 0.94)',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: radius.pill,
    borderWidth: 0.5,
    borderColor: colors.lineGold,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0.8,
  },
  offerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 63, 32, 0.88)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: radius.pill,
    borderWidth: 0.5,
    borderColor: colors.accent,
  },
  offerText: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 0.6,
  },
  telemetryRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: radius.pill,
    gap: 5,
    marginTop: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  telemetryDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#00E676',
  },
  telemetryText: {
    color: colors.white,
    fontSize: 8.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  bottomContent: {
    gap: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 11,
    color: 'rgba(253, 251, 247, 0.92)',
    fontWeight: '500',
    marginBottom: 6,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  curateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    gap: 5,
    ...(shadows?.soft || {}),
  },
  curateBtnText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  secondaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  secondaryCtaText: {
    color: colors.accentLight,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.line,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
});
