import React, { useState } from 'react';
import {
  View,
  Pressable,
  TouchableOpacity,
  Animated,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Heart, Plus, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Radius, Shadows, Motion } from '../theme';
import { Product } from '../types';
import { getProductImageUrl } from '../utils/imageUrl';
import { AppText } from './AppText';
import { Price } from './Price';
import { Rating } from './Rating';
import { Badge } from './Badge';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { useUIStore } from '../store/uiStore';

export interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  style?: ViewStyle;
  width?: number | string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  style,
  width,
}) => {
  const prodId = product.id || product._id || '';
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();
  const inCart = useCartStore((state) =>
    state.items.some((item) => (item.product.id || item.product._id) === prodId)
  );
  const cartItem = useCartStore((state) =>
    state.items.find((item) => (item.product.id || item.product._id) === prodId)
  );
  const { showToast } = useUIStore();

  const [justAdded, setJustAdded] = useState(false);
  const [cardScale] = useState(() => new Animated.Value(1));
  const [btnScale] = useState(() => new Animated.Value(1));

  const isFav = isInWishlist(prodId);
  const imageSource = getProductImageUrl(product.images?.[0]);
  const isChecked = inCart || justAdded;

  const handlePressIn = () => {
    Animated.timing(cardScale, {
      toValue: 0.97,
      duration: Motion.instant,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(cardScale, {
      toValue: 1,
      damping: Motion.spring.damping,
      stiffness: Motion.spring.stiffness,
      mass: Motion.spring.mass,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const handleToggleWishlist = (e?: any) => {
    e?.stopPropagation?.();
    toggleWishlist(product);
  };

  const handleAddToCart = (e?: any) => {
    e?.stopPropagation?.();
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }

    Animated.sequence([
      Animated.timing(btnScale, {
        toValue: 1.25,
        duration: 100,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(btnScale, {
        toValue: 1,
        damping: 10,
        stiffness: 220,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    addToCart(product, 1);
    setJustAdded(true);
    const newQty = (cartItem?.quantity || 0) + 1;
    showToast(
      inCart
        ? `${product.name} quantity updated (${newQty} in bag)`
        : `${product.name} added to bag`,
      'success'
    );
    setTimeout(() => {
      setJustAdded(false);
    }, 1200);
  };

  // Discount & Offers calculation
  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
  const discountPercent = hasDiscount
    ? Math.round((((product.originalPrice! - product.price) / product.originalPrice!) * 100))
    : 0;

  // Status flags
  const isBestseller = Boolean(product.isBestSeller);
  const isNew = Boolean(product.isNewArrival || product.tag === 'NEW');
  const tagUpper = (product.tag || '').toUpperCase();
  const isOfferTag = Boolean(
    !hasDiscount &&
      product.tag &&
      product.tag !== 'NEW' &&
      (tagUpper.includes('SALE') ||
        tagUpper.includes('OFF') ||
        tagUpper.includes('DEAL') ||
        tagUpper.includes('SPECIAL'))
  );

  return (
    <Animated.View
      style={[
        styles.root,
        width !== undefined ? { width: width as any } : undefined,
        { transform: [{ scale: cardScale }] },
        style,
      ]}
    >
      <View style={styles.container}>
        {/* 4:5 Image Container with independent navigation pressable and floating actions */}
        <View style={styles.imageContainer}>
          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={() => onPress(product)}
            style={StyleSheet.absoluteFill}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`${product.name}, ${product.price} rupees`}
          >
            <Image
              source={{ uri: imageSource }}
              style={styles.image}
              contentFit="cover"
              transition={300}
            />
          </Pressable>

          {/* Top-left Badges (Offers & Status, never suppresses discounts) */}
          {(discountPercent > 0 || isOfferTag || isBestseller || isNew) && (
            <View pointerEvents="none" style={styles.badgeWrapper}>
              {discountPercent > 0 ? (
                <Badge label={`${discountPercent}% OFF`} variant="success" />
              ) : isOfferTag ? (
                <Badge label={product.tag!} variant="success" />
              ) : null}

              {isBestseller ? (
                <Badge label="Bestseller" variant="gold" />
              ) : isNew ? (
                <Badge label="New" variant="primary" />
              ) : null}
            </View>
          )}

          {/* Top-right Wishlist Button (34px circular, 44px hit area) */}
          <TouchableOpacity
            onPress={handleToggleWishlist}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[styles.wishlistButton, isFav && styles.wishlistActive]}
            accessibilityRole="button"
            accessibilityLabel={isFav ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              size={18}
              color={isFav ? Colors.primary : Colors.textSecondary}
              fill={isFav ? Colors.primary : 'transparent'}
            />
          </TouchableOpacity>

          {/* Bottom-right Quick Add Button: checked state persists when in bag */}
          {product.inStock ? (
            <Animated.View style={[styles.addButtonWrapper, { transform: [{ scale: btnScale }] }]}>
              <TouchableOpacity
                onPress={handleAddToCart}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={[styles.addButton, isChecked && styles.addedButton]}
                accessibilityRole="button"
                accessibilityLabel={isChecked ? `${product.name} in bag, tap to add more` : 'Add to bag'}
              >
                {isChecked ? (
                  <Check size={18} color={Colors.white} strokeWidth={2.6} />
                ) : (
                  <Plus size={18} color={Colors.white} strokeWidth={2.2} />
                )}
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <View pointerEvents="none" style={styles.outOfStockBadge}>
              <AppText variant="caption" color={Colors.white} weight="semiBold">
                Out of stock
              </AppText>
            </View>
          )}
        </View>

        {/* Product Details (tapping content also navigates to product details) */}
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => onPress(product)}
          style={styles.content}
        >
          {/* Flower Type / Subcategory */}
          <AppText
            variant="caption"
            color={Colors.textSecondary}
            numberOfLines={1}
            style={styles.categoryText}
          >
            {product.flowerType || product.subCategory || product.category || 'Luxury Floral'}
          </AppText>

          {/* Product Name (strictly locked to 2 lines height) */}
          <AppText
            variant="bodySm"
            weight="medium"
            color={Colors.text}
            numberOfLines={2}
            style={styles.name}
          >
            {product.name}
          </AppText>

          {/* Price & Offer Row */}
          <View style={styles.priceRow}>
            <Price
              price={product.price}
              originalPrice={product.originalPrice}
              size="normal"
            />
          </View>

          {/* Rating (uniform baseline height) */}
          <View style={styles.ratingRow}>
            {product.rating && product.rating > 0 ? (
              <Rating rating={product.rating} reviewsCount={product.reviewsCount} />
            ) : null}
          </View>
        </Pressable>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: '100%',
    alignSelf: 'stretch',
  },
  container: {
    width: '100%',
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4 / 5,
    backgroundColor: Colors.blush,
    overflow: 'hidden',
    position: 'relative',
    borderTopLeftRadius: Radius.card,
    borderTopRightRadius: Radius.card,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeWrapper: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 2,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    maxWidth: '65%',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.90)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    ...Shadows.sm,
  },
  wishlistActive: {
    backgroundColor: Colors.white,
  },
  addButtonWrapper: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    zIndex: 2,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  addedButton: {
    backgroundColor: Colors.success,
  },
  outOfStockBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(36, 27, 31, 0.75)',
    paddingVertical: 4,
    borderRadius: Radius.chip,
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    minHeight: 128,
    justifyContent: 'space-between',
  },
  categoryText: {
    lineHeight: 14,
    marginBottom: 2,
  },
  name: {
    minHeight: 34,
    maxHeight: 38,
    lineHeight: 18,
  },
  priceRow: {
    minHeight: 24,
    justifyContent: 'center',
    marginVertical: 2,
  },
  ratingRow: {
    minHeight: 18,
    justifyContent: 'center',
  },
});

export default ProductCard;
