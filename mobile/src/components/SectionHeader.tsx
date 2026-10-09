import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing } from '../theme';
import { AppText } from './AppText';

export interface SectionHeaderProps {
  title: string;
  kicker?: string;
  actionText?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  kicker,
  actionText = 'See all',
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.titleWrapper}>
        {kicker ? (
          <AppText
            variant="caption"
            color={Colors.primaryDeep}
            weight="semiBold"
            style={styles.kicker}
          >
            {kicker.toUpperCase()}
          </AppText>
        ) : null}
        <AppText variant="h2" weight="semiBold" color={Colors.text}>
          {title}
        </AppText>
      </View>

      {onAction ? (
        <TouchableOpacity
          onPress={onAction}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <AppText variant="button" color={Colors.primaryDeep} weight="semiBold">
            {actionText}
          </AppText>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.screenPadding,
  },
  titleWrapper: {
    flex: 1,
  },
  kicker: {
    marginBottom: 4,
    letterSpacing: 1,
  },
});

export default SectionHeader;
