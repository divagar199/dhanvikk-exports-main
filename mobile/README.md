# Dhanvikk Blooms Mobile

Expo React Native client for the existing Dhanvikk Node/Express API.

Stack: Expo SDK 58, Expo Router, TypeScript, TanStack Query, Zustand, SecureStore, expo-image, expo-location, react-native-maps and native Razorpay.

API defaults to https://dhanvikk-exports-api.onrender.com and can be overridden with EXPO_PUBLIC_API_URL.

Install:
cd mobile
npm install
npx expo install --fix

Run UI:
npx expo start

Because Razorpay is a native module, use a development build/EAS build rather than Expo Go. Razorpay's current React Native package has Expo installation guidance and v3 includes React Native New Architecture support. After installing it, prebuild/build the native app.

Production backend requirements:
- keep JWT/Razorpay/SMTP secrets only in server environment variables
- calculate payable totals server-side from trusted product data
- require authentication for orders/payments
- verify every Razorpay signature before creating an order
- add secure Firebase/Google token verification before enabling social login
- remove demo/in-memory production fallbacks
