import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, radius, spacing } from '@/constants/theme';
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

  // Compute realistic original price & discount if missing
  const price = product.price || 999;
  const originalPrice =
    product.originalPrice && product.originalPrice > price
      ? product.originalPrice
      : Math.round(price * 1.35);
  const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);
  const rating = product.rating || 4.7;
  const reviewsCount = product.reviewsCount || Math.floor(25 + (price % 50));

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
          {discountPercent > 0 && (
            <View style={s.discountBadge}>
              <Text style={s.discountText}>{discountPercent}% OFF</Text>
            </View>
          )}
        </View>

        <View style={s.hBody}>
          <Text style={s.name} numberOfLines={1}>
            {product.name}
          </Text>

          <View style={s.ratingRow}>
            <View style={s.ratingBadge}>
              <Text style={s.ratingText}>{rating.toFixed(1)}</Text>
              <Ionicons name="star" size={10} color={colors.white} />
            </View>
            <Text style={s.reviewsText}>({reviewsCount})</Text>
          </View>

          <View style={s.priceRow}>
            <Text style={s.price}>₹{price.toLocaleString('en-IN')}</Text>
            <Text style={s.originalPrice}>₹{originalPrice.toLocaleString('en-IN')}</Text>
          </View>

          <Text style={s.freeDelivery}>⚡ Free Delivery</Text>
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

        {discountPercent > 0 && (
          <View style={s.discountBadge}>
            <Text style={s.discountText}>{discountPercent}% OFF</Text>
          </View>
        )}

        <Pressable
          style={s.heart}
          onPress={() => wish(id)}
          hitSlop={8}
          accessibilityLabel="Wishlist"
        >
          <Ionicons
            name={isSaved ? 'heart' : 'heart-outline'}
            size={18}
            color={isSaved ? colors.primary : colors.muted}
          />
        </Pressable>
      </View>

      <View style={s.body}>
        <Text style={s.categoryTag} numberOfLines={1}>
          {product.flowerType || product.category || 'FRESH BLOOM'}
        </Text>

        <Text style={s.name} numberOfLines={2}>
          {product.name}
        </Text>

        <View style={s.ratingRow}>
          <View style={s.ratingBadge}>
            <Text style={s.ratingText}>{rating.toFixed(1)}</Text>
            <Ionicons name="star" size={10} color={colors.white} />
          </View>
          <Text style={s.reviewsText}>({reviewsCount})</Text>
        </View>

        <View style={s.priceRow}>
          <Text style={s.price}>₹{price.toLocaleString('en-IN')}</Text>
          <Text style={s.originalPrice}>₹{originalPrice.toLocaleString('en-IN')}</Text>
          <Text style={s.savePercent}>{discountPercent}% off</Text>
        </View>

        <View style={s.footerRow}>
          <Text style={s.freeDelivery}>⚡ Free Delivery</Text>
          <Pressable
            style={s.addBtn}
            onPress={() => add({ ...product, quantity: 1 })}
            hitSlop={6}
          >
            <Ionicons name="add" size={16} color={colors.white} />
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
    borderColor: colors.lineLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pic: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.pale,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.discountGreen,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '900',
  },
  heart: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  body: {
    padding: 10,
  },
  categoryTag: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryDeep,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
    lineHeight: 18,
    minHeight: 36,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginVertical: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.starGreen,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    gap: 2,
  },
  ratingText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  reviewsText: {
    fontSize: 11,
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
    fontSize: 12,
    color: colors.mutedLight,
    textDecorationLine: 'line-through',
  },
  savePercent: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.discountGreen,
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
  freeDelivery: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.muted,
  },
  addBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.xs,
    gap: 2,
  },
  addBtnText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '900',
  },

  // Horizontal Card Styles for "Deal of the Day" rail
  hCard: {
    width: 150,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.lineLight,
  },
  hPic: {
    width: '100%',
    height: 140,
    backgroundColor: colors.pale,
  },
  hBody: {
    padding: 8,
  },
});