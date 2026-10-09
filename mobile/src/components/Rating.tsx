import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import { Colors } from '../theme';
import { AppText } from './AppText';

export interface RatingProps {
  rating: number;
  reviewsCount?: number;
  size?: number;
}

export const Rating: React.FC<RatingProps> = ({
  rating,
  reviewsCount,
  size = 13,
}) => {
  if (!rating || rating <= 0) return null;

  return (
    <View style={styles.container}>
      <Star size={size} color={Colors.gold} fill={Colors.gold} />
      <AppText variant="caption" weight="semiBold" color={Colors.text} style={styles.text}>
        {rating.toFixed(1)}
      </AppText>
      {reviewsCount && reviewsCount > 0 ? (
        <AppText variant="caption" color={Colors.textSecondary}>
          ({reviewsCount})
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  text: {
    marginLeft: 2,
  },
});

export default Rating;
