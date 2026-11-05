# 🚂 RailQuick

**India's first railway-focused quick-commerce mobile app — order essentials and get them hand-delivered to your train berth during station halts in under 5 minutes.**

Built with **React Native**, **Expo SDK 58**, and **TypeScript**.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Screenshots](#screenshots)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Application Flow](#application-flow)
- [Design System](#design-system)
- [Key Components Reference](#key-components-reference)
- [Data Models](#data-models)
- [State Management](#state-management)
- [Configuration](#configuration)
- [Available Scripts](#available-scripts)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

RailQuick solves a real problem for Indian train passengers — needing essentials (chargers, hygiene products, baby care, first aid) during a journey and having no reliable way to get them. The app connects passengers with **Station Dark Stores** positioned at railway platforms. When a train halts, a runner picks the ordered items and delivers them directly to the passenger's coach and berth — all within the halt window.

### How It Works

```
Passenger opens app → Enters PNR / Journey details → Browses product catalogue
→ Adds items to cart → Places order → Runner picks from Station Dark Store
→ Delivers to Coach B2, Berth 36 within 5 minutes of station halt
```

---

## Screenshots

The app has three screens:

| Splash Screen | Welcome / Auth Screen | Main Marketplace |
|:-:|:-:|:-:|
| Animated logo + train convoy | Green hero + Google sign-in | Full product catalogue |

---

## Features

### 🎬 Screen 1 — Animated Splash
- Animated RailQuick logo with pulsing orange arrow
- Moving vehicle convoy (train, charger product, Lays chips) crossing the screen
- Auto-transitions to the Welcome screen after 3.8 seconds

### 👋 Screen 2 — Welcome & Authentication
- Emerald green gradient hero section with RailQuick branding
- Rotating product showcase carousel
- Feature highlights (5-min delivery, berth delivery, station dark store, 100% refund)
- Google Sign-In button (mock — triggers navigation to home)
- Trust banner with security messaging

### 🛒 Screen 3 — Main Home / Quick-Commerce Marketplace
- **Fixed 3-row header**: Logo + PNR badge + station info + delivery time pill + search bar with animated placeholder + horizontal category filter chips
- **Promotional hero banner**: "5-Min Berth Delivery Guaranteed" with animated live dot
- **Station halt notification**: Amber pill showing scheduled arrival and halt duration
- **Product catalogue**: 15 products across 8 categories in multiple layout variants
- **Cart system**: Add/remove with quantity stepper, floating cart bar with live total
- **Product detail modal**: Slide-up bottom sheet with full product info
- **Berth Guarantee card**: 100% refund promise card
- **5-tab bottom navigation**: Home, Categories, Orders, Train Status, Profile

### Product Categories
| # | Category | Products | Layout |
|---|----------|----------|--------|
| 1 | Mobile Essentials | USB-C cable, 20W charger, wired earphones, 10K mAh power bank | 2-column grid |
| 2 | Women's Hygiene | Sanitary pads XL (7) | Horizontal card |
| 3 | Personal Hygiene | Hygiene kit, disposable seat covers, wet wipes | 3-column grid |
| 4 | Baby Care | Baby diapers (5), baby wipes (24) | 2-column grid |
| 5 | Sleep & Comfort | Inflatable neck pillow, eye mask + earplugs | 2-column grid |
| 6 | Travel Essentials | Mosquito repellent cream | Horizontal card |
| 7 | First Aid | First-aid pouch (no medicines) | Horizontal card |
| 8 | Travel Accessories | Berth chain lock with padlock | Horizontal card |

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| [Expo](https://expo.dev) | SDK 58 | Managed React Native workflow |
| [React Native](https://reactnative.dev) | 0.88.1 | Cross-platform mobile UI |
| [React](https://react.dev) | 19.3.0 | UI component library |
| [TypeScript](https://typescriptlang.org) | 6.0.3 | Static type checking |
| [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) | 4.7.1 | Animations (splash, transitions, search cursor) |
| [Expo Image](https://docs.expo.dev/versions/latest/sdk/image/) | 58.x | Optimised image rendering with caching |
| [Expo Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/) | 58.x | Gradient backgrounds (header, hero, cart bar) |
| [React Native SVG](https://github.com/software-mansion/react-native-svg) | 15.16.0 | Vector product illustrations and logo |
| [Lucide React Native](https://lucide.dev) | 1.68.0 | Icon library (200+ icons used throughout) |
| [React Native Safe Area Context](https://github.com/th3rdwave/react-native-safe-area-context) | 5.10.1 | Safe area insets for notch/gesture bar devices |

---

## Prerequisites

Before you begin, make sure you have:

- **Node.js** ≥ 18.x ([download](https://nodejs.org))
- **npm** ≥ 9.x (comes with Node.js)
- **Expo CLI** (installed globally or via `npx`)
- **Expo Go** app on your phone ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779)), **OR**
- **Android Emulator** with Android Studio and Android SDK configured, **OR**
- **iOS Simulator** (macOS only, requires Xcode)

### For Android Emulator

```bash
# Ensure ANDROID_HOME is set
export ANDROID_HOME=$HOME/Library/Android/sdk   # macOS
export ANDROID_HOME=$HOME/Android/Sdk           # Linux
export PATH=$ANDROID_HOME/platform-tools:$PATH

# Verify ADB is working
adb devices
```

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/RAILQUICK.git
cd RAILQUICK
```

### 2. Install Dependencies

```bash
npm install
```

> **Important**: Always use `npx expo install <package>` when adding new Expo-compatible packages. This ensures SDK version compatibility.

### 3. Start the Development Server

```bash
# Start with Metro bundler
npx expo start

# Or start and open directly on Android emulator
npx expo start --android

# Or start and open directly on iOS simulator (macOS only)
npx expo start --ios
```

### 4. Run on Device / Emulator

**Option A — Expo Go (Easiest)**
1. Start the dev server: `npx expo start`
2. Scan the QR code with Expo Go app on your phone

**Option B — Android Emulator**
```bash
# Start emulator (replace Pixel_7_API_34 with your AVD name)
emulator -avd Pixel_7_API_34

# Set up port forwarding
adb reverse tcp:8081 tcp:8081

# Start the app
npx expo start --android --port 8081
```

**Option C — iOS Simulator (macOS only)**
```bash
npx expo start --ios
```

### 5. Verify the Build

```bash
# TypeScript type check (should exit with 0 errors)
npx tsc --noEmit

# Lint the project
npx expo lint
```

---

## Project Structure

```
RAILQUICK/
│
├── App.tsx                          # Root component — SafeAreaProvider + AppNavigator
├── index.ts                         # Entry point — registerRootComponent(App)
├── app.json                         # Expo configuration (SDK 58, app name, icons)
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript config (extends expo/tsconfig.base)
├── metro.config.js                  # Metro bundler config (asset-registry fix)
├── .gitignore                       # Git ignore rules
├── .env.example                     # Environment variable template
├── LICENSE                          # MIT License
├── AGENTS.md                        # AI coding agent rules
│
├── assets/                          # Expo default app icons
│   ├── icon.png                     # App icon
│   ├── splash-icon.png              # Splash screen icon
│   ├── favicon.png                  # Web favicon
│   ├── android-icon-foreground.png  # Android adaptive icon foreground
│   ├── android-icon-background.png  # Android adaptive icon background
│   └── android-icon-monochrome.png  # Android monochrome icon
│
└── src/                             # All application source code
    │
    ├── assets/                      # Static assets
    │   ├── images/                  # App images (with @2x/@3x variants)
    │   │   ├── railquick_logo_base.png
    │   │   ├── railquick_arrow.png
    │   │   ├── railquick_logo.png
    │   │   └── train_ref.png
    │   │
    │   ├── products/                # Product images
    │   │   ├── anker_charger.png    # 20W USB-C charger photo
    │   │   ├── sanitary_pads.png    # Sanitary pads product photo
    │   │   ├── lays_chips.png       # Lays chips (splash animation)
    │   │   ├── logorailquick.png    # RailQuick logo placeholder
    │   │   ├── granola_bars.png
    │   │   ├── cough_syrup.png
    │   │   ├── crocin_tablets.png
    │   │   ├── daily_vitamins.png
    │   │   └── usb_hub.png
    │   │
    │   └── svg/                     # SVG components
    │       └── RailQuickLogoSvg.tsx # Vector RailQuick logo (green R + orange Q)
    │
    ├── screens/                     # Screen-level components (one per app screen)
    │   ├── SplashScreen.tsx         # Screen 1 — animated splash with vehicle convoy
    │   ├── WelcomeScreen.tsx        # Screen 2 — auth/onboarding with green hero
    │   └── HomeScreen.tsx           # Screen 3 — marketplace home with product catalogue
    │
    ├── navigation/                  # Navigation logic
    │   └── AppNavigator.tsx         # State machine: splash → welcome → home
    │                                # Cross-fade + slide-up animated transitions
    │
    ├── context/                     # React Context providers
    │   └── CartContext.tsx          # Shopping cart state (add, remove, quantity, totals)
    │
    ├── data/                        # Static data and type definitions
    │   ├── marketplaceData.ts       # 15 products, 8 categories, journey details, search terms
    │   └── products.ts             # Legacy product data (deprecated, kept for reference)
    │
    └── components/                  # Reusable UI components
        │
        │   ── Splash Screen Components ──
        ├── AnimatedLogo.tsx          # RailQuick logo with pulsing orange arrow animation
        ├── AnimatedTrain.tsx         # SVG animated train vehicle
        ├── AnimatedBus.tsx           # SVG animated bus vehicle  
        ├── AnimatedAuto.tsx          # SVG animated auto-rickshaw
        ├── AnimatedCharger.tsx       # SVG animated charger product
        ├── AnimatedLays.tsx          # SVG animated Lays chips product
        ├── TransportationConvoy.tsx  # Orchestrates the moving vehicle convoy
        │
        │   ── Welcome Screen Components ──
        ├── RailQuickHeader.tsx       # Logo + tagline header
        ├── HeroHeadline.tsx          # "Order at your berth" hero text
        ├── AnimatedProductShowcase.tsx # Rotating product cards carousel
        ├── WelcomePanel.tsx          # White bottom sheet: features + sign-in
        ├── FeatureCard.tsx           # Individual feature highlight card
        ├── GoogleSignInButton.tsx    # Google Sign-In button (mock)
        ├── TrustBanner.tsx           # "Your data is secured" trust badge
        ├── TermsFooter.tsx           # Terms & conditions footer links
        │
        └── marketplace/             # Marketplace / Home Screen Components
            ├── MarketplaceHeader.tsx      # Fixed 3-row header (brand, search, categories)
            ├── PromotionalHeroBanner.tsx  # "5-Min Berth Delivery" promotional banner
            ├── StationHaltNotifier.tsx    # Amber arrival/halt notification pill
            ├── MarketplaceProductCard.tsx # Product card (3 variants: grid-2, grid-3, horizontal)
            ├── ProductVisual.tsx          # Product image renderer (PNG or SVG vector)
            ├── ProductDetailModal.tsx     # Slide-up bottom sheet product detail
            ├── FloatingCartBar.tsx        # Persistent floating cart bar with live total
            ├── BerthGuaranteeCard.tsx     # "100% refund guarantee" card
            └── MarketplaceBottomNav.tsx   # 5-tab fixed bottom navigation bar
```

---

## Application Flow

### Navigation State Machine

The app uses a custom state-machine navigator (not React Navigation or Expo Router) for cinematic screen transitions:

```
┌─────────────┐    3.8s auto     ┌──────────────────────┐    Sign-in tap    ┌──────────────┐
│   SPLASH    │ ──────────────→  │ TRANSITIONING_WELCOME │ ────────────────→ │              │
│  (Screen 1) │   cross-fade +   │       WELCOME         │    cross-fade +   │     HOME     │
│             │   slide-up        │     (Screen 2)        │    slide-up       │  (Screen 3)  │
└─────────────┘                  └──────────────────────┘                   └──────────────┘
```

**Transition Details:**
- **Splash → Welcome**: Splash fades out (550ms), Welcome slides up from 30px + fades in (650ms)
- **Welcome → Home**: Welcome fades out (450ms), Home slides up from 25px + fades in (550ms)
- All animations use `react-native-reanimated` with cubic easing for smooth native-thread performance

### Screen Lifecycle

```
1. App mounts → SafeAreaProvider → AppNavigator
2. AppNavigator renders SplashScreen (z-index on top)
3. After 3.8s → cross-fade transition begins
4. SplashScreen fades out, WelcomeScreen fades + slides in
5. User taps "Sign in with Google" → handleSignInSuccess()
6. WelcomeScreen fades out, HomeScreen fades + slides in
7. HomeScreen renders: Header (fixed) + ScrollView (catalogue) + FloatingCartBar + BottomNav
```

---

## Design System

The app follows a strict design system documented in `DESIGN.md`.

### Colour Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Primary Green | `#159447` | Buttons, active states, cart bar, category pills |
| Dark Green | `#08763A` | Text accents, PNR badge text, delivery info |
| Light Green Surface | `#E9F8EF` | Tag chip backgrounds, surface highlights |
| Accent Yellow | `#FFD45A` | Price ticket badges, promotional accents |
| Main Canvas | `#F6F8F6` | Page background |
| Card Background | `#FFFFFF` | Product cards, panels |
| Primary Text | `#17231B` | Headings, product names |
| Secondary Text | `#7C8980` | Descriptions, metadata |

### Typography

| Font | Usage |
|------|-------|
| **Plus Jakarta Sans** | Headings, product names, prices, category titles, delivery metrics |
| **Inter** | Descriptions, metadata, coach/berth details, supporting text |

### Border Radii

| Element | Radius |
|---------|--------|
| Small controls | 8px |
| Product cards | 16–18px |
| Promotional banners | 20–24px |
| Pill-shaped badges | 999px (fully rounded) |

### Elevation / Shadows

| Element | Shadow |
|---------|--------|
| Product cards | `rgba(0,0,0,0.05)` offset 0,2 blur 8 |
| Search bar | `rgba(0,0,0,0.04)` subtle elevation |
| Floating cart | `rgba(21,148,71,0.38)` offset 0,8 blur 16 — strong green glow |
| Bottom navigation | `rgba(0,0,0,0.05)` offset 0,-3 blur 10 — top shadow |

---

## Key Components Reference

### `MarketplaceHeader` — Fixed 3-Row Header

The header stays pinned at the top while the product catalogue scrolls underneath.

**Row A — Brand & Journey Info** (3 sub-lines)
- Line 1: RailQuick SVG logo (left) + circular profile avatar button (right)
- Line 2: PNR badge with green border (left) + green gradient "⚡ 5 MINS" delivery pill (right)
- Line 3: Station name • Platform (Coach, Berth) with dropdown arrow (left) + "Train Halt: 12 min" text (right)

**Row B — Search Bar**
- Full-width rounded search input
- Animated placeholder that rotates every 2.8s: "USB-C cable" → "hygiene kit" → "neck pillow" → "diapers" → "power bank" → "sanitary pads"
- Blinking green cursor animation (Reanimated)
- Microphone and barcode scanner action icons

**Row C — Category Filter Pills**
- Horizontally scrollable category chips with icons
- Active: solid green with white text
- Inactive: category-specific pastel background with accent border
- 9 categories: All, Mobile, Women's Hygiene, Personal Hygiene, Baby, Sleep/Comfort, Travel Essentials, First Aid, Travel Accessories

### `MarketplaceProductCard` — 3 Layout Variants

Each card shows: product image, wishlist heart, weight pill, add button (or quantity stepper), price with dashed yellow coupon badge, strikethrough MRP, savings text, product title, feature tag chips, and 5-min delivery ETA.

| Variant | Usage | Layout |
|---------|-------|--------|
| `grid-2` | Mobile Essentials, Baby Care, Sleep & Comfort | 2-column grid, square image box on top |
| `grid-3` | Personal Hygiene | 3-column compact grid |
| `horizontal` | Women's Hygiene, Travel, First Aid, Accessories | Full-width horizontal card with image left |

### `ProductVisual` — Image Renderer

Renders either:
- **Local PNG image** (if `product.localImage` is set) using `expo-image`
- **SVG vector illustration** matched by `product.iconType` (cable, charger, battery, headphones, flower, med-bag, seat-cover, wipes, baby-carriage, water-wipes, pillow, eye-off, bug, firstaid, lock)

### `CartContext` — Shopping Cart State

```typescript
interface CartContextType {
  cart: Record<string, number>;      // productId → quantity
  totalCount: number;                // sum of all quantities
  totalPrice: number;                // sum of price × quantity
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
}
```

**Initial Cart State**: Pre-loaded with 3 items totalling ₹397:
- USB-C cable (₹149) × 1
- Travel hygiene kit (₹129) × 1
- First-aid pouch (₹119) × 1

---

## Data Models

### `ProductItem`

```typescript
interface ProductItem {
  id: string;              // Unique identifier (e.g. "prod-cable")
  name: string;            // Full product name
  shortName?: string;      // Abbreviated name for compact views
  category: string;        // Category ID (e.g. "mobile", "baby")
  price: number;           // Selling price in ₹
  mrp: number;             // Maximum retail price in ₹
  weight: string;          // Size/quantity label (e.g. "1 meter", "Pack of 7")
  badge?: string;          // Feature badge text (e.g. "BIS Certified")
  discountBadge?: string;  // Discount label (e.g. "50% OFF")
  deliveryTime: string;    // Estimated delivery (e.g. "5 MINS")
  description: string;     // Full product description
  iconType: string;        // SVG icon identifier for ProductVisual
  localImage?: any;        // require() PNG asset (overrides SVG)
  rating?: number;         // Product rating (e.g. 4.8)
  specs?: string;          // Additional specifications
  tags?: string[];         // Feature tags shown as chips (e.g. ["Braided", "60W PD"])
}
```

### `CategoryInfo`

```typescript
interface CategoryInfo {
  id: string;              // Unique category ID
  name: string;            // Display name
  icon: string;            // Material icon name
  subtitle: string;        // Category description
  itemCount: number;       // Number of products
  accentColor: string;     // Category theme colour
  bgColor: string;         // Pill background colour (inactive)
  borderColor: string;     // Pill border colour (inactive)
  layout: 'grid-2' | 'grid-3' | 'horizontal-list';
}
```

### `JOURNEY_DETAILS`

```typescript
const JOURNEY_DETAILS = {
  pnr: '2458-9102-36',
  trainName: 'Bhopal Express',
  station: 'Bhopal Jn',
  platform: 'Platform 1',
  coach: 'B2',
  berth: '36',
  deliveryMinutes: 5,
  haltMinutes: 12,
  scheduledArrivalMins: 18,
  haltDurationMins: 10,
};
```

---

## State Management

The app uses **React Context** for cart state and **local component state** (`useState`) for everything else. No external state management library (Redux, Zustand, etc.) is needed at this stage.

| State | Location | Scope |
|-------|----------|-------|
| Cart items & quantities | `CartContext` | Global (wraps HomeScreen) |
| Current screen | `AppNavigator` (useState) | App-level |
| Selected category | `HomeScreen` (useState) | Marketplace screen |
| Search term rotation | `MarketplaceHeader` (useState + useEffect) | Header |
| Product modal visibility | `HomeScreen` (useState) | Marketplace screen |
| Wishlist heart toggle | `MarketplaceProductCard` (useState) | Per card |
| Active bottom tab | `HomeScreen` (useState) | Marketplace screen |

---

## Configuration

### `app.json` — Expo Config

```json
{
  "expo": {
    "name": "RailQuick",
    "slug": "railquick",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "light",
    "plugins": ["expo-image"]
  }
}
```

### `metro.config.js` — Metro Bundler

Custom configuration to fix the `react-native/asset-registry` resolution issue in Expo SDK 58 / React Native 0.88:

```javascript
const config = getDefaultConfig(__dirname);

// Point asset registry to the actual file path inside react-native
config.transformer.assetRegistryPath = path.resolve(
  __dirname,
  'node_modules/react-native/src/asset-registry.js'
);
```

### Environment Variables (`.env.example`)

| Variable | Purpose |
|----------|---------|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Web client ID (for real auth) |
| `RAILKIT_API_KEY` | Indian Railways API key (for live train data) |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Backend database |
| `DELIVERY_STATIONS` | Active delivery station codes |
| `DELIVERY_FEE_PAISE` | Delivery fee in paise (3000 = ₹30) |
| `FREE_DELIVERY_ABOVE_PAISE` | Free delivery threshold (49900 = ₹499) |

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` / `npx expo start` | Start the Metro dev server |
| `npx expo start --android` | Start and open on Android emulator |
| `npx expo start --ios` | Start and open on iOS simulator |
| `npx expo start --web` | Start web version |
| `npx expo start -c` | Start with cleared Metro cache |
| `npx tsc --noEmit` | TypeScript type check (0 errors expected) |
| `npx expo lint` | Run ESLint |
| `npx expo-doctor` | Diagnose dependency and config issues |
| `npx expo install --fix` | Fix incompatible package versions |

### Running on Android Emulator (Step by Step)

```bash
# 1. Start the emulator
emulator -avd YOUR_AVD_NAME

# 2. Set up port forwarding
adb reverse tcp:8081 tcp:8081

# 3. Start Expo with Android target and cache clear
npx expo start --android -c --port 8081

# 4. If Expo Go doesn't launch automatically:
adb shell am start -a android.intent.action.VIEW -d "exp://127.0.0.1:8081"
```

---

## Troubleshooting

### `react-native/asset-registry could not be found`

This is a known issue with React Native 0.88 + Expo SDK 58. The `metro.config.js` in this project fixes it by explicitly setting `transformer.assetRegistryPath`. If the error persists after `npm install`:

```bash
# Copy the asset-registry file to the expected path
cp node_modules/react-native/src/asset-registry.js node_modules/react-native/asset-registry.js

# Clear Metro cache and restart
npx expo start -c
```

### `EPERM: operation not permitted` on Expo start

Expo needs write access to `~/.expo/`. Ensure permissions are correct:
```bash
chmod -R u+rw ~/.expo
```

### Metro bundler stuck / stale cache

```bash
# Clear all caches
npx expo start -c
# OR
rm -rf node_modules/.cache
npx expo start
```

### TypeScript errors after dependency update

```bash
npx expo install --fix    # Fix SDK-compatible versions
npx tsc --noEmit          # Verify
```

### Reanimated warnings about `value` during render

These are non-fatal warnings from React Native Reanimated's strict mode. They don't affect functionality. To suppress them, configure the Reanimated logger:
```typescript
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
configureReanimatedLogger({ level: ReanimatedLogLevel.warn, strict: false });
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run type checks: `npx tsc --noEmit`
5. Run lint: `npx expo lint`
6. Commit: `git commit -m "feat: add my feature"`
7. Push: `git push origin feature/my-feature`
8. Open a Pull Request

### Code Style Guidelines

- Use TypeScript strict mode
- Follow the design system colours and spacing from `DESIGN.md`
- Keep screen files in `src/screens/`, components in `src/components/`
- Use `react-native-reanimated` for animations (runs on native UI thread)
- Use `expo-image` instead of React Native's `Image` for product photos
- Use Lucide React Native icons instead of importing custom icon packs
- Always use `npx expo install` when adding new packages (ensures SDK compatibility)

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>🚂 RailQuick — Essentials delivered to your berth, before the train departs.</strong>
</p>

