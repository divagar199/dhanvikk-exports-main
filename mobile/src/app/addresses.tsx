import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getProfileData } from '@/services/orders';
import { colors, spacing, radius } from '@/constants/theme';
import type { Address } from '@/types/models';

export default function Addresses() {
  const insets = useSafeAreaInsets();
  const { data, isLoading } = useQuery({
    queryKey: ['profile-data'],
    queryFn: getProfileData,
  });

  const addresses: Address[] = data?.savedAddresses || [];

  return (
    <View style={[s.page, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={s.header}>
        <Pressable
          style={s.backBtn}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/account'))}
        >
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={s.headerTitle}>Delivery Addresses</Text>
        <View style={{ width: 38 }} />
      </View>

      {isLoading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={s.loadingText}>Loading saved addresses…</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={[s.content, { paddingBottom: 60 }]}>
          <Text style={s.heading}>Saved locations</Text>

          {addresses.map((a, i) => (
            <View style={s.card} key={a.id || i}>
              <View style={s.cardTop}>
                <View style={s.tag}>
                  <Ionicons name="location" size={12} color={colors.primaryDeep} />
                  <Text style={s.tagText}>{a.title || 'Address'}</Text>
                </View>
                {a.isDefault && (
                  <View style={s.defaultBadge}>
                    <Text style={s.defaultText}>DEFAULT</Text>
                  </View>
                )}
              </View>
              <Text style={s.name}>{a.recipientName || 'Recipient'}</Text>
              <Text style={s.text}>
                {a.street}, {a.city}, {a.state}
              </Text>
              <Text style={s.text}>
                {a.country || 'India'} {a.postalCode || ''}
              </Text>
              {a.phone ? <Text style={s.phone}>Phone: {a.phone}</Text> : null}
            </View>
          ))}

          {addresses.length === 0 && (
            <View style={s.empty}>
              <View style={s.emptyIconCircle}>
                <Ionicons name="location-outline" size={42} color={colors.primary} />
              </View>
              <Text style={s.emptyTitle}>No saved addresses yet</Text>
              <Text style={s.emptySub}>
                Add your delivery address during checkout, and it will be saved here for future orders.
              </Text>
              <Pressable style={s.shopBtn} onPress={() => router.push('/(tabs)/shop')}>
                <Text style={s.shopBtnText}>Shop flowers</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.ink,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: colors.muted,
  },
  content: {
    padding: spacing.lg,
  },
  heading: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.blush,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    color: colors.primaryDeep,
    fontWeight: '800',
  },
  defaultBadge: {
    backgroundColor: colors.pale,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.ink,
  },
  name: {
    fontWeight: '900',
    fontSize: 15,
    color: colors.ink,
    marginBottom: 4,
  },
  text: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 19,
  },
  phone: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 6,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 70,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.ink,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    lineHeight: 18,
  },
  shopBtn: {
    backgroundColor: colors.primary,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  shopBtnText: {
    color: colors.white,
    fontWeight: '900',
    fontSize: 14,
  },
});