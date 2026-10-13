import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '@/constants/theme';

export function TrustBadges() {
  const items = [
    {
      icon: 'flash-outline' as const,
      title: 'Same Day',
      subtitle: 'Express Delivery',
    },
    {
      icon: 'flower-outline' as const,
      title: '100% Fresh',
      subtitle: 'Direct from Farms',
    },
    {
      icon: 'shield-checkmark-outline' as const,
      title: 'Guaranteed',
      subtitle: 'Quality & Care',
    },
    {
      icon: 'gift-outline' as const,
      title: 'Free Card',
      subtitle: 'Handwritten Note',
    },
  ];

  return (
    <View style={s.container}>
      {items.map((item, idx) => (
        <View key={idx} style={s.badge}>
          <View style={s.iconWrapper}>
            <Ionicons name={item.icon} size={16} color={colors.primaryDeep} />
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
  },
  badge: {
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.pale,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.ink,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 9,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 1,
  },
});
