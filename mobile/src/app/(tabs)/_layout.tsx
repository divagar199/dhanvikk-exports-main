import React, { useEffect, useRef, useState } from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Home,
  Flower2,
  LayoutGrid,
  ShoppingBag,
  User,
} from 'lucide-react-native';
import { Colors, Typography, Motion } from '../../theme';
import { AppText } from '../../components/AppText';
import { useCartStore } from '../../store/cartStore';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = insets?.bottom ?? 0;
  const { getItemCount } = useCartStore();
  const cartCount = getItemCount();

  const [badgeScale] = useState(() => new Animated.Value(cartCount > 0 ? 1 : 0));
  const prevCount = useRef(cartCount);

  useEffect(() => {
    if (cartCount > 0) {
      if (prevCount.current !== cartCount) {
        badgeScale.setValue(0.5);
        Animated.spring(badgeScale, {
          toValue: 1,
          damping: Motion.spring.damping,
          stiffness: Motion.spring.stiffness,
          mass: Motion.spring.mass,
          useNativeDriver: Platform.OS !== 'web',
        }).start();
      }
    } else {
      Animated.timing(badgeScale, {
        toValue: 0,
        duration: Motion.fast,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }
    prevCount.current = cartCount;
  }, [cartCount, badgeScale]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: [
          styles.tabBar,
          {
            height: 60 + bottomInset,
            paddingBottom: bottomInset > 0 ? bottomInset : 8,
          },
        ],
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <Home
                size={24}
                color={color}
                strokeWidth={1.5}
                fill={focused ? Colors.primary : 'none'}
              />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <Flower2
                size={24}
                color={color}
                strokeWidth={1.5}
                fill={focused ? Colors.primary : 'none'}
              />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <LayoutGrid
                size={24}
                color={color}
                strokeWidth={1.5}
                fill={focused ? Colors.primary : 'none'}
              />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: 'Bag',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <ShoppingBag
                size={24}
                color={color}
                strokeWidth={1.5}
                fill={focused ? Colors.primary : 'none'}
              />
              {cartCount > 0 && (
                <Animated.View style={[styles.badgeContainer, { transform: [{ scale: badgeScale }] }]}>
                  <AppText variant="caption" color={Colors.white} weight="bold" style={styles.badgeText}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </AppText>
                </Animated.View>
              )}
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <User
                size={24}
                color={color}
                strokeWidth={1.5}
                fill={focused ? Colors.primary : 'none'}
              />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    paddingTop: 6,
    elevation: 4,
  },
  tabLabel: {
    fontFamily: Typography.fonts.medium,
    fontSize: 11,
    marginTop: 2,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 28,
  },
  activeDot: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    lineHeight: 12,
  },
});
