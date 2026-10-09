import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Trash2, Heart, ShieldCheck, Undo2 } from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, Shadows, Motion } from '../../theme';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { QuantitySelector } from '../../components/QuantitySelector';
import { Price } from '../../components/Price';
import { EmptyState } from '../../components/EmptyState';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { getProductImageUrl } from '../../utils/imageUrl';
import { useResponsive } from '../../hooks/useResponsive';
import { CartItem } from '../../types';

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isTablet, containerStyle } = useResponsive();
  const {
    items,
    addToCart,
    updateQuantity,
    removeFromCart,
    getSubtotal,
    getDeliveryFee,
    getTotalAmount,
    getItemCount,
  } = useCartStore();

  const { toggleWishlist, isInWishlist } = useWishlistStore();

  // Undo Snackbar State
  const [removedItem, setRemovedItem] = useState<CartItem | null>(null);
  const [undoAnim] = useState(() => new Animated.Value(0));
  const undoTimeout = useRef<any>(null);

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const totalAmount = getTotalAmount();
  const itemCount = getItemCount();

  const handleRemove = (item: CartItem) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    const prodId = (item.product.id || item.product._id || '') as string;
    removeFromCart(prodId);
    setRemovedItem(item);

    // Show undo snackbar
    Animated.spring(undoAnim, {
      toValue: 1,
      damping: Motion.spring.damping,
      stiffness: Motion.spring.stiffness,
      mass: Motion.spring.mass,
      useNativeDriver: Platform.OS !== 'web',
    }).start();

    if (undoTimeout.current) clearTimeout(undoTimeout.current);
    undoTimeout.current = setTimeout(() => {
      dismissUndo();
    }, 4500);
  };

  const handleUndo = () => {
    if (!removedItem) return;
    addToCart(
      removedItem.product,
      removedItem.quantity,
      removedItem.deliveryDate,
      removedItem.timeSlot
    );
    dismissUndo();
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  };

  const dismissUndo = () => {
    Animated.timing(undoAnim, {
      toValue: 0,
      duration: Motion.fast,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      setRemovedItem(null);
    });
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (items.length === 0 && !removedItem) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <AppText variant="h1" serif={true} color={Colors.text}>
            Your Bag
          </AppText>
        </View>

        <EmptyState
          title="Your bag is waiting"
          description="You haven't selected any blooms yet. Discover our fresh luxury arrangements and bouquets."
          actionTitle="Browse the flower edit"
          onAction={() => router.push('/(tabs)/shop')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, isTablet && containerStyle]}>
        <AppText variant="h1" serif={true} color={Colors.text}>
          Your Bag
        </AppText>
        <AppText variant="bodySm" color={Colors.textSecondary}>
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </AppText>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, isTablet && containerStyle]}
      >
        {/* Cart Item Rows (simple rows, no nested cards) */}
        <View style={styles.itemsList}>
          {items.map((item) => {
            const prod = item.product;
            const prodId = (prod.id || prod._id || '') as string;
            const isFav = isInWishlist(prodId);
            const imageUri = getProductImageUrl(prod.images?.[0]);

            return (
              <View key={prodId} style={styles.itemRow}>
                {/* 72px Thumbnail with radius 16 */}
                <Image
                  source={{ uri: imageUri }}
                  style={styles.thumbnail}
                  contentFit="cover"
                />

                {/* Info Column */}
                <View style={styles.itemInfo}>
                  <AppText variant="caption" color={Colors.textSecondary}>
                    {prod.flowerType || prod.category || 'Luxury Floral'}
                  </AppText>

                  <AppText variant="body" weight="medium" numberOfLines={1}>
                    {prod.name}
                  </AppText>

                  <Price price={prod.price} size="small" />

                  {item.deliveryDate ? (
                    <AppText variant="caption" color={Colors.primaryDeep} style={{ marginTop: 2 }}>
                      {item.deliveryDate} • {item.timeSlot}
                    </AppText>
                  ) : null}

                  {/* Actions Row */}
                  <View style={styles.actionsRow}>
                    <QuantitySelector
                      quantity={item.quantity}
                      onIncrease={() => updateQuantity(prodId, 1)}
                      onDecrease={() => updateQuantity(prodId, -1)}
                    />

                    <View style={styles.rowRightBtns}>
                      <TouchableOpacity
                        onPress={() => toggleWishlist(prod)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={styles.actionIconButton}
                        accessibilityRole="button"
                        accessibilityLabel={isFav ? 'Remove from wishlist' : 'Save for later'}
                      >
                        <Heart
                          size={18}
                          color={isFav ? Colors.primary : Colors.textSecondary}
                          fill={isFav ? Colors.primary : 'transparent'}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleRemove(item)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={styles.actionIconButton}
                        accessibilityRole="button"
                        accessibilityLabel="Remove item"
                      >
                        <Trash2 size={18} color={Colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Clean Receipt Breakdown with dotted divider & emphasized total */}
        <View style={styles.receiptCard}>
          <AppText variant="caption" color={Colors.primaryDeep} weight="semiBold" style={{ letterSpacing: 1.2 }}>
            ORDER SUMMARY
          </AppText>

          <View style={styles.receiptRow}>
            <AppText variant="body" color={Colors.textSecondary}>
              Subtotal
            </AppText>
            <AppText variant="body" weight="medium" style={{ fontVariant: ['tabular-nums'] }}>
              ₹{subtotal.toLocaleString()}
            </AppText>
          </View>

          <View style={styles.receiptRow}>
            <AppText variant="body" color={Colors.textSecondary}>
              Delivery Fee
            </AppText>
            <AppText
              variant="body"
              weight="medium"
              color={deliveryFee === 0 ? Colors.success : Colors.text}
              style={{ fontVariant: ['tabular-nums'] }}
            >
              {deliveryFee === 0 ? 'Complimentary' : `₹${deliveryFee}`}
            </AppText>
          </View>

          {/* Dotted Divider */}
          <View style={styles.dottedDivider} />

          {/* Emphasized Total */}
          <View style={styles.totalRow}>
            <AppText variant="h2" weight="semiBold">
              Total
            </AppText>
            <AppText variant="h2" weight="semiBold" color={Colors.primaryDeep} style={{ fontVariant: ['tabular-nums'] }}>
              ₹{totalAmount.toLocaleString()}
            </AppText>
          </View>

          <View style={styles.taxNotice}>
            <AppText variant="caption" color={Colors.textSecondary}>
              Inclusive of all floral hydration wraps & local taxes.
            </AppText>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Undo Snackbar on Removal */}
      {removedItem && (
        <Animated.View
          style={[
            styles.undoSnackbar,
            {
              bottom: 96 + insets.bottom,
              opacity: undoAnim,
              transform: [
                {
                  translateY: undoAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [24, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <AppText variant="caption" color={Colors.white} numberOfLines={1} style={{ flex: 1 }}>
            Removed {removedItem.product.name}
          </AppText>
          <TouchableOpacity onPress={handleUndo} style={styles.undoBtn} accessibilityRole="button">
            <Undo2 size={14} color={Colors.white} style={{ marginRight: 4 }} />
            <AppText variant="caption" color={Colors.white} weight="bold">
              Undo
            </AppText>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Sticky Bottom Checkout Bar showing total in label */}
      <View
        style={[
          styles.stickyFooter,
          { paddingBottom: Math.max(insets.bottom, 16) },
          isTablet && { maxWidth: 640, alignSelf: 'center', width: '100%', borderRadius: 20, marginBottom: 12 },
        ]}
      >
        <View style={styles.securityRow}>
          <ShieldCheck size={16} color={Colors.success} />
          <AppText variant="caption" color={Colors.textSecondary}>
            100% Secure Checkout via Razorpay
          </AppText>
        </View>

        <AppButton
          title={`Continue to checkout · ₹${totalAmount.toLocaleString()}`}
          onPress={handleCheckout}
          variant="primary"
          size="large"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  itemsList: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    gap: 16,
    alignItems: 'center',
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: Radius.image,
    backgroundColor: Colors.blush,
  },
  itemInfo: {
    flex: 1,
    gap: 3,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  rowRightBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  receiptCard: {
    marginHorizontal: Spacing.screenPadding,
    marginTop: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  dottedDivider: {
    borderStyle: 'dashed',
    borderWidth: 0.8,
    borderColor: Colors.border,
    marginVertical: 14,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taxNotice: {
    marginTop: 8,
  },
  undoSnackbar: {
    position: 'absolute',
    left: Spacing.screenPadding,
    right: Spacing.screenPadding,
    backgroundColor: Colors.text,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderRadius: Radius.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.md,
    zIndex: 20,
  },
  undoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(233, 30, 99, 0.4)',
    borderRadius: Radius.chip,
    marginLeft: 8,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    ...Shadows.lg,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 10,
  },
});
