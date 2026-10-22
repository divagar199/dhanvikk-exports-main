import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { ToastProvider } from '@/context/ToastContext';
import { BASE } from '@/lib/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 15, // 15 minutes fresh cache for instant navigation
      gcTime: 1000 * 60 * 60 * 24, // 24 hours persistent retention in memory
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function Layout() {
  useEffect(() => {
    // Hide splash screen immediately when app layout mounts
    SplashScreen.hideAsync().catch(() => {});

    // Proactively warm up Render backend container in background
    try {
      fetch(`${BASE}/api/health`).catch(() => {});
    } catch {
      // silent
    }
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              animationDuration: 280,
              gestureEnabled: true,
            }}
          >
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen
            name="product/[id]"
            options={{
              animation: 'slide_from_bottom',
              animationDuration: 300,
            }}
          />
          <Stack.Screen
            name="cart"
            options={{
              animation: 'slide_from_bottom',
              animationDuration: 280,
            }}
          />
          <Stack.Screen name="checkout" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="order/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="orders" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="search" options={{ animation: 'fade', animationDuration: 200 }} />
          <Stack.Screen name="addresses" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="support" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="notifications" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="profile" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen
            name="auth/login"
            options={{
              animation: 'slide_from_bottom',
              animationDuration: 280,
            }}
          />
          <Stack.Screen name="auth/register" options={{ animation: 'slide_from_right' }} />
        </Stack>
      </QueryClientProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}