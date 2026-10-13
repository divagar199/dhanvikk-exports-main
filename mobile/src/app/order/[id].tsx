import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getMyOrders } from '@/services/orders';
import { colors, spacing, radius } from '@/constants/theme';
import type { Order } from '@/types/models';

export default function OrderDetail() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data = [], isLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: getMyOrders,
  });

  const order = data.find((x) => x.orderId === id);

  return (
    <View style={[s.page, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={s.header}>
        <Pressable
          style={s.backBtn}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/orders'))}
        >
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={s.headerTitle}>Order Details</Text>
        <View style={{ width: 38 }} />
      </View>

      {isLoading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={s.loadingText}>Fetching order details…</Text>
        </View>
      ) : !order ? (
        <View style={s.center}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.muted} />
          <Text style={s.notFoundTitle}>Order not found</Text>
          <Text style={s.notFoundSub}>We couldn't locate order #{id}.</Text>
          <Pressable style={s.returnBtn} onPress={() => router.replace('/orders')}>
            <Text style={s.returnBtnText}>Back to all orders</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={[s.content, { paddingBottom: 60 }]}>
          <View style={s.idCard}>
            <View>
              <Text style={s.orderNumberLabel}>Order ID</Text>
              <Text style={s.orderNumber}>{order.orderId}</Text>
            </View>
            <View style={s.statusBadge}>
              <Ionicons name="checkmark-circle" size={14} color={colors.primaryDeep} />
              <Text style={s.statusText}>{order.status || 'Confirmed'}</Text>
            </View>
          </View>

          <Text style={s.heading}>Delivery Information</Text>
          <View style={s.card}>
            <View style={s.infoRow}>
              <Ionicons name="person-outline" size={18} color={colors.primaryDeep} />
              <Text style={s.bold}>
                {order.shippingAddress?.fullName ||
                  (order.shippingAddress as any)?.recipientName ||
                  'Customer'}
              </Text>
            </View>
            <View style={s.infoRow}>
              <Ionicons name="location-outline" size={18} color={colors.primaryDeep} />
              <Text style={s.muted}>
                {order.shippingAddress?.streetAddress || (order.shippingAddress as any)?.street || ''},{' '}
                {order.shippingAddress?.city || ''}
              </Text>
            </View>
            <View style={s.infoRow}>
              <Ionicons name="calendar-outline" size={18} color={colors.primaryDeep} />
              <Text style={s.muted}>
                {order.deliveryDate || 'Standard delivery'} · {order.timeSlot || '9 AM - 1 PM'}
              </Text>
            </View>
          </View>

          <Text style={s.heading}>Items Ordered</Text>
          {(order.items || []).map((item: any, index: number) => (
            <View key={item.product || item.id || index} style={s.itemCard}>
              {item.image ? (
                <Image
                  source={{ uri: item.image }}
                  style={s.itemThumb}
                  contentFit="cover"
                />
              ) : null}
              <View style={{ flex: 1, paddingLeft: item.image ? 10 : 0 }}>
                <Text style={s.itemName}>{item.name}</Text>
                <Text style={s.itemMeta}>
                  {item.quantity} × ₹{Number(item.price || 0).toLocaleString('en-IN')}
                </Text>
              </View>
              <Text style={s.itemTotal}>
                ₹{(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString('en-IN')}
              </Text>
            </View>
          ))}

          <Text style={s.heading}>Payment Summary</Text>
          <View style={s.card}>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Subtotal</Text>
              <Text style={s.summaryVal}>
                ₹{(order.subtotal || order.totalAmount || 0).toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Delivery fee</Text>
              <Text style={[s.summaryVal, { color: colors.success }]}>
                {order.deliveryFee ? `₹${order.deliveryFee}` : 'FREE'}
              </Text>
            </View>
            <View style={s.divider} />
            <View style={s.summaryRow}>
              <Text style={s.totalLabel}>Total paid</Text>
              <Text style={s.totalAmount}>
                ₹{(order.totalAmount || 0).toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
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
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: colors.muted,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.ink,
    marginTop: 12,
  },
  notFoundSub: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
    marginBottom: 20,
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
    padding: spacing.lg,
  },
  idCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  orderNumberLabel: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '700',
  },
  orderNumber: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.ink,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.blush,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primaryDeep,
  },
  heading: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.ink,
    marginTop: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  bold: {
    fontWeight: '800',
    color: colors.ink,
    fontSize: 14,
  },
  muted: {
    color: colors.muted,
    fontSize: 13,
    flex: 1,
  },
  itemCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  itemThumb: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: colors.pale,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.ink,
  },
  itemMeta: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
  },
  itemTotal: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.ink,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    fontSize: 20,
    fontWeight: '900',
    color: colors.primaryDeep,
  },
});