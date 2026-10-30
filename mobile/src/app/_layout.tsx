import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from '@/context/ToastContext';
import { BASE } from '@/lib/api';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getStoredUser, saveSession } from '@/lib/storage';
import { useStore } from '@/store/useStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 15,   // 15 minutes fresh cache
      gcTime: 1000 * 60 * 60 * 24, // 24 hours retention
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * FirebaseAuthSync
 *
 * Subscribes to Firebase's onAuthStateChanged inside the React tree so
 * zustand's `useStore` is accessible via the hook.
 *
 * - On sign-in: if the store is empty, hydrates it from SecureStore or the
 *   Firebase user object so the app shows the correct account after a cold start.
 * - On sign-out: clears the user from the store.
 */
function FirebaseAuthSync() {
  const setUser = useStore((s) => s.setUser);

  useEffect(() => {
    // Warm up the backend container
    try {
      fetch(`${BASE}/api/health`).catch(() => {});
    } catch {
      // silent
    }

    // Hydrate store from SecureStore on first render (before Firebase resolves)
    getStoredUser<any>()
      .then((stored) => {
        if (stored && !useStore.getState().user) {
          setUser(stored);
        }
      })
      .catch(() => {});

    // Subscribe to Firebase auth state changes — this is the canonical source of truth.
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        // Firebase confirmed sign-out; clear the store if it still has a user.
        if (useStore.getState().user) {
          setUser(null);
        }
        return;
      }

      // Firebase confirmed a signed-in user.
      // Only update the store if it's empty to avoid overwriting a freshly-set user.
      if (!useStore.getState().user) {
        const cleanEmail = (fbUser.email || '').trim().toLowerCase();
        const syntheticUser = {
          id: fbUser.uid,
          uid: fbUser.uid,
          name: fbUser.displayName || cleanEmail.split('@')[0] || 'Customer',
          email: cleanEmail,
          avatar: fbUser.photoURL || '',
          phone: fbUser.phoneNumber || '',
          role: 'customer',
          isVerified: true,
        } as any;
        setUser(syntheticUser);

        // Persist so the app survives a cold restart without a network round-trip
        try {
          const token = await fbUser.getIdToken();
          await saveSession(token, syntheticUser);
        } catch {
          // Non-fatal
        }
      }
    });

    return () => unsubscribe();
  }, [setUser]);

  return null;
}

export default function Layout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <FirebaseAuthSync />
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
              options={{ animation: 'slide_from_bottom', animationDuration: 300 }}
            />
            <Stack.Screen
              name="cart"
              options={{ animation: 'slide_from_bottom', animationDuration: 280 }}
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
              options={{ animation: 'slide_from_bottom', animationDuration: 280 }}
            />
            <Stack.Screen name="auth/register" options={{ animation: 'slide_from_right' }} />
          </Stack>
        </QueryClientProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}
