import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Sparkles } from 'lucide-react-native';
import { Colors, Spacing, Radius, Shadows } from '../theme';
import { AppText } from '../components/AppText';
import { useUIStore } from '../store/uiStore';

const BRAND_LOGO = require('../../assets/images/dhanvikk-brand-logo.png');
const FLORAL_SPLASH_IMAGE =
  'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&q=85';

export default function SplashScreenComponent() {
  const router = useRouter();
  const { hasCompletedOnboarding } = useUIStore();

  // Pure state initialization for Animated values
  const [floralScale] = useState(() => new Animated.Value(1.14));
  const [floralOpacity] = useState(() => new Animated.Value(0));
  const [logoScale] = useState(() => new Animated.Value(0.76));
  const [logoOpacity] = useState(() => new Animated.Value(0));
  const [glowScale] = useState(() => new Animated.Value(0.65));
  const [glowOpacity] = useState(() => new Animated.Value(0));
  const [textOpacity] = useState(() => new Animated.Value(0));
  const [textTranslateY] = useState(() => new Animated.Value(16));
  const [screenOpacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const useDriver = Platform.OS !== 'web';

    // Cinematic Blooming Sequence - Snappy, Premium, and Responsive
    Animated.parallel([
      // 1. Floral background breathing zoom
      Animated.timing(floralOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: useDriver,
      }),
      Animated.timing(floralScale, {
        toValue: 1.0,
        duration: 1300,
        useNativeDriver: useDriver,
      }),

      // 2. Halo glow pulse
      Animated.sequence([
        Animated.parallel([
          Animated.timing(glowOpacity, {
            toValue: 0.65,
            duration: 450,
            useNativeDriver: useDriver,
          }),
          Animated.spring(glowScale, {
            toValue: 1.25,
            friction: 6,
            tension: 50,
            useNativeDriver: useDriver,
          }),
        ]),
      ]),

      // 3. Grand logo blooming spring
      Animated.sequence([
        Animated.delay(100),
        Animated.parallel([
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 450,
            useNativeDriver: useDriver,
          }),
          Animated.spring(logoScale, {
            toValue: 1,
            friction: 6,
            tension: 55,
            useNativeDriver: useDriver,
          }),
        ]),
      ]),

      // 4. Staggered brand tagline & pill reveal
      Animated.sequence([
        Animated.delay(350),
        Animated.parallel([
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: useDriver,
          }),
          Animated.timing(textTranslateY, {
            toValue: 0,
            duration: 400,
            useNativeDriver: useDriver,
          }),
        ]),
      ]),
    ]).start(() => {
      // 5. Elegant dissolve into app
      timeoutId = setTimeout(() => {
        Animated.timing(screenOpacity, {
          toValue: 0,
          duration: 320,
          useNativeDriver: useDriver,
        }).start(() => {
          if (!hasCompletedOnboarding) {
            router.replace('/onboarding');
          } else {
            router.replace('/(tabs)/home');
          }
        });
      }, 400);
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [
    hasCompletedOnboarding,
    router,
    floralOpacity,
    floralScale,
    logoOpacity,
    logoScale,
    glowOpacity,
    glowScale,
    textOpacity,
    textTranslateY,
    screenOpacity,
  ]);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      {/* 1. Opulent Floral Botanical Background with Ken Burns Breathing Motion */}
      <Animated.View
        style={[
          styles.floralBackgroundContainer,
          {
            opacity: floralOpacity,
            transform: [{ scale: floralScale }],
          },
        ]}
      >
        <Image
          source={{ uri: FLORAL_SPLASH_IMAGE }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          priority="high"
        />
        {/* Luxury Vignette & Frosted Scrim */}
        <View style={styles.darkScrim} />
        <View style={styles.blushTintOverlay} />
      </Animated.View>

      {/* 2. Soft Ambient Golden-Rose Glow Halo */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            opacity: glowOpacity,
            transform: [{ scale: glowScale }],
          },
        ]}
      />

      {/* 3. Grand Brand Logo Medallion with Spring Blooming Motion */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <View style={styles.grandLogoCard}>
          <Image
            source={BRAND_LOGO}
            style={styles.grandLogoImage}
            contentFit="contain"
            priority="high"
          />
        </View>
      </Animated.View>

      {/* 4. Luxury Staggered Brand Text & Tagline */}
      <Animated.View
        style={[
          styles.wordmarkContainer,
          {
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
          },
        ]}
      >
        <View style={styles.atelierPill}>
          <Sparkles size={13} color={Colors.gold} />
          <AppText
            variant="caption"
            color={Colors.white}
            weight="bold"
            style={styles.atelierPillText}
          >
            HAUTE FLORAL ATELIER
          </AppText>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <View style={styles.diamondPip} />
          <View style={styles.dividerLine} />
        </View>

        <AppText
          variant="bodySm"
          color="rgba(255, 255, 255, 0.92)"
          align="center"
          weight="medium"
          style={styles.tagline}
        >
          Curated Ecuadorian Blooms & Luxury Exports
        </AppText>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1018',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  floralBackgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  darkScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 12, 20, 0.62)',
  },
  blushTintOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(194, 24, 91, 0.18)',
  },
  glowRing: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(233, 30, 99, 0.28)',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 50,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    zIndex: 3,
  },
  grandLogoCard: {
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderRadius: Radius.modal,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    ...Shadows.lg,
    shadowColor: '#000000',
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 12,
  },
  grandLogoImage: {
    width: 210,
    height: 56,
  },
  wordmarkContainer: {
    alignItems: 'center',
    zIndex: 3,
    paddingHorizontal: Spacing.xl,
  },
  atelierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.chip,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    gap: 6,
  },
  atelierPillText: {
    letterSpacing: 2.4,
    fontSize: 11,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 12,
  },
  dividerLine: {
    width: 32,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  diamondPip: {
    width: 5,
    height: 5,
    backgroundColor: Colors.gold,
    transform: [{ rotate: '45deg' }],
  },
  tagline: {
    letterSpacing: 0.8,
    maxWidth: 280,
    lineHeight: 18,
  },
});
