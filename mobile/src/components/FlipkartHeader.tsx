import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadows, spacing } from '@/constants/theme';
import { useStore } from '@/store/useStore';
import { useQuery } from '@tanstack/react-query';
import { getProfileData } from '@/services/orders';

import { BrandHeaderTitle } from '@/components/BrandHeaderTitle';

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
    <View style={[s.header, { paddingTop: Math.max(insets.top + 8, 16) }]}>
      {/* Brand & Location Row */}
      <View style={s.topRow}>
        <BrandHeaderTitle />

        <Pressable
          style={({ pressed }) => [
            s.locationPill,
            pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
          ]}
          onPress={() => (user ? router.push('/addresses') : router.push('/auth/login'))}
        >
          <Ionicons name="location-sharp" size={13} color={colors.primary} />
          <Text style={s.locationText} numberOfLines={1}>
            {locationLabel}
          </Text>
          <Ionicons name="chevron-down" size={11} color={colors.muted} />
        </Pressable>

        <View style={s.iconsGroup}>
          <Pressable
            style={({ pressed }) => [
              s.iconBtn,
              pressed && { opacity: 0.7, transform: [{ scale: 0.92 }] },
            ]}
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
            style={({ pressed }) => [
              s.iconBtn,
              pressed && { opacity: 0.7, transform: [{ scale: 0.92 }] },
            ]}
            onPress={() => router.push('/cart')}
            hitSlop={6}
          >
            <Ionicons name="cart-outline" size={22} color={colors.ink} />
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
        style={({ pressed }) => [
          s.searchBar,
          pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
        ]}
        onPress={() => router.push('/search')}
      >
        <Ionicons name="search" size={17} color={colors.muted} />
        <Text style={s.searchPlaceholder} numberOfLines={1}>
          Search flowers, bouquets…
        </Text>
        <View style={s.micIcon}>
          <Ionicons name="mic-outline" size={17} color={colors.primary} />
        </View>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineLight,
    ...(shadows?.soft || {}),
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 4,
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
    borderColor: colors.border,
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
    fontSize: 8.5,
    fontWeight: '800',
    color: colors.secondary,
    letterSpacing: 0.5,
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
    borderColor: colors.white,
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
    height: 44,
    backgroundColor: colors.canvas,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
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
