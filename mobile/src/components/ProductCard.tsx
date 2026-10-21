import { memo, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, radius, shadows, spacing } from '@/constants/theme';
import type { Product } from '@/types/models';
import { useStore } from '@/store/useStore';
import { useToast } from '@/context/ToastContext';
import { resolveImageUrl, FALLBACK_FLOWER_IMAGE } from '@/lib/imageUrl';

export const ProductCard = memo(function ProductCard({
  product,
  horizontal = false,
  cardWidth,
}: {
  product: Product;
  horizontal?: boolean;
  cardWidth?: number | string;
}) {
  const { showToast } = useToast();
  const cart = useStore((s) => s.cart);
  const add = useStore((s) => s.add);
  const qty = useStore((s) => s.qty);
  const wish = useStore((s) => s.wish);
  const saved = useStore((s) => s.wishlist);

  const id = String(product.id || product._id || product.slug);
  const allIds = [product.id, product._id, product.slug].filter(Boolean).map(String);
  const isSaved = allIds.some((cand) => saved.includes(cand));

  const inCartItem = cart.find((i) => {
    const itemIds = [i.id, i._id, i.slug].filter(Boolean).map(String);
    return allIds.some((cand) => itemIds.includes(cand));
  });
  const cartQty = inCartItem?.quantity || 0;

  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [id]);

  const rawImg = product.image || product.images?.[0];
  const imageUri = imageError ? FALLBACK_FLOWER_IMAGE : resolveImageUrl(rawImg);

  const price = product.price || 999;
  const originalPrice =
    product.originalPrice && product.originalPrice > price
      ? product.originalPrice
      : Math.round(price * 1.3);
  const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);
  const rating = product.rating || 4.8;
  const reviewsCount = product.reviewsCount || Math.floor(40 + (price % 60));

  if (horizontal) {
    return (
      <Pressable
        style={({ pressed }) => [
          s.hCard,
          pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
        ]}
        onPress={() => router.push(('/product/' + id) as any)}
      >
        <View style={s.hPic}>
          <Image
            source={{ uri: imageUri }}
            style={s.image}
            contentFit="cover"
            transition={100}
            cachePolicy="memory-disk"
            priority="high"
            recyclingKey={imageUri}
            onError={() => setImageError(true)}
          />
          <View style={s.originBadge}>
            <Text style={s.originText}>7,200ft Cut</Text>
          </View>
        </View>

        <View style={s.hBody}>
          <Text style={s.hName} numberOfLines={1}>
            {product.name}
          </Text>

          <View style={s.ratingRow}>
            <Ionicons name="star" size={11} color={colors.primary} />
            <Text style={s.ratingNum}>{rating.toFixed(1)}</Text>
            <Text style={s.reviewsCount}>({reviewsCount})</Text>
          </View>

          <View style={s.priceRow}>
            <Text style={s.price}>₹{price.toLocaleString('en-IN')}</Text>
            {discountPercent > 0 && (
              <Text style={s.originalPrice}>₹{originalPrice.toLocaleString('en-IN')}</Text>
            )}
          </View>

          <Text style={s.telemetryNotice}>⚡ Express 90m</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={[s.card, cardWidth !== undefined ? { width: cardWidth } : null]}>
      <View style={s.pic}>
        <Pressable
          style={s.picPressable}
          onPress={() => router.push(('/product/' + id) as any)}
        >
          <Image
            source={{ uri: imageUri }}
            style={s.image}
            contentFit="cover"
            transition={100}
            cachePolicy="memory-disk"
            priority="high"
            recyclingKey={imageUri}
            onError={() => setImageError(true)}
          />

          {/* Origin / Provenance Tag */}
          <View style={s.originBadge}>
            <Text style={s.originText}>Kotagiri • 7,200ft</Text>
          </View>
        </Pressable>

        {/* Wishlist Button */}
        <Pressable
          style={({ pressed }) => [
            s.heart,
            pressed && { transform: [{ scale: 0.85 }] },
          ]}
          onPress={(e) => {
            e?.stopPropagation?.();
            wish(id, {
              name: product.name,
              price,
              image: imageUri,
              altIds: allIds,
            });
            showToast(
              isSaved ? 'Removed from Wishlist' : 'Saved to Wishlist ❤️',
              product.name,
              'info',
              2000
            );
          }}
          hitSlop={8}
          accessibilityLabel={isSaved ? 'Remove from Wishlist' : 'Save to Wishlist'}
        >
          <Ionicons
            name={isSaved ? 'heart' : 'heart-outline'}
            size={18}
            color={isSaved ? '#E11D48' : colors.ink}
          />
        </Pressable>
      </View>

      <View style={s.body}>
        <Pressable
          style={({ pressed }) => [
            s.bodyClickable,
            pressed && { opacity: 0.85 },
          ]}
          onPress={() => router.push(('/product/' + id) as any)}
        >
          <Text style={s.categoryTag} numberOfLines={1}>
            {product.flowerType || product.category || 'Blooms and Exports'}
          </Text>

          <Text style={s.name} numberOfLines={2}>
            {product.name}
          </Text>

          <View style={s.ratingRow}>
            <View style={s.starGroup}>
              <Ionicons name="star" size={11} color={colors.primary} />
              <Text style={s.ratingNum}>{rating.toFixed(1)}</Text>
            </View>
            <Text style={s.dotSep}>•</Text>
            <Text style={s.reviewsCount}>{reviewsCount} reviews</Text>
          </View>

          <View style={s.priceRow}>
            <Text style={s.price}>₹{price.toLocaleString('en-IN')}</Text>
            {originalPrice > price && (
              <Text style={s.originalPrice}>₹{originalPrice.toLocaleString('en-IN')}</Text>
            )}
            {discountPercent > 0 && (
              <View style={s.discountPill}>
                <Text style={s.discountPillText}>{discountPercent}% OFF</Text>
              </View>
            )}
          </View>
        </Pressable>

        <View style={s.footerRow}>
          <View style={s.deliveryTag}>
            <Ionicons name="flash" size={10} color={colors.secondary} />
            <Text style={s.deliveryText}>Express 90m</Text>
          </View>

          {cartQty > 0 ? (
            <View style={s.stepperContainer}>
              <Pressable
                style={({ pressed }) => [
                  s.stepperBtn,
                  pressed && { opacity: 0.6, transform: [{ scale: 0.88 }] },
                ]}
                onPress={() => qty(id, cartQty - 1)}
                hitSlop={6}
                accessibilityLabel="Decrease quantity"
              >
                <Ionicons
                  name={cartQty === 1 ? 'trash-outline' : 'remove'}
                  size={12}
                  color={colors.primary}
                />
              </Pressable>
              <Text style={s.stepperQtyText}>{cartQty}</Text>
              <Pressable
                style={({ pressed }) => [
                  s.stepperBtn,
                  pressed && { opacity: 0.6, transform: [{ scale: 0.88 }] },
                ]}
                onPress={() => qty(id, cartQty + 1)}
                hitSlop={6}
                accessibilityLabel="Increase quantity"
              >
                <Ionicons name="add" size={12} color={colors.primary} />
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={({ pressed }) => [
                s.addBtn,
                pressed && { opacity: 0.82, transform: [{ scale: 0.93 }] },
              ]}
              onPress={() => {
                add({
                  ...product,
                  id,
                  name: product.name,
                  price,
                  image: imageUri,
                  quantity: 1,
                });
                showToast('Added to Cart! 🌸', `${product.name} added to your bag.`, 'success');
              }}
              hitSlop={6}
              accessibilityLabel={`Add ${product.name} to cart`}
            >
              <Ionicons name="add" size={15} color={colors.white} />
              <Text style={s.addBtnText}>ADD</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  card: {
    width: '48.5%',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.line,
    ...(shadows?.soft || {}),
  },
  pic: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.surfaceContainer,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  originBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(253, 251, 247, 0.94)',
    borderWidth: 0.5,
    borderColor: colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: radius.pill,
  },
  originText: {
    color: colors.primary,
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  heart: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    ...(shadows?.soft || {}),
    elevation: 6,
  },
  body: {
    padding: 10,
  },
  categoryTag: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  name: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
    lineHeight: 18,
    minHeight: 36,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    gap: 4,
  },
  starGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingNum: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.ink,
  },
  dotSep: {
    fontSize: 10,
    color: colors.mutedLight,
  },
  reviewsCount: {
    fontSize: 10,
    color: colors.muted,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  price: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.ink,
  },
  originalPrice: {
    fontSize: 11,
    color: colors.mutedLight,
    textDecorationLine: 'line-through',
  },
  discountPill: {
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  discountPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.primary,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.lineLight,
  },
  deliveryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  deliveryText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.secondary,
  },
  addBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: radius.pill,
    gap: 2,
    borderWidth: 0.8,
    borderColor: colors.primaryDeep,
    ...(shadows?.soft || {}),
  },
  addBtnText: {
    color: colors.white,
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  picPressable: {
    width: '100%',
    height: '100%',
  },
  bodyClickable: {
    width: '100%',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 4,
    minWidth: 68,
    justifyContent: 'space-between',
    ...(shadows?.soft || {}),
  },
  stepperBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  stepperQtyText: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.primary,
    minWidth: 14,
    textAlign: 'center',
  },

  // Horizontal Card Styles for Reserve rail
  hCard: {
    width: 156,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.line,
    ...(shadows?.soft || {}),
  },
  hPic: {
    width: '100%',
    height: 140,
    backgroundColor: colors.surfaceContainer,
    position: 'relative',
  },
  hBody: {
    padding: 8,
  },
  hName: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 2,
  },
  telemetryNotice: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.secondary,
    marginTop: 4,
  },
});