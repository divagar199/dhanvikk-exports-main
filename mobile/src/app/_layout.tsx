import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox, Animated, Platform, StyleSheet } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { Colors } from '../theme';
import { AppText } from '../components/AppText';

LogBox.ignoreLogs([
  "Database '(default)' not found",
  "@firebase/firestore: Firestore",
  'Non-serializable values were found in the navigation state',
  'VirtualizedLists should never be nested',
]);

SplashScreen.preventAutoHideAsync().catch(() => {});
SystemUI.setBackgroundColorAsync(Colors.background).catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 2,
    },
  },
});

function ToastNotification() {
  const { toast } = useUIStore();
  const [anim] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(-20));

  useEffect(() => {
    if (toast?.visible) {
      translateY.setValue(-20);
      anim.setValue(0);
      Animated.parallel([
        Animated.timing(anim, { toValue: 1, duration: 240, useNativeDriver: Platform.OS !== 'web' }),
        Animated.spring(translateY, { toValue: 0, damping: 18, stiffness: 200, useNativeDriver: Platform.OS !== 'web' }),
      ]).start();
    } else {
      Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: Platform.OS !== 'web' }).start();
    }
  }, [toast, anim, translateY]);

  if (!toast) return null;

  const bgColor = toast.type === 'success' ? '#16805B' : toast.type === 'error' ? '#C62828' : '#241B1F';

  return (
    <Animated.View
      style={[toastStyles.toast, { backgroundColor: bgColor, opacity: anim, transform: [{ translateY }] }]}
      pointerEvents="none"
    >
      <AppText variant="caption" color="#FFFFFF" weight="semiBold" style={toastStyles.text}>
        {toast.message}
      </AppText>
    </Animated.View>
  );
}

const toastStyles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 44,
    left: 16,
    right: 16,
    zIndex: 9999,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 10,
  },
  text: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
  });

  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  // Instant fallback: Hide native splash within 350ms regardless of font loader
  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  if (!fontsLoaded && !fontError) {
    return <Animated.View style={{ flex: 1, backgroundColor: '#FFF7F9' }} />;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
            animation: 'slide_from_right',
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
          }}
        >
          <Stack.Screen name="index" options={{ animation: 'fade' }} />
          <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="product/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="category/[slug]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="search" options={{ animation: 'fade' }} />
          <Stack.Screen name="filters" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="wishlist" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="checkout/index" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="checkout/success" options={{ animation: 'fade', gestureEnabled: false }} />
          <Stack.Screen name="orders/index" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="orders/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="auth/welcome" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="auth/login" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="auth/register" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="auth/forgot-password" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="addresses" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="map" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="profile" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="notifications" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="help" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="about" options={{ animation: 'slide_from_right' }} />
        </Stack>
        <ToastNotification />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
