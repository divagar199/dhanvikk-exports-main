import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadows, spacing } from '@/constants/theme';

export function TrustBadges() {
  const items = [
    {
      icon: 'time-outline' as const,
      title: '90-Min Handover',
      subtitle: 'White-Glove Fleet',
    },
    {
      icon: 'snow-outline' as const,
      title: '2°C–4°C Reefer',
      subtitle: 'Cold-Chain Transit',
    },
    {
      icon: 'shield-checkmark-outline' as const,
      title: '12-Day Life',
      subtitle: 'Longevity Pledge',
    },
    {
      icon: 'mail-open-outline' as const,
      title: 'Calligraphy Card',
      subtitle: 'Wax-Sealed Note',
    },
  ];

  return (
    <View style={s.container}>
      {items.map((item, idx) => (
        <View key={idx} style={s.badge}>
          <View style={s.iconWrapper}>
            <Ionicons name={item.icon} size={15} color={colors.primary} />
          </View>
          <Text style={s.title}>{item.title}</Text>
          <Text style={s.subtitle}>{item.subtitle}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    marginVertical: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.lineLight,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    ...(shadows?.soft || {}),
  },
  badge: {
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.lineGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.ink,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  subtitle: {
    fontSize: 8.5,
    fontWeight: '600',
    color: colors.muted,
    textAlign: 'center',
    marginTop: 1,
  },
});
