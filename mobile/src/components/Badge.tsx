import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius } from '../theme';
import { AppText } from './AppText';

export interface BadgeProps {
  label: string;
  variant?: 'primary' | 'gold' | 'success' | 'pale' | 'dark';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  style,
}) => {
  const getColors = () => {
    switch (variant) {
      case 'gold':
        return { bg: '#FFFEFA', text: '#9E6E00', border: '#FFB400' };
      case 'success':
        return { bg: '#E8F5E9', text: Colors.success, border: '#C8E6C9' };
      case 'pale':
        return { bg: Colors.palePink, text: Colors.primaryDeep, border: Colors.border };
      case 'dark':
        return { bg: Colors.text, text: Colors.white, border: Colors.text };
      default:
        return { bg: Colors.primary, text: Colors.white, border: Colors.primary };
    }
  };

  const { bg, text, border } = getColors();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderColor: border,
          borderWidth: variant === 'gold' || variant === 'success' ? 1 : 0,
        },
        style,
      ]}
    >
      <AppText
        variant="caption"
        weight="semiBold"
        color={text}
        style={styles.label}
      >
        {label.toUpperCase()}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.chip,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 0.5,
  },
});

export default Badge;
