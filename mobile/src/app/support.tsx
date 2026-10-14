import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '@/constants/theme';

interface FAQItem {
  q: string;
  a: string;
}

const FAQS: FAQItem[] = [
  {
    q: 'How fresh will my blooms be upon delivery?',
    a: 'Every stem is hand-harvested at dawn in our Kotagiri and Ooty highland estates (7,200ft elevation), immediately conditioned in specialized botanical elixir, and transported across Bangalore in our dedicated 2°C–4°C reefer fleet—guaranteeing an unbroken 7 to 12 days of radiant bloom vitality.',
  },
  {
    q: 'What delivery time slots and handover options do you offer?',
    a: 'We offer Express 90-Minute White-Glove Handover for urgent celebrations, alongside scheduled Morning Aura (8:00 AM - 12:00 PM), Afternoon Sun (1:00 PM - 5:00 PM), and Twilight Soirée (6:00 PM - 9:00 PM) delivery windows across Bangalore and Chennai metropolitan zones.',
  },
  {
    q: 'Can I add a custom handwritten calligraphy card?',
    a: 'Yes, absolutely! Every Dhanvikk floral arrangement includes a complimentary bespoke wax-sealed calligraphy card. Your inscription is penned in gold or black archival ink on 300 GSM handmade Italian cotton cardstock by our atelier calligrapher.',
  },
  {
    q: 'What is the Dhanvikk 12-Day Longevity Pledge?',
    a: 'If your blooms do not arrive in pristine estate condition or fail to thrive with our complimentary floral elixir, notify our concierge within 24 hours. We immediately dispatch a fresh replacement bouquet or issue an unconditional 100% refund.',
  },
  {
    q: 'How do I care for my highland flowers once they arrive?',
    a: 'Trim stems diagonally by 1–2 inches under running water, strip any foliage below the waterline, dissolve one vial of our complimentary Dhanvikk Botanical Elixir in fresh cool water, and place in an airy room away from direct heat or fruit bowls.',
  },
];

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const openWhatsApp = async () => {
    const url = 'https://wa.me/919876543210?text=Hi%20Dhanvikk%20Blooms,%20I%20need%20assistance%20with%20an%20order.';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Concierge WhatsApp', 'Please message our master florists on WhatsApp at +91 98765 43210.');
      }
    } catch {
      Alert.alert('Concierge WhatsApp', 'Our WhatsApp concierge number is +91 98765 43210.');
    }
  };

  const callSupport = () => {
    Linking.openURL('tel:+919876543210').catch(() => {
      Alert.alert('Phone Concierge', 'Call our floral concierge at +91 98765 43210.');
    });
  };

  const emailSupport = () => {
    Linking.openURL('mailto:care@dhanvikk.com?subject=Floral%20Inquiry%20-%20Dhanvikk%20Blooms').catch(() => {
      Alert.alert('Email Support', 'Email us anytime at care@dhanvikk.com.');
    });
  };

  return (
    <View style={[s.page, { paddingTop: Math.max(insets.top, 12) }]}>
      {/* Top App Bar */}
      <View style={s.topBar}>
        <Pressable
          style={s.backBtn}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/account'))}
        >
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={s.topBarTitle}>Floral Concierge & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[s.content, { paddingBottom: Math.max(insets.bottom, 20) + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Luxury Hero Banner */}
        <View style={s.heroCard}>
          <View style={s.heroBadge}>
            <Ionicons name="sparkles" size={14} color={colors.yellowGold} />
            <Text style={s.heroBadgeText}>24/7 DEDICATED ASSISTANCE</Text>
          </View>
          <Text style={s.heroTitle}>We are here to craft your perfect floral moment.</Text>
          <Text style={s.heroSub}>
            Speak directly with our floral stylists for custom arrangements, order modifications, or delivery coordination.
          </Text>

          {/* Contact Action Buttons */}
          <View style={s.contactRow}>
            <Pressable style={s.whatsAppBtn} onPress={openWhatsApp}>
              <Ionicons name="logo-whatsapp" size={18} color={colors.white} />
              <Text style={s.whatsAppBtnText}>WhatsApp</Text>
            </Pressable>

            <Pressable style={s.callBtn} onPress={callSupport}>
              <Ionicons name="call-outline" size={18} color={colors.primaryDeep} />
              <Text style={s.callBtnText}>Call Stylist</Text>
            </Pressable>

            <Pressable style={s.emailBtn} onPress={emailSupport}>
              <Ionicons name="mail-outline" size={18} color={colors.ink} />
              <Text style={s.emailBtnText}>Email</Text>
            </Pressable>
          </View>
        </View>

        {/* Quality Guarantee Card */}
        <View style={s.guaranteeCard}>
          <Ionicons name="shield-checkmark" size={28} color={colors.success} />
          <View style={s.guaranteeBody}>
            <Text style={s.guaranteeTitle}>12-Day Botanical Longevity Pledge</Text>
            <Text style={s.guaranteeText}>
              Every stem is harvested above 7,200ft in the Nilgiris and transported under continuous 2°C–4°C reefer transit. Complete replacement within 24h if your arrangement does not surpass expectations.
            </Text>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={s.faqSection}>
          <Text style={s.sectionHeader}>FREQUENTLY ASKED QUESTIONS</Text>

          {FAQS.map((item, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <Pressable
                key={idx}
                style={[s.faqCard, isExpanded && s.faqCardActive]}
                onPress={() => setExpandedIndex(isExpanded ? null : idx)}
              >
                <View style={s.faqQuestionRow}>
                  <Text style={[s.faqQuestion, isExpanded && s.faqQuestionActive]}>
                    {item.q}
                  </Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={isExpanded ? colors.primary : colors.muted}
                  />
                </View>
                {isExpanded ? <Text style={s.faqAnswer}>{item.a}</Text> : null}
              </Pressable>
            );
          })}
        </View>

        {/* Operating Hours & Atelier Location */}
        <View style={s.atelierCard}>
          <View style={s.atelierRow}>
            <Ionicons name="time-outline" size={18} color={colors.muted} />
            <Text style={s.atelierText}>Concierge Hours: Mon - Sun, 7:00 AM - 10:00 PM IST</Text>
          </View>
          <View style={s.atelierRow}>
            <Ionicons name="location-outline" size={18} color={colors.muted} />
            <Text style={s.atelierText}>Flagship Floral Studio: Anna Nagar & ECR, Chennai</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    maxWidth: 840,
    width: '100%',
    alignSelf: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.pale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  content: {
    padding: spacing.md,
    maxWidth: 840,
    width: '100%',
    alignSelf: 'center',
  },
  heroCard: {
    backgroundColor: colors.pale,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryDeep,
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 6,
    lineHeight: 26,
  },
  heroSub: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 8,
  },
  whatsAppBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#25D366',
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  whatsAppBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  callBtn: {
    flex: 1.1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.white,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  callBtnText: {
    color: colors.primaryDeep,
    fontSize: 13,
    fontWeight: '700',
  },
  emailBtn: {
    flex: 0.9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.white,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  emailBtnText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  guaranteeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  guaranteeBody: {
    flex: 1,
  },
  guaranteeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 2,
  },
  guaranteeText: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 16,
  },
  faqSection: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.muted,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  faqCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  faqCardActive: {
    borderColor: colors.primary,
  },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
    lineHeight: 18,
  },
  faqQuestionActive: {
    color: colors.primaryDeep,
  },
  faqAnswer: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 19,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.pale,
  },
  atelierCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 8,
  },
  atelierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  atelierText: {
    fontSize: 12,
    color: colors.muted,
  },
});
