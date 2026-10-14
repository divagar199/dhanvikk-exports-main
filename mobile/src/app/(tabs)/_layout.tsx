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
          borderTopColor: colors.lineGold,
          borderTopWidth: 1,
          elevation: 8,
          shadowColor: '#1A1A1A',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800',
          letterSpacing: 0.4,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={21}
              color={focused ? colors.primary : colors.muted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Categories',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'grid' : 'grid-outline'}
              size={21}
              color={focused ? colors.primary : colors.muted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlist',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'heart' : 'heart-outline'}
              size={22}
              color={focused ? colors.primary : colors.muted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'receipt' : 'receipt-outline'}
              size={21}
              color={focused ? colors.primary : colors.muted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={21}
              color={focused ? colors.primary : colors.muted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}