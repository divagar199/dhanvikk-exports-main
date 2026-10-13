import { useQuery } from '@tanstack/react-query';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getProducts } from '@/services/products';
import { ProductCard } from '@/components/ProductCard';
import { colors, spacing } from '@/constants/theme';
import type { Product } from '@/types/models';

export default function Home() {
  const insets = useSafeAreaInsets();
  const { data = [] } = useQuery<Product[]>({
    queryKey: ['featured'],
    queryFn: () => getProducts({ limit: 12 }),
  });

  return (
    <FlatList
      data={data}
      numColumns={2}
      keyExtractor={(p) => p.id || p._id || p.slug}
      columnWrapperStyle={s.grid}
      contentContainerStyle={[
        s.content,
        { paddingTop: Math.max(insets.top, 16), paddingBottom: 100 },
      ]}
      ListHeaderComponent={
        <>
          <View style={s.head}>
            <View>
              <Text style={s.eyebrow}>DHANVIKK BLOOMS</Text>
              <Text style={s.title}>Flowers that make moments unforgettable.</Text>
            </View>
            <View style={s.actions}>
              <Pressable
                style={s.iconBtn}
                onPress={() => router.push('/search')}
                accessibilityLabel="Search"
              >
                <Ionicons name="search" size={22} color={colors.ink} />
              </Pressable>
              <Pressable
                style={s.iconBtn}
                onPress={() => router.push('/wishlist')}
                accessibilityLabel="Wishlist"
              >
                <Ionicons name="heart-outline" size={22} color={colors.ink} />
              </Pressable>
            </View>
          </View>

          <Pressable style={s.hero} onPress={() => router.push('/(tabs)/shop')}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=85',
              }}
              style={s.heroImg}
              contentFit="cover"
            />
            <View style={s.overlay}>
              <Text style={s.kicker}>BOTANICAL GALLERY</Text>
              <Text style={s.heroTitle}>Curated blooms, delivered beautifully.</Text>
              <View style={s.button}>
                <Text style={s.buttonText}>Shop flowers</Text>
              </View>
            </View>
          </Pressable>

          <View style={s.sectionHeader}>
            <Text style={s.section}>Fresh picks</Text>
            <Pressable onPress={() => router.push('/(tabs)/shop')}>
              <Text style={s.seeAll}>See all</Text>
            </Pressable>
          </View>
        </>
      }
      renderItem={({ item }) => <ProductCard product={item} />}
    />
  );
}

const s = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 2,
    color: colors.primaryDeep,
    fontWeight: '900',
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '900',
    color: colors.ink,
    marginTop: 6,
    maxWidth: 280,
  },
  hero: {
    height: 300,
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 12,
    marginBottom: 24,
  },
  heroImg: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    padding: 22,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  kicker: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '900',
    marginVertical: 10,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  buttonText: {
    color: colors.primaryDeep,
    fontWeight: '900',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  section: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.ink,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryDeep,
  },
  grid: {
    justifyContent: 'space-between',
  },
});