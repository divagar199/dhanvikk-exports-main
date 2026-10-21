import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from '@/context/ToastContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
      retry: 2,
    },
  },
});

export default function Layout() {
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