import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ArrowLeft, Globe, Award } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadows } from '../theme';
import { AppText } from '../components/AppText';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <AppText variant="h1" color={Colors.text}>
          About Dhanvikk
        </AppText>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroCard}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
            }}
            style={styles.heroImage}
            contentFit="cover"
          />
          <View style={styles.heroScrim}>
            <AppText variant="caption" color={Colors.white} weight="semiBold" style={{ letterSpacing: 2 }}>
              ESTABLISHED 2026
            </AppText>
            <AppText variant="h1" color={Colors.white}>
              Botanical Mastery & Direct Farm Exports
            </AppText>
          </View>
        </View>

        <View style={styles.textSection}>
          <AppText variant="h2" style={{ marginBottom: 10 }}>
            The Essence of Dhanvikk
          </AppText>
          <AppText variant="body" color={Colors.textSecondary} style={{ lineHeight: 26, marginBottom: 16 }}>
            Dhanvikk Blooms & Exports is a bespoke luxury floristry house bridging highland Ecuadorian rose plantations, Dutch horticultural auctions, and Indian artisan craftsmanship.
          </AppText>
          <AppText variant="body" color={Colors.textSecondary} style={{ lineHeight: 26 }}>
            Every stem is conditioned in our temperature-controlled botanical labs, ensuring pristine pedal longevity, radiant scent profiles, and museum-grade floral compositions.
          </AppText>
        </View>

        {/* Brand Pillars */}
        <View style={styles.pillarsCard}>
          <View style={styles.pillarItem}>
            <Globe size={24} color={Colors.primary} />
            <AppText variant="bodySm" weight="semiBold">
              International Farm Direct
            </AppText>
            <AppText variant="caption" color={Colors.textSecondary}>
              Sourced directly from certified eco-sustainable flower farms in Ecuador, Kenya, and Netherlands.
            </AppText>
          </View>

          <View style={styles.divider} />

          <View style={styles.pillarItem}>
            <Award size={24} color={Colors.primary} />
            <AppText variant="bodySm" weight="semiBold">
              Master Certified Florists
            </AppText>
            <AppText variant="caption" color={Colors.textSecondary}>
              Each arrangement is personally reviewed, hand-tied with silk ribbons, and accompanied by hydration nourishment.
            </AppText>
          </View>
        </View>
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: Spacing.screenPadding,
    gap: 20,
    paddingBottom: 40,
  },
  heroCard: {
    height: 220,
    borderRadius: Radius.card,
    overflow: 'hidden',
    position: 'relative',
    ...Shadows.md,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroScrim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    backgroundColor: 'rgba(36, 27, 31, 0.6)',
  },
  textSection: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  pillarsCard: {
    backgroundColor: Colors.palePink,
    borderRadius: Radius.card,
    padding: Spacing.xl,
    gap: 16,
    borderWidth: 1,
    borderColor: '#F8BBD0',
  },
  pillarItem: {
    gap: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#F8BBD0',
  },
});
