import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius } from '../theme';
import { AppText } from '../components/AppText';
import { AppButton } from '../components/AppButton';
import { useUIStore } from '../store/uiStore';

const SLIDES = [
  {
    id: '1',
    title: 'Fresh blooms.\nBeautiful moments.',
    subtitle: 'Direct farm exports from highland Ecuador and Dutch auctions, curated for life’s grandest celebrations.',
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: '2',
    title: 'Curated flowers for\nevery occasion.',
    subtitle: 'Hand-tied bouquets, Parisian velvet hat boxes, and eternal gold-dusted forever roses crafted by master florists.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: '3',
    title: 'Delivered with\nunwavering care.',
    subtitle: 'Temperature-controlled transport with personalized greeting cards, arriving in peak bloom across UAE & India.',
    image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: '4',
    title: 'Your flowers,\nyour way.',
    subtitle: 'Express same-day arrivals, scheduled celebration reminders, and white-glove bespoke floral concierge.',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1000&q=80',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const { setOnboardingCompleted } = useUIStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleFinish = () => {
    setOnboardingCompleted();
    router.replace('/(tabs)/home');
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({
        x: (currentIndex + 1) * width,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinish();
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          const offsetX = e.nativeEvent.contentOffset.x;
          const index = Math.round(offsetX / width);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
        style={styles.slider}
      >
        {SLIDES.map((slide) => (
          <View key={slide.id} style={[styles.slide, { width, height }]}>
            <Image
              source={{ uri: slide.image }}
              style={styles.slideImage}
              contentFit="cover"
            />
            <View style={styles.scrim} />
          </View>
        ))}
      </ScrollView>

      {/* Content Overlay */}
      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
        {/* Top Skip Button */}
        <View style={styles.topBar}>
          <View />
          <TouchableOpacity onPress={handleFinish} style={styles.skipBtn}>
            <AppText variant="caption" color={Colors.white} weight="semiBold">
              SKIP
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Bottom Text & Actions */}
        <View style={styles.bottomSection}>
          {/* Pagination Indicators */}
          <View style={styles.dotsRow}>
            {SLIDES.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  currentIndex === idx && styles.dotActive,
                ]}
              />
            ))}
          </View>

          <AppText variant="display" color={Colors.white} style={styles.slideTitle}>
            {SLIDES[currentIndex].title}
          </AppText>

          <AppText variant="body" color="rgba(255, 255, 255, 0.85)" style={styles.slideSubtitle}>
            {SLIDES[currentIndex].subtitle}
          </AppText>

          <View style={styles.actionsRow}>
            <AppButton
              title={currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
              onPress={handleNext}
              variant="primary"
              size="large"
              fullWidth
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F9',
  },
  slider: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  slide: {
    position: 'relative',
    backgroundColor: '#FFF7F9',
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(36, 27, 31, 0.35)',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
  },
  skipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.chip,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  bottomSection: {
    paddingBottom: Spacing.xl,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  slideTitle: {
    marginBottom: Spacing.md,
    lineHeight: 44,
  },
  slideSubtitle: {
    lineHeight: 24,
    marginBottom: Spacing.huge,
  },
  actionsRow: {
    width: '100%',
  },
});
