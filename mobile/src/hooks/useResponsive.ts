import { useWindowDimensions } from 'react-native';

export interface ResponsiveInfo {
  width: number;
  height: number;
  isTablet: boolean;
  isLargeTablet: boolean;
  isLandscape: boolean;
  columns: number;
  containerPadding: number;
  maxContentWidth: number;
  cardWidth: number;
}

/**
 * Clean responsive layout hook for Dhanvikk Mobile & Tablet
 * Adapts phone (portrait/landscape), foldable devices, and small/large tablets.
 */
export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();

  const isLandscape = width > height;
  const isTablet = width >= 600;
  const isLargeTablet = width >= 900;

  // Grid columns for product and occasion showcases
  const columns = isLargeTablet ? 4 : isTablet ? 3 : 2;

  // Outer gutters
  const containerPadding = isLargeTablet ? 32 : isTablet ? 24 : 14;
  const maxContentWidth = 1200;

  // Dynamic card width calculation considering gutters and column gaps
  const availableWidth = Math.min(width, maxContentWidth) - containerPadding * 2;
  const gap = 12;
  const cardWidth = Math.floor((availableWidth - (columns - 1) * gap) / columns);

  return {
    width,
    height,
    isTablet,
    isLargeTablet,
    isLandscape,
    columns,
    containerPadding,
    maxContentWidth,
    cardWidth,
  };
}
