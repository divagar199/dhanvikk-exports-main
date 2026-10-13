import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, radius, spacing } from '@/constants/theme';
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

  // Filter deals
  const deals = products.slice(0, 8);

  if (!deals.length) return null;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.iconTag}>
            <Ionicons name="flash" size={14} color={colors.white} />
          </View>
          <View>
            <Text style={s.title}>Deals of the Day</Text>
            <View style={s.timerRow}>
              <Ionicons name="time-outline" size={13} color={colors.dealOrange} />
              <Text style={s.timerLabel}>Ends in </Text>
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
          <Text style={s.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={13} color={colors.primaryDeep} />
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
    marginVertical: 6,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.lineLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconTag: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.dealOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.ink,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  timerLabel: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '700',
  },
  timerBox: {
    backgroundColor: colors.pale,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  timerText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.dealOrange,
  },
  colon: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.muted,
    marginHorizontal: 1,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blush,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    gap: 2,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryDeep,
  },
  listContent: {
    paddingHorizontal: 12,
  },
});
