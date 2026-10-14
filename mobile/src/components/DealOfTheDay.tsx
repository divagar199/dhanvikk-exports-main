import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, radius, shadows, spacing } from '@/constants/theme';
import type { Product } from '@/types/models';
import { ProductCard } from '@/components/ProductCard';

export function DealOfTheDay({ products }: { products: Product[] }) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 4,
    minutes: 36,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 4, minutes: 30, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const format = (n: number) => n.toString().padStart(2, '0');

  const deals = products.slice(0, 8);
  if (!deals.length) return null;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.iconTag}>
            <Ionicons name="sparkles" size={14} color={colors.accent} />
          </View>
          <View>
            <Text style={s.title}>The Daily Harvest Reserve</Text>
            <View style={s.timerRow}>
              <Ionicons name="time-outline" size={12} color={colors.primary} />
              <Text style={s.timerLabel}>Dawn reserve closes: </Text>
              <View style={s.timerBox}>
                <Text style={s.timerText}>{format(timeLeft.hours)}h</Text>
              </View>
              <Text style={s.colon}>:</Text>
              <View style={s.timerBox}>
                <Text style={s.timerText}>{format(timeLeft.minutes)}m</Text>
              </View>
              <Text style={s.colon}>:</Text>
              <View style={s.timerBox}>
                <Text style={s.timerText}>{format(timeLeft.seconds)}s</Text>
              </View>
            </View>
          </View>
        </View>

        <Pressable
          style={s.viewAllBtn}
          onPress={() => router.push('/(tabs)/shop')}
        >
          <Text style={s.viewAllText}>Explore Reserve</Text>
          <Ionicons name="chevron-forward" size={13} color={colors.primary} />
        </Pressable>
      </View>

      <FlatList
        data={deals}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.listContent}
        keyExtractor={(p) => (p.id || p._id || p.slug) + '-deal'}
        renderItem={({ item }) => <ProductCard product={item} horizontal />}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    marginVertical: 8,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.lineLight,
    ...(shadows?.soft || {}),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconTag: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15.5,
    fontWeight: '900',
    color: colors.ink,
    letterSpacing: 0.2,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 3,
  },
  timerLabel: {
    fontSize: 10.5,
    color: colors.muted,
    fontWeight: '700',
  },
  timerBox: {
    backgroundColor: colors.canvas,
    borderWidth: 0.8,
    borderColor: colors.lineGold,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  timerText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.primary,
  },
  colon: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.primary,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.lineGold,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  listContent: {
    paddingHorizontal: 12,
    gap: 10,
  },
});
