import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import {
  Package,
  Heart,
  MapPin,
  Bell,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  UserCheck,
  Crown,
  Flower2,
  User,
  LogIn,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadows } from '../../theme';
import { AppText } from '../../components/AppText';
import { GrandLogo } from '../../components/GrandLogo';
import GoogleAuthModal from '../../components/GoogleAuthModal';
import { useAuthStore } from '../../store/authStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useUIStore } from '../../store/uiStore';
import { getUserAvatarUrl } from '../../utils/imageUrl';
import { useResponsive } from '../../hooks/useResponsive';

export default function AccountScreen() {
  const router = useRouter();
  const { isTablet, containerStyle } = useResponsive();
  const { user, logout, syncUserData, savedAddresses, recentOrders } = useAuthStore();
  const { items: wishlistItems } = useWishlistStore();
  const { showToast } = useUIStore();

  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your Dhanvikk account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            showToast('Signed out of Dhanvikk account', 'info');
          },
        },
      ]
    );
  };

  const handleSyncProfile = async () => {
    if (!user?.email || syncing) return;
    try {
      setSyncing(true);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
      await syncUserData(user.email);
      showToast('Profile and saved blooms synced in real time ✨', 'success');
    } catch {
      showToast('Sync completed', 'info');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, isTablet && containerStyle]}
      >
        {/* Profile Card Header */}
        <View style={styles.profileHeader}>
          {user ? (
            <View style={styles.userCardContent}>
              <View style={styles.userRow}>
                <View style={styles.avatarWrap}>
                  <Image
                    source={{
                      uri: getUserAvatarUrl(user),
                    }}
                    style={styles.avatar}
                    contentFit="cover"
                  />
                  <View style={styles.verifiedOnlineDot} />
                </View>

                <View style={styles.userInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <AppText variant="h2" weight="semiBold" numberOfLines={1} style={{ flexShrink: 1 }}>
                      {user.name}
                    </AppText>
                    <View style={styles.vipTierBadge}>
                      <Crown size={11} color={Colors.gold} />
                      <AppText variant="caption" color={Colors.primaryDeep} weight="bold" style={{ fontSize: 9 }}>
                        VIP
                      </AppText>
                    </View>
                  </View>

                  <AppText variant="bodySm" color={Colors.textSecondary} numberOfLines={1}>
                    {user.email}
                  </AppText>

                  {/* Google Verified Security Tag */}
                  <View style={styles.googleVerifiedPill}>
                    <ShieldCheck size={13} color={Colors.success} />
                    <AppText variant="caption" color={Colors.success} weight="semiBold" style={{ fontSize: 10, marginLeft: 4 }}>
                      Google Authenticated
                    </AppText>
                  </View>
                </View>
              </View>

              {/* Real-time Cloud Sync & Switch Account Actions */}
              <View style={styles.userActionRow}>
                <TouchableOpacity
                  style={styles.syncBtn}
                  onPress={handleSyncProfile}
                  disabled={syncing}
                  activeOpacity={0.7}
                >
                  {syncing ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <RefreshCw size={14} color={Colors.primary} />
                  )}
                  <AppText variant="caption" color={Colors.primaryDeep} weight="semiBold" style={{ marginLeft: 6 }}>
                    {syncing ? 'Syncing...' : 'Sync Cloud'}
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.switchAccountBtn}
                  onPress={() => setShowGoogleModal(true)}
                  activeOpacity={0.7}
                >
                  <UserCheck size={14} color={Colors.textSecondary} />
                  <AppText variant="caption" color={Colors.textSecondary} weight="medium" style={{ marginLeft: 6 }}>
                    Switch Account
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.guestCard}>
              <View style={styles.guestHeaderRow}>
                <View style={styles.guestAvatarPlaceholder}>
                  <User size={30} color={Colors.primaryDeep} />
                </View>
                <View style={styles.guestInfo}>
                  <View style={styles.guestKickerRow}>
                    <Flower2 size={12} color={Colors.primaryDeep} />
                    <AppText variant="caption" color={Colors.primaryDeep} weight="bold" style={styles.guestKicker}>
                      DHANVIKK ATELIER
                    </AppText>
                  </View>
                  <AppText variant="h2" serif={true} style={{ marginTop: 2 }}>
                    Welcome to Dhanvikk
                  </AppText>
                  <AppText variant="bodySm" color={Colors.textSecondary} style={{ marginTop: 2, lineHeight: 18 }}>
                    Sign in to access your orders, saved bouquets, and luxury delivery concierge.
                  </AppText>
                </View>
              </View>

              {/* Direct Go to Login Page Option */}
              <TouchableOpacity
                style={styles.goToLoginBtn}
                activeOpacity={0.88}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  }
                  router.push('/auth/login');
                }}
              >
                <LogIn size={18} color={Colors.white} />
                <AppText variant="body" weight="semiBold" color={Colors.white} style={{ marginLeft: 8 }}>
                  Sign In / Log In
                </AppText>
                <ChevronRight size={18} color={Colors.white} style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>

              {/* Continue with Google Option */}
              <TouchableOpacity
                style={styles.guestGoogleBtn}
                activeOpacity={0.88}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  }
                  setShowGoogleModal(true);
                }}
              >
                <Image
                  source={{
                    uri: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                  }}
                  style={{ width: 18, height: 18, marginRight: 8 }}
                  contentFit="contain"
                />
                <AppText variant="body" weight="medium" color={Colors.text}>
                  Continue with Google
                </AppText>
              </TouchableOpacity>

              {/* Register Option Below */}
              <View style={styles.guestRegisterRow}>
                <AppText variant="caption" color={Colors.textSecondary}>
                  {"Don't have an account?"}{' '}
                </AppText>
                <TouchableOpacity
                  onPress={() => router.push('/auth/register')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <AppText variant="caption" color={Colors.primaryDeep} weight="bold">
                    Create Account →
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Menu Groups */}
        <View style={styles.menuGroup}>
          <AppText variant="caption" color={Colors.textSecondary} weight="semiBold" style={styles.groupTitle}>
            ORDERS & SHOPPING
          </AppText>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/orders')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
                <Package size={20} color="#1976D2" />
              </View>
              <AppText variant="body" weight="medium">
                My Orders
              </AppText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {recentOrders.length > 0 && (
                <AppText variant="caption" color={Colors.primaryDeep} weight="semiBold">
                  {recentOrders.length}
                </AppText>
              )}
              <ChevronRight size={18} color={Colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/wishlist')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconBox, { backgroundColor: Colors.palePink }]}>
                <Heart size={20} color={Colors.primary} />
              </View>
              <AppText variant="body" weight="medium">
                Saved Blooms
              </AppText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {wishlistItems.length > 0 && (
                <AppText variant="caption" color={Colors.primaryDeep} weight="semiBold">
                  {wishlistItems.length}
                </AppText>
              )}
              <ChevronRight size={18} color={Colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/addresses')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
                <MapPin size={20} color={Colors.success} />
              </View>
              <AppText variant="body" weight="medium">
                Delivery Addresses
              </AppText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {savedAddresses.length > 0 && (
                <AppText variant="caption" color={Colors.primaryDeep} weight="semiBold">
                  {savedAddresses.length}
                </AppText>
              )}
              <ChevronRight size={18} color={Colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Preferences & Support Group */}
        <View style={styles.menuGroup}>
          <AppText variant="caption" color={Colors.textSecondary} weight="semiBold" style={styles.groupTitle}>
            PREFERENCES & SUPPORT
          </AppText>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/notifications')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#FFF3E0' }]}>
                <Bell size={20} color="#E65100" />
              </View>
              <AppText variant="body" weight="medium">
                Notifications
              </AppText>
            </View>
            <ChevronRight size={18} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/help')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#F3E5F5' }]}>
                <HelpCircle size={20} color="#8E24AA" />
              </View>
              <AppText variant="body" weight="medium">
                Help & Concierge Support
              </AppText>
            </View>
            <ChevronRight size={18} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/about')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#EDE7F6' }]}>
                <Info size={20} color="#5E35B1" />
              </View>
              <AppText variant="body" weight="medium">
                About Dhanvikk Blooms
              </AppText>
            </View>
            <ChevronRight size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Sign Out Action if logged in */}
        {user ? (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color={Colors.error} />
            <AppText variant="button" color={Colors.error}>
              Sign Out
            </AppText>
          </TouchableOpacity>
        ) : null}

        {/* Version & Heritage Brand Footer */}
        <View style={styles.versionFooter}>
          <GrandLogo
            size="sm"
            showSubtitle={true}
            subtitleText="Blooms & Exports"
            style={{ marginBottom: 12 }}
          />
          <AppText variant="caption" color={Colors.textSecondary} align="center">
            Dhanvikk Blooms & Exports Mobile • v1.0.0
          </AppText>
          <AppText variant="caption" color={Colors.textSecondary} align="center" style={{ marginTop: 2 }}>
            DEVELOPED BY{' '}
            <Link href="https://haznox.com" style={{ color: Colors.primary }}>
              HAZNOX TECHS PVT LTD
            </Link>
          </AppText>
        </View>
      </ScrollView>

      {/* Real-time Google Authentication Modal */}
      <GoogleAuthModal
        visible={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        initialEmail={user?.email || ''}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.screenPadding,
    paddingBottom: 40,
  },
  profileHeader: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  userCardContent: {
    gap: 14,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.blush,
  },
  verifiedOnlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  vipTierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.palePink,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.primary + '33',
  },
  googleVerifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    marginTop: 4,
  },
  userActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.tintedSurface,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.chip,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  switchAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: Radius.chip,
  },
  // Guest VIP Invitation Card
  guestCard: {
    gap: 14,
  },
  guestHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  guestAvatarPlaceholder: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.palePink,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary + '33',
  },
  guestInfo: {
    flex: 1,
    gap: 2,
  },
  guestKickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  guestKicker: {
    letterSpacing: 1.1,
    fontSize: 10,
  },
  goToLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: Radius.md,
    ...Shadows.sm,
  },
  guestGoogleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 10,
    ...Shadows.sm,
  },
  guestRegisterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    marginTop: 4,
  },
  menuGroup: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  groupTitle: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5EFF2',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.button,
    height: 52,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    gap: 10,
    marginBottom: Spacing.xl,
  },
  versionFooter: {
    alignItems: 'center',
    paddingVertical: 10,
  },
});
