import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadows, spacing } from '@/constants/theme';

const OCCASIONS = [
  {
    id: 'Anniversary',
    title: 'Anniversaries & Romance',
    subtitle: '70cm Ecuadorian Naomi',
    badge: 'ESTATE LUXE',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'Birthday',
    title: 'Highland Birthdays',
    subtitle: 'Vibrant Dutch Medleys',
    badge: 'DAWN CUT',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'Pooja',
    title: 'Divine Sanctum & Pooja',
    subtitle: 'Organic Temple Jasmine',
    badge: 'PURE SACRED',
    image: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'Luxury',
    title: 'Bespoke Executive Gifts',
    subtitle: 'Wax-Sealed Keepsakes',
    badge: 'VIP ATELIER',
    image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=400&q=80',
  },
];

export function OccasionsGrid() {
  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.titleRow}>
          <View style={s.indicator} />
          <Text style={s.title}>Occasions of Grandeur</Text>
        </View>
        <Text style={s.sub}>Bespoke arrangements curated for life's most cherished milestones</Text>
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
            <View style={s.scrim} />
            <View style={s.overlay}>
              <View style={s.badgePill}>
                <Text style={s.badgePillText}>{occ.badge}</Text>
              </View>
              <View>
                <Text style={s.cardTitle}>{occ.title}</Text>
                <Text style={s.cardSub}>{occ.subtitle}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Stitch Bespoke VIP Concierge Banner */}
      <View style={s.conciergeBanner}>
        <View style={s.conciergeLeft}>
          <View style={s.vipTag}>
            <Ionicons name="sparkles" size={13} color={colors.accent} />
            <Text style={s.vipTagText}>VIP FLORILEGIUM</Text>
          </View>
          <Text style={s.conciergeTitle}>Private Event & Residence Styling</Text>
          <Text style={s.conciergeSub}>
            Direct access to Dhanvikk master florists for bespoke installations and recurring fresh deliveries.
          </Text>
        </View>
        <Pressable
          style={s.conciergeBtn}
          onPress={() => router.push('/support')}
        >
          <Text style={s.conciergeBtnText}>Speak to Florist</Text>
          <Ionicons name="call-outline" size={12} color={colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    marginVertical: 8,
    padding: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.lineLight,
    ...shadows.soft,
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  indicator: {
    width: 3.5,
    height: 18,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.ink,
    letterSpacing: 0.2,
  },
  sub: {
    fontSize: 11.5,
    color: colors.muted,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  card: {
    width: '48.5%',
    height: 110,
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.lineGold,
    ...shadows.soft,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(26, 10, 16, 0.45)',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
    padding: 10,
  },
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(253, 251, 247, 0.92)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 0.5,
    borderColor: colors.lineGold,
  },
  badgePillText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0.4,
  },
  cardTitle: {
    color: colors.white,
    fontSize: 12.5,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  cardSub: {
    color: 'rgba(253, 251, 247, 0.9)',
    fontSize: 9.5,
    marginTop: 1,
  },
  conciergeBanner: {
    marginTop: 14,
    backgroundColor: colors.secondary,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.accent,
    ...shadows.soft,
  },
  conciergeLeft: {
    gap: 4,
  },
  vipTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vipTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.accent,
    letterSpacing: 1,
  },
  conciergeTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 0.2,
  },
  conciergeSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.82)',
    lineHeight: 16,
    marginVertical: 4,
  },
  conciergeBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    gap: 5,
  },
  conciergeBtnText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
