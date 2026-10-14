import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadows, spacing } from '@/constants/theme';
import { useStore } from '@/store/useStore';
import { useQuery } from '@tanstack/react-query';
import { getProfileData } from '@/services/orders';

const brandLogo = require('@/assets/logo.png');

export function FlipkartHeader() {
  const insets = useSafeAreaInsets();
  const user = useStore((s) => s.user);
  const cart = useStore((s) => s.cart);
  const wishlist = useStore((s) => s.wishlist);

  const { data: profileData } = useQuery({
    queryKey: ['profile-data', user?.email],
    queryFn: getProfileData,
    enabled: !!user,
  });

  const savedAddresses = user ? (profileData?.savedAddresses || []) : [];
  const defaultAddress = savedAddresses.find((a: any) => a.isDefault) || savedAddresses[0];

  const locationLabel = !user
    ? 'Select Destination'
    : defaultAddress
    ? `${defaultAddress.city || 'Bangalore'}${defaultAddress.postalCode ? ` • ${defaultAddress.postalCode}` : ''}`
    : '+ Add Address';

  const cartCount = cart.reduce((t, i) => t + (i.quantity || 1), 0);
  const wishCount = wishlist.length;

  return (
    <View style={[s.header, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Top Telemetry & Micro-Status Bar */}
      <View style={s.telemetryRow}>
        <View style={s.telemetryPill}>
          <View style={s.telemetryDot} />
          <Text style={s.telemetryText}>EXPRESS 90M • REEFER COLD-CHAIN: 3.2°C</Text>
        </View>
        <Pressable
          style={s.conciergeLink}
          onPress={() => router.push('/support')}
          hitSlop={6}
        >
          <Ionicons name="sparkles" size={12} color={colors.accent} />
          <Text style={s.conciergeText}>VIP Concierge</Text>
        </Pressable>
      </View>

      {/* Brand & Location Row */}
      <View style={s.topRow}>
        <Pressable style={s.brandGroup} onPress={() => router.push('/(tabs)/home')}>
          <Image source={brandLogo} style={s.brandLogoImg} contentFit="contain" />
          <View>
            <Text style={s.brandTitle}>DHANVIKK</Text>
            <Text style={s.brandSubtitle}>HAUTE FLORICULTURE</Text>
          </View>
        </Pressable>

        <Pressable
          style={s.locationPill}
          onPress={() => (user ? router.push('/addresses') : router.push('/auth/login'))}
        >
          <Ionicons name="location-sharp" size={13} color={colors.primary} />
          <Text style={s.locationText} numberOfLines={1}>
            {locationLabel}
          </Text>
          <Ionicons name="chevron-down" size={11} color={colors.accent} />
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

      {/* Luxury Editorial Search Bar */}
      <Pressable
        style={s.searchBar}
        onPress={() => router.push('/search')}
      >
        <Ionicons name="search" size={17} color={colors.primary} />
        <Text style={s.searchPlaceholder}>
          Search Royal Red Naomi, Casablanca Lilies, Cymbidiums…
        </Text>
        <View style={s.micIcon}>
          <Ionicons name="mic-outline" size={17} color={colors.accent} />
        </View>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineLight,
    ...shadows.soft,
  },
  telemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.lineLight,
    marginBottom: 8,
  },
  telemetryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: radius.pill,
    gap: 5,
  },
  telemetryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.secondary,
  },
  telemetryText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.secondary,
    letterSpacing: 0.5,
  },
  conciergeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  conciergeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accentMuted,
    letterSpacing: 0.3,
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
    alignItems: 'center',
    gap: 8,
  },
  brandLogoImg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.lineGold,
    backgroundColor: colors.canvas,
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 1.2,
    lineHeight: 17,
  },
  brandSubtitle: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.secondary,
    letterSpacing: 1.6,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    gap: 4,
    maxWidth: 155,
  },
  locationText: {
    fontSize: 10.5,
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
    padding: 3,
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -5,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.accent,
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
    backgroundColor: colors.canvas,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.lineGold,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: '500',
    color: colors.muted,
  },
  micIcon: {
    paddingLeft: 4,
  },
});
