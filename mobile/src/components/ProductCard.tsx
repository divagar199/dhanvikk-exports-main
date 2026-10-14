import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, radius, shadows, spacing } from '@/constants/theme';
import type { Product } from '@/types/models';
import { useStore } from '@/store/useStore';
import { resolveImageUrl, FALLBACK_FLOWER_IMAGE } from '@/lib/imageUrl';

export function ProductCard({
  product,
  horizontal = false,
}: {
  product: Product;
  horizontal?: boolean;
}) {
  const add = useStore((s) => s.add);
  const wish = useStore((s) => s.wish);
  const saved = useStore((s) => s.wishlist);

  const id = product.id || product._id || product.slug;
  const isSaved = saved.includes(id);

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
        style={s.hCard}
        onPress={() => router.push(('/product/' + id) as any)}
      >
        <View style={s.hPic}>
          <Image
            source={{ uri: imageUri }}
            style={s.image}
            contentFit="cover"
            transition={150}
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
            <Ionicons name="star" size={11} color={colors.accent} />
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
    <Pressable
      style={s.card}
      onPress={() => router.push(('/product/' + id) as any)}
    >
      <View style={s.pic}>
        <Image
          source={{ uri: imageUri }}
          style={s.image}
          contentFit="cover"
          transition={150}
          onError={() => setImageError(true)}
        />

        {/* Origin / Provenance Tag */}
        <View style={s.originBadge}>
          <Text style={s.originText}>Kotagiri • 7,200ft</Text>
        </View>

        {/* Wishlist Button */}
        <Pressable
          style={s.heart}
          onPress={() => wish(id)}
          hitSlop={8}
          accessibilityLabel="Wishlist"
        >
          <Ionicons
            name={isSaved ? 'heart' : 'heart-outline'}
            size={17}
            color={isSaved ? colors.primary : colors.ink}
          />
        </Pressable>
      </View>

      <View style={s.body}>
        <Text style={s.categoryTag} numberOfLines={1}>
          {product.flowerType || product.category || 'HAUTE FLORICULTURE'}
        </Text>

        <Text style={s.name} numberOfLines={2}>
          {product.name}
        </Text>

        <View style={s.ratingRow}>
          <View style={s.starGroup}>
            <Ionicons name="star" size={11} color={colors.accent} />
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

        <View style={s.footerRow}>
          <View style={s.deliveryTag}>
            <Ionicons name="flash" size={10} color={colors.secondary} />
            <Text style={s.deliveryText}>Express 90m</Text>
          </View>

          <Pressable
            style={s.addBtn}
            onPress={() => add({ ...product, quantity: 1 })}
            hitSlop={6}
          >
            <Ionicons name="add" size={15} color={colors.white} />
            <Text style={s.addBtnText}>ADD</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    width: '48.5%',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.soft,
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
    borderColor: colors.lineGold,
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
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 0.5,
    borderColor: colors.lineGold,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
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
    borderColor: colors.accent,
    ...shadows.soft,
  },
  addBtnText: {
    color: colors.white,
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.3,
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
    ...shadows.soft,
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