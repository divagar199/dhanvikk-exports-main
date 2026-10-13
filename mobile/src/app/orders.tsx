import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getMyOrders } from '@/services/orders';
import { colors, spacing, radius } from '@/constants/theme';
import type { Order } from '@/types/models';

export default function Orders() {
  const insets = useSafeAreaInsets();
  const { data = [], isLoading, refetch } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: getMyOrders,
  });

  return (
    <View style={[s.page, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={s.header}>
        <Pressable
          style={s.backBtn}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/account'))}
        >
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={s.headerTitle}>My Orders</Text>
        <Pressable style={s.backBtn} onPress={() => refetch()}>
          <Ionicons name="refresh" size={20} color={colors.ink} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={s.loadingText}>Loading your orders…</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          contentContainerStyle={[s.content, { paddingBottom: 60 }]}
          keyExtractor={(x: Order) => x.orderId}
          ListEmptyComponent={
            <View style={s.empty}>
              <View style={s.emptyIconCircle}>
                <Ionicons name="receipt-outline" size={42} color={colors.primary} />
              </View>
              <Text style={s.emptyTitle}>No orders placed yet</Text>
              <Text style={s.emptySub}>
                Your order history will appear here once you make your first purchase.
              </Text>
              <Pressable style={s.shopBtn} onPress={() => router.push('/(tabs)/shop')}>
                <Text style={s.shopBtnText}>Explore flowers</Text>
              </Pressable>
            </View>
          }
          renderItem={({ item }: { item: Order }) => (
            <Pressable
              style={s.card}
              onPress={() => router.push(('/order/' + item.orderId) as any)}
            >
              <View style={s.cardTop}>
                <View>
                  <Text style={s.id}>{item.orderId}</Text>
                  <Text style={s.date}>
                    {item.deliveryDate || 'Scheduled'} · {item.timeSlot || 'Standard'}
                  </Text>
                </View>
                <View style={s.statusBadge}>
                  <Text style={s.statusText}>{item.status || 'Confirmed'}</Text>
                </View>
              </View>

              <View style={s.cardDivider} />

              <View style={s.cardBottom}>
                <Text style={s.itemCount}>
                  {item.items?.length || 1} {item.items?.length === 1 ? 'item' : 'items'}
                </Text>
                <View style={s.priceRow}>
                  <Text style={s.amountLabel}>Total: </Text>
                  <Text style={s.amount}>
                    ₹{(item.totalAmount || 0).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            </Pressable>
          )}
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
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: colors.blush,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryDeep,
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
  itemCount: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
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