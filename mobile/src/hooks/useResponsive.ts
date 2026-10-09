import { useWindowDimensions } from 'react-native';
import { Spacing } from '../theme';

export interface ResponsiveLayout {
  width: number;
  height: number;
  isLandscape: boolean;
  isTablet: boolean;
  numColumns: number;
  gridItemWidth: number;
  gridGap: number;
  screenPadding: number;
}

export function useResponsive(): ResponsiveLayout {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isTablet = Math.min(width, height) >= 600;

  // Responsive columns for product grids:
  // - Mobile Portrait (< 600px): 2 columns
  // - Mobile Landscape / Small Tablet (600px - 899px): 3 columns
  // - Large Tablet / Desktop (>= 900px): 4 columns
  const numColumns = width >= 900 ? 4 : width >= 600 ? 3 : 2;
  const gridGap = 12;
  const screenPadding = Spacing.screenPadding;
  const availableWidth = Math.max(0, width - screenPadding * 2);
  const gridItemWidth = Math.floor(
    (availableWidth - (numColumns - 1) * gridGap) / numColumns
  );

  return {
    width,
    height,
    isLandscape,
    isTablet,
    numColumns,
    gridItemWidth,
    gridGap,
    screenPadding,
  };
}

export default useResponsive;
