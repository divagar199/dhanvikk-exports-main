import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadows } from '../../theme';
import { AppText } from '../../components/AppText';
import { EmptyState } from '../../components/EmptyState';
import { Skeleton } from '../../components/Skeleton';
import { orderService } from '../../services/orderService';
import { useAuthStore } from '../../store/authStore';
import { Order } from '../../types';
import { getProductImageUrl } from '../../utils/imageUrl';

const STATUS_TABS = ['All', 'Preparing', 'Out for Delivery', 'Delivered'];

export default function OrdersListScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('All');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['myOrders', user?.email],
    queryFn: () => orderService.getMyOrders(user?.email || 'customer@dhanvikk.com'),
  });

  const orders: Order[] = data?.orders || [];

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Preparing') return o.status?.includes('Preparing') || o.status === 'Confirmed';
    if (activeTab === 'Out for Delivery') return o.status === 'Out for Delivery';
    if (activeTab === 'Delivered') return o.status === 'Delivered';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return Colors.success;
      case 'Out for Delivery':
        return '#1976D2';
      case 'Preparing Floral Order':
      case 'Confirmed':
        return Colors.primaryDeep;
      default:
        return Colors.textSecondary;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <AppText variant="h1" color={Colors.text}>
          My Orders
        </AppText>
      </View>

      {/* Status Filter Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {STATUS_TABS.map((tab) => {
            const isTabActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabChip, isTabActive && styles.tabChipActive]}
              >
                <AppText
                  variant="caption"
                  weight={isTabActive ? 'semiBold' : 'medium'}
                  color={isTabActive ? Colors.white : Colors.text}
                >
                  {tab}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.primary}
          />
        }
      >
        {isLoading ? (
          <View style={{ gap: 16 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={140} borderRadius={Radius.card} />
            ))}
          </View>
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            title="No orders found"
            description="You don't have any orders matching this milestone. Discover our freshly harvested flowers."
            actionTitle="Shop Floral Arrangements"
            onAction={() => router.push('/(tabs)/shop')}
          />
        ) : (
          <View style={{ gap: 16 }}>
            {filteredOrders.map((order) => {
              const firstItem = order.items?.[0];
              const orderId = order.orderId || order.id || 'DHN-2026-8941';

              return (
                <TouchableOpacity
                  key={orderId}
                  activeOpacity={0.9}
                  onPress={() =>
                    router.push({
                      pathname: '/orders/[id]',
                      params: { id: orderId },
                    })
                  }
                  style={styles.orderCard}
                >
                  {/* Card Header */}
                  <View style={styles.cardHeader}>
                    <View>
                      <AppText variant="caption" color={Colors.textSecondary}>
                        ORDER NUMBER
                      </AppText>
                      <AppText variant="body" weight="semiBold">
                        {orderId}
                      </AppText>
                    </View>

                    <View
                      style={[
                        styles.statusPill,
                        { backgroundColor: Colors.palePink },
                      ]}
                    >
                      <AppText
                        variant="caption"
                        weight="semiBold"
                        color={getStatusColor(order.status)}
                      >
                        {order.status || 'Confirmed'}
                      </AppText>
                    </View>
                  </View>

                  <View style={styles.cardDivider} />

                  {/* Item Preview */}
                  <View style={styles.itemPreviewRow}>
                    <Image
                      source={{
                        uri: getProductImageUrl(firstItem?.image),
                      }}
                      style={styles.orderThumb}
                      contentFit="cover"
                    />

                    <View style={{ flex: 1, justifyContent: 'center' }}>
                      <AppText variant="bodySm" weight="medium" numberOfLines={1}>
                        {firstItem?.name || 'Passionate Serenity Noir'}
                      </AppText>
                      {order.items?.length > 1 && (
                        <AppText variant="caption" color={Colors.textSecondary}>
                          + {order.items.length - 1} more items
                        </AppText>
                      )}
                      <AppText variant="caption" color={Colors.primaryDeep} style={{ marginTop: 4 }}>
                        Delivery: {order.deliveryDate} • {order.timeSlot}
                      </AppText>
                    </View>

                    <ChevronRight size={20} color={Colors.textSecondary} />
                  </View>

                  <View style={styles.cardFooter}>
                    <AppText variant="caption" color={Colors.textSecondary}>
                      Total: ₹{order.totalAmount?.toLocaleString()}
                    </AppText>
                    <AppText variant="caption" color={Colors.primaryDeep} weight="semiBold">
                      View Tracking Timeline →
                    </AppText>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabsScroll: {
    paddingHorizontal: Spacing.screenPadding,
    gap: 8,
  },
  tabChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.chip,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  scrollContent: {
    padding: Spacing.screenPadding,
    paddingBottom: 40,
  },
  orderCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.chip,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  itemPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orderThumb: {
    width: 56,
    height: 70,
    borderRadius: Radius.image,
    backgroundColor: Colors.blush,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8F1F4',
  },
});
