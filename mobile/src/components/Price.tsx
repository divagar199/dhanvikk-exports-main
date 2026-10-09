import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius } from '../theme';
import { AppText } from './AppText';

export interface PriceProps {
  price: number;
  originalPrice?: number;
  currency?: string;
  size?: 'normal' | 'large' | 'small';
  showDiscount?: boolean;
  style?: ViewStyle;
}

export const Price: React.FC<PriceProps> = ({
  price,
  originalPrice,
  currency = '₹',
  size = 'normal',
  showDiscount = true,
  style,
}) => {
  const hasDiscount = Boolean(originalPrice && originalPrice > price);
  const discountPercent = hasDiscount
    ? Math.round((((originalPrice! - price) / originalPrice!) * 100))
    : 0;

  const getPriceVariant = () => {
    if (size === 'large') return 'heroPrice';
    if (size === 'small') return 'caption';
    return 'price';
  };

  const accessLabel = hasDiscount
    ? `${price.toLocaleString()} rupees, original price ${originalPrice?.toLocaleString()} rupees, ${discountPercent} percent off`
    : `${price.toLocaleString()} rupees`;

  return (
    <View
      style={[styles.container, style]}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={accessLabel}
    >
      <View style={styles.priceRow}>
        <AppText
          variant={getPriceVariant()}
          color={Colors.text}
          weight="semiBold"
          numberOfLines={1}
          style={styles.price}
        >
          {currency}
          {price.toLocaleString()}
        </AppText>

        {hasDiscount && (
          <AppText
            variant={size === 'large' ? 'body' : 'bodySm'}
            color={Colors.textSecondary}
            numberOfLines={1}
            style={[
              styles.originalPrice,
              size === 'small' && styles.originalPriceSmall,
            ]}
          >
            {currency}
            {originalPrice?.toLocaleString()}
          </AppText>
        )}
      </View>

      {hasDiscount && showDiscount && discountPercent > 0 && (
        <View
          style={[
            styles.discountBadge,
            size === 'small' && styles.discountBadgeSmall,
            size === 'large' && styles.discountBadgeLarge,
          ]}
        >
          <AppText
            variant="caption"
            color="#1B5E20"
            weight="bold"
            numberOfLines={1}
            style={[
              styles.discountText,
              size === 'small' && styles.discountTextSmall,
              size === 'large' && styles.discountTextLarge,
            ]}
          >
            {discountPercent}% OFF
          </AppText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    rowGap: 3,
    columnGap: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  price: {
    fontVariant: ['tabular-nums'],
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    fontVariant: ['tabular-nums'],
    fontSize: 12,
    lineHeight: 16,
  },
  originalPriceSmall: {
    fontSize: 11,
    lineHeight: 14,
  },
  discountBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: Radius.xs,
    alignSelf: 'center',
    borderWidth: 0.5,
    borderColor: '#C8E6C9',
  },
  discountBadgeSmall: {
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  discountBadgeLarge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: Radius.sm,
  },
  discountText: {
    fontSize: 10,
    lineHeight: 13,
    color: '#1B5E20',
    fontVariant: ['tabular-nums'],
  },
  discountTextSmall: {
    fontSize: 9,
    lineHeight: 11,
  },
  discountTextLarge: {
    fontSize: 12,
    lineHeight: 15,
  },
});

export default Price;
