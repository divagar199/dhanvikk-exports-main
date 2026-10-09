import React, { useState } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { Colors, Radius, Typography, Spacing, Shadows } from '../theme';
import { AppText } from './AppText';

export interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const AppInput: React.FC<AppInputProps> = ({
  label,
  error,
  icon,
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  onFocus,
  onBlur,
  returnKeyType = 'next',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const leadingIcon = leftIcon || icon;

  return (
    <View style={[{ marginBottom: Spacing.md }, containerStyle]}>
      {label && (
        <AppText
          variant="caption"
          color={isFocused ? Colors.primaryDeep : Colors.textSecondary}
          weight="medium"
          style={{ marginBottom: 6 }}
        >
          {label}
        </AppText>
      )}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focused,
          Boolean(error) && styles.errorBorder,
        ]}
      >
        {leadingIcon && <View style={styles.leftIcon}>{leadingIcon}</View>}

        <TextInput
          placeholderTextColor={Colors.textSecondary}
          style={[styles.input, style]}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          returnKeyType={returnKeyType}
          {...props}
        />

        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>

      {error ? (
        <View style={styles.errorRow}>
          <AlertCircle size={14} color={Colors.error} />
          <AppText variant="caption" color={Colors.error} style={{ marginLeft: 4 }}>
            {error}
          </AppText>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    height: 56,
    borderRadius: Radius.input,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  focused: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
    ...Shadows.halo,
  },
  errorBorder: {
    borderColor: Colors.error,
    borderWidth: 1.5,
  },
  leftIcon: {
    marginRight: 10,
  },
  rightIcon: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: Typography.fonts.regular,
    fontSize: 15,
    color: Colors.text,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
});

export default AppInput;
