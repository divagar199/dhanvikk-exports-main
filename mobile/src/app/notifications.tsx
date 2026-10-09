import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Flower2, Package, Truck } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadows } from '../theme';
import { AppText } from '../components/AppText';

const NOTIFICATIONS = [
  {
    id: 'notif_1',
    title: 'Your Bouquet is Being Prepared',
    message: 'Master florists are hand-tying Passionate Serenity Noir with fresh hydration wraps.',
    time: '10 mins ago',
    unread: true,
    icon: Package,
    color: Colors.primary,
  },
  {
    id: 'notif_2',
    title: 'Exclusive Export Arrivals from Ecuador',
    message: 'New obsidian matte boxed roses just landed in our temperature-controlled vault.',
    time: '2 hours ago',
    unread: true,
    icon: Flower2,
    color: '#8E24AA',
  },
  {
    id: 'notif_3',
    title: 'Delivery Milestone Confirmed',
    message: 'Order #DHN-2026-8941 was verified and scheduled for temperature-controlled transport.',
    time: 'Yesterday',
    unread: false,
    icon: Truck,
    color: Colors.success,
  },
];

export default function NotificationsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <AppText variant="h1" color={Colors.text}>
          Notifications
        </AppText>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.list}>
          {NOTIFICATIONS.map((item) => {
            const IconComponent = item.icon;
            return (
              <View
                key={item.id}
                style={[styles.card, item.unread && styles.cardUnread]}
              >
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: item.unread ? Colors.palePink : '#F5F5F5' },
                  ]}
                >
                  <IconComponent size={20} color={item.color} />
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.cardHeader}>
                    <AppText
                      variant="bodySm"
                      weight={item.unread ? 'semiBold' : 'medium'}
                      numberOfLines={1}
                      style={{ flex: 1 }}
                    >
                      {item.title}
                    </AppText>
                    {item.unread && <View style={styles.unreadDot} />}
                  </View>

                  <AppText variant="caption" color={Colors.textSecondary} style={{ marginTop: 4 }}>
                    {item.message}
                  </AppText>

                  <AppText variant="caption" color={Colors.textSecondary} style={{ marginTop: 6, fontSize: 11 }}>
                    {item.time}
                  </AppText>
                </View>
              </View>
            );
          })}
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
    paddingBottom: 40,
  },
  list: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
    ...Shadows.sm,
  },
  cardUnread: {
    borderColor: '#F8BBD0',
    backgroundColor: '#FFFAFC',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
});
