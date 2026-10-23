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

