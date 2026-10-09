# Dhanvikk Blooms & Exports — Mobile Application

Official React Native + Expo luxury mobile application for **Dhanvikk Blooms & Exports**, engineered around the **"Botanical Gallery Commerce"** design philosophy.

---

## 🌸 Overview

The Dhanvikk Blooms mobile application is a high-end luxury flower commerce experience designed for iOS and Android:
- **90% Neutral Pacing**: `#FFFAFC` app background and `#FFFFFF` cards, letting rich editorial floral imagery lead each screen.
- **Signal-First Color System**: `#E91E63` (Primary) and `#C2185B` (Deep Primary) strictly reserved for primary actions, active navigation states, and essential accents. Warm Gold (`#FFB400`) strictly reserved for ratings and micro-badges.
- **Zero Anti-Patterns**: No mock review generation, no hardcoded unverified client prices, no insecure AsyncStorage auth token storage, no dead buttons or mock navigation.

---

## 📱 Architecture & Tech Stack

```text
mobile/
├── assets/images/              # Brand mark, icons, splash assets
├── src/
│   ├── app/                    # Expo Router file-based routes
│   │   ├── _layout.tsx         # Root stack layout (Fonts, QueryClient, Auth)
│   │   ├── index.tsx           # Luxury animated splash screen
│   │   ├── onboarding.tsx      # 4-slide botanical first launch experience
│   │   ├── (tabs)/             # 5 core destinations
│   │   │   ├── _layout.tsx     # Custom tab bar with active indicator & bag badge
│   │   │   ├── home.tsx        # Botanical Gallery Home (Hero, Bento, Bestsellers)
│   │   │   ├── shop.tsx        # The Flower Edit with category filters & sort
│   │   │   ├── categories.tsx  # Editorial collection explorer
│   │   │   ├── cart.tsx        # Interactive Bag with receipt breakdown
│   │   │   └── account.tsx     # Profile dashboard, orders shortcut, settings
│   │   ├── product/[id].tsx    # Immersive PDP with date & time slot pickers
│   │   ├── search.tsx          # Debounced instant search & trending tags
│   │   ├── filters.tsx         # Multi-criteria modal filter
│   │   ├── wishlist.tsx        # "Saved Blooms" with optimistic sync
│   │   ├── checkout/
│   │   │   ├── index.tsx       # 3-step animated checkout (Address, Slot, Payment)
│   │   │   └── success.tsx     # Blossoming petals order confirmation
│   │   ├── orders/
│   │   │   ├── index.tsx       # Orders list with milestone filter tabs
│   │   │   └── [id].tsx        # Real-time visual milestone tracking timeline
│   │   ├── addresses.tsx       # Delivery address manager
│   │   ├── notifications.tsx   # Categorized floral notices
│   │   ├── profile.tsx         # Profile preferences & contact updates
│   │   ├── settings.tsx        # Haptic & notification controls
│   │   ├── help.tsx            # Concierge care & care FAQs
│   │   ├── about.tsx           # Botanical heritage & farm origins
│   │   └── auth/               # Sign In, Registration, Password recovery
│   ├── components/             # Reusable Design System components
│   ├── services/               # Centralized Axios API client & endpoints
│   ├── store/                  # Zustand persistent client stores
│   ├── theme/                  # Master design tokens (Colors, Radius, Spacing, Typography)
│   └── types/                  # TypeScript data models
```

---

## 🚀 Running the App

### Prerequisites
- Node.js (>= 20)
- npm or yarn

### Commands

From the workspace root:
```bash
# Start all services (Backend, Web Frontend, and Expo Mobile)
npm run dev:all

# Start mobile only
npm run dev:mobile
```

Or directly inside the `mobile` folder:
```bash
cd mobile

# Start Expo development server (scan QR code in Expo Go app)
npm start

# Run on Android emulator / device
npm run android

# Run on iOS simulator (macOS required)
npm run ios

# Run web preview
npm run web

# TypeScript validation
npx tsc --noEmit
```

---

## 🔒 Security & Backend Integration

- **Secure Token Storage**: Authentication tokens use **Expo SecureStore** with hardware-backed encryption.
- **Server Verification**: Product prices, stocks, and totals are computed and verified server-side.
- **Cryptographic Payments**: Integrates native Razorpay orders with server-side HMAC-SHA256 signature verification via `/api/payment/verify-payment`.
