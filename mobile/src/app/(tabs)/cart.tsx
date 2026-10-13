import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '@/constants/theme';
import { cartTotal, useStore } from '@/store/useStore';

export default function Cart() {
  const insets = useSafeAreaInsets();
  const cart = useStore((s) => s.cart);
  const qty = useStore((s) => s.qty);
  const remove = useStore((s) => s.remove);
  const total = cartTotal(cart);

  return (
    <FlatList
      data={cart}
      keyExtractor={(x) => x.id || x._id || x.slug}
      contentContainerStyle={[
        s.content,
        { paddingTop: Math.max(insets.top, 16), paddingBottom: 110 },
      ]}
      ListHeaderComponent={
        <>
          <Text style={s.title}>Your bag</Text>
          <Text style={s.sub}>
            {cart.length === 0
              ? 'No items added yet'
              : `${cart.length} item${cart.length > 1 ? 's' : ''} ready for delivery`}
          </Text>
        </>
      }
      ListEmptyComponent={
        <View style={s.empty}>
          <View style={s.emptyIconCircle}>
            <Ionicons name="flower-outline" size={48} color={colors.primary} />
          </View>
          <Text style={s.emptyTitle}>Your bag is blooming quietly.</Text>
          <Text style={s.emptySub}>Add something beautiful to get started.</Text>
          <Pressable style={s.button} onPress={() => router.push('/(tabs)/shop')}>
            <Text style={s.buttonText}>Explore flowers</Text>
          </Pressable>
        </View>
      }
      renderItem={({ item }) => {
        const id = item.id || item._id || item.slug;
        return (
          <View style={s.item}>
            <Image
              source={{ uri: item.image || item.images?.[0] }}
              style={s.image}
              contentFit="cover"
            />
            <View style={s.info}>
              <Text style={s.name} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={s.price}>₹{item.price.toLocaleString('en-IN')}</Text>
              <View style={s.controls}>
                <View style={s.qtyGroup}>
                  <Pressable style={s.qtyBtn} onPress={() => qty(id, item.quantity - 1)}>
                    <Ionicons name="remove" size={16} color={colors.ink} />
                  </Pressable>
                  <Text style={s.qtyNum}>{item.quantity}</Text>
                  <Pressable style={s.qtyBtn} onPress={() => qty(id, item.quantity + 1)}>
                    <Ionicons name="add" size={16} color={colors.ink} />
                  </Pressable>
                </View>
                <Pressable onPress={() => remove(id)} style={s.removeBtn}>
                  <Ionicons name="trash-outline" size={16} color={colors.danger} />
                  <Text style={s.removeText}>Remove</Text>
                </Pressable>
              </View>
            </View>
          </View>
        );
      }}
      ListFooterComponent={
        cart.length > 0 ? (
          <View style={s.summary}>
            <Text style={s.summaryTitle}>Bill details</Text>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Item total</Text>
              <Text style={s.summaryValue}>₹{total.toLocaleString('en-IN')}</Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Standard delivery</Text>
              <Text style={[s.summaryValue, { color: colors.success }]}>FREE</Text>
            </View>
            <View style={s.divider} />
            <View style={s.summaryRow}>
              <Text style={s.totalLabel}>To pay</Text>
              <Text style={s.totalValue}>₹{total.toLocaleString('en-IN')}</Text>
            </View>
            <Pressable style={s.checkoutBtn} onPress={() => router.push('/checkout')}>
              <Text style={s.checkoutBtnText}>Continue to checkout</Text>
              <Ionicons name="arrow-forward" color={colors.white} size={18} />
            </Pressable>
          </View>
        ) : undefined
      }
    />
  );
}

const s = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.ink,
    marginTop: 8,
  },
  sub: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
  },
  item: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 12,
    flexDirection: 'row',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  image: {
    width: 86,
    height: 98,
    borderRadius: 12,
    backgroundColor: colors.blush,
  },
  info: {
    flex: 1,
    paddingLeft: 14,
    justifyContent: 'space-between',
  },
  name: {
    fontWeight: '800',
    color: colors.ink,
    lineHeight: 19,
    fontSize: 14,
  },
  price: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primaryDeep,
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  qtyGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.pale,
    borderRadius: 16,
    paddingHorizontal: 4,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyNum: {
    fontWeight: '800',
    fontSize: 13,
    paddingHorizontal: 8,
    color: colors.ink,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  removeText: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: '700',
  },
  summary: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 18,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.ink,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.muted,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.ink,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primaryDeep,
  },
  checkoutBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  checkoutBtnText: {
    color: colors.white,
    fontWeight: '900',
    fontSize: 15,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.ink,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  buttonText: {
    color: colors.white,
    fontWeight: '900',
  },
});