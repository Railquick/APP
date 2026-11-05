---
name: Berth Express Quick-Commerce
colors:
  surface: '#effdf0'
  surface-dim: '#cfded1'
  surface-bright: '#effdf0'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#e9f7ea'
  surface-container: '#e3f2e5'
  surface-container-high: '#deecdf'
  surface-container-highest: '#d8e6d9'
  on-surface: '#121e16'
  on-surface-variant: '#3e4a3e'
  inverse-surface: '#27332b'
  inverse-on-surface: '#e6f4e7'
  outline: '#6e7a6d'
  outline-variant: '#bdcabb'
  surface-tint: '#006d31'
  primary: '#006b2f'
  on-primary: '#ffffff'
  primary-container: '#00873e'
  on-primary-container: '#f7fff3'
  inverse-primary: '#6cdd86'
  secondary: '#006d34'
  on-secondary: '#ffffff'
  secondary-container: '#95f4aa'
  on-secondary-container: '#007237'
  tertiary: '#755b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#cea730'
  on-tertiary-container: '#503d00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#88faa0'
  primary-fixed-dim: '#6cdd86'
  on-primary-fixed: '#00210a'
  on-primary-fixed-variant: '#005323'
  secondary-fixed: '#98f7ad'
  secondary-fixed-dim: '#7cda93'
  on-secondary-fixed: '#00210b'
  on-secondary-fixed-variant: '#005226'
  tertiary-fixed: '#ffe08f'
  tertiary-fixed-dim: '#ebc24a'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#584400'
  background: '#effdf0'
  on-background: '#121e16'
  surface-variant: '#d8e6d9'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 0.75rem
  gutter-desktop: 1.25rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The design system establishes a high-velocity, ultra-dependable railway quick-commerce interface engineered specifically for passengers ordering essentials directly to their coach and seat. The experience borrows the brisk utility and tactile delight of modern quick-commerce leaders (Blinkit, Zepto, Instamart) while addressing the time-sensitive realities of railway transit—such as train halt countdowns, spotty connectivity, and complex coach/seat addressing.

The aesthetic blends **Modern Quick-Commerce Utility** with **Tactile Soft Surfaces**:
- **Clarity over Clutter:** Bold typographic hierarchy and crisp status badges provide instant legibility on moving trains under direct sunlight.
- **Urgent Reassurance:** High-contrast greens and energetic yellows signal speed, fresh items, and prompt delivery windows, eliminating passenger anxiety around train departures.
- **Physical Seat Awareness:** Dedicated spatial badges for train coach codes (e.g., `B4 - Berth 42`) and upcoming station halts treat location data as a primary navigation anchor.

## Colors

The color system delivers high visibility, quick comprehension, and clear feedback states:

- **Primary Green (`#159447`):** The engine of the UI. Drives high-confidence actions, active delivery timelines, add-to-cart counters, and primary call-to-actions.
- **Dark Green (`#08763A`):** Used for pressed states, critical structural containers (sticky bottom checkout carts), and deep brand emphasis.
- **Light Green Surface (`#E9F8EF`):** An airy tint for badges, selected chip backgrounds, and micro-promotional banners.
- **Accent Yellow (`#FFD45A`):** The quick-commerce speed badge color (e.g., "⚡ 5-Min Station Delivery", flash sales, and active halt timers). Contrasts sharply against deep slate text (`#17231B`).
- **Surface Canvas (`#FFFFFF` & `#F6F8F6`):** Pure white serves as the foreground product card tile, while `#F6F8F6` cushions background groupings to maintain edge contrast without heavy borders.
- **Typography Neutrals:** Headings and primary copy use `#17231B` for readability; secondary and auxiliary metadata use `#7C8980`.

## Typography

The pairing combines the rounded energy of **Plus Jakarta Sans** for headlines and high-priority metrics with the neutral legibility of **Inter** for data tables, seat allocation numbers, and ingredient lists.

- **Numerics & Pricing:** Prices, item tallies, and station ETA timers are set in Plus Jakarta Sans SemiBold/Bold for instant recognition during rapid scrolling.
- **Coach & Berth Coordinates:** Rendered in `label-md` or `label-sm` with slight uppercase tracking to distinguish physical delivery metadata from standard catalog items.

## Layout & Spacing

A mobile-first layout optimized for single-thumb ergonomics:

- **Mobile Viewport (<= 480px):** Single-column dynamic feed with 2-column or 3-column product thumbnail carousels. Canvas margin is locked at `1rem` (16px), with `0.75rem` (12px) horizontal gutters between card items to maximize display real estate.
- **Tablet & Split-Screen (481px - 1024px):** Fixed-center max-width of 640px, keeping thumb zones tight for handheld train travel.
- **Bottom Anchor Sheet:** Floating interactive safe zone reserved for the persistent Cart / Berth Confirmation drawer (height: 72px) padded by `1rem` from screen bottom edges.

## Elevation & Depth

Visual hierarchy uses clean surface separation and soft, colored ambient shadows:

- **Level 0 (Base Canvas):** `#F6F8F6` background. Flat, zero elevation.
- **Level 1 (Card & Product Tiles):** Solid `#FFFFFF` cards featuring an ambient drop shadow: `0px 4px 16px -2px rgba(23, 35, 27, 0.04)`. Outlines are minimal (`1px solid rgba(23, 35, 27, 0.05)`).
- **Level 2 (Interactive Floating Modules & Badges):** Active quantity selectors, category chips, and search bars use `0px 8px 24px -4px rgba(21, 148, 71, 0.08)`.
- **Level 3 (Sticky Bottom Bar & Modal Sheets):** High tactile presence. Elevated with `0px -8px 30px rgba(23, 35, 27, 0.08)`, creating depth over scrollable content.

## Shapes

The design system enforces a friendly, modern roundedness curve (`roundedness: 2`):

- **Default Elements (`0.5rem` / 8px):** Form inputs, delivery station pills, micro badges, and quantity increment steppers.
- **Containers & Cards (`rounded-lg` - `1rem` / 16px):** Primary product cards, category banners, station arrival trackers, and bottom sheets.
- **Hero & Promotional Units (`rounded-xl` - `1.5rem` / 24px):** Featured train pantry deals, delivery milestone cards, and checkout summaries.
- **Pill Counters:** Steppers (`+ / -`) and active filter pills use full pill radius (`9999px`) to invite touch.

## Components

### Buttons & Steppers
- **Primary CTA:** Solid `#159447` background, pure white text, font `label-lg`, height 48px, radius `0.5rem`. Subtle press scale `0.98`.
- **Quantity Stepper ("ADD"):** Starts as a white-bordered pill with green text (`#159447`). On activation, transforms smoothly into a solid green pill with white `−`, count, and `+` triggers.

### Cards
- **Product Card:** White `#FFFFFF` container with `rounded-lg` (16px), 8px inner padding, soft image container on `#F6F8F6`, bold pricing alongside strike-through MRP, and a top-left ETA micro badge (`⚡ 5 mins`).
- **Berth & Coach Header Card:** Sticky context bar showing Train Number, Coach (e.g., `S3`), and Berth (e.g., `45`), paired with next-station countdown timer.

### Chips & Badges
- **Delivery Badge:** Pill shape, `#FFD45A` background with `#17231B` bold text for ultra-urgent platform halts; `#E9F8EF` with `#159447` for standard in-seat fulfillment.
- **Category Filter Chips:** Horizontal scrolling pills, height 36px, soft grey stroke, turning solid green with white text when active.

### Form Inputs
- **Seat/Berth Verification Input:** 52px height, soft container background `#FFFFFF`, border `1.5px solid #E9F8EF`, active focus ring in `#159447`. Coach selector includes quick-tap suggestions (`A1`, `B1`, `S1`, etc.).