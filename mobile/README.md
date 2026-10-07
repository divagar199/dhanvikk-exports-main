# Dhanvikk Blooms Mobile

Expo React Native frontend for the existing Dhanvikk Node.js backend.

## Core
- Expo Router + TypeScript
- Existing Express/Mongoose API as server source of truth
- React Query for server state
- Zustand for cart/wishlist state
- SecureStore for authentication
- SQLite for offline cache
- Expo Location + react-native-maps for delivery location
- EAS for development, preview and production builds

## Offline
Cached products, cart and wishlist remain available offline. Checkout, authentication and payment confirmation require network access.

## Run
cd mobile
npm install
npx expo start

Before store builds, set EXPO_PUBLIC_API_URL and EXPO_PUBLIC_GOOGLE_MAPS_API_KEY.