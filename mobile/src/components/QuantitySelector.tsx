import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle, Platform } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Radius } from '../theme';
import { AppText } from './AppText';

export interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
  style?: ViewStyle;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onIncrease,
  onDecrease,
  min = 1,
  max = 99,
  style,
}) => {
  const handleDecrease = () => {
    if (quantity <= min) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onDecrease();
  };

  const handleIncrease = () => {
    if (quantity >= max) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onIncrease();
  };

  return (
    <View style={[styles.container, style]}>
      {/* 36px stepper button with 44px hit area */}
      <TouchableOpacity
        onPress={handleDecrease}
        disabled={quantity <= min}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={[styles.button, quantity <= min && styles.disabledButton]}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
      >
        <Minus size={16} color={quantity <= min ? Colors.border : Colors.text} />
      </TouchableOpacity>

      <AppText
        variant="body"
        weight="semiBold"
        style={styles.quantityText}
      >
        {quantity}
      </AppText>

      {/* 36px stepper button with 44px hit area */}
      <TouchableOpacity
        onPress={handleIncrease}
        disabled={quantity >= max}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={[styles.button, quantity >= max && styles.disabledButton]}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
      >
        <Plus size={16} color={quantity >= max ? Colors.border : Colors.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.palePink,
    borderRadius: Radius.chip,
    paddingHorizontal: 4,
    height: 44,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: 'transparent',
  },
  quantityText: {
    paddingHorizontal: 12,
    minWidth: 36,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
});

export default QuantitySelector;
