import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '@/constants/theme';
import { useStore } from '@/store/useStore';

export function FlipkartHeader() {
  const insets = useSafeAreaInsets();
  const cart = useStore((s) => s.cart);
  const wishlist = useStore((s) => s.wishlist);

  const cartCount = cart.reduce((t, i) => t + (i.quantity || 1), 0);
  const wishCount = wishlist.length;

  return (
    <View style={[s.header, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Brand & Location Row */}
      <View style={s.topRow}>
        <View style={s.brandGroup}>
          <Text style={s.brandTitle}>DHANVIKK</Text>
          <Text style={s.brandSubtitle}>BLOOMS</Text>
        </View>

        <Pressable
          style={s.locationPill}
          onPress={() => router.push('/addresses')}
        >
          <Ionicons name="location" size={13} color={colors.primaryDeep} />
          <Text style={s.locationText} numberOfLines={1}>
            Deliver to: Chennai 600001
          </Text>
          <Ionicons name="chevron-down" size={12} color={colors.muted} />
        </Pressable>

        <View style={s.iconsGroup}>
          <Pressable
            style={s.iconBtn}
            onPress={() => router.push('/wishlist')}
            hitSlop={6}
          >
            <Ionicons name="heart-outline" size={22} color={colors.ink} />
            {wishCount > 0 && (
              <View style={s.badge}>
                <Text style={s.badgeText}>{wishCount}</Text>
              </View>
            )}
          </Pressable>

          <Pressable
            style={s.iconBtn}
            onPress={() => router.push('/(tabs)/cart')}
            hitSlop={6}
          >
            <Ionicons name="bag-handle-outline" size={22} color={colors.ink} />
            {cartCount > 0 && (
              <View style={s.badge}>
                <Text style={s.badgeText}>{cartCount}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* Flipkart-Style Search Bar */}
      <Pressable
        style={s.searchBar}
        onPress={() => router.push('/search')}
      >
        <Ionicons name="search" size={18} color={colors.muted} />
        <Text style={s.searchPlaceholder}>
          Search for fresh roses, lilies, pooja flowers, gifts…
        </Text>
        <View style={s.micIcon}>
          <Ionicons name="mic-outline" size={18} color={colors.muted} />
        </View>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 2,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryDeep,
    letterSpacing: 1,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.pale,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    gap: 4,
    maxWidth: 150,
  },
  locationText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.ink,
  },
  iconsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    position: 'relative',
    padding: 2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: colors.primary,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '900',
  },
  searchBar: {
    height: 42,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 12,
    color: colors.muted,
  },
  micIcon: {
    paddingLeft: 4,
  },
});
