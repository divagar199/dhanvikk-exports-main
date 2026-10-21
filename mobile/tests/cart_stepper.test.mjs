import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Test our pure cart logic methods
const parsePrice = (price) => {
  if (typeof price === 'number') return isNaN(price) ? 999 : price;
  if (!price) return 999;
  const cleaned = String(price).replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 999 : num;
};

const sanitizeCartItem = (p, quantity = 1) => {
  const canonicalId = String(p.id || p._id || p.slug || `stem_${Date.now()}`);
  return {
    id: canonicalId,
    _id: canonicalId,
    slug: String(p.slug || canonicalId),
    name: String(p.name || 'Floral Arrangement'),
    category: typeof p.category === 'object' && p.category !== null ? String(p.category.name || 'Flowers') : String(p.category || 'Luxury Flowers'),
    flowerType: p.flowerType ? String(p.flowerType) : undefined,
    price: parsePrice(p.price),
    originalPrice: p.originalPrice ? parsePrice(p.originalPrice) : undefined,
    stock: p.stock !== undefined ? Number(p.stock) : 99,
    image: p.image || p.images?.[0] || '',
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.image ? [p.image] : []),
    quantity: Math.max(1, Number(quantity) || 1),
    description: typeof p.description === 'string' ? p.description.slice(0, 160) : '',
  };
};

const matchesCartItem = (item, targetId) => {
  if (!targetId || !item) return false;
  const target = String(targetId).trim().toLowerCase();
  const cands = [item.id, item._id, item.slug]
    .filter(Boolean)
    .map((x) => String(x).trim().toLowerCase());
  return cands.includes(target);
};

const cartTotal = (c) =>
  c.reduce((n, x) => n + parsePrice(x.price) * Math.max(1, Number(x.quantity) || 1), 0);

describe('Shopping Cart & Stepper Reliability Tests', () => {
  test('matchesCartItem matches by MongoDB _id, id, and slug', () => {
    const item = {
      id: 'rose-01',
      _id: '671abc1234567890',
      slug: 'royal-ooty-rose',
      name: 'Royal Ooty Red Rose',
      price: 1299,
      quantity: 2,
    };

    assert.equal(matchesCartItem(item, '671abc1234567890'), true);
    assert.equal(matchesCartItem(item, 'rose-01'), true);
    assert.equal(matchesCartItem(item, 'royal-ooty-rose'), true);
    assert.equal(matchesCartItem(item, 'different-id'), false);
  });

  test('sanitizeCartItem strips large payload and protects against 2048-byte limits', () => {
    const heavyProduct = {
      _id: '671abc1234567890',
      name: 'Grand Nilgiri Bouquet',
      price: '₹2,499',
      description: 'A'.repeat(5000), // huge description
      reviews: Array(50).fill({ comment: 'Beautiful bloom', rating: 5 }), // heavy reviews
    };

    const clean = sanitizeCartItem(heavyProduct, 2);
    assert.equal(clean.id, '671abc1234567890');
    assert.equal(clean.price, 2499);
    assert.equal(clean.quantity, 2);
    assert.equal(clean.reviews, undefined);
    assert.ok(clean.description.length <= 160);
    assert.ok(JSON.stringify(clean).length < 400); // lightweight!
  });

  test('cartTotal correctly handles string prices and quantity multiplication', () => {
    const items = [
      { id: '1', price: '₹1,200', quantity: 2 }, // 2400
      { id: '2', price: 800, quantity: 1 },      // 800
      { id: '3', price: '450.50', quantity: 3 }, // 1351.5
    ];

    const total = cartTotal(items);
    assert.equal(total, 4551.5);
  });

  test('quantity stepper increment, decrement, and removal', () => {
    let cart = [
      sanitizeCartItem({ id: 'stem-1', name: 'Lily', price: 500 }, 1),
    ];

    // Increment
    cart = cart.map((i) => matchesCartItem(i, 'stem-1') ? { ...i, quantity: i.quantity + 1 } : i);
    assert.equal(cart[0].quantity, 2);

    // Decrement
    cart = cart.map((i) => matchesCartItem(i, 'stem-1') ? { ...i, quantity: i.quantity - 1 } : i);
    assert.equal(cart[0].quantity, 1);

    // Decrement below 1 removes item
    const targetQty = 0;
    cart = targetQty < 1
      ? cart.filter((i) => !matchesCartItem(i, 'stem-1'))
      : cart.map((i) => matchesCartItem(i, 'stem-1') ? { ...i, quantity: targetQty } : i);

    assert.equal(cart.length, 0);
  });
});
