import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import { useStore } from '@/store/useStore';

export default function TabsLayout() {
  const cart = useStore((s) => s.cart);
  const cartCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          height: 68,
          paddingTop: 8,
          paddingBottom: 10,
          backgroundColor: colors.white,
          borderTopColor: colors.line,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: (p) => (
            <Ionicons
              name={p.focused ? 'home' : 'home-outline'}
              size={22}
              color={(p.color as string) || colors.muted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: (p) => (
            <Ionicons
              name={p.focused ? 'flower' : 'flower-outline'}
              size={22}
              color={(p.color as string) || colors.muted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Bag',
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.primary,
            color: colors.white,
            fontSize: 10,
            fontWeight: '800',
          },
          tabBarIcon: (p) => (
            <Ionicons
              name={p.focused ? 'bag-handle' : 'bag-handle-outline'}
              size={22}
              color={(p.color as string) || colors.muted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: (p) => (
            <Ionicons
              name={p.focused ? 'person' : 'person-outline'}
              size={22}
              color={(p.color as string) || colors.muted}
            />
          ),
        }}
      />
    </Tabs>
  );
}