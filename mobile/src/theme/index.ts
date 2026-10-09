import { Platform } from 'react-native';

export const Colors = {
  primary: '#E91E63',
  primaryDeep: '#C2185B',
  bloom: '#F23878',
  blush: '#FCE4EC',
  palePink: '#FFF3F6',
  gold: '#FFB400',
  text: '#241B1F',
  textSecondary: '#756B70',
  background: '#FFFAFC',
  surface: '#FFFFFF',
  border: '#EDE6E9',
  success: '#16805B',
  error: '#C62828',
  warning: '#ED8B00',
  white: '#FFFFFF',
  overlay: 'rgba(36, 27, 31, 0.40)',
  tintedSurface: '#FFF3F6',
  skeletonBase: '#F4ECEF',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  section: 32,
  huge: 40,
  massive: 56,
  screenPadding: 20,
  cardPadding: 16,
} as const;

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
  chip: 999,
  input: 14,
  button: 16,
  card: 20,
  image: 16,
  bottomSheet: 28,
  modal: 24,
  round: 999,
} as const;

export const Typography = {
  fonts: {
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    semiBold: 'Poppins-SemiBold',
    bold: 'Poppins-Bold',
    serif: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      web: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
      default: 'serif',
    }),
  },
  display: {
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -0.5,
    fontFamily: 'Poppins-SemiBold',
  },
  h1: {
    fontSize: 28,
    lineHeight: 36,
    fontFamily: 'Poppins-SemiBold',
  },
  h2: {
    fontSize: 22,
    lineHeight: 30,
    fontFamily: 'Poppins-SemiBold',
  },
  h3: {
    fontSize: 18,
    lineHeight: 26,
    fontFamily: 'Poppins-Medium',
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    fontFamily: 'Poppins-Regular',
  },
  bodySm: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.2,
    fontFamily: 'Poppins-Medium',
  },
  button: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Poppins-SemiBold',
  },
  price: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: 'Poppins-SemiBold',
  },
  heroPrice: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: 'Poppins-SemiBold',
  },
  editorialHero: {
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.3,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      web: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
      default: 'serif',
    }),
    fontStyle: 'italic' as const,
  },
  editorialKicker: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.2,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      web: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
      default: 'serif',
    }),
    fontStyle: 'italic' as const,
  },
} as const;

export const Shadows = {
  sm: Platform.select({
    web: {
      boxShadow: '0 2px 8px rgba(194, 24, 91, 0.06)',
    },
    default: {
      shadowColor: '#C2185B',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
  }) as any,
  md: Platform.select({
    web: {
      boxShadow: '0 6px 20px rgba(194, 24, 91, 0.10)',
    },
    default: {
      shadowColor: '#C2185B',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 4,
    },
  }) as any,
  lg: Platform.select({
    web: {
      boxShadow: '0 -8px 32px rgba(36, 27, 31, 0.10)',
    },
    default: {
      shadowColor: '#241B1F',
      shadowOffset: { width: 0, height: -8 },
      shadowOpacity: 0.1,
      shadowRadius: 32,
      elevation: 8,
    },
  }) as any,
  halo: Platform.select({
    web: {
      boxShadow: '0 0 0 3px rgba(233, 30, 99, 0.12)',
    },
    default: {
      shadowColor: '#E91E63',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 3,
    },
  }) as any,
};

export const Motion = {
  instant: 120,
  fast: 180,
  base: 260,
  slow: 350,
  spring: {
    damping: 18,
    stiffness: 180,
    mass: 1,
  },
  sheetSpring: {
    damping: 22,
    stiffness: 220,
  },
} as const;

export const Theme = {
  colors: Colors,
  spacing: Spacing,
  radius: Radius,
  typography: Typography,
  shadows: Shadows,
  motion: Motion,
};

export default Theme;
