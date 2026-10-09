import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Phone, Mail } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadows } from '../theme';
import { AppText } from '../components/AppText';

const FAQS = [
  {
    q: 'How long do Dhanvikk fresh bouquets stay in bloom?',
    a: 'Because our stems are flown in directly under cold-chain conditions and conditioned in botanical nutrient water, our roses typically remain radiant for 5 to 7 days with regular hydration.',
  },
  {
    q: 'Do you offer same-day delivery?',
    a: 'Yes, orders placed before 4:00 PM local time are dispatched via climate-controlled vans for evening delivery.',
  },
  {
    q: 'What are Forever Roses?',
    a: 'Forever Roses are natural Colombian blooms harvested at peak blossom and treated with an eco-friendly non-toxic conservation formula, allowing them to last 3 to 5 years without water.',
  },
];

export default function HelpScreen() {
  const router = useRouter();

  const handleEmailSupport = () => {
    Linking.openURL('mailto:divagar.m.msc.cs@gmail.com?subject=Dhanvikk%20Concierge%20Inquiry').catch(() => {});
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:+919876500000').catch(() => {});
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <AppText variant="h1" color={Colors.text}>
          Concierge Support
        </AppText>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Contact Cards */}
        <View style={styles.supportCardsRow}>
          <TouchableOpacity
            style={styles.supportCard}
            onPress={handleCallSupport}
            activeOpacity={0.85}
          >
            <View style={styles.iconCircle}>
              <Phone size={22} color={Colors.primary} />
            </View>
            <AppText variant="bodySm" weight="semiBold">
              Call Concierge
            </AppText>
            <AppText variant="caption" color={Colors.textSecondary} align="center">
              +91 98765 00000
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.supportCard}
            onPress={handleEmailSupport}
            activeOpacity={0.85}
          >
            <View style={styles.iconCircle}>
              <Mail size={22} color={Colors.primary} />
            </View>
            <AppText variant="bodySm" weight="semiBold">
              Email Care
            </AppText>
            <AppText variant="caption" color={Colors.textSecondary} align="center">
              concierge@dhanvikk.com
            </AppText>
          </TouchableOpacity>
        </View>

        {/* FAQs */}
        <View style={styles.faqSection}>
          <AppText variant="h2" style={{ marginBottom: 16 }}>
            Frequently Asked Questions
          </AppText>

          <View style={{ gap: 14 }}>
            {FAQS.map((faq, idx) => (
              <View key={idx} style={styles.faqCard}>
                <AppText variant="body" weight="semiBold" style={{ marginBottom: 6 }}>
                  {faq.q}
                </AppText>
                <AppText variant="bodySm" color={Colors.textSecondary} style={{ lineHeight: 22 }}>
                  {faq.a}
                </AppText>
              </View>
            ))}
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
    gap: 24,
    paddingBottom: 40,
  },
  supportCardsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  supportCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.palePink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  faqSection: {
    gap: 8,
  },
  faqCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
});
