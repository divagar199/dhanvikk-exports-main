import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getMyOrders, getOrderById } from '@/services/orders';
import { colors, spacing, radius } from '@/constants/theme';
import { resolveImageUrl } from '@/lib/imageUrl';
import { BrandHeaderTitle } from '@/components/BrandHeaderTitle';
import type { Order } from '@/types/models';

export default function OrderDetail() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  // 1. Query order list (from cache or background)
  const { data: ordersList = [], isLoading: isLoadingList } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: getMyOrders,
  });

  // 2. Query direct order by ID from backend if needed
  const { data: singleOrder, isLoading: isLoadingSingle } = useQuery<Order | null>({
    queryKey: ['order', id],
    queryFn: () => (id ? getOrderById(id) : Promise.resolve(null)),
    enabled: !!id,
  });

  const order =
    ordersList.find((x: any) => {
      if (!id) return false;
      const target = String(id).toLowerCase().trim();
      return (
        String(x.orderId || '').toLowerCase().trim() === target ||
        String(x.id || '').toLowerCase().trim() === target ||
        String(x._id || '').toLowerCase().trim() === target
      );
    }) || singleOrder;

  const isLoading = (isLoadingList || isLoadingSingle) && !order;

  const getStatusColor = (status?: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('deliver')) return { bg: '#E6F4EA', text: '#137333', border: '#CEEAD6', icon: 'checkmark-circle' };
    if (s.includes('out') || s.includes('prepar') || s.includes('progress')) {
      return { bg: '#FCE4EC', text: '#C2185B', border: '#F8BBD0', icon: 'bicycle-outline' };
    }
    if (s.includes('cancel')) return { bg: '#FCE8E6', text: '#C5221F', border: '#FAD2CF', icon: 'close-circle' };
    return { bg: colors.blush, text: colors.primaryDeep, border: colors.blushDeep, icon: 'shield-checkmark' };
  };

  const handleSupportPress = () => {
    const msg = encodeURIComponent(`Hi Dhanvikk Blooms and Exports, I have an inquiry regarding my order #${order?.orderId || id}`);
    Linking.openURL(`https://wa.me/919488344799?text=${msg}`).catch(() => {});
  };

  return (
    <View style={[s.page, { paddingTop: Math.max(insets.top, 12) }]}>
      {/* Top Header */}
      <View style={s.header}>
        <Pressable
          style={({ pressed }) => [
            s.backBtn,
            pressed && { opacity: 0.7, transform: [{ scale: 0.92 }] },
          ]}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/orders'))}
        >
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>
        <BrandHeaderTitle align="center" />
        <Pressable
          style={({ pressed }) => [
            s.backBtn,
            pressed && { opacity: 0.7, transform: [{ scale: 0.92 }] },
          ]}
          onPress={handleSupportPress}
        >
          <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={s.loadingText}>Fetching order details…</Text>
        </View>
      ) : !order ? (
        <View style={s.center}>
          <View style={s.notFoundCircle}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.primary} />
          </View>
          <Text style={s.notFoundTitle}>Order Not Found</Text>
          <Text style={s.notFoundSub}>We couldn't locate order reference #{id}.</Text>
          <Pressable style={s.returnBtn} onPress={() => router.replace('/orders')}>
            <Text style={s.returnBtnText}>Back to all orders</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={[s.content, { paddingBottom: Math.max(insets.bottom, 20) + 50 }]}>
          {/* Top Order ID and Status Pill */}
          {(() => {
            const st = getStatusColor(order.status);
            return (
              <View style={s.idCard}>
                <View style={{ flex: 1 }}>
                  <Text style={s.orderNumberLabel}>ORDER REFERENCE</Text>
                  <Text style={s.orderNumber}>#{order.orderId || order.id || id}</Text>
                  <Text style={s.orderDateSub}>
                    Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
                  </Text>
                </View>
                <View style={[s.statusBadge, { backgroundColor: st.bg, borderColor: st.border }]}>
                  <Ionicons name={st.icon as any} size={14} color={st.text} />
                  <Text style={[s.statusText, { color: st.text }]}>{order.status || 'Confirmed'}</Text>
                </View>
              </View>
            );
          })()}

          {/* Delivery Details */}
          <Text style={s.heading}>Delivery & Schedule</Text>
          <View style={s.card}>
            <View style={s.infoRow}>
              <Ionicons name="person-circle-outline" size={20} color={colors.primaryDeep} />
              <View style={{ flex: 1 }}>
                <Text style={s.infoBold}>
                  {order.shippingAddress?.fullName ||
                    (order.shippingAddress as any)?.recipientName ||
                    order.user?.name ||
                    'Customer'}
                </Text>
                {order.shippingAddress?.phone || order.user?.phone ? (
                  <Text style={s.infoMuted}>{order.shippingAddress?.phone || order.user?.phone}</Text>
                ) : null}
              </View>
            </View>

            <View style={s.infoRow}>
              <Ionicons name="location-outline" size={20} color={colors.primaryDeep} />
              <Text style={s.infoMuted}>
                {[
                  order.shippingAddress?.streetAddress || (order.shippingAddress as any)?.street,
                  order.shippingAddress?.city,
                  order.shippingAddress?.state,
                  order.shippingAddress?.pincode,
                ]
                  .filter(Boolean)
                  .join(', ') || 'Address on file'}
              </Text>
            </View>

            <View style={[s.infoRow, { marginBottom: 0 }]}>
              <Ionicons name="calendar-outline" size={20} color={colors.primaryDeep} />
              <Text style={s.infoMuted}>
                {order.deliveryDate || 'Scheduled delivery'} · {order.timeSlot || 'Standard Slot'}
              </Text>
            </View>
          </View>

          {/* Greeting Card Message if available */}
          {order.greetingCardMessage ? (
            <>
              <Text style={s.heading}>Gift Greeting Message</Text>
              <View style={[s.card, s.greetingCardBox]}>
                <Ionicons name="heart" size={18} color={colors.primary} style={{ marginBottom: 6 }} />
                <Text style={s.greetingCardText}>"{order.greetingCardMessage}"</Text>
              </View>
            </>
          ) : null}

          {/* Ordered Floral Items */}
          <Text style={s.heading}>Items Ordered ({order.items?.length || 0})</Text>
          {(order.items || []).map((item: any, index: number) => {
            const imgUri = resolveImageUrl(item.image);
            return (
              <View key={item.product || item.id || index} style={s.itemCard}>
                {imgUri ? (
                  <Image
                    source={{ uri: imgUri }}
                    style={s.itemThumb}
                    contentFit="cover"
                    transition={150}
                  />
                ) : (
                  <View style={[s.itemThumb, s.itemThumbFallback]}>
                    <Ionicons name="rose-outline" size={20} color={colors.muted} />
                  </View>
                )}
                <View style={{ flex: 1, paddingLeft: 12 }}>
                  <Text style={s.itemName} numberOfLines={2}>{item.name}</Text>
                  {item.notes ? (
                    <Text style={s.itemSubNote} numberOfLines={1}>{item.notes}</Text>
                  ) : null}
                  <Text style={s.itemMeta}>
                    Qty: {item.quantity || 1} × ₹{Number(item.price || 0).toLocaleString('en-IN')}
                  </Text>
                </View>
                <Text style={s.itemTotal}>
                  ₹{(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString('en-IN')}
                </Text>
              </View>
            );
          })}

          {/* Payment Breakdown */}
          <Text style={s.heading}>Payment Summary</Text>
          <View style={s.card}>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Subtotal</Text>
              <Text style={s.summaryVal}>
                ₹{(order.subtotal || order.totalAmount || 0).toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Delivery Fee</Text>
              <Text style={[s.summaryVal, { color: colors.success }]}>
                {order.deliveryFee ? `₹${order.deliveryFee}` : 'FREE'}
              </Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Payment Method</Text>
              <Text style={s.summaryVal}>
                {order.paymentInfo?.method || 'Razorpay / Prepaid'}
              </Text>
            </View>
            <View style={s.divider} />
            <View style={s.summaryRow}>
              <Text style={s.totalLabel}>Total Amount</Text>
              <Text style={s.totalAmount}>
                ₹{(order.totalAmount || 0).toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          {/* Support Actions */}
          <Pressable style={s.supportBtn} onPress={handleSupportPress}>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.primary} />
            <Text style={s.supportBtnText}>Need assistance with this order? Contact Concierge</Text>
          </Pressable>
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
    maxWidth: 840,
    width: '100%',
    alignSelf: 'center',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0.8,
  },
  headerSub: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.secondary,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: colors.muted,
  },
  notFoundCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.ink,
  },
  notFoundSub: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
    marginBottom: 20,
    textAlign: 'center',
  },
  returnBtn: {
    backgroundColor: colors.primary,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  returnBtnText: {
    color: colors.white,
    fontWeight: '900',
  },
  content: {
    padding: spacing.md,
    maxWidth: 840,
    width: '100%',
    alignSelf: 'center',
  },
  idCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  orderNumberLabel: {
    fontSize: 10,
    color: colors.muted,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  orderNumber: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.ink,
    marginTop: 2,
  },
  orderDateSub: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  heading: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.ink,
    marginTop: 18,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  infoBold: {
    fontWeight: '800',
    color: colors.ink,
    fontSize: 14,
  },
  infoMuted: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  greetingCardBox: {
    backgroundColor: '#FFF7F9',
    borderColor: '#FCE7ED',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  greetingCardText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: colors.primaryDeep,
    lineHeight: 20,
  },
  itemCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  itemThumb: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: colors.pale,
  },
  itemThumbFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
  },
  itemSubNote: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  itemMeta: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.ink,
    marginLeft: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.muted,
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.ink,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primaryDeep,
  },
  supportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.blush,
    borderRadius: radius.md,
    paddingVertical: 14,
    marginTop: 18,
    borderWidth: 1,
    borderColor: colors.blushDeep,
  },
  supportBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primaryDeep,
  },
});