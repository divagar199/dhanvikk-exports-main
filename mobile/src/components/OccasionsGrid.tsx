import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { colors, radius } from '@/constants/theme';

const OCCASIONS = [
  {
    id: 'Birthday',
    title: 'Birthday',
    subtitle: 'Vibrant & Cheerful',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'Anniversary',
    title: 'Anniversary',
    subtitle: 'Timeless Romance',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'Romance',
    title: 'Love & Romance',
    subtitle: 'Classic Red Roses',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'Pooja',
    title: 'Festivals & Poojas',
    subtitle: 'Fresh Temple Garlands',
    image: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=400&q=80',
  },
];

export function OccasionsGrid() {
  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Celebrate Every Occasion</Text>
        <Text style={s.sub}>Handcrafted bouquets tailored for your special moments</Text>
      </View>

      <View style={s.grid}>
        {OCCASIONS.map((occ) => (
          <Pressable
            key={occ.id}
            style={s.card}
            onPress={() =>
              router.push({
                pathname: '/(tabs)/shop',
                params: { occasion: occ.id },
              })
            }
          >
            <Image source={{ uri: occ.image }} style={s.image} contentFit="cover" />
            <View style={s.overlay}>
              <Text style={s.cardTitle}>{occ.title}</Text>
              <Text style={s.cardSub}>{occ.subtitle}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    marginVertical: 6,
    padding: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.lineLight,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.ink,
  },
  sub: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  card: {
    width: '48.5%',
    height: 100,
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.38)',
    justifyContent: 'flex-end',
    padding: 10,
  },
  cardTitle: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
  },
  cardSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10,
    marginTop: 1,
  },
});
