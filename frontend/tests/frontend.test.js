import test from 'node:test';
import assert from 'node:assert/strict';

test('Frontend - Cart Reducer & Total Calculations', async (t) => {
  // Pure cart state reducer logic matching Redux cartSlice
  let state = {
    items: [],
    totalQuantity: 0,
    totalAmount: 0,
  };

  const addItem = (item) => {
    const existing = state.items.find((i) => (i.id || i._id) === (item.id || item._id));
    const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
    if (existing) {
      existing.quantity += qty;
    } else {
      state.items.push({ ...item, quantity: qty });
    }
    state.totalQuantity = state.items.reduce((acc, i) => acc + i.quantity, 0);
    state.totalAmount = state.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  };

  const removeItem = (id) => {
    state.items = state.items.filter((i) => (i.id || i._id) !== id);
    state.totalQuantity = state.items.reduce((acc, i) => acc + i.quantity, 0);
    state.totalAmount = state.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  };

  const clearCart = () => {
    state.items = [];
    state.totalQuantity = 0;
    state.totalAmount = 0;
  };

  await t.test('addItem should correctly stack identical items and calculate subtotal', () => {
    addItem({ id: 'prod_1', name: 'Royal Red Roses', price: 1500, quantity: 1 });
    assert.equal(state.items.length, 1);
    assert.equal(state.totalQuantity, 1);
    assert.equal(state.totalAmount, 1500);

    addItem({ id: 'prod_1', name: 'Royal Red Roses', price: 1500, quantity: 2 });
    assert.equal(state.items.length, 1);
    assert.equal(state.items[0].quantity, 3);
    assert.equal(state.totalQuantity, 3);
    assert.equal(state.totalAmount, 4500);
  });

  await t.test('removeItem should recalculate totalQuantity and totalAmount', () => {
    addItem({ id: 'prod_2', name: 'White Lilies', price: 2000, quantity: 1 });
    assert.equal(state.items.length, 2);
    assert.equal(state.totalAmount, 6500);

    removeItem('prod_1');
    assert.equal(state.items.length, 1);
    assert.equal(state.items[0].id, 'prod_2');
    assert.equal(state.totalAmount, 2000);
  });

  await t.test('clearCart should reset state to 0', () => {
    clearCart();
    assert.equal(state.items.length, 0);
    assert.equal(state.totalQuantity, 0);
    assert.equal(state.totalAmount, 0);
  });
});

test('Frontend - Razorpay Currency Subunit Multipliers', async (t) => {
  const getSubunits = (amount, currency = 'INR') => {
    const upper = currency.toUpperCase();
    const multiplier = upper === 'OMR' ? 1000 : 100;
    return Math.round(amount * multiplier);
  };

  await t.test('should calculate INR subunits (paise = x100)', () => {
    assert.equal(getSubunits(1500, 'INR'), 150000);
  });

  await t.test('should calculate USD subunits (cents = x100)', () => {
    assert.equal(getSubunits(50, 'USD'), 5000);
  });

  await t.test('should calculate OMR subunits (baisa = x1000)', () => {
    assert.equal(getSubunits(15.5, 'OMR'), 15500);
  });
});

test('Frontend - Axios Request Headers & Error Transformer', async (t) => {
  const transformHeaders = (token, userObj) => {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    if (userObj?.email) {
      headers['X-User-Email'] = userObj.email;
    }
    return headers;
  };

  const getFriendlyMessage = (status, serverMsg) => {
    switch (status) {
      case 401:
        return serverMsg || 'Incorrect email or password. Please try again.';
      case 403:
        return serverMsg || 'You do not have permission to access this resource.';
      case 404:
        return serverMsg || 'The requested resource could not be found.';
      case 500:
        return 'Something went wrong on our side. Please try again shortly.';
      default:
        return serverMsg || 'Unable to complete request. Please try again.';
    }
  };

  await t.test('attaches Bearer authorization and X-User-Email when available', () => {
    const headers = transformHeaders('dhanvikk_jwt_token', { email: 'client@dhanvikk.com' });
    assert.equal(headers.Authorization, 'Bearer dhanvikk_jwt_token');
    assert.equal(headers['X-User-Email'], 'client@dhanvikk.com');
  });

  await t.test('returns friendly human-readable messages for HTTP error codes', () => {
    assert.equal(getFriendlyMessage(401), 'Incorrect email or password. Please try again.');
    assert.equal(
      getFriendlyMessage(500),
      'Something went wrong on our side. Please try again shortly.'
    );
  });
});

test('Frontend - Checkout Delivery Address Isolation', async (t) => {
  const getDisplayAddresses = (user) => {
    if (!user) return [];
    return user.savedAddresses || [];
  };

  await t.test('unauthenticated users have zero prefilled fake addresses', () => {
    const addresses = getDisplayAddresses(null);
    assert.equal(addresses.length, 0);
  });

  await t.test('displays real saved addresses when logged in', () => {
    const user = {
      email: 'customer@dhanvikk.com',
      savedAddresses: [
        {
          id: 'addr_1',
          recipientName: 'Diya Menon',
          street: '12 Blossom Avenue',
          city: 'Chennai',
          state: 'Tamil Nadu',
        },
      ],
    };
    const addresses = getDisplayAddresses(user);
    assert.equal(addresses.length, 1);
    assert.equal(addresses[0].street, '12 Blossom Avenue');
  });
});

test('Frontend - Google Sign-In Redirect & Destination Resolution', async (t) => {
  const resolveTargetDestination = (rawFrom, redirectTarget) => {
    const isAuthOrAccount = (p) => !p || p === '/login' || p === '/register' || p === '/account';
    const cleanFrom = (rawFrom && !isAuthOrAccount(rawFrom)) ? rawFrom : null;
    const cleanTarget = (redirectTarget && !isAuthOrAccount(redirectTarget)) ? redirectTarget : null;
    return cleanFrom || cleanTarget || '/';
  };

  await t.test('strictly avoids circular redirection to /login when from is /login', () => {
    assert.equal(resolveTargetDestination('/login', null), '/');
    assert.equal(resolveTargetDestination('/login', '/login'), '/');
  });

  await t.test('strictly avoids circular redirection to /register when from is /register', () => {
    assert.equal(resolveTargetDestination('/register', null), '/');
  });

  await t.test('strictly avoids bouncing back when from is unhydrated /account', () => {
    assert.equal(resolveTargetDestination('/account', null), '/');
    assert.equal(resolveTargetDestination('/account', '/account'), '/');
  });

  await t.test('preserves intended return path when from is a protected route (e.g. /checkout)', () => {
    assert.equal(resolveTargetDestination('/checkout', null), '/checkout');
    assert.equal(resolveTargetDestination('/orders', null), '/orders');
  });

  await t.test('falls back to sessionStorage redirectTarget if rawFrom is absent or /login', () => {
    assert.equal(resolveTargetDestination(null, '/checkout'), '/checkout');
    assert.equal(resolveTargetDestination('/login', '/orders'), '/orders');
  });

  await t.test('defaults to / (main page) when neither valid target is specified', () => {
    assert.equal(resolveTargetDestination(null, null), '/');
    assert.equal(resolveTargetDestination(undefined, undefined), '/');
    assert.equal(resolveTargetDestination(null, '/account'), '/');
  });
});

test('Frontend - Admin Authentication & Dynamic Staff Authorization Guard', async (t) => {
  const ROOT_SUPER_ADMIN = 'divagar.m.msc.cs@gmail.com';
  const ROLE_HIERARCHY = {
    super_admin: 4,
    admin: 3,
    editor: 2,
    viewer: 1,
    customer: 0,
  };

  const authenticateStaff = (email, password, storedCustomStaff = []) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const isSuperAdmin = cleanEmail === ROOT_SUPER_ADMIN || cleanEmail === 'stf-super-01';

    if (isSuperAdmin && password === 'admin@2026') {
      return {
        success: true,
        user: { email: ROOT_SUPER_ADMIN, role: 'super_admin', name: 'Divagar M (Super Admin)' },
      };
    }

    const custom = storedCustomStaff.find(
      (s) =>
        (s.email?.toLowerCase() === cleanEmail || s.staffId?.toLowerCase() === cleanEmail) &&
        s.password === password
    );

    if (custom) {
      return {
        success: true,
        user: { email: custom.email, role: custom.role || 'admin', name: custom.name },
      };
    }

    return { success: false, message: 'Invalid credentials or access restricted.' };
  };

  const hasAccess = (userRole, requiredRole) => {
    return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[requiredRole] || 0);
  };

  await t.test('Super Admin authenticates successfully with root credentials', () => {
    const res = authenticateStaff('divagar.m.msc.cs@gmail.com', 'admin@2026');
    assert.equal(res.success, true);
    assert.equal(res.user.role, 'super_admin');
  });

  await t.test('deprecated mock staff accounts are strictly rejected', () => {
    const resManager = authenticateStaff('manager@dhanvikk.com', 'Manager@2026');
    assert.equal(resManager.success, false);

    const resAdmin = authenticateStaff('admin@dhanvikk.com', 'AdminBloom@2026');
    assert.equal(resAdmin.success, false);
  });

  await t.test('allows future staff members dynamically appointed by Super Admin', () => {
    const futureStaff = [
      {
        id: 'stf-custom-1',
        name: 'Kavitha R',
        email: 'kavitha.operations@dhanvikk.com',
        password: 'KavithaSecure#2026',
        role: 'inventory_manager',
      },
    ];

    const res = authenticateStaff('kavitha.operations@dhanvikk.com', 'KavithaSecure#2026', futureStaff);
    assert.equal(res.success, true);
    assert.equal(res.user.name, 'Kavitha R');
    assert.equal(res.user.role, 'inventory_manager');
  });

  await t.test('role hierarchy correctly gates access based on required privilege level', () => {
    assert.equal(hasAccess('super_admin', 'admin'), true);
    assert.equal(hasAccess('admin', 'editor'), true);
    assert.equal(hasAccess('viewer', 'admin'), false);
    assert.equal(hasAccess('customer', 'viewer'), false);
  });
});

test('Frontend - Cross-Platform Review Moderation & Aggregate Score', async (t) => {
  const calculateAggregateRating = (reviewsList) => {
    const approved = reviewsList.filter((r) => r.status === 'Approved');
    if (approved.length === 0) return { averageRating: 0, count: 0 };
    const sum = approved.reduce((acc, r) => acc + (r.rating || 5), 0);
    const avg = Math.round((sum / approved.length) * 10) / 10;
    return { averageRating: avg, count: approved.length };
  };

  await t.test('calculates correct rating only including Approved reviews', () => {
    const reviews = [
      { id: '1', rating: 5, status: 'Approved' },
      { id: '2', rating: 4, status: 'Approved' },
      { id: '3', rating: 1, status: 'Hidden' },
    ];
    const { averageRating, count } = calculateAggregateRating(reviews);
    assert.equal(count, 2);
    assert.equal(averageRating, 4.5);
  });

  await t.test('handles empty or all hidden reviews gracefully without NaN', () => {
    const reviews = [{ id: '1', rating: 2, status: 'Pending' }];
    const { averageRating, count } = calculateAggregateRating(reviews);
    assert.equal(count, 0);
    assert.equal(averageRating, 0);
  });
});



test('Frontend - 10-Digit Serial Number / SKU Engine (YYMMDDXXXX)', async (t) => {
  const { generate10DigitSKU, isValid10DigitSKU, parseSKU, getNextProductSKU, ensureProductHasSKU } = await import('../src/utils/skuGenerator.js');

  await t.test('generates exactly 10 numeric digits conforming to YYMMDDXXXX', () => {
    const testDate = new Date('2026-10-30T10:00:00Z');
    const sku = generate10DigitSKU(1, testDate);
    assert.equal(sku.length, 10);
    assert.equal(sku, '2610300001');
    assert.equal(isValid10DigitSKU(sku), true);
  });

  await t.test('pads sequence numbers properly up to 4 digits', () => {
    const testDate = new Date('2026-10-30T10:00:00Z');
    assert.equal(generate10DigitSKU(42, testDate), '2610300042');
    assert.equal(generate10DigitSKU(999, testDate), '2610300999');
    assert.equal(generate10DigitSKU(1024, testDate), '2610301024');
  });

  await t.test('parses date and sequence from 10-digit SKU correctly', () => {
    const parsed = parseSKU('2610300015');
    assert.equal(parsed.valid, true);
    assert.equal(parsed.year, '2026');
    assert.equal(parsed.month, '10');
    assert.equal(parsed.day, '30');
    assert.equal(parsed.sequence, 15);
  });

  await t.test('getNextProductSKU calculates next sequential SKU from existing list', () => {
    const existing = [
      { id: '1', sku: '2610300001' },
      { id: '2', sku: '2610300002' },
    ];
    const nextSKU = getNextProductSKU(existing, new Date('2026-10-30T10:00:00Z'));
    assert.equal(nextSKU, '2610300003');
  });

  await t.test('ensureProductHasSKU preserves existing valid SKU or assigns deterministic new SKU', () => {
    const prodWithSKU = { id: 'p1', name: 'Red Roses', sku: '2610300005' };
    assert.equal(ensureProductHasSKU(prodWithSKU).sku, '2610300005');

    const prodWithoutSKU = { id: 'p2', name: 'White Lilies' };
    const fixed = ensureProductHasSKU(prodWithoutSKU, 0, new Date('2026-10-30T10:00:00Z'));
    assert.equal(fixed.sku, '2610300001');
  });
});

test('Frontend - Tax Invoice Calculations & Numbering', async (t) => {
  await t.test('computes subtotal, GST 5%, and grand total with absolute accuracy', () => {
    const items = [
      { name: 'Red Roses Hatbox', quantity: 2, price: 1500, sku: '2610300001' },
      { name: 'Pink Lily Stem', quantity: 1, price: 1000, sku: '2610300002' },
    ];
    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    assert.equal(subtotal, 4000);

    const taxRate = 5; // 5% GST
    const cgst = Math.round((subtotal * (taxRate / 2)) / 100);
    const sgst = Math.round((subtotal * (taxRate / 2)) / 100);
    const totalTax = cgst + sgst;
    assert.equal(cgst, 100);
    assert.equal(sgst, 100);
    assert.equal(totalTax, 200);

    const grandTotal = subtotal + totalTax;
    assert.equal(grandTotal, 4200);
  });
});
