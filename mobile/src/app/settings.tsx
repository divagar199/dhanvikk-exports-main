import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Globe, Shield } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadows } from '../theme';
import { AppText } from '../components/AppText';
import { useUIStore } from '../store/uiStore';

export default function SettingsScreen() {
  const router = useRouter();
  const { showToast } = useUIStore();

  const [pushNotifs, setPushNotifs] = useState(true);
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <AppText variant="h1" color={Colors.text}>
          Settings
        </AppText>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <AppText variant="caption" color={Colors.textSecondary} weight="semiBold" style={styles.cardTitle}>
            NOTIFICATIONS & ALERTS
          </AppText>

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <AppText variant="body" weight="medium">
                Push Notifications
              </AppText>
              <AppText variant="caption" color={Colors.textSecondary}>
                Receive delivery updates and floral care tips.
              </AppText>
            </View>
            <Switch
              value={pushNotifs}
              onValueChange={setPushNotifs}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <AppText variant="body" weight="medium">
                Order Tracking Milestones
              </AppText>
              <AppText variant="caption" color={Colors.textSecondary}>
                Real-time alerts when your courier is nearby.
              </AppText>
            </View>
            <Switch
              value={orderAlerts}
              onValueChange={setOrderAlerts}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
        </View>

        <View style={styles.card}>
          <AppText variant="caption" color={Colors.textSecondary} weight="semiBold" style={styles.cardTitle}>
            EXPERIENCE & ACCESSIBILITY
          </AppText>

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <AppText variant="body" weight="medium">
                Tactile Haptics
              </AppText>
              <AppText variant="caption" color={Colors.textSecondary}>
                Subtle micro-feedback when favoriting or adding to bag.
              </AppText>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={setHapticsEnabled}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
        </View>

        <View style={styles.card}>
          <AppText variant="caption" color={Colors.textSecondary} weight="semiBold" style={styles.cardTitle}>
            SECURITY & LEGAL
          </AppText>

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => showToast('Dhanvikk privacy protocols are ISO certified.', 'info')}
          >
            <AppText variant="body">Privacy Policy</AppText>
            <Shield size={18} color={Colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => showToast('Terms of Service applied.', 'info')}
          >
            <AppText variant="body">Terms of Service</AppText>
            <Globe size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
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
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  cardTitle: {
    letterSpacing: 1,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
});
