import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { Colors, Spacing } from '../theme';
import { AppText } from './AppText';
import { AppButton } from './AppButton';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to Load Blooms',
  message = 'We encountered an issue communicating with our floristry network. Please try again.',
  onRetry,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <AlertCircle size={40} color={Colors.error} strokeWidth={1.5} />
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
        {message}
      </AppText>

      {onRetry && (
        <AppButton
          title="Try Again"
          onPress={onRetry}
          variant="primary"
          style={styles.button}
        />
      )}
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFEBEE',
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
    minWidth: 160,
  },
});

export default ErrorState;
