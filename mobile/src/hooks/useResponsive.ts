import { useWindowDimensions } from 'react-native';
import { Spacing } from '../theme';

export interface ResponsiveLayout {
  width: number;
  height: number;
  isLandscape: boolean;
  isTablet: boolean;
  isSmallPhone: boolean;
  numColumns: number;
  gridItemWidth: number;
  gridGap: number;
  screenPadding: number;
  maxContentWidth: number;
  containerStyle: {
    maxWidth: number;
    width: '100%';
    alignSelf: 'center';
  };
}

export function useResponsive(): ResponsiveLayout {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isTablet = Math.min(width, height) >= 600 || width >= 768;
  const isSmallPhone = width < 375;

  // Responsive columns for product grids:
  // - Small Phone (< 360px): 2 columns
  // - Mobile Portrait (360px - 599px): 2 columns
  // - Mobile Landscape / Small Tablet (600px - 899px): 3 columns
  // - Large Tablet / iPad / Desktop (>= 900px): 4 columns
  const numColumns = width >= 900 ? 4 : width >= 600 ? 3 : 2;
  const gridGap = isTablet ? 16 : 12;
  const maxContentWidth = isTablet ? Math.min(width, 1140) : width;
  const screenPadding = isTablet ? 24 : Spacing.screenPadding;

  const contentWidth = Math.min(width, maxContentWidth);
  const availableWidth = Math.max(0, contentWidth - screenPadding * 2);
  const gridItemWidth = Math.floor(
    (availableWidth - (numColumns - 1) * gridGap) / numColumns
  );

  return {
    width,
    height,
    isLandscape,
    isTablet,
    isSmallPhone,
    numColumns,
    gridItemWidth,
    gridGap,
    screenPadding,
    maxContentWidth,
    containerStyle: {
      maxWidth: 1140,
      width: '100%',
      alignSelf: 'center',
    },
  };
}

export default useResponsive;
