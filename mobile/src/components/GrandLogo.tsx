import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Colors } from '../theme';
import { AppText } from './AppText';

export interface GrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  layout?: 'horizontal' | 'vertical';
  height?: number;
  width?: number;
  onPress?: () => void;
  showSubtitle?: boolean;
  subtitleText?: string;
  light?: boolean;
  style?: ViewStyle;
}

const VERTICAL_SIZE_MAP = {
  xs: { height: 26, width: 22 },
  sm: { height: 34, width: 28 },
  md: { height: 44, width: 36 },
  lg: { height: 64, width: 52 },
  xl: { height: 84, width: 68 },
};

const HORIZONTAL_SIZE_MAP = {
  xs: { iconSize: 26, titleSize: 13, subtitleSize: 8, gap: 6 },
  sm: { iconSize: 32, titleSize: 15, subtitleSize: 8.5, gap: 8 },
  md: { iconSize: 38, titleSize: 17, subtitleSize: 9.5, gap: 9 },
  lg: { iconSize: 48, titleSize: 20, subtitleSize: 11, gap: 10 },
  xl: { iconSize: 60, titleSize: 26, subtitleSize: 13, gap: 12 },
};

const BRAND_LOGO_SOURCE = require('../../assets/images/dhanvikk-brand-logo.png');

export const GrandLogo: React.FC<GrandLogoProps> = ({
  size = 'md',
  layout = 'horizontal',
  height,
  width,
  onPress,
  showSubtitle = true,
  subtitleText = 'BLOOMS',
  light = false,
  style,
}) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/(tabs)/home');
    }
  };

  const renderContent = () => {
    if (layout === 'horizontal') {
      const hConfig = HORIZONTAL_SIZE_MAP[size] || HORIZONTAL_SIZE_MAP.sm;
      const iconDimension = height ?? hConfig.iconSize;

      return (
        <View style={[styles.horizontalContainer, { gap: hConfig.gap }]}>
          {/* Logo Icon on Left */}
          <View style={[styles.iconWrap, { width: iconDimension, height: iconDimension }]}>
            <Image
              source={BRAND_LOGO_SOURCE}
              style={{ width: iconDimension, height: iconDimension }}
              contentFit="contain"
              priority="high"
              transition={250}
              accessibilityLabel="Dhanvikk Blooms Brand Mark"
            />
          </View>

          {/* Brand Typography on Right */}
          <View style={styles.textWrap}>
            <AppText
              variant="h3"
              weight="bold"
              color={light ? Colors.white : Colors.text}
              style={[styles.brandTitle, { fontSize: hConfig.titleSize }]}
              numberOfLines={1}
            >
              DHANVIKK
            </AppText>
            {showSubtitle && (
              <AppText
                variant="caption"
                weight="semiBold"
                color={light ? 'rgba(255, 255, 255, 0.85)' : Colors.primaryDeep}
                style={[styles.brandSubtitle, { fontSize: hConfig.subtitleSize }]}
                numberOfLines={1}
              >
                {subtitleText}
              </AppText>
            )}
          </View>
        </View>
      );
    }

    // Vertical / Standalone Image Layout
    const vConfig = VERTICAL_SIZE_MAP[size] || VERTICAL_SIZE_MAP.md;
    const targetHeight = height ?? vConfig.height;
    const targetWidth = width ?? vConfig.width;

    return (
      <View style={styles.verticalContainer}>
        <Image
          source={BRAND_LOGO_SOURCE}
          style={{
            width: targetWidth,
            height: targetHeight,
          }}
          contentFit="contain"
          priority="high"
          transition={250}
          accessibilityLabel="Dhanvikk Blooms Brand Logo"
        />
        {showSubtitle && (
          <AppText
            variant="caption"
            color={light ? 'rgba(255, 255, 255, 0.85)' : Colors.primaryDeep}
            weight="semiBold"
            style={styles.verticalSubtitle}
          >
            {subtitleText}
          </AppText>
        )}
      </View>
    );
  };

  if (onPress !== undefined) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.85}
        style={[styles.root, style]}
        accessibilityRole="button"
        accessibilityLabel="Dhanvikk Blooms, Go to home"
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.root, style]}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  root: {
    justifyContent: 'center',
  },
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    justifyContent: 'center',
  },
  brandTitle: {
    letterSpacing: 1.4,
    lineHeight: 18,
  },
  brandSubtitle: {
    letterSpacing: 2.2,
    lineHeight: 12,
    marginTop: 1,
  },
  verticalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalSubtitle: {
    letterSpacing: 2.4,
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default GrandLogo;
