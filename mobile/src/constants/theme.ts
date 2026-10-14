/**
 * DHANVIKK BLOOMS & EXPORTS - Haute Floriculture Luxury Design System
 * Grounded in StitchMCP: "Dhanvikk Luxury Floriculture" Design Specification
 */

export const colors = {
  // Stitch Luxury Floriculture Core Palette
  primary: '#7A1D36', // Imperial Bloom wine rose
  primaryDeep: '#5C0B1D', // Regal Deep Maroon
  primaryLight: '#F3D8DE', // Soft Rose Mist
  primarySubtle: '#FBF0F2', // Translucent Rose Silk

  // Secondary Botanical Palette
  secondary: '#1E3F20', // Forest Flora Nilgiri Green
  secondaryLight: '#E8F3EA', // Botanical Mist
  secondaryDeep: '#112513',

  // Tertiary Accents
  accent: '#D4AF37', // Champagne Gold
  accentLight: '#FCF7E9', // Warm Gold Cream
  accentMuted: '#B89730', // Antique Gold
  gold: '#D4AF37',
  warmGold: '#D4AF37',
  yellowGold: '#D4AF37',
  starYellow: '#D4AF37',
  starGreen: '#1E3F20',
  starGreenBg: '#E8F3EA',

  // Canvas & Surfaces (Avoiding clinical pure white)
  canvas: '#FDFBF7', // Natural Soft Ivory Parchment
  background: '#FDFBF7',
  mainBackground: '#FDFBF7',
  surface: '#FFFFFF',
  cardBg: '#FFFFFF',
  softBg: '#F8F4EE',
  surfaceContainer: '#F7F2EC', // Subtle warm container
  surfaceVariant: '#EFEAE2',

  // Typography & Neutrals
  ink: '#1A1A1A', // Obsidian Onyx (Rich deep black)
  inkLight: '#383536',
  primaryText: '#1A1A1A',
  secondaryText: '#666062',
  muted: '#666062', // Refined Warm Charcoal
  mutedLight: '#9E9799',
  mutedXLight: '#D1CACD',

  // Borders & Fine Lines
  line: '#ECE5DE', // Fine-line warm border
  lineLight: '#F4EFEA',
  lineGold: 'rgba(212, 175, 55, 0.35)',
  border: '#ECE5DE',

  // Telemetry & Indicators
  reeferGreen: '#107C41',
  reeferGreenBg: '#E6F4EA',
  dealOrange: '#C65102',
  flipkartBlue: '#7A1D36', // Replaced legacy blue with Imperial Bloom
  discountGreen: '#1E3F20',

  // Backwards-Compatible Aliases
  primaryBlush: '#F3D8DE',
  bloomPink: '#7A1D36',
  deepMagenta: '#5C0B1D',
  softBlush: '#FBF0F2',
  bloom: '#7A1D36',
  blush: '#F3D8DE',
  blushDeep: '#EABDC6',
  pale: '#FBF0F2',

  // States
  success: '#1E3F20',
  danger: '#7A1D36',
  error: '#BA1A1A',
  white: '#FFFFFF',
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
    shadowColor: '#D4AF37',
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
