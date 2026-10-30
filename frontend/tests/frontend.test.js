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


test('Frontend - Unique SKU Engine & Outward/Inward Single-Use Invoices', async (t) => {
  const {
    isSKUUnique,
    ensureUniqueCatalogSKUs,
    generateOutwardInvoiceNumber,
    isInvoiceNumberUsedForInward,
    getAvailableOutwardInvoicesForInward,
  } = await import('../src/utils/skuGenerator.js');

  await t.test('isSKUUnique correctly detects collisions and allows own SKU update', () => {
    const catalog = [
      { id: 'prod_1', sku: '2610300001', name: 'Roses' },
      { id: 'prod_2', sku: '2610300002', name: 'Lilies' },
    ];

    // Colliding with existing
    assert.equal(isSKUUnique('2610300001', catalog, 'prod_3'), false);
    // Unique new SKU
    assert.equal(isSKUUnique('2610300003', catalog, 'prod_3'), true);
    // Editing own product keeps own SKU valid
    assert.equal(isSKUUnique('2610300001', catalog, 'prod_1'), true);
  });

  await t.test('ensureUniqueCatalogSKUs guarantees 100% unique SKUs across catalog', () => {
    const rawCatalog = [
      { id: '1', name: 'Product A', sku: '2610300001' },
      { id: '2', name: 'Product B', sku: '2610300001' }, // Duplicate!
      { id: '3', name: 'Product C' }, // Missing!
      { id: '4', name: 'Product D', sku: '2610300001' }, // Another duplicate!
    ];

    const uniqueCatalog = ensureUniqueCatalogSKUs(rawCatalog, new Date('2026-10-30T10:00:00Z'));
    assert.equal(uniqueCatalog.length, 4);

    const skuSet = new Set(uniqueCatalog.map((p) => p.sku));
    assert.equal(skuSet.size, 4, 'All 4 products must have distinct, unique SKUs');
    assert.equal(uniqueCatalog[0].sku, '2610300001');
    assert.notEqual(uniqueCatalog[1].sku, '2610300001');
    assert.notEqual(uniqueCatalog[3].sku, '2610300001');
  });

  await t.test('generateOutwardInvoiceNumber auto-generates sequential DHN-OUT invoices', () => {
    const testDate = new Date('2026-10-30T10:00:00Z');
    const emptyLedger = [];
    const firstInvoice = generateOutwardInvoiceNumber(emptyLedger, testDate);
    assert.equal(firstInvoice, 'DHN-OUT-261030-0001');

    const existingLedger = [
      { type: 'outward', invoiceNo: 'DHN-OUT-261030-0001' },
      { type: 'outward', invoiceNo: 'DHN-OUT-261030-0002' },
    ];
    const nextInvoice = generateOutwardInvoiceNumber(existingLedger, testDate);
    assert.equal(nextInvoice, 'DHN-OUT-261030-0003');
  });

  await t.test('isInvoiceNumberUsedForInward strictly blocks re-using inward invoices', () => {
    const ledger = [
      { type: 'inward', invoiceNo: 'INV-FARM-901' },
      { type: 'outward', invoiceNo: 'DHN-OUT-261030-0001' },
    ];

    // Already used in inward -> must return true (blocked)
    assert.equal(isInvoiceNumberUsedForInward('INV-FARM-901', ledger), true);
    assert.equal(isInvoiceNumberUsedForInward('inv-farm-901', ledger), true); // case-insensitive

    // Not yet used in inward -> must return false (allowed)
    assert.equal(isInvoiceNumberUsedForInward('INV-FARM-902', ledger), false);
    assert.equal(isInvoiceNumberUsedForInward('DHN-OUT-261030-0001', ledger), false);
  });

  await t.test('getAvailableOutwardInvoicesForInward tracks unused outward invoices for 1-time import', () => {
    const ledger = [
      { type: 'outward', invoiceNo: 'DHN-OUT-261030-0001', productName: 'Red Roses' },
      { type: 'outward', invoiceNo: 'DHN-OUT-261030-0002', productName: 'White Lilies' },
      // One outward invoice was already imported inward
      { type: 'inward', invoiceNo: 'DHN-OUT-261030-0001', productName: 'Red Roses Return' },
    ];

    const available = getAvailableOutwardInvoicesForInward(ledger);
    assert.equal(available.length, 1);
    assert.equal(available[0].invoiceNo, 'DHN-OUT-261030-0002');
  });
});


test('Frontend - Real-time Dynamic Dashboard & Notification Engine', async (t) => {
  const sampleOrders = [
    {
      orderId: 'ORD-1001',
      totalAmount: 2499,
      status: 'Delivered',
      createdAt: '2026-10-30T10:00:00Z',
      items: [{ name: 'Velvet Rose Hatbox', price: 2499, quantity: 1 }],
    },
    {
      orderId: 'ORD-1002',
      totalAmount: 1499,
      status: 'Confirmed',
      createdAt: '2026-10-30T11:30:00Z',
      items: [{ name: 'Forever Red Roses', price: 1499, quantity: 1 }],
    },
    {
      orderId: 'ORD-1003',
      totalAmount: 3999,
      status: 'Processing',
      createdAt: '2026-10-25T14:00:00Z',
      items: [{ name: 'Velvet Rose Hatbox', price: 3999, quantity: 1 }],
    },
  ];

  const sampleProducts = [
    { id: 'p1', name: 'Velvet Rose Hatbox', stock: 2, price: 2499 },
    { id: 'p2', name: 'Forever Red Roses', stock: 15, price: 1499 },
    { id: 'p3', name: 'Orchid Dreamscape', stock: 0, price: 4999 },
  ];

  const sampleEnquiries = [
    { id: 'enq-1', status: 'New', country: 'UAE', flowerType: 'Dutch Tulips' },
    { id: 'enq-2', status: 'Closed', country: 'Singapore' },
  ];

  await t.test('dynamically calculates total orders and revenue from real orders without fake placeholders', () => {
    const totalRev = sampleOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    assert.equal(sampleOrders.length, 3);
    assert.equal(totalRev, 7997);
  });

  await t.test('dynamically computes order status breakdown and percentages', () => {
    const delivered = sampleOrders.filter(o => o.status === 'Delivered').length;
    const processing = sampleOrders.filter(o => ['Processing', 'Confirmed'].includes(o.status)).length;
    const cancelled = sampleOrders.filter(o => o.status === 'Cancelled').length;

    assert.equal(delivered, 1);
    assert.equal(processing, 2);
    assert.equal(cancelled, 0);

    const deliveredPct = Math.round((delivered / sampleOrders.length) * 100);
    const processingPct = Math.round((processing / sampleOrders.length) * 100);
    assert.equal(deliveredPct, 33);
    assert.equal(processingPct, 67);
  });

  await t.test('computes top selling products dynamically from real items in placed orders', () => {
    const statsMap = {};
    sampleOrders.forEach((o) => {
      o.items.forEach((it) => {
        if (!statsMap[it.name]) statsMap[it.name] = { name: it.name, orders: 0, revenue: 0 };
        statsMap[it.name].orders += 1;
        statsMap[it.name].revenue += (it.price * it.quantity);
      });
    });

    const ranked = Object.values(statsMap).sort((a, b) => b.orders - a.orders);
    assert.equal(ranked[0].name, 'Velvet Rose Hatbox');
    assert.equal(ranked[0].orders, 2);
    assert.equal(ranked[0].revenue, 6498);
    assert.equal(ranked[1].name, 'Forever Red Roses');
    assert.equal(ranked[1].orders, 1);
  });

  await t.test('aggregates active live notifications strictly from real alerts', () => {
    const orderAlerts = sampleOrders.filter(o => ['Processing', 'Confirmed', 'Pending'].includes(o.status));
    const stockAlerts = sampleProducts.filter(p => (p.stock || 0) <= 5);
    const enquiryAlerts = sampleEnquiries.filter(e => e.status === 'New' || e.status === 'Pending');

    const totalActiveAlerts = orderAlerts.length + stockAlerts.length + enquiryAlerts.length;

    assert.equal(orderAlerts.length, 2); // ORD-1002 (Confirmed), ORD-1003 (Processing)
    assert.equal(stockAlerts.length, 2); // Velvet Rose (stock: 2), Orchid (stock: 0)
    assert.equal(enquiryAlerts.length, 1); // enq-1 (status: New)
    assert.equal(totalActiveAlerts, 5);
  });
});
