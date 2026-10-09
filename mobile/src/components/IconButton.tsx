import React from 'react';
import { TouchableOpacity, ViewStyle, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export interface IconButtonProps {
  onPress: () => void;
  icon: React.ReactNode;
  size?: number;
  backgroundColor?: string;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  onPress,
  icon,
  size = 44,
  backgroundColor = 'transparent',
  style,
  accessibilityLabel,
}) => {
  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {icon}
    </TouchableOpacity>
  );
};

export default IconButton;
