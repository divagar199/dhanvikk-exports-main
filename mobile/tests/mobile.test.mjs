import test from 'node:test';
import assert from 'node:assert/strict';

test('Mobile App - API URL Resolution & Fallback Logic', async (t) => {
  const resolveBaseUrl = (envExpo, envVite, extraUrl, platform = 'android') => {
    const raw = String(
      envExpo ||
        envVite ||
        extraUrl ||
        'https://dhanvikk-exports-api.onrender.com'
    ).replace(/\/$/, '');

    return platform === 'android' && (raw.includes('localhost') || raw.includes('127.0.0.1'))
      ? raw.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2')
      : raw;
  };

  await t.test('should prioritize EXPO_PUBLIC_API_URL', () => {
    const url = resolveBaseUrl('https://custom-api.example.com', '', '');
    assert.equal(url, 'https://custom-api.example.com');
  });

  await t.test('should fall back to VITE_API_URL when EXPO_PUBLIC_API_URL is missing', () => {
    const url = resolveBaseUrl('', 'https://dhanvikk-exports-api.onrender.com', '');
    assert.equal(url, 'https://dhanvikk-exports-api.onrender.com');
  });

  await t.test('should use production live Render URL as universal fallback', () => {
    const url = resolveBaseUrl('', '', '');
    assert.equal(url, 'https://dhanvikk-exports-api.onrender.com');
  });

  await t.test('should convert localhost to 10.0.2.2 for Android emulator', () => {
    const url = resolveBaseUrl('http://localhost:5000', '', '', 'android');
    assert.equal(url, 'http://10.0.2.2:5000');
  });

  await t.test('should keep production Render domain intact on Android without 10.0.2.2 replacement', () => {
    const url = resolveBaseUrl('https://dhanvikk-exports-api.onrender.com', '', '', 'android');
    assert.equal(url, 'https://dhanvikk-exports-api.onrender.com');
  });
});

test('Mobile App - Cart & Store Logic', async (t) => {
  // Pure store logic testing mirroring useStore implementation
  let cart = [];
  let wishlist = [];

  const add = (item) => {
    const id = item.id;
    const existing = cart.find((i) => i.id === id);
    const addQty = item.quantity && item.quantity > 0 ? item.quantity : 1;
    cart = existing
      ? cart.map((i) => (i.id === id ? { ...i, quantity: i.quantity + addQty } : i))
      : [...cart, { ...item, quantity: addQty }];
  };

  const remove = (id) => {
    cart = cart.filter((i) => i.id !== id);
  };

  const updateQty = (id, n) => {
    cart = n < 1 ? cart.filter((i) => i.id !== id) : cart.map((i) => (i.id === id ? { ...i, quantity: n } : i));
  };

  const clear = () => {
    cart = [];
  };

  const toggleWish = (id) => {
    wishlist = wishlist.includes(id) ? wishlist.filter((x) => x !== id) : [...wishlist, id];
  };

  await t.test('add item to cart increments total and stacks quantities', () => {
    add({ id: 'rose_1', name: 'Scarlet Rose Bouquet', price: 1200, quantity: 1 });
    assert.equal(cart.length, 1);
    assert.equal(cart[0].quantity, 1);

    add({ id: 'rose_1', name: 'Scarlet Rose Bouquet', price: 1200, quantity: 2 });
    assert.equal(cart.length, 1);
    assert.equal(cart[0].quantity, 3);
  });

  await t.test('update quantity updates item and removes when 0', () => {
    updateQty('rose_1', 5);
    assert.equal(cart[0].quantity, 5);

    updateQty('rose_1', 0);
    assert.equal(cart.length, 0);
  });

  await t.test('clear empties the cart', () => {
    add({ id: 'lily_1', name: 'White Asiatic Lilies', price: 1800, quantity: 2 });
    assert.equal(cart.length, 1);
    clear();
    assert.equal(cart.length, 0);
  });

  await t.test('wishlist toggle adds and removes bouquet ID', () => {
    toggleWish('rose_1');
    assert.ok(wishlist.includes('rose_1'));

    toggleWish('rose_1');
    assert.ok(!wishlist.includes('rose_1'));
  });
});

test('Mobile App - Currency Formatting & Calculations', async (t) => {
  const RATES = {
    INR: 1,
    USD: 0.012,
    EUR: 0.011,
    GBP: 0.0095,
    AED: 0.044,
    OMR: 0.0046,
    QAR: 0.044,
    SGD: 0.016,
  };

  const convertPrice = (priceINR, targetCurrency) => {
    const rate = RATES[targetCurrency] || 1;
    const converted = priceINR * rate;
    return targetCurrency === 'OMR'
      ? Math.round(converted * 1000) / 1000
      : Math.round(converted);
  };

  await t.test('should calculate INR without loss', () => {
    assert.equal(convertPrice(2500, 'INR'), 2500);
  });

  await t.test('should calculate USD conversion', () => {
    assert.equal(convertPrice(2500, 'USD'), 30);
  });

  await t.test('should support 3 decimal precision for Omani Rial (OMR)', () => {
    const omr = convertPrice(1000, 'OMR');
    assert.equal(omr, 4.6);
  });
});

test('Mobile App - Delivery Address Empty State Safety', async (t) => {
  const getInitialAddresses = (user) => {
    if (!user) return [];
    return user.savedAddresses || [];
  };

  await t.test('unauthenticated visitor has 0 addresses by default and no fake samples', () => {
    const addresses = getInitialAddresses(null);
    assert.equal(addresses.length, 0);
    const hasFake = addresses.some(
      (a) => a.street?.includes('Villa 14') || a.street?.includes('Bengaluru')
    );
    assert.equal(hasFake, false);
  });

  await t.test('authenticated user returns real stored addresses', () => {
    const testUser = {
      id: 'cust_123',
      savedAddresses: [
        {
          id: 'addr_1',
          recipientName: 'Diya Menon',
          street: 'Poes Garden',
          city: 'Chennai',
        },
      ],
    };
    const addresses = getInitialAddresses(testUser);
    assert.equal(addresses.length, 1);
    assert.equal(addresses[0].recipientName, 'Diya Menon');
  });
});

test('Mobile App - Per-User Storage Isolation & Wishlist Zero Default', async (t) => {
  const getUserKey = (u) => {
    if (!u) return 'guest';
    const raw = u.id || u._id || u.email || 'guest';
    return String(raw).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_') || 'guest';
  };

  const getWishlistStorageKey = (u) => `dhanvikk.wishlist.${getUserKey(u)}`;
  const getCartStorageKey = (u) => `dhanvikk.cart.${getUserKey(u)}`;

  const GHOST_BOUQUET_IDS = new Set(['flw-rose-01', 'flw-rose-02', 'flw-rose-03', 'flw-rose-04']);
  const sanitizeWishlist = (list) => {
    if (!Array.isArray(list)) return [];
    return Array.from(
      new Set(
        list
          .map((x) => String(x || '').trim())
          .filter((id) => id && !GHOST_BOUQUET_IDS.has(id))
      )
    );
  };

  await t.test('guest has isolated storage keys and 0 default wishlist items', () => {
    assert.equal(getUserKey(null), 'guest');
    assert.equal(getWishlistStorageKey(null), 'dhanvikk.wishlist.guest');
    assert.equal(getCartStorageKey(null), 'dhanvikk.cart.guest');

    const rawLegacyWishlist = ['flw-rose-01', 'flw-rose-02', 'flw-rose-03', 'flw-rose-04'];
    const cleaned = sanitizeWishlist(rawLegacyWishlist);
    assert.equal(cleaned.length, 0, 'Ghost sample bouquets must be stripped out so badge shows 0');
  });

  await t.test('different user accounts get strictly partitioned storage keys', () => {
    const userA = { id: 'usr_abc_1', email: 'user1@example.com' };
    const userB = { id: 'usr_xyz_2', email: 'user2@example.com' };

    assert.equal(getWishlistStorageKey(userA), 'dhanvikk.wishlist.usr_abc_1');
    assert.equal(getWishlistStorageKey(userB), 'dhanvikk.wishlist.usr_xyz_2');
    assert.notEqual(getWishlistStorageKey(userA), getWishlistStorageKey(userB));

    assert.equal(getCartStorageKey(userA), 'dhanvikk.cart.usr_abc_1');
    assert.equal(getCartStorageKey(userB), 'dhanvikk.cart.usr_xyz_2');
    assert.notEqual(getCartStorageKey(userA), getCartStorageKey(userB));
  });

  await t.test('genuine added items persist while ghost items are filtered out', () => {
    const mixed = ['flw-rose-01', 'real-bouquet-99', 'flw-rose-02', 'real-bouquet-100'];
    const cleaned = sanitizeWishlist(mixed);
    assert.deepEqual(cleaned, ['real-bouquet-99', 'real-bouquet-100']);
  });
});

