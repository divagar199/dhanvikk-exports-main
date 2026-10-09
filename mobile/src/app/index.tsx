import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Sparkles, Flower2 } from 'lucide-react-native';
import { Colors, Spacing, Radius, Shadows } from '../theme';
import { AppText } from '../components/AppText';
import { GrandLogo } from '../components/GrandLogo';

export default function SplashScreenComponent() {
  const router = useRouter();
  const navigatedRef = useRef(false);

  // Animated values initialized to full visibility - zero black screen latency
  const [logoScale] = useState(() => new Animated.Value(0.85));
  const [haloScale] = useState(() => new Animated.Value(0.9));
  const [contentOpacity] = useState(() => new Animated.Value(1));

  const navigateToHome = useCallback(() => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    router.replace('/(tabs)/home');
  }, [router]);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
    const useDriver = Platform.OS !== 'web';

    // Elegant, gentle blooming spring motion
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: useDriver,
      }),
      Animated.timing(haloScale, {
        toValue: 1.15,
        duration: 800,
        useNativeDriver: useDriver,
      }),
    ]).start();

    // Smooth navigation into Flipkart-style Home Feed after 750ms
    const timer = setTimeout(() => {
      navigateToHome();
    }, 750);

    return () => clearTimeout(timer);
  }, [logoScale, haloScale, navigateToHome]);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={navigateToHome}
      style={styles.container}
    >
      {/* 1. Ambient Warm Halo Aura */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            transform: [{ scale: haloScale }],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.centerCard,
          {
            opacity: contentOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        {/* 2. Grand Brand Logo */}
        <View style={styles.logoWrapper}>
          <GrandLogo layout="vertical" size="lg" subtitleText="EXPORTS" />
        </View>

        {/* 3. Dhanvikk Assured Badge */}
        <View style={styles.assuredPill}>
          <Sparkles size={12} color={Colors.gold} />
          <AppText
            variant="caption"
            color={Colors.primaryDeep}
            weight="bold"
            style={styles.assuredText}
          >
            FARM-FRESH EXPORT BLOOMS
          </AppText>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Flower2 size={12} color={Colors.primary} />
          <View style={styles.dividerLine} />
        </View>

        <AppText
          variant="caption"
          color={Colors.textSecondary}
          align="center"
          weight="medium"
          style={styles.tagline}
        >
          Hosur & Nilgiris Direct · Express Delivery in TN & BLR
        </AppText>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F9', // Crisp, bright warm rose background - impossible to be black
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  glowRing: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#FFE4ED',
    opacity: 0.6,
  },
  centerCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 28,
    paddingVertical: 32,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: '#FCE4EC',
    ...Shadows.md,
    maxWidth: 340,
    width: '100%',
  },
  logoWrapper: {
    marginBottom: 16,
  },
  assuredPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.blush,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.chip,
    borderWidth: 1,
    borderColor: '#F8BBD0',
    gap: 6,
    marginBottom: 14,
  },
  assuredText: {
    letterSpacing: 1.2,
    fontSize: 10,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    width: '80%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F8BBD0',
  },
  tagline: {
    fontSize: 11,
    lineHeight: 16,
  },
});
