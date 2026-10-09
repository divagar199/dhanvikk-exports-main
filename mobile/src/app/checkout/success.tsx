import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, Shadows, Motion } from '../../theme';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';

// 8 Petals radiating outward at 45 degree intervals
const PETALS = Array.from({ length: 8 }, (_, i) => {
  const angle = (i * 45 * Math.PI) / 180;
  return {
    id: i,
    dx: Math.cos(angle) * 48,
    dy: Math.sin(angle) * 48,
    rotation: `${i * 45}deg`,
  };
});

export default function OrderSuccessScreen() {
  const router = useRouter();
  const { orderId, deliveryDate, timeSlot, total } = useLocalSearchParams<{
    orderId?: string;
    deliveryDate?: string;
    timeSlot?: string;
    total?: string;
  }>();

  // Animation values
  const [circleScale] = useState(() => new Animated.Value(0));
  const [checkScale] = useState(() => new Animated.Value(0));
  const [petalDrift] = useState(() => new Animated.Value(0));
  const [petalOpacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    // 1. Success Haptic
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }

    // 2. Coordinated 1.1s Petal Burst Animation (One time only)
    Animated.sequence([
      // A. Pink Circle pops in
      Animated.spring(circleScale, {
        toValue: 1,
        damping: Motion.spring.damping,
        stiffness: Motion.spring.stiffness,
        mass: Motion.spring.mass,
        useNativeDriver: Platform.OS !== 'web',
      }),
      // B. Check stroke & Petals drifting outward simultaneously
      Animated.parallel([
        Animated.spring(checkScale, {
          toValue: 1,
          damping: 14,
          stiffness: 200,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(petalDrift, {
          toValue: 1,
          duration: 900,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(petalOpacity, {
          toValue: 0,
          duration: 900,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    ]).start();
  }, [circleScale, checkScale, petalDrift, petalOpacity]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Centered Pink Circle & Drifting Petal Burst */}
        <View style={styles.animationWrapper}>
          {/* 8 Drifting Petal Shapes */}
          {PETALS.map((petal) => {
            const translateX = petalDrift.interpolate({
              inputRange: [0, 1],
              outputRange: [0, petal.dx],
            });
            const translateY = petalDrift.interpolate({
              inputRange: [0, 1],
              outputRange: [0, petal.dy],
            });

            return (
              <Animated.View
                key={petal.id}
                style={[
                  styles.petalShape,
                  {
                    opacity: petalOpacity,
                    transform: [
                      { translateX },
                      { translateY },
                      { rotate: petal.rotation },
                    ],
                  },
                ]}
              />
            );
          })}

          {/* Centered Pink Circle */}
          <Animated.View
            style={[
              styles.pinkCircle,
              {
                transform: [{ scale: circleScale }],
              },
            ]}
          >
            {/* Drawn Check Stroke */}
            <Animated.View style={{ transform: [{ scale: checkScale }] }}>
              <Check size={42} color={Colors.white} strokeWidth={2.8} />
            </Animated.View>
          </Animated.View>
        </View>

        <AppText variant="h1" serif={true} align="center" style={styles.headline}>
          Your order is blooming!
        </AppText>

        <AppText
          variant="body"
          color={Colors.textSecondary}
          align="center"
          style={styles.subtext}
        >
          Thank you for trusting Dhanvikk. Master florists are currently selecting and conditioning your fresh stems.
        </AppText>

        {/* Receipt Card */}
        <View style={styles.receiptCard}>
          <View style={styles.receiptRow}>
            <AppText variant="caption" color={Colors.textSecondary}>
              Order Reference
            </AppText>
            <AppText variant="bodySm" weight="semiBold">
              {orderId || 'DHN-2026-8941'}
            </AppText>
          </View>

          <View style={styles.receiptRow}>
            <AppText variant="caption" color={Colors.textSecondary}>
              Delivery Window
            </AppText>
            <AppText variant="bodySm" weight="medium">
              {deliveryDate || 'Today'} • {timeSlot || 'Evening'}
            </AppText>
          </View>

          <View style={styles.receiptRow}>
            <AppText variant="caption" color={Colors.textSecondary}>
              Total Paid
            </AppText>
            <AppText variant="body" weight="semiBold" color={Colors.primaryDeep} style={{ fontVariant: ['tabular-nums'] }}>
              ₹{total ? Number(total).toLocaleString() : '2,499'}
            </AppText>
          </View>

          <View style={styles.receiptRow}>
            <AppText variant="caption" color={Colors.textSecondary}>
              Receipt & Tracking
            </AppText>
            <AppText variant="caption" color={Colors.success} weight="semiBold">
              Email & SMS Dispatched
            </AppText>
          </View>
        </View>

        {/* Action Buttons: "Track order" primary, "Continue shopping" text link */}
        <View style={styles.actions}>
          <AppButton
            title="Track order"
            onPress={() => router.replace(`/orders/${orderId || 'DHN-2026-8941'}` as any)}
            variant="primary"
            size="large"
            fullWidth
          />

          <TouchableOpacity
            onPress={() => router.replace('/(tabs)/home')}
            style={styles.continueLink}
            accessibilityRole="button"
          >
            <AppText variant="button" color={Colors.primaryDeep} weight="semiBold">
              Continue shopping
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  animationWrapper: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    position: 'relative',
  },
  pinkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
    zIndex: 5,
  },
  petalShape: {
    position: 'absolute',
    width: 14,
    height: 22,
    borderRadius: 7,
    backgroundColor: '#F8BBD0',
    borderTopLeftRadius: 14,
    borderBottomRightRadius: 14,
    zIndex: 2,
  },
  headline: {
    marginBottom: Spacing.sm,
  },
  subtext: {
    maxWidth: 320,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  receiptCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
    marginBottom: Spacing.huge,
    ...Shadows.sm,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    width: '100%',
    gap: 14,
    alignItems: 'center',
  },
  continueLink: {
    paddingVertical: 10,
  },
});
