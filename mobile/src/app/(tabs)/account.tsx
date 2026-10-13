import { useEffect } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '@/constants/theme';
import { getStoredUser } from '@/lib/storage';
import { logout } from '@/services/auth';
import { useStore } from '@/store/useStore';
import type { User } from '@/types/models';

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  route: string;
};

const MENU_ITEMS: MenuItem[] = [
  {
    icon: 'receipt-outline',
    title: 'My orders',
    subtitle: 'Track live orders & view history',
    route: '/orders',
  },
  {
    icon: 'location-outline',
    title: 'Delivery addresses',
    subtitle: 'Saved home, office & event locations',
    route: '/addresses',
  },
  {
    icon: 'heart-outline',
    title: 'Saved blooms',
    subtitle: 'Your favorite floral arrangements',
    route: '/wishlist',
  },
  {
    icon: 'navigate-outline',
    title: 'Delivery map',
    subtitle: 'Live map delivery view',
    route: '/map',
  },
];

export default function Account() {
  const insets = useSafeAreaInsets();
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);

  useEffect(() => {
    getStoredUser<User>().then((u) => {
      if (u) setUser(u);
    });
  }, [setUser]);

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          setUser(null);
        },
      },
    ]);
  };

  return (
    <ScrollView
      contentContainerStyle={[
        s.content,
        { paddingTop: Math.max(insets.top, 16), paddingBottom: 120 },
      ]}
    >
      <Text style={s.title}>Your account</Text>

      <View style={s.profileCard}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
          </Text>
        </View>
        <View style={s.profileInfo}>
          <Text style={s.name}>{user?.name || 'Guest Explorer'}</Text>
          <Text style={s.email}>
            {user?.email || 'Sign in to sync your bag, orders & wishlist'}
          </Text>
        </View>
      </View>

      {!user ? (
        <Pressable style={s.loginBtn} onPress={() => router.push('/auth/login')}>
          <Text style={s.loginBtnText}>Sign in / Register</Text>
        </Pressable>
      ) : null}

      <Text style={s.sectionHeader}>Quick services</Text>

      <View style={s.menuList}>
        {MENU_ITEMS.map((item, idx) => (
          <Pressable
            key={item.title}
            style={[s.menuRow, idx === MENU_ITEMS.length - 1 && s.menuRowLast]}
            onPress={() => router.push(item.route as any)}
          >
            <View style={s.menuIcon}>
              <Ionicons name={item.icon} size={20} color={colors.primaryDeep} />
            </View>
            <View style={s.menuText}>
              <Text style={s.menuTitle}>{item.title}</Text>
              <Text style={s.menuSub}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        ))}
      </View>

      {user ? (
        <Pressable style={s.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={s.logoutText}>Sign out of Dhanvikk</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.ink,
    marginTop: 8,
    marginBottom: 16,
  },
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primaryDeep,
  },
  profileInfo: {
    flex: 1,
    paddingLeft: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.ink,
  },
  email: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 3,
  },
  loginBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  loginBtnText: {
    color: colors.white,
    fontWeight: '900',
    fontSize: 14,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 22,
    marginBottom: 10,
  },
  menuList: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
  },
  menuRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  menuRowLast: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.pale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    flex: 1,
    paddingLeft: 12,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.ink,
  },
  menuSub: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    marginTop: 20,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  logoutText: {
    color: colors.danger,
    fontWeight: '800',
    fontSize: 14,
  },
});