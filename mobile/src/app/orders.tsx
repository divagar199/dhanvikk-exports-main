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
import { colors, spacing, radius } from '@/constants/theme';
import { useStore } from '@/store/useStore';
import { getStoredUser } from '@/lib/storage';
import { resolveImageUrl } from '@/lib/imageUrl';
import GoogleSignInModal from '@/components/GoogleSignInModal';
import type { Order, User } from '@/types/models';

export default function Orders() {
  const insets = useSafeAreaInsets();
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
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
    if (s.includes('deliver')) return { bg: '#E6F4EA', text: '#137333', border: '#CEEAD6' };
    if (s.includes('out') || s.includes('prepar') || s.includes('progress')) {
      return { bg: '#FEF7E0', text: '#B06000', border: '#FEEFC3' };
    }
    if (s.includes('cancel')) return { bg: '#FCE8E6', text: '#C5221F', border: '#FAD2CF' };
    return { bg: colors.blush, text: colors.primaryDeep, border: colors.blushDeep };
  };

  return (
    <View style={[s.page, { paddingTop: Math.max(insets.top, 12) }]}>
      {/* Top Header */}
      <View style={s.header}>
        <Pressable
          style={s.backBtn}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/account'))}
        >
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>My Orders</Text>
          {user ? (
            <Text style={s.headerSub}>
              {data.length} {data.length === 1 ? 'order' : 'orders'} placed
            </Text>
          ) : null}
        </View>
        <Pressable
          style={s.backBtn}
          onPress={() => {
            if (user) refetch();
          }}
        >
          <Ionicons name="refresh" size={20} color={colors.ink} />
        </Pressable>
      </View>

      {/* Guest Mode: VIP Sign In Prompt */}
      {!user ? (
        <View style={s.guestContainer}>
          <View style={s.guestCard}>
            <View style={s.guestIconCircle}>
              <Ionicons name="bag-check" size={38} color={colors.primary} />
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
              <Text style={s.signupBtnText}>New to Dhanvikk? <Text style={{ color: colors.primary, fontWeight: '800' }}>Create Account</Text></Text>
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
          <Text style={s.loadingText}>Loading your orders…</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          contentContainerStyle={[s.content, { paddingBottom: 60 }]}
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
                <Ionicons name="receipt-outline" size={42} color={colors.primary} />
              </View>
              <Text style={s.emptyTitle}>No orders placed yet</Text>
              <Text style={s.emptySub}>
                Your order history will appear here once you place your first luxury bouquet order.
              </Text>
              <Pressable style={s.shopBtn} onPress={() => router.push('/(tabs)/shop')}>
                <Text style={s.shopBtnText}>Explore Fresh Flowers</Text>
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
                    <Text style={s.detailsLinkText}>View Details</Text>
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
  headerCenter: {
    alignItems: 'center',
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
  headerSub: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
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
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
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
    fontSize: 12,
    color: colors.muted,
    marginTop: 3,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
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
    borderColor: colors.line,
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
    backgroundColor: colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreThumbText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryDeep,
  },
  itemsTextCol: {
    flex: 1,
  },
  itemNamesLine: {
    fontSize: 13,
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
    backgroundColor: colors.line,
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
  },
  amount: {
    fontWeight: '900',
    fontSize: 16,
    color: colors.primaryDeep,
  },
  detailsLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailsLinkText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  guestContainer: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  guestCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  guestIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.ink,
    marginBottom: 8,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 24,
    paddingVertical: 12,
    marginBottom: 10,
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3c4043',
  },
  emailLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingVertical: 12,
    marginBottom: 14,
  },
  emailLoginBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.white,
  },
  signupBtn: {
    paddingVertical: 6,
  },
  signupBtnText: {
    fontSize: 13,
    color: colors.muted,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 80,
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