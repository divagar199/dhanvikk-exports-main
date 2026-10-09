import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, ViewStyle, Platform } from 'react-native';
import { Radius } from '../theme';

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = Radius.input,
  style,
}) => {
  const [opacity] = useState(() => new Animated.Value(0.4));

  useEffect(() => {
    const useDriver = Platform.OS !== 'web';
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 700,
          useNativeDriver: useDriver,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: useDriver,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height: height as any,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <View style={styles.cardSkeleton}>
      <View style={styles.skeletonImageContainer}>
        <Skeleton width="100%" height="100%" borderRadius={0} />
      </View>
      <View style={styles.skeletonContent}>
        <Skeleton width="45%" height={14} borderRadius={Radius.xs} />
        <Skeleton width="85%" height={32} borderRadius={Radius.xs} />
        <Skeleton width="55%" height={20} borderRadius={Radius.xs} />
        <Skeleton width="35%" height={16} borderRadius={Radius.xs} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#F4ECEF',
  },
  cardSkeleton: {
    width: '100%',
    alignSelf: 'stretch',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EDE6E9',
  },
  skeletonImageContainer: {
    width: '100%',
    aspectRatio: 4 / 5,
    backgroundColor: '#FCE4EC',
    overflow: 'hidden',
  },
  skeletonContent: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    minHeight: 128,
    justifyContent: 'space-between',
  },
});

export default Skeleton;
