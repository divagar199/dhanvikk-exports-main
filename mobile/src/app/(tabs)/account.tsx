import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadows, spacing } from '@/constants/theme';
import { getStoredUser } from '@/lib/storage';
import { logout } from '@/services/auth';
import { useStore } from '@/store/useStore';
import type { User } from '@/types/models';
import { GoogleSignInModal } from '@/components/GoogleSignInModal';
import { useResponsive } from '@/hooks/useResponsive';
import { BrandHeaderTitle } from '@/components/BrandHeaderTitle';
import { useToast } from '@/context/ToastContext';

export default function Account() {
  const insets = useSafeAreaInsets();
  const { isTablet, maxContentWidth } = useResponsive();
  const contentMaxWidth = Math.min(maxContentWidth, 840);

  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    getStoredUser<User>().then((u) => {
      if (u) setUser(u);
    });
  }, [setUser]);

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out from Dhanvikk?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          setUser(null);
          showToast('Signed Out', 'You have been safely signed out from Dhanvikk.', 'info');
        },
      },
    ]);
  };

  return (
    <View style={[s.page, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Haute Floriculture Header */}
      <View style={[s.header, { maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }]}>
        <View style={s.headerLeftGroup}>
          <Pressable
            style={({ pressed }) => [
              s.backBtn,
              pressed && { opacity: 0.7, transform: [{ scale: 0.92 }] },
            ]}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'))}
            hitSlop={8}
            accessibilityLabel="Back to Home"
          >
            <Ionicons name="arrow-back" size={22} color={colors.ink} />
          </Pressable>
          <BrandHeaderTitle />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          s.content,
          { paddingBottom: Math.max(insets.bottom, 16) + 130, maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card with VIP Gold Styling */}
        <View style={s.profileCard}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : '🌸'}
            </Text>
          </View>

          <View style={s.profileInfo}>
            <Text style={s.name}>{user?.name || 'Guest Connoisseur'}</Text>
            <Text style={s.email}>
              {user?.email || 'Sign in to access VIP cold-chain reservations'}
            </Text>
          </View>

          {!user ? (
            <View style={s.profileAuthBtns}>
              <Pressable
                style={s.googleProfileBtn}
                onPress={() => setShowGoogleModal(true)}
              >
                <Ionicons name="logo-google" size={15} color="#EA4335" />
                <Text style={s.googleProfileText}>Google</Text>
              </Pressable>
              <Pressable
                style={s.signInMiniBtn}
                onPress={() => router.push('/auth/login')}
              >
                <Text style={s.signInMiniText}>Login</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        {/* 4-Item Quick Action Grid */}
        <View style={s.quickGrid}>
          <Pressable
            style={s.quickItem}
            onPress={() => router.push('/orders')}
          >
            <View style={s.quickIcon}>
              <Ionicons name="cube-outline" size={22} color={colors.primary} />
            </View>
            <Text style={s.quickLabel}>Orders</Text>
          </Pressable>

          <Pressable
            style={s.quickItem}
            onPress={() => router.push('/wishlist')}
          >
            <View style={s.quickIcon}>
              <Ionicons name="heart-outline" size={22} color={colors.primary} />
            </View>
            <Text style={s.quickLabel}>Wishlist</Text>
          </Pressable>

          <Pressable
            style={s.quickItem}
            onPress={() =>
              showToast('Coupons & Offers 🏷️', 'Use code DHANVIKK10 for 10% off your orders!', 'info', 3000)
            }
          >
            <View style={s.quickIcon}>
              <Ionicons name="pricetag-outline" size={22} color={colors.primary} />
            </View>
            <Text style={s.quickLabel}>Coupons</Text>
          </Pressable>

          <Pressable
            style={s.quickItem}
            onPress={() => router.push('/support')}
          >
            <View style={s.quickIcon}>
              <Ionicons name="headset-outline" size={22} color={colors.primary} />
            </View>
            <Text style={s.quickLabel}>Help Center</Text>
          </Pressable>
        </View>

        {/* Account Services List */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>ACCOUNT SETTINGS</Text>

          <Pressable
            style={s.menuRow}
            onPress={() => router.push('/profile')}
          >
            <Ionicons name="person-outline" size={20} color={colors.ink} />
            <Text style={s.menuLabel}>Edit Profile & Security</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>

          <Pressable
            style={s.menuRow}
            onPress={() => router.push('/addresses')}
          >
            <Ionicons name="location-outline" size={20} color={colors.ink} />
            <Text style={s.menuLabel}>Saved Addresses</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>

          <Pressable
            style={s.menuRow}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.ink} />
            <Text style={s.menuLabel}>Notifications & Updates</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        </View>

        {/* Support & Policies */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>INFORMATION & ENTERPRISE</Text>

          <Pressable
            style={s.menuRow}
            onPress={() =>
              showToast(
                'About Dhanvikk Blooms & Exports 🌸',
                'Rare, heavy-caliber blossoms from 7,200ft Nilgiri estates in continuous 2°C–4°C reefer transit.',
                'info',
                3500
              )
            }
          >
            <Ionicons name="flower-outline" size={20} color={colors.ink} />
            <Text style={s.menuLabel}>About Dhanvikk Blooms & Exports</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>

          <Pressable
            style={s.menuRow}
            onPress={() => router.push('/support')}
          >
            <Ionicons name="globe-outline" size={20} color={colors.ink} />
            <Text style={s.menuLabel}>Wholesale & Floral Exports</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>

          <Pressable
            style={s.menuRow}
            onPress={() =>
              showToast(
                '12-Day Longevity Promise 🌿',
                'Guaranteed 7 to 12 days vase vitality with our botanical elixir. Concierge replacement if unsatisfied.',
                'success',
                3500
              )
            }
          >
            <Ionicons name="ribbon-outline" size={20} color={colors.ink} />
            <Text style={s.menuLabel}>12-Day Longevity Promise</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>

          <Pressable
            style={s.menuRow}
            onPress={() =>
              showToast(
                'Privacy & Security 🔒',
                '256-bit SSL encryption. Customer personal information and addresses are guarded with strict confidentiality.',
                'info',
                3000
              )
            }
          >
            <Ionicons name="document-text-outline" size={20} color={colors.ink} />
            <Text style={s.menuLabel}>Legal & Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        </View>

        {/* Auth CTA */}
        {user ? (
          <Pressable style={s.logoutRow} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />
            <Text style={s.logoutText}>Sign Out</Text>
          </Pressable>
        ) : (
          <View style={s.guestBottomCta}>
            <Pressable
              style={s.googleBottomBtn}
              onPress={() => setShowGoogleModal(true)}
            >
              <Ionicons name="logo-google" size={18} color="#DB4437" />
              <Text style={s.googleBottomText}>Sign In with Google</Text>
            </Pressable>

            <Pressable
              style={s.fullLoginBtn}
              onPress={() => router.push('/auth/login')}
            >
              <Text style={s.fullLoginText}>Sign In / Register with Email</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Google Sign In Modal */}
      <GoogleSignInModal
        visible={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSuccess={(u?: any) => {
          setShowGoogleModal(false);
          if (u) setUser(u);
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  headerLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0.3,
  },
  headerSub: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.secondary,
    letterSpacing: 0.3,
  },
  content: {},
  profileCard: {
    backgroundColor: colors.white,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineLight,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primary,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.ink,
  },
  email: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  signInMiniBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primaryDeep,
  },
  signInMiniText: {
    color: colors.white,
    fontWeight: '900',
    fontSize: 12,
  },
  vipBanner: {
    backgroundColor: colors.secondary, // Deep Forest Flora VIP bar
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accent,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...(shadows?.soft || {}),
  },
  vipLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  vipCrown: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vipTitle: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
  },
  vipSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10,
    marginTop: 1,
  },
  vipPill: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  vipPillText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '900',
  },
  quickGrid: {
    backgroundColor: colors.white,
    marginVertical: 10,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.lineLight,
  },
  quickItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.pale,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.ink,
  },
  section: {
    backgroundColor: colors.white,
    marginBottom: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.lineLight,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.muted,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    letterSpacing: 0.5,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineLight,
    gap: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
  },
  logoutRow: {
    backgroundColor: colors.white,
    marginHorizontal: 12,
    marginTop: 6,
    padding: 14,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.lineLight,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '900',
  },
  fullLoginBtn: {
    backgroundColor: colors.primary,
    marginHorizontal: 12,
    marginTop: 6,
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: 'center',
  },
  fullLoginText: {
    color: colors.white,
    fontWeight: '900',
    fontSize: 14,
  },
  profileAuthBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  googleProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lineLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  googleProfileText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.ink,
  },
  guestBottomCta: {
    gap: 8,
  },
  googleBottomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.lineLight,
    marginHorizontal: 12,
    marginTop: 10,
    paddingVertical: 13,
    borderRadius: 4,
  },
  googleBottomText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
  },
});