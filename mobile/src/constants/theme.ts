/**
 * DHANVIKK BLOOMS & EXPORTS - Haute Floriculture Luxury Design System
 * Grounded in StitchMCP: "Dhanvikk Luxury Floriculture" Design Specification
 */

export const colors = {
  // Botanical Gallery Commerce Core Palette (Prompt Section 5)
  primary: '#E91E63', // Primary blossom pink
  primaryDeep: '#C2185B', // Deep magenta
  deepMagenta: '#C2185B', // Deep magenta
  accent: '#C2185B', // Rich deep magenta brand accent (matching palette)
  warmGold: '#C2185B', // Deep rose matching accent
  accentMuted: '#AD1457',
  accentLight: '#FCE4EC', // Soft blush
  bloomAccent: '#F23878', // Bloom accent
  softBlush: '#FCE4EC', // Soft blush
  palePink: '#FFF3F6', // Pale pink background
  blush: '#FCE4EC',
  blushDeep: '#F8BBD0',
  pale: '#FFF3F6',
  primaryLight: '#FCE4EC',
  primarySubtle: '#FFF3F6',

  // Secondary Botanical Accent
  secondary: '#2E7D32', // Forest Botanical Flora Green
  secondaryLight: '#E8F5E9',
  secondaryDeep: '#1B5E20',

  // Tertiary Accents
  gold: '#E91E63',
  yellowGold: '#C2185B',
  starYellow: '#E91E63', // Blossom rose rating star (matching brand palette)
  starGreen: '#2E7D32',
  starGreenBg: '#E8F5E9',

  // Canvas & Surfaces
  canvas: '#FAF7F8', // Subtle surface
  background: '#FFFFFF', // Primary background
  mainBackground: '#FFFFFF',
  surface: '#FAF7F8', // Subtle surface
  surfaceContainer: '#FFF3F6', // Pale pink container
  surfaceVariant: '#FCE4EC',
  cardBg: '#FFFFFF',
  softBg: '#FAF7F8',
  white: '#FFFFFF',

  // Typography & Neutrals
  ink: '#272126', // Main text
  primaryText: '#272126',
  inkLight: '#4A4148',
  secondaryText: '#756C72', // Secondary text
  muted: '#756C72', // Secondary text
  mutedLight: '#A399A0',
  mutedXLight: '#D9D2D6',

  // Borders & Fine Lines
  border: '#EEE5E9', // Border
  line: '#EEE5E9',
  lineLight: '#F5EFF2',
  lineGold: 'rgba(233, 30, 99, 0.15)', // Delicate matching rose hairline border

  // States & Indicators
  reeferGreen: '#2E7D32',
  reeferGreenBg: '#E8F5E9',
  discountGreen: '#2E7D32',
  dealOrange: '#E65100',
  success: '#2E7D32',
  warning: '#E91E63',
  danger: '#E91E63',
  error: '#D32F2F',

  // Backwards-Compatible Aliases
  primaryBlush: '#FCE4EC',
  bloomPink: '#E91E63',
  bloom: '#E91E63',
};

export const shadows = {
  soft: {
    shadowColor: '#3A1E25',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    shadowColor: '#3A1E25',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  goldGlow: {
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  elevated: {
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 36,
};

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  xxl: 30,
  pill: 999,
  full: 9999,
};

export const layout = {
  maxContentWidth: 1200,
  tabletBreakpoint: 600,
  largeTabletBreakpoint: 900,
};

export const typography = {
  titleHero: { fontSize: 26, fontWeight: '900' as const, letterSpacing: 0.3 },
  titleSection: { fontSize: 18, fontWeight: '800' as const, letterSpacing: 0.2 },
  titleCard: { fontSize: 14, fontWeight: '700' as const },
  bodyRegular: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  bodyMedium: { fontSize: 13, fontWeight: '600' as const },
  caption: { fontSize: 11, fontWeight: '500' as const, letterSpacing: 0.2 },
  badge: { fontSize: 9.5, fontWeight: '800' as const, letterSpacing: 0.4 },
};

export default {
  colors,
  shadows,
  spacing,
  radius,
  layout,
  typography,
};
