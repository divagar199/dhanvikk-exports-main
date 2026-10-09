import React, { useState } from 'react';
import {
  Pressable,
  ActivityIndicator,
  Animated,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Radius, Spacing, Motion } from '../theme';
import { AppText } from './AppText';

export interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'normal' | 'small' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'normal',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const [scale] = useState(() => new Animated.Value(1));

  const handlePressIn = () => {
    if (disabled || loading) return;
    Animated.timing(scale, {
      toValue: 0.98,
      duration: Motion.instant,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      damping: Motion.spring.damping,
      stiffness: Motion.spring.stiffness,
      mass: Motion.spring.mass,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const handlePress = () => {
    if (disabled || loading) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress();
  };

  const getContainerStyle = (pressed: boolean): ViewStyle => {
    let base: ViewStyle = {
      height: size === 'small' ? 40 : size === 'large' ? 56 : 52,
      borderRadius: Radius.button,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: size === 'small' ? Spacing.md : Spacing.xl,
      opacity: disabled ? 0.4 : 1,
    };

    switch (variant) {
      case 'primary':
        base.backgroundColor = pressed ? Colors.primaryDeep : Colors.primary;
        break;
      case 'secondary':
        base.backgroundColor = pressed ? '#FCE4EC' : Colors.palePink;
        break;
      case 'outline':
        base.backgroundColor = pressed ? 'rgba(233, 30, 99, 0.04)' : 'transparent';
        base.borderWidth = 1.5;
        base.borderColor = Colors.primary;
        break;
      case 'ghost':
        base.backgroundColor = pressed ? Colors.palePink : 'transparent';
        break;
      case 'danger':
        base.backgroundColor = pressed ? '#B71C1C' : Colors.error;
        break;
    }

    if (fullWidth) {
      base.width = '100%';
    }

    return base;
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
      case 'danger':
        return Colors.white;
      case 'secondary':
        return Colors.primaryDeep;
      case 'outline':
      case 'ghost':
        return Colors.primary;
      default:
        return Colors.white;
    }
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, fullWidth && { width: '100%' }]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || loading}
        style={({ pressed }) => [getContainerStyle(pressed), style]}
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled || loading, busy: loading }}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' || variant === 'danger' ? Colors.white : Colors.primary}
          />
        ) : (
          <>
            {icon && <>{icon}</>}
            <AppText
              variant="button"
              color={getTextColor()}
              style={[icon ? { marginLeft: 8 } : {}, textStyle]}
            >
              {title}
            </AppText>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
};

export default AppButton;
