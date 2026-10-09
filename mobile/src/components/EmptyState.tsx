import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Flower2 } from 'lucide-react-native';
import { Colors, Spacing } from '../theme';
import { AppText } from './AppText';
import { AppButton } from './AppButton';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionTitle,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        {icon || <Flower2 size={44} color={Colors.primary} strokeWidth={1.5} />}
      </View>

      <AppText variant="h2" align="center" style={styles.title}>
        {title}
      </AppText>

      <AppText
        variant="body"
        color={Colors.textSecondary}
        align="center"
        style={styles.description}
      >
        {description}
      </AppText>

      {actionTitle && onAction ? (
        <AppButton
          title={actionTitle}
          onPress={onAction}
          variant="primary"
          style={styles.button}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.huge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.palePink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  description: {
    maxWidth: 280,
    marginBottom: Spacing.xl,
  },
  button: {
    minWidth: 180,
  },
});

export default EmptyState;
