import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadows } from '@/constants/theme';

export type ToastType = 'success' | 'info' | 'error';

interface ToastOptions {
  title: string;
  message?: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (title: string, message?: string, type?: ToastType, duration?: number) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
  hideToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastOptions | null>(null);

  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const hideToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.92,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToast(null);
    });
  }, [translateY, opacity, scale]);

  const showToast = useCallback(
    (title: string, message?: string, type: ToastType = 'success', duration = 2600) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      setToast({ title, message, type, duration });

      translateY.setValue(-100);
      opacity.setValue(0);
      scale.setValue(0.92);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      timerRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    },
    [translateY, opacity, scale, hideToast]
  );

  const getToastColors = (type?: ToastType) => {
    switch (type) {
      case 'error':
        return {
          bg: '#FFF1F2',
          border: '#FECDD3',
          iconBg: '#E11D48',
          iconColor: '#FFFFFF',
          titleColor: '#9F1239',
          iconName: 'alert-circle' as const,
        };
      case 'info':
        return {
          bg: '#FFF8E7',
          border: '#FDE68A',
          iconBg: '#D97706',
          iconColor: '#FFFFFF',
          titleColor: '#92400E',
          iconName: 'sparkles' as const,
        };
      case 'success':
      default:
        return {
          bg: '#FFFFFF',
          border: 'rgba(233, 30, 99, 0.18)',
          iconBg: colors.primary,
          iconColor: '#FFFFFF',
          titleColor: colors.ink,
          iconName: 'checkmark' as const,
        };
    }
  };

  const currentTheme = getToastColors(toast?.type);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && (
        <Animated.View
          style={[
            s.toastWrapper,
            {
              top: Math.max(insets.top, 14) + 6,
              transform: [{ translateY }, { scale }],
              opacity,
            },
          ]}
          pointerEvents="box-none"
        >
          <Pressable
            style={[
              s.toastCard,
              {
                backgroundColor: currentTheme.bg,
                borderColor: currentTheme.border,
              },
            ]}
            onPress={hideToast}
          >
            <View style={[s.iconCircle, { backgroundColor: currentTheme.iconBg }]}>
              <Ionicons name={currentTheme.iconName} size={15} color={currentTheme.iconColor} />
            </View>

            <View style={s.textContainer}>
              <Text style={[s.title, { color: currentTheme.titleColor }]} numberOfLines={1}>
                {toast.title}
              </Text>
              {toast.message ? (
                <Text style={s.message} numberOfLines={2}>
                  {toast.message}
                </Text>
              ) : null}
            </View>

            <Ionicons name="close" size={16} color={colors.muted} style={{ marginLeft: 6 }} />
          </Pressable>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

const s = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 99999,
    elevation: 999,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 420,
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1.2,
    backgroundColor: colors.white,
    ...shadows.elevated,
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  message: {
    fontSize: 11.5,
    color: colors.muted,
    marginTop: 1,
    lineHeight: 15,
  },
});
