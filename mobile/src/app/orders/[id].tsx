import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Calendar,
  Flower2,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadows } from '../../theme';
import { AppText } from '../../components/AppText';
import { orderService } from '../../services/orderService';
import { useAuthStore } from '../../store/authStore';
import { Order } from '../../types';

const TIMELINE_STEPS = [
  { id: 'placed', title: 'Order Placed', desc: 'Your floral request was received' },
  { id: 'confirmed', title: 'Payment Confirmed', desc: 'Verified securely via Razorpay' },
  { id: 'preparing', title: 'Preparing Your Blooms', desc: 'Conditioned and hand-tied by master florists' },
  { id: 'packed', title: 'Packed with Care', desc: 'Hydration stem wrap & luxury gift box sealed' },
  { id: 'out', title: 'Out for Delivery', desc: 'Dispatched in climate-controlled floral transport' },
  { id: 'delivered', title: 'Delivered', desc: 'Handed to recipient with fresh blessings' },
];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const [pulseAnim] = useState(() => new Animated.Value(1));

  const { data } = useQuery({
    queryKey: ['myOrders', user?.email],
    queryFn: () => orderService.getMyOrders(user?.email || 'customer@dhanvikk.com'),
  });

  const orders: Order[] = data?.orders || [];
  const order = orders.find((o) => o.orderId === id || o.id === id) || orders[0];

  // Calculate current active milestone step index
  const getActiveStepIndex = () => {
    const status = order?.status?.toLowerCase() || '';
    if (status.includes('delivered')) return 5;
    if (status.includes('out')) return 4;
    if (status.includes('packed')) return 3;
    if (status.includes('preparing')) return 2;
    if (status.includes('confirmed')) return 1;
    return 0;
  };

  const activeIndex = getActiveStepIndex();

  // Run soft pulse for exactly 3 cycles, then stop
  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 400,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
      { iterations: 3 }
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulseAnim]);

  // Format real timestamp if available
  const getFormattedTime = (stepIdx: number) => {
    if (!order?.createdAt) return null;
    const baseDate = new Date(order.createdAt);
    if (isNaN(baseDate.getTime())) return null;

    if (stepIdx <= activeIndex) {
      const stepDate = new Date(baseDate.getTime() + stepIdx * 25 * 60 * 1000);
      return stepDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <View>
          <AppText variant="caption" color={Colors.textSecondary}>
            TRACKING TIMELINE
          </AppText>
          <AppText variant="h2" weight="semiBold">
            {order?.orderId || id}
          </AppText>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Status Badge Strip */}
        <View style={styles.statusStrip}>
          <View style={styles.statusIconWrap}>
            <Flower2 size={20} color={Colors.primary} strokeWidth={1.8} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="caption" color={Colors.primaryDeep} weight="semiBold">
              CURRENT STATUS
            </AppText>
            <AppText variant="h2" serif={true} color={Colors.text}>
              {order?.status || 'Preparing Floral Order'}
            </AppText>
          </View>
        </View>

        {/* Vertical Tracking Timeline */}
        <View style={styles.timelineCard}>
          <AppText variant="caption" color={Colors.primaryDeep} weight="semiBold" style={styles.timelineKicker}>
            MILESTONE PROGRESS
          </AppText>

          <View style={styles.timelineList}>
            {TIMELINE_STEPS.map((step, idx) => {
              const isPast = idx < activeIndex;
              const isCurrent = idx === activeIndex;
              const isFuture = idx > activeIndex;
              const timestamp = getFormattedTime(idx);

              return (
                <View key={step.id} style={styles.timelineRow}>
                  {/* Left Column: Indicator & 2px Line */}
                  <View style={styles.timelineIndicatorCol}>
                    {isCurrent ? (
                      <Animated.View
                        style={[
                          styles.dot,
                          styles.dotCurrent,
                          { transform: [{ scale: pulseAnim }] },
                        ]}
                      >
                        <View style={styles.innerDotCurrent} />
                      </Animated.View>
                    ) : (
                      <View
                        style={[
                          styles.dot,
                          isPast && styles.dotPast,
                          isFuture && styles.dotFuture,
                        ]}
                      >
                        {isPast ? (
                          <CheckCircle2 size={16} color={Colors.white} />
                        ) : null}
                      </View>
                    )}

                    {idx < TIMELINE_STEPS.length - 1 && (
                      <View
                        style={[
                          styles.verticalLine,
                          idx < activeIndex ? styles.linePast : styles.lineFuture,
                        ]}
                      />
                    )}
                  </View>

                  {/* Right Column: Title, Description, and Timestamps */}
                  <View style={styles.timelineTextCol}>
                    <View style={styles.stepTitleRow}>
                      <AppText
                        variant="body"
                        weight={isCurrent ? 'semiBold' : 'medium'}
                        color={isFuture ? '#A0969B' : Colors.text}
                      >
                        {step.title}
                      </AppText>

                      {timestamp && (
                        <AppText variant="caption" color={Colors.primaryDeep} style={{ fontVariant: ['tabular-nums'] }}>
                          {timestamp}
                        </AppText>
                      )}
                    </View>

                    <AppText
                      variant="caption"
                      color={isFuture ? '#BDB4B8' : Colors.textSecondary}
                      style={{ marginTop: 2 }}
                    >
                      {step.desc}
                    </AppText>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Delivery Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Calendar size={18} color={Colors.primary} />
            <View style={{ flex: 1 }}>
              <AppText variant="caption" color={Colors.textSecondary}>
                Expected Delivery
              </AppText>
              <AppText variant="bodySm" weight="semiBold">
                {order?.deliveryDate || 'Today'} • {order?.timeSlot || 'Evening (5 PM - 9 PM)'}
              </AppText>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <MapPin size={18} color={Colors.primary} />
            <View style={{ flex: 1 }}>
              <AppText variant="caption" color={Colors.textSecondary}>
                Recipient Address
              </AppText>
              <AppText variant="bodySm" weight="semiBold">
                {(order?.shippingAddress as any)?.fullName || (order?.shippingAddress as any)?.recipientName || 'Valued Recipient'}
              </AppText>
              <AppText variant="caption" color={Colors.textSecondary}>
                {(order?.shippingAddress as any)?.streetAddress || (order?.shippingAddress as any)?.street || 'Dubai Luxury Residence'}, {order?.shippingAddress?.city || 'Dubai'}
              </AppText>
            </View>
          </View>
        </View>

        {/* Items in this Order */}
        {order?.items && order.items.length > 0 && (
          <View style={[styles.itemsCard, { marginTop: 16 }]}>
            <AppText variant="caption" color={Colors.primaryDeep} weight="semiBold">
              ITEMS IN THIS ORDER
            </AppText>

            {order.items.map((it: any, i: number) => (
              <View key={i} style={styles.itemRow}>
                <Image
                  source={{ uri: it.image || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=300&q=80' }}
                  style={styles.itemThumb}
                  contentFit="cover"
                />
                <View style={{ flex: 1 }}>
                  <AppText variant="bodySm" weight="medium">
                    {it.name}
                  </AppText>
                  <AppText variant="caption" color={Colors.textSecondary}>
                    Quantity: {it.quantity}
                  </AppText>
                </View>
                <AppText variant="bodySm" weight="semiBold" style={{ fontVariant: ['tabular-nums'] }}>
                  ₹{(it.price * it.quantity).toLocaleString()}
                </AppText>
              </View>
            ))}

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <AppText variant="body" weight="semiBold">
                Total Paid
              </AppText>
              <AppText variant="h3" weight="semiBold" color={Colors.primaryDeep} style={{ fontVariant: ['tabular-nums'] }}>
                ₹{(order.totalAmount || 0).toLocaleString()}
              </AppText>
            </View>
          </View>
        )}

        <View style={{ height: 48 }} />
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
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: Spacing.screenPadding,
    gap: Spacing.lg,
  },
  statusStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.palePink,
    padding: Spacing.lg,
    borderRadius: Radius.card,
    gap: 14,
    borderWidth: 1,
    borderColor: '#F8BBD0',
  },
  statusIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  timelineCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  timelineKicker: {
    letterSpacing: 1.2,
    marginBottom: Spacing.lg,
  },
  timelineList: {
    gap: 0,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 64,
  },
  timelineIndicatorCol: {
    width: 28,
    alignItems: 'center',
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  dotPast: {
    backgroundColor: Colors.primary,
  },
  dotCurrent: {
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: Colors.palePink,
    ...Shadows.sm,
  },
  dotFuture: {
    backgroundColor: '#EDE6E9',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  innerDotCurrent: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white,
  },
  verticalLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  linePast: {
    backgroundColor: Colors.primary,
  },
  lineFuture: {
    backgroundColor: '#EDE6E9',
  },
  timelineTextCol: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 20,
  },
  stepTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
    ...Shadows.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  itemsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
    ...Shadows.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemThumb: {
    width: 48,
    height: 60,
    borderRadius: Radius.input,
    backgroundColor: Colors.blush,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
