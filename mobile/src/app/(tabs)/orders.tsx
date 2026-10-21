import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getMyOrders } from '@/services/orders';
import { colors, spacing, radius, shadows } from '@/constants/theme';
import { useStore } from '@/store/useStore';
import { getStoredUser } from '@/lib/storage';
import { resolveImageUrl } from '@/lib/imageUrl';
import GoogleSignInModal from '@/components/GoogleSignInModal';
import { BrandHeaderTitle } from '@/components/BrandHeaderTitle';
import type { Order, User } from '@/types/models';

export default function OrdersTab() {
  const insets = useSafeAreaInsets();
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const cart = useStore((s) => s.cart);
  const cartCount = cart.reduce((t, i) => t + (i.quantity || 1), 0);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  useEffect(() => {
    if (!user) {
      getStoredUser<User>().then((u) => {
        if (u) setUser(u);
      });
    }
  }, [user, setUser]);

  const {
    data = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<Order[]>({
    queryKey: ['orders', user?.id, user?.email],
    queryFn: getMyOrders,
    enabled: !!user,
  });

  const getStatusColor = (status?: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('out') || s.includes('prepar') || s.includes('progress')) {
      return { bg: '#FCE4EC', text: '#C2185B', border: '#F8BBD0' };
    }
    if (s.includes('deliver')) return { bg: '#E8F5E9', text: '#2E7D32', border: '#C8E6C9' };
    if (s.includes('cancel')) return { bg: '#FFEBEE', text: '#C62828', border: '#FFCDD2' };
    return { bg: colors.softBlush, text: colors.deepMagenta, border: colors.border };
  };

  return (
    <View style={[s.page, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Botanical Gallery Header */}
      <View style={s.header}>
        <View style={s.headerLeftGroup}>
          <Pressable
            style={({ pressed }) => [
              s.backBtn,
              pressed && { opacity: 0.7, transform: [{ scale: 0.92 }] },
            ]}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'))}
            hitSlop={8}
            accessibilityLabel="Back to Home"
          >
            <Ionicons name="arrow-back" size={22} color={colors.ink} />
          </Pressable>
          <BrandHeaderTitle />
        </View>

        <View style={s.headerActions}>
          <Pressable
            style={({ pressed }) => [
              s.iconBtn,
              pressed && { opacity: 0.7, transform: [{ scale: 0.92 }] },
            ]}
            onPress={() => {
              if (user) refetch();
            }}
            accessibilityLabel="Refresh orders"
          >
            <Ionicons name="refresh" size={19} color={colors.ink} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              s.iconBtn,
              pressed && { opacity: 0.7, transform: [{ scale: 0.92 }] },
            ]}
            onPress={() => router.push('/cart')}
            accessibilityLabel="Shopping Cart"
          >
            <Ionicons name="cart-outline" size={21} color={colors.ink} />
            {cartCount > 0 && (
              <View style={s.cartBadge}>
                <Text style={s.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* Guest Mode: VIP Sign In Prompt */}
      {!user ? (
        <View style={s.guestContainer}>
          <View style={s.guestCard}>
            <View style={s.guestIconCircle}>
              <Ionicons name="cart" size={38} color={colors.primary} />
            </View>
            <Text style={s.guestTitle}>Sign in to view orders</Text>
            <Text style={s.guestSubtitle}>
              Access your active deliveries, real-time tracking, floral greeting messages, and past invoices.
            </Text>

            <Pressable
              style={s.googleBtn}
              onPress={() => setShowGoogleModal(true)}
            >
              <Ionicons name="logo-google" size={18} color="#EA4335" style={{ marginRight: 8 }} />
              <Text style={s.googleBtnText}>Continue with Google</Text>
            </Pressable>

            <Pressable
              style={s.emailLoginBtn}
              onPress={() => router.push('/auth/login')}
            >
              <Ionicons name="mail-outline" size={18} color={colors.white} style={{ marginRight: 8 }} />
              <Text style={s.emailLoginBtnText}>Sign in with Email</Text>
            </Pressable>

            <Pressable
              style={s.signupBtn}
              onPress={() => router.push('/auth/register')}
            >
              <Text style={s.signupBtnText}>
                New to Dhanvikk? <Text style={{ color: colors.primary, fontWeight: '800' }}>Create Account</Text>
              </Text>
            </Pressable>
          </View>

          <GoogleSignInModal
            visible={showGoogleModal}
            onClose={() => setShowGoogleModal(false)}
            onSuccess={() => {
              setShowGoogleModal(false);
              refetch();
            }}
          />
        </View>
      ) : isLoading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={s.loadingText}>Retrieving your floral orders…</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          contentContainerStyle={[s.content, { paddingBottom: Math.max(insets.bottom, 16) + 115 }]}
          keyExtractor={(item: Order, index: number) =>
            item.orderId || item.id || (item as any)._id || String(index)
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                refetch();
              }}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={s.empty}>
              <View style={s.emptyIconCircle}>
                <Ionicons name="receipt-outline" size={44} color={colors.primary} />
              </View>
              <Text style={s.emptyTitle}>No Orders Placed Yet</Text>
              <Text style={s.emptySub}>
                Your order history will appear here once you place your first luxury bouquet order.
              </Text>
              <Pressable style={s.shopBtn} onPress={() => router.push('/(tabs)/shop')}>
                <Text style={s.shopBtnText}>Explore Fresh Flowers</Text>
                <Ionicons name="arrow-forward" size={14} color={colors.white} />
              </Pressable>
            </View>
          }
          renderItem={({ item }: { item: Order }) => {
            const statusStyle = getStatusColor(item.status);
            const targetId = item.orderId || item.id || (item as any)._id;
            return (
              <Pressable
                style={s.card}
                onPress={() => router.push(('/order/' + encodeURIComponent(targetId)) as any)}
              >
                {/* Header row: Order ID + Status Badge */}
                <View style={s.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.id}>#{item.orderId || item.id || 'DHN-ORDER'}</Text>
                    <Text style={s.date}>
                      {item.deliveryDate || 'Scheduled'} · {item.timeSlot || 'Standard Delivery'}
                    </Text>
                  </View>
                  <View
                    style={[
                      s.statusBadge,
                      {
                        backgroundColor: statusStyle.bg,
                        borderColor: statusStyle.border,
                      },
                    ]}
                  >
                    <Text style={[s.statusText, { color: statusStyle.text }]}>
                      {item.status || 'Confirmed'}
                    </Text>
                  </View>
                </View>

                {/* Items preview row */}
                {Array.isArray(item.items) && item.items.length > 0 ? (
                  <View style={s.itemsPreviewRow}>
                    <View style={s.thumbnailsGroup}>
                      {item.items.slice(0, 3).map((it: any, idx: number) => {
                        const imgUri = resolveImageUrl(it.image);
                        return (
                          <View key={it.product || it.id || idx} style={s.thumbWrapper}>
                            {imgUri ? (
                              <Image
                                source={{ uri: imgUri }}
                                style={s.thumbImage}
                                contentFit="cover"
                                transition={150}
                              />
                            ) : (
                              <View style={s.thumbPlaceholder}>
                                <Ionicons name="rose-outline" size={16} color={colors.muted} />
                              </View>
                            )}
                          </View>
                        );
                      })}
                      {item.items.length > 3 ? (
                        <View style={s.moreThumbBadge}>
                          <Text style={s.moreThumbText}>+{item.items.length - 3}</Text>
                        </View>
                      ) : null}
                    </View>

                    <View style={s.itemsTextCol}>
                      <Text style={s.itemNamesLine} numberOfLines={1}>
                        {item.items.map((i: any) => i.name).join(', ')}
                      </Text>
                      <Text style={s.itemCount}>
                        {item.items.length} {item.items.length === 1 ? 'item' : 'items'}
                      </Text>
                    </View>
                  </View>
                ) : null}

                <View style={s.cardDivider} />

                {/* Card Bottom: Total Price & CTA */}
                <View style={s.cardBottom}>
                  <View style={s.priceRow}>
                    <Text style={s.amountLabel}>Total: </Text>
                    <Text style={s.amount}>
                      ₹{(item.totalAmount || 0).toLocaleString('en-IN')}
                    </Text>
                  </View>
                  <View style={s.detailsLinkRow}>
                    <Text style={s.detailsLinkText}>Track Order</Text>
                    <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    maxWidth: 840,
    width: '100%',
    alignSelf: 'center',
    ...(shadows?.soft || {}),
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    gap: 2,
  },
  headerSup: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.secondary,
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  cartBadgeText: {
    color: colors.white,
    fontSize: 9.5,
    fontWeight: '900',
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  guestCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...(shadows?.soft || {}),
  },
  guestIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.softBlush,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  guestTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: colors.ink,
    marginBottom: 8,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: 12,
    marginBottom: 10,
    ...(shadows?.soft || {}),
  },
  googleBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.ink,
  },
  emailLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: 12,
    marginBottom: 12,
    ...(shadows?.soft || {}),
  },
  emailLoginBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.white,
  },
  signupBtn: {
    paddingVertical: 6,
  },
  signupBtnText: {
    fontSize: 12.5,
    color: colors.muted,
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
    padding: spacing.md,
    maxWidth: 840,
    width: '100%',
    alignSelf: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...(shadows?.soft || {}),
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  id: {
    fontWeight: '900',
    fontSize: 15,
    color: colors.ink,
  },
  date: {
    fontSize: 11.5,
    color: colors.muted,
    marginTop: 3,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  itemsPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 10,
  },
  thumbnailsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbWrapper: {
    width: 44,
    height: 44,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 6,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreThumbBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.softBlush,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  moreThumbText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
  },
  itemsTextCol: {
    flex: 1,
  },
  itemNamesLine: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.ink,
  },
  itemCount: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  amountLabel: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '600',
  },
  amount: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.ink,
  },
  detailsLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  detailsLinkText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 90,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.softBlush,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.ink,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    maxWidth: 280,
  },
  shopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 22,
    paddingVertical: 12,
    ...(shadows?.soft || {}),
  },
  shopBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});
