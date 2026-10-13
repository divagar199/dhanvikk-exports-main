import { useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '@/constants/theme';
import { cartTotal, useStore } from '@/store/useStore';
import { resolveImageUrl } from '@/lib/imageUrl';
import { GoogleSignInModal } from '@/components/GoogleSignInModal';

export default function Cart() {
  const insets = useSafeAreaInsets();
  const user = useStore((s) => s.user);
  const cart = useStore((s) => s.cart);
  const qty = useStore((s) => s.qty);
  const remove = useStore((s) => s.remove);
  const wish = useStore((s) => s.wish);

  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const subtotal = cartTotal(cart);
  const originalTotal = Math.round(subtotal * 1.35);
  const retailDiscount = originalTotal - subtotal;
  const finalTotal = Math.max(0, subtotal - couponDiscount);
  const totalSavings = retailDiscount + couponDiscount;

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'DHANVIKK10' || code === 'SPRING20' || code === 'FLOWER10') {
      const discount = Math.round(subtotal * 0.1);
      setCouponDiscount(discount);
      setCouponApplied(true);
      Alert.alert('Coupon Applied! 🎉', `You saved ₹${discount.toLocaleString('en-IN')} with ${code}!`);
    } else {
      Alert.alert('Invalid Coupon', 'Try using coupon code "DHANVIKK10" for 10% off.');
    }
  };

  const handleSaveForLater = (id: string) => {
    wish(id);
    remove(id);
    Alert.alert('Saved to Wishlist', 'Bloom moved to your saved items.');
  };

  const handlePlaceOrder = () => {
    if (!user) {
      Alert.alert(
        'Sign In to Order',
        'Please sign in with Google or your Dhanvikk account to place your floral order and receive express doorstep delivery.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign In with Google',
            onPress: () => setShowGoogleModal(true),
          },
          {
            text: 'Login / Register',
            onPress: () => router.push('/auth/login'),
          },
        ]
      );
      return;
    }
    router.push('/checkout');
  };

  return (
    <View style={[s.page, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Flipkart-Style Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>My Bag ({cart.length})</Text>
      </View>

      {/* Delivery Address Banner */}
      <Pressable style={s.addressBanner} onPress={() => router.push('/addresses')}>
        <View style={s.addressLeft}>
          <Ionicons name="location" size={18} color={colors.primary} />
          <View>
            <View style={s.addressTitleRow}>
              <Text style={s.addressTitle}>Deliver to: Chennai - 600001</Text>
              <View style={s.homeBadge}>
                <Text style={s.homeBadgeText}>HOME</Text>
              </View>
            </View>
            <Text style={s.addressSub} numberOfLines={1}>
              42 Rose Garden Avenue, Anna Nagar
            </Text>
          </View>
        </View>
        <Text style={s.changeBtn}>Change</Text>
      </Pressable>

      <FlatList
        data={cart}
        keyExtractor={(x) => x.id || x._id || x.slug}
        contentContainerStyle={[s.content, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.empty}>
            <View style={s.emptyIconCircle}>
              <Ionicons name="bag-handle-outline" size={50} color={colors.primary} />
            </View>
            <Text style={s.emptyTitle}>Your shopping bag is empty!</Text>
            <Text style={s.emptySub}>
              Explore fresh roses, orchids, and handcrafted bouquets to get started.
            </Text>
            <Pressable style={s.exploreBtn} onPress={() => router.push('/(tabs)/shop')}>
              <Text style={s.exploreBtnText}>Shop Now</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => {
          const id = item.id || item._id || item.slug;
          const itemPrice = item.price || 999;
          const itemOriginal = Math.round(itemPrice * 1.35);
          const itemDiscount = Math.round(((itemOriginal - itemPrice) / itemOriginal) * 100);

          return (
            <View style={s.cartCard}>
              <View style={s.itemMain}>
                <Image
                  source={{ uri: resolveImageUrl(item.image || item.images?.[0]) }}
                  style={s.itemImage}
                  contentFit="cover"
                  transition={150}
                />
                <View style={s.itemDetails}>
                  <Text style={s.itemName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={s.itemCategory}>
                    {item.flowerType || item.category || 'Luxury Floral'}
                  </Text>

                  <View style={s.itemPriceRow}>
                    <Text style={s.itemPrice}>₹{itemPrice.toLocaleString('en-IN')}</Text>
                    <Text style={s.itemOriginal}>₹{itemOriginal.toLocaleString('en-IN')}</Text>
                    <Text style={s.itemDiscount}>{itemDiscount}% off</Text>
                  </View>

                  <Text style={s.itemDelivery}>
                    ⚡ Delivery by <Text style={s.deliveryBold}>Tomorrow, 5 PM</Text> | <Text style={s.freeText}>FREE</Text>
                  </Text>
                </View>
              </View>

              {/* Controls Row */}
              <View style={s.controlsRow}>
                <View style={s.stepper}>
                  <Pressable
                    style={s.stepperBtn}
                    onPress={() => qty(id, item.quantity - 1)}
                  >
                    <Ionicons name="remove" size={16} color={colors.ink} />
                  </Pressable>
                  <Text style={s.stepperNum}>{item.quantity}</Text>
                  <Pressable
                    style={s.stepperBtn}
                    onPress={() => qty(id, item.quantity + 1)}
                  >
                    <Ionicons name="add" size={16} color={colors.ink} />
                  </Pressable>
                </View>

                <Pressable
                  style={s.actionBtn}
                  onPress={() => handleSaveForLater(id)}
                >
                  <Text style={s.actionText}>Save for later</Text>
                </Pressable>

                <Pressable
                  style={s.actionBtn}
                  onPress={() => remove(id)}
                >
                  <Text style={[s.actionText, { color: colors.danger }]}>Remove</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
        ListFooterComponent={
          cart.length > 0 ? (
            <>
              {/* Coupon Code Section */}
              <View style={s.couponCard}>
                <View style={s.couponHeader}>
                  <Ionicons name="pricetag-outline" size={18} color={colors.primaryDeep} />
                  <Text style={s.couponTitle}>Apply Coupon / Promo Code</Text>
                </View>
                <View style={s.couponInputRow}>
                  <TextInput
                    style={s.couponInput}
                    placeholder="Enter DHANVIKK10"
                    placeholderTextColor={colors.muted}
                    value={couponCode}
                    onChangeText={setCouponCode}
                    autoCapitalize="characters"
                  />
                  <Pressable
                    style={[s.couponApplyBtn, couponApplied && s.couponAppliedBtn]}
                    onPress={handleApplyCoupon}
                  >
                    <Text style={s.couponApplyText}>
                      {couponApplied ? 'APPLIED ✓' : 'APPLY'}
                    </Text>
                  </Pressable>
                </View>
                {couponApplied && (
                  <Text style={s.couponSuccessText}>
                    🎉 Coupon applied! Extra ₹{couponDiscount.toLocaleString('en-IN')} off!
                  </Text>
                )}
              </View>

              {/* Flipkart-Style Price Details Card */}
              <View style={s.priceDetailsCard}>
                <Text style={s.priceDetailsTitle}>PRICE DETAILS</Text>
                <View style={s.divider} />

                <View style={s.priceRow}>
                  <Text style={s.priceLabel}>Price ({cart.length} items)</Text>
                  <Text style={s.priceValue}>₹{originalTotal.toLocaleString('en-IN')}</Text>
                </View>

                <View style={s.priceRow}>
                  <Text style={s.priceLabel}>Discount</Text>
                  <Text style={[s.priceValue, { color: colors.discountGreen }]}>
                    - ₹{retailDiscount.toLocaleString('en-IN')}
                  </Text>
                </View>

                {couponDiscount > 0 && (
                  <View style={s.priceRow}>
                    <Text style={s.priceLabel}>Coupon Discount</Text>
                    <Text style={[s.priceValue, { color: colors.discountGreen }]}>
                      - ₹{couponDiscount.toLocaleString('en-IN')}
                    </Text>
                  </View>
                )}

                <View style={s.priceRow}>
                  <Text style={s.priceLabel}>Delivery Charges</Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <Text style={[s.priceValue, s.strike]}>₹150</Text>
                    <Text style={[s.priceValue, { color: colors.discountGreen }]}>FREE</Text>
                  </View>
                </View>

                <View style={s.divider} />

                <View style={s.priceRow}>
                  <Text style={s.totalLabel}>Total Amount</Text>
                  <Text style={s.totalAmount}>₹{finalTotal.toLocaleString('en-IN')}</Text>
                </View>

                <View style={s.savingsBanner}>
                  <Text style={s.savingsText}>
                    🌿 You will save ₹{totalSavings.toLocaleString('en-IN')} on this order
                  </Text>
                </View>
              </View>

              {/* Security Trust Note */}
              <View style={s.safeNote}>
                <Ionicons name="shield-checkmark" size={18} color={colors.primaryDeep} />
                <Text style={s.safeText}>
                  Safe and secure payments. 100% Authentic farm-fresh blossoms.
                </Text>
              </View>
            </>
          ) : undefined
        }
      />

      {/* Sticky Bottom Bar */}
      {cart.length > 0 && (
        <View style={[s.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={s.bottomPriceCol}>
            <Text style={s.bottomOriginal}>₹{originalTotal.toLocaleString('en-IN')}</Text>
            <Text style={s.bottomTotal}>₹{finalTotal.toLocaleString('en-IN')}</Text>
          </View>
          <Pressable
            style={s.placeOrderBtn}
            onPress={handlePlaceOrder}
          >
            <Text style={s.placeOrderText}>Place Order</Text>
          </Pressable>
        </View>
      )}

      {/* Google Sign In Modal */}
      <GoogleSignInModal
        visible={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSuccess={() => {
          setShowGoogleModal(false);
          router.push('/checkout');
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineLight,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.ink,
  },
  addressBanner: {
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineLight,
  },
  addressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  addressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addressTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
  },
  homeBadge: {
    backgroundColor: colors.pale,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  homeBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.primaryDeep,
  },
  addressSub: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  changeBtn: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 13,
    paddingHorizontal: 8,
  },
  content: {},
  cartCard: {
    backgroundColor: colors.white,
    marginBottom: 6,
    padding: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.lineLight,
  },
  itemMain: {
    flexDirection: 'row',
    gap: 12,
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: radius.xs,
    backgroundColor: colors.pale,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
    lineHeight: 18,
  },
  itemCategory: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  itemPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 6,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.ink,
  },
  itemOriginal: {
    fontSize: 12,
    color: colors.mutedLight,
    textDecorationLine: 'line-through',
  },
  itemDiscount: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.discountGreen,
  },
  itemDelivery: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 6,
  },
  deliveryBold: {
    fontWeight: '800',
    color: colors.ink,
  },
  freeText: {
    fontWeight: '800',
    color: colors.discountGreen,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.lineLight,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 4,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  stepperNum: {
    width: 32,
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 13,
    color: colors.ink,
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.inkLight,
  },
  couponCard: {
    backgroundColor: colors.white,
    padding: 12,
    marginBottom: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.lineLight,
  },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  couponTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
  },
  couponInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  couponInput: {
    flex: 1,
    height: 40,
    backgroundColor: colors.background,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  couponApplyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  couponAppliedBtn: {
    backgroundColor: colors.discountGreen,
  },
  couponApplyText: {
    color: colors.white,
    fontWeight: '900',
    fontSize: 12,
  },
  couponSuccessText: {
    color: colors.discountGreen,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 6,
  },
  priceDetailsCard: {
    backgroundColor: colors.white,
    padding: 14,
    marginBottom: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.lineLight,
  },
  priceDetailsTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.muted,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: colors.lineLight,
    marginVertical: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 13,
    color: colors.inkLight,
  },
  priceValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  strike: {
    color: colors.mutedLight,
    textDecorationLine: 'line-through',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.ink,
  },
  totalAmount: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.ink,
  },
  savingsBanner: {
    backgroundColor: colors.starGreenBg,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginTop: 6,
  },
  savingsText: {
    color: colors.discountGreen,
    fontWeight: '800',
    fontSize: 12,
    textAlign: 'center',
  },
  safeNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  safeText: {
    fontSize: 11,
    color: colors.muted,
    flex: 1,
    lineHeight: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  bottomPriceCol: {
    justifyContent: 'center',
  },
  bottomOriginal: {
    fontSize: 11,
    color: colors.mutedLight,
    textDecorationLine: 'line-through',
  },
  bottomTotal: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.ink,
  },
  placeOrderBtn: {
    backgroundColor: colors.dealOrange, // Classic Flipkart "Place Order" orange
    paddingHorizontal: 28,
    height: 44,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeOrderText: {
    color: colors.white,
    fontWeight: '900',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 80,
    backgroundColor: colors.white,
    margin: 12,
    borderRadius: radius.md,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.pale,
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
    textAlign: 'center',
    paddingHorizontal: 30,
    marginBottom: 20,
    lineHeight: 18,
  },
  exploreBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 4,
  },
  exploreBtnText: {
    color: colors.white,
    fontWeight: '900',
    fontSize: 14,
  },
});