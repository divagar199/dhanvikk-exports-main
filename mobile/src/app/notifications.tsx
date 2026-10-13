import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '@/constants/theme';

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();

  const [orderUpdates, setOrderUpdates] = useState(true);
  const [floralDrops, setFloralDrops] = useState(true);
  const [occasionReminders, setOccasionReminders] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [marketingEmail, setMarketingEmail] = useState(false);

  const saveSettings = () => {
    Alert.alert(
      'Preferences Saved',
      'Your notification settings have been updated. You will receive real-time updates for your floral orders.'
    );
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
        <Text style={s.topBarTitle}>Notification Preferences</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[s.content, { paddingBottom: Math.max(insets.bottom, 20) + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Informational Header */}
        <View style={s.bannerCard}>
          <Ionicons name="notifications" size={24} color={colors.primaryDeep} />
          <View style={{ flex: 1 }}>
            <Text style={s.bannerTitle}>Stay in the loop</Text>
            <Text style={s.bannerSub}>
              Choose how and when Dhanvikk Blooms communicates order progress, delivery milestones, and exclusive botanical drops.
            </Text>
          </View>
        </View>

        {/* Section 1: Order Tracking */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>ORDER & DELIVERY UPDATES</Text>

          <View style={s.toggleRow}>
            <View style={s.toggleInfo}>
              <Text style={s.toggleLabel}>Live Dispatch & Delivery Tracking</Text>
              <Text style={s.toggleDesc}>
                Instant notifications when your flowers are hand-tied, loaded into cold transit, and delivered.
              </Text>
            </View>
            <Switch
              value={orderUpdates}
              onValueChange={setOrderUpdates}
              trackColor={{ false: colors.line, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={s.toggleRow}>
            <View style={s.toggleInfo}>
              <Text style={s.toggleLabel}>SMS & WhatsApp Courier Alerts</Text>
              <Text style={s.toggleDesc}>
                Direct SMS with the driver contact and live ETA 30 minutes before arrival.
              </Text>
            </View>
            <Switch
              value={smsAlerts}
              onValueChange={setSmsAlerts}
              trackColor={{ false: colors.line, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* Section 2: Botanical Perks & Reminders */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>BOTANICAL CURATIONS & REMINDERS</Text>

          <View style={s.toggleRow}>
            <View style={s.toggleInfo}>
              <Text style={s.toggleLabel}>Exclusive Farm Drops & VIP Perks</Text>
              <Text style={s.toggleDesc}>
                Be the first to know when rare seasonal blooms (e.g. Dutch Tulips, Highland Peonies) arrive.
              </Text>
            </View>
            <Switch
              value={floralDrops}
              onValueChange={setFloralDrops}
              trackColor={{ false: colors.line, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={s.toggleRow}>
            <View style={s.toggleInfo}>
              <Text style={s.toggleLabel}>Occasion Reminders</Text>
              <Text style={s.toggleDesc}>
                Gentle reminders 7 days in advance for saved birthdays, anniversaries, and holidays.
              </Text>
            </View>
            <Switch
              value={occasionReminders}
              onValueChange={setOccasionReminders}
              trackColor={{ false: colors.line, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={s.toggleRow}>
            <View style={s.toggleInfo}>
              <Text style={s.toggleLabel}>Floristry Newsletter & Styling Tips</Text>
              <Text style={s.toggleDesc}>
                Monthly editorial guide on vase arrangements, floral preservation, and garden styling.
              </Text>
            </View>
            <Switch
              value={marketingEmail}
              onValueChange={setMarketingEmail}
              trackColor={{ false: colors.line, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* Save Button */}
        <Pressable style={s.saveBtn} onPress={saveSettings}>
          <Text style={s.saveBtnText}>Save Preferences</Text>
        </Pressable>
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
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.pale,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 2,
  },
  bannerSub: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 16,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.muted,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.pale,
  },
  toggleInfo: {
    flex: 1,
    paddingRight: 14,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: 2,
  },
  toggleDesc: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 16,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
