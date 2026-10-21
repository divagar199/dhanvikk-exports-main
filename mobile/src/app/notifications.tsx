import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import { colors, radius, shadows, spacing } from '@/constants/theme';
import { useToast } from '@/context/ToastContext';

interface CustomerNotification {
  id: string;
  type: 'update' | 'order' | 'harvest' | 'offer';
  title: string;
  message: string;
  timestamp: string;
  badge: string;
  badgeColor: string;
  icon: keyof typeof Ionicons.glyphMap;
  isNew?: boolean;
  actionText?: string;
  actionRoute?: string;
}

const CUSTOMER_UPDATES: CustomerNotification[] = [
  {
    id: 'upd-1',
    type: 'update',
    title: 'App Update v1.0.2 Live',
    message: 'New below-price quantity controls, faster Google 1-Tap sign in, and enhanced 3.2°C cold-chain tracking are now active.',
    timestamp: 'Just now',
    badge: 'NEW UPDATE',
    badgeColor: colors.primary,
    icon: 'rocket-outline',
    isNew: true,
  },
  {
    id: 'upd-2',
    type: 'harvest',
    title: 'Dawn Nilgiri Harvest Available',
    message: 'Fresh stems of Royal Ooty Roses and Dutch Casablanca Lilies were cut this morning and are in chilled transit.',
    timestamp: '2 hours ago',
    badge: 'FARM ARRIVAL',
    badgeColor: '#059669',
    icon: 'rose-outline',
    isNew: true,
    actionText: 'Explore Stems',
    actionRoute: '/(tabs)/shop',
  },
  {
    id: 'upd-3',
    type: 'offer',
    title: 'Boutique Savings Active',
    message: 'Apply coupon code "DHANVIKK10" at checkout for 10% privilege savings across all hand-crafted bouquets.',
    timestamp: '1 day ago',
    badge: 'PRIVILEGE',
    badgeColor: '#D97706',
    icon: 'gift-outline',
    actionText: 'Shop Bouquets',
    actionRoute: '/(tabs)/shop',
  },
  {
    id: 'upd-4',
    type: 'order',
    title: 'Continuous Cold-Chain Active',
    message: 'Reefer Van #BLR-04 is maintaining strict 2°C–4°C chilled sanctity across Bangalore deliveries today.',
    timestamp: '2 days ago',
    badge: 'COLD-CHAIN',
    badgeColor: colors.secondary,
    icon: 'snow-outline',
    actionText: 'Track Delivery',
    actionRoute: '/(tabs)/orders',
  },
];

export default function NotificationsScreen() {
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<'feed' | 'settings'>('feed');
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [notifications, setNotifications] = useState(CUSTOMER_UPDATES);

  // Preference switches
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [floralDrops, setFloralDrops] = useState(true);
  const [occasionReminders, setOccasionReminders] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [marketingEmail, setMarketingEmail] = useState(false);

  const handleCheckUpdate = () => {
    setCheckingUpdate(true);
    setTimeout(() => {
      setCheckingUpdate(false);
      showToast(
        'Up to Date! 🌸',
        'Dhanvikk Blooms v1.0.2 is the latest official release.',
        'success'
      );
    }, 1200);
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isNew: false })));
    showToast('All Caught Up', 'All updates marked as read.', 'info');
  };

  const saveSettings = () => {
    showToast(
      'Preferences Saved! 🔔',
      'Your notification preferences have been safely updated.',
      'success'
    );
  };

  const unreadCount = notifications.filter((n) => n.isNew).length;

  return (
    <View style={[s.page, { paddingTop: Math.max(insets.top, 12) }]}>
      {/* Top App Bar */}
      <View style={s.topBar}>
        <Pressable
          style={({ pressed }) => [
            s.backBtn,
            pressed && { opacity: 0.7, transform: [{ scale: 0.92 }] },
          ]}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/account'))}
          hitSlop={8}
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>

        <Text style={s.topBarTitle}>Notifications & Updates</Text>

        <Pressable
          style={({ pressed }) => [
            s.markReadBtn,
            pressed && { opacity: 0.7, transform: [{ scale: 0.92 }] },
          ]}
          onPress={markAllRead}
          hitSlop={8}
          accessibilityLabel="Mark all as read"
        >
          <Ionicons name="checkmark-done" size={20} color={colors.primary} />
        </Pressable>
      </View>

      {/* Segment Switch */}
      <View style={s.tabRow}>
        <Pressable
          style={[s.tabBtn, activeTab === 'feed' && s.tabBtnActive]}
          onPress={() => setActiveTab('feed')}
        >
          <Ionicons
            name="notifications"
            size={16}
            color={activeTab === 'feed' ? colors.primary : colors.muted}
          />
          <Text style={[s.tabText, activeTab === 'feed' && s.tabTextActive]}>
            Customer Updates {unreadCount > 0 ? `(${unreadCount})` : ''}
          </Text>
        </Pressable>

        <Pressable
          style={[s.tabBtn, activeTab === 'settings' && s.tabBtnActive]}
          onPress={() => setActiveTab('settings')}
        >
          <Ionicons
            name="settings-outline"
            size={16}
            color={activeTab === 'settings' ? colors.primary : colors.muted}
          />
          <Text style={[s.tabText, activeTab === 'settings' && s.tabTextActive]}>
            Preferences
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[s.content, { paddingBottom: Math.max(insets.bottom, 20) + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'feed' ? (
          <>
            {/* Version & OTA Updates Banner */}
            <View style={s.updateStatusCard}>
              <View style={s.updateStatusLeft}>
                <View style={s.updateIconCircle}>
                  <Ionicons name="shield-checkmark" size={20} color="#059669" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.updateStatusTitle}>Dhanvikk Blooms v1.0.2</Text>
                  <Text style={s.updateStatusSub}>Latest production build installed</Text>
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [
                  s.checkUpdateBtn,
                  pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
                ]}
                onPress={handleCheckUpdate}
                disabled={checkingUpdate}
              >
                {checkingUpdate ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <Ionicons name="refresh" size={14} color={colors.white} style={{ marginRight: 4 }} />
                    <Text style={s.checkUpdateBtnText}>Check Updates</Text>
                  </>
                )}
              </Pressable>
            </View>

            {/* Notification Feed */}
            <View style={s.feedWrap}>
              {notifications.map((item) => (
                <View key={item.id} style={[s.notifCard, item.isNew && s.notifCardUnread]}>
                  <View style={s.notifHeaderRow}>
                    <View style={[s.badgePill, { backgroundColor: item.badgeColor + '18', borderColor: item.badgeColor + '40' }]}>
                      <Ionicons name={item.icon} size={12} color={item.badgeColor} />
                      <Text style={[s.badgeText, { color: item.badgeColor }]}>{item.badge}</Text>
                    </View>
                    <Text style={s.timestampText}>{item.timestamp}</Text>
                  </View>

                  <Text style={s.notifTitle}>{item.title}</Text>
                  <Text style={s.notifMessage}>{item.message}</Text>

                  {item.actionText && item.actionRoute && (
                    <Pressable
                      style={({ pressed }) => [
                        s.notifActionBtn,
                        pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
                      ]}
                      onPress={() => router.push(item.actionRoute as any)}
                    >
                      <Text style={s.notifActionText}>{item.actionText}</Text>
                      <Ionicons name="arrow-forward" size={13} color={colors.primary} />
                    </Pressable>
                  )}
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* Informational Header */}
            <View style={s.bannerCard}>
              <Ionicons name="notifications" size={24} color={colors.primaryDeep} />
              <View style={{ flex: 1 }}>
                <Text style={s.bannerTitle}>Notification Channels</Text>
                <Text style={s.bannerSub}>
                  Control how Dhanvikk Blooms sends real-time order updates, temperature milestones, and boutique drops.
                </Text>
              </View>
            </View>

            {/* Section 1: Order Tracking */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>ORDER & COLD-CHAIN DISPATCH</Text>

              <View style={s.toggleRow}>
                <View style={s.toggleInfo}>
                  <Text style={s.toggleLabel}>Live Dispatch & Reefer Tracking</Text>
                  <Text style={s.toggleDesc}>
                    Push notifications when your flowers are hand-tied and loaded into 3.2°C cold transit.
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
                    Direct message with driver live contact and arrival countdown 30 minutes before delivery.
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
                    Be alerted the instant rare seasonal harvests (e.g. Dutch Tulips, Highland Peonies) arrive.
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
                    Monthly editorial guide on vase arrangements, floral food preservation, and styling.
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
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    maxWidth: 840,
    width: '100%',
    alignSelf: 'center',
    ...(shadows?.soft || {}),
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markReadBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: 0.2,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineLight,
    gap: 10,
    maxWidth: 840,
    width: '100%',
    alignSelf: 'center',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.line,
  },
  tabBtnActive: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.muted,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  content: {
    padding: 16,
    maxWidth: 840,
    width: '100%',
    alignSelf: 'center',
  },
  updateStatusCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    ...(shadows?.soft || {}),
  },
  updateStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  updateIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateStatusTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
  },
  updateStatusSub: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 1,
  },
  checkUpdateBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkUpdateBtnText: {
    color: colors.white,
    fontSize: 11.5,
    fontWeight: '800',
  },
  feedWrap: {
    gap: 12,
  },
  notifCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...(shadows?.soft || {}),
  },
  notifCardUnread: {
    borderColor: colors.primary,
    backgroundColor: '#FFFBFB',
  },
  notifHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timestampText: {
    fontSize: 11,
    color: colors.muted,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 6,
  },
  notifMessage: {
    fontSize: 12.5,
    color: colors.muted,
    lineHeight: 18,
    marginBottom: 10,
  },
  notifActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingVertical: 4,
  },
  notifActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '800',
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
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.secondary,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineLight,
    gap: 12,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 3,
  },
  toggleDesc: {
    fontSize: 11.5,
    color: colors.muted,
    lineHeight: 16,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...(shadows?.card || {}),
  },
  saveBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
