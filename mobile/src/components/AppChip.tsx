import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Radius, Spacing, Shadows } from '../theme';
import { AppText } from './AppText';

export interface AppChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export const AppChip: React.FC<AppChipProps> = ({
  label,
  selected,
  onPress,
  icon,
  style,
  textStyle,
  disabled = false,
}) => {
  const handlePress = () => {
    if (disabled) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.chip,
        selected ? styles.selectedChip : styles.unselectedChip,
        disabled && styles.disabled,
        style,
      ]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={`${label}, ${selected ? 'selected' : 'not selected'}`}
    >
      {selected ? (
        <Check size={14} color={Colors.white} strokeWidth={2.5} style={styles.iconMargin} />
      ) : icon ? (
        <>{icon}</>
      ) : null}

      <AppText
        variant="caption"
        weight={selected ? 'semiBold' : 'medium'}
        color={selected ? Colors.white : Colors.text}
        style={[styles.label, textStyle]}
      >
        {label}
      </AppText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    height: 40,
    borderRadius: Radius.chip,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  selectedChip: {
    backgroundColor: Colors.primary,
    borderWidth: 0,
    ...Shadows.sm,
  },
  unselectedChip: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  disabled: {
    opacity: 0.4,
  },
  iconMargin: {
    marginRight: 6,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
  },
});

export default AppChip;
