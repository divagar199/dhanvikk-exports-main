import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { colors } from '@/constants/theme';

interface BrandHeaderTitleProps {
  showLogo?: boolean;
  onPress?: () => void;
  align?: 'left' | 'center';
}

export const BrandHeaderTitle = memo(function BrandHeaderTitle({
  showLogo = true,
  onPress = () => router.push('/(tabs)/home'),
  align = 'left',
}: BrandHeaderTitleProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        s.container,
        align === 'center' && s.containerCenter,
        pressed && s.pressed,
      ]}
      onPress={onPress}
      hitSlop={6}
    >
      {showLogo && (
        <Image
          source={require('@/assets/logo.png')}
          style={s.logo}
          contentFit="contain"
          transition={150}
        />
      )}
      <View style={[s.textCol, align === 'center' && s.textColCenter]}>
        <Text style={s.brandTitle}>DHANVIKK</Text>
        <Text style={s.brandSubtitle}>Blooms and Exports</Text>
      </View>
    </Pressable>
  );
});

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  containerCenter: {
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.canvas,
  },
  textCol: {
    justifyContent: 'center',
  },
  textColCenter: {
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 1.1,
    lineHeight: 18,
  },
  brandSubtitle: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.secondary,
    letterSpacing: 0.5,
    lineHeight: 12,
  },
});
