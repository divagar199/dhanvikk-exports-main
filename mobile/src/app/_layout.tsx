import React, { useEffect } from 'react';
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
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { Colors } from '../theme';

// Suppress unprovisioned Firestore background connection warnings
LogBox.ignoreLogs([
  "Database '(default)' not found",
  '@firebase/firestore: Firestore (13.0.0): Database \'(default)\' not found',
  '@firebase/firestore: Firestore',
]);

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 2,
    },
  },
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
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
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
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
        <Stack.Screen
          name="product/[id]"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="category/[slug]"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="search"
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="filters"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="wishlist"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="checkout/index"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="checkout/success"
          options={{
            animation: 'fade',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="orders/index"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="orders/[id]"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="auth/welcome"
          options={{
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="auth/login"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="auth/register"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="auth/forgot-password"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="addresses"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="map"
          options={{
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="help"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="about"
          options={{
            animation: 'slide_from_right',
          }}
        />
      </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
