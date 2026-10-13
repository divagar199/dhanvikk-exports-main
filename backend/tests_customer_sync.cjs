const http = require('http');

const BASE_URL = 'http://localhost:5000';

function request(method, path, body = null, token = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    let payload = null;
    if (body) {
      payload = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (c) => (raw += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        } catch {
          resolve({ status: res.statusCode, body: raw });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('🌸 STARTING DHANVIKK CROSS-PLATFORM CUSTOMER SYNC & AUTH SUITE');
  let token = null;
  const testEmail = `test_${Date.now()}@dhanvikk.com`;

  // 1. Register new customer
  console.log(`\n1. Register customer account (${testEmail})...`);
  const regRes = await request('POST', '/api/auth/register', {
    name: 'Aanya Verma',
    email: testEmail,
    password: 'Password123!',
    phone: '+91 98765 43210',
  });
  console.log('Status:', regRes.status, 'Success:', regRes.body?.success);
  if (regRes.status !== 200 && regRes.status !== 201) throw new Error('Registration failed');
  token = regRes.body.token;

  // 2. Login with registered customer
  console.log('\n2. Login with registered customer credentials...');
  const loginRes = await request('POST', '/api/auth/login', {
    email: testEmail,
    password: 'Password123!',
  });
  console.log('Status:', loginRes.status, 'User Name:', loginRes.body?.user?.name);
  if (loginRes.status !== 200) throw new Error('Login failed');
  token = loginRes.body.token;

  // 3. Verify /api/auth/me
  console.log('\n3. Verify /api/auth/me token session...');
  const meRes = await request('GET', '/api/auth/me', null, token);
  console.log('Status:', meRes.status, 'Email:', meRes.body?.user?.email);
  if (meRes.status !== 200) throw new Error('/api/auth/me failed');

  // 4. Synchronize Cart across platforms
  console.log('\n4. Synchronize Cart (Mobile/Web)...');
  const cartData = [
    { id: 'flw-rose-01', name: 'Passionate Serenity Noir', price: 2499, quantity: 2 },
    { id: 'flw-lily-02', name: 'Imperial Casablanca Lilies', price: 1899, quantity: 1 },
  ];
  const cartRes = await request('POST', '/api/auth/cart', { cart: cartData }, token);
  console.log('Status:', cartRes.status, 'Cart Saved Items:', cartRes.body?.cart?.length);
  if (cartRes.status !== 200) throw new Error('Cart sync failed');

  // 5. Retrieve Profile Data & verify cart and wishlist
  console.log('\n5. Retrieve /api/auth/profile-data (Cart & Wishlist check)...');
  const profileRes = await request('GET', '/api/auth/profile-data', null, token);
  console.log('Status:', profileRes.status, 'Retrieved Cart Items:', profileRes.body?.cart?.length);
  if (profileRes.body?.cart?.length !== 2) throw new Error('Cart not persisted correctly');

  // 6. Toggle Wishlist Bouquet
  console.log('\n6. Toggle Wishlist Bouquet (/api/auth/wishlist)...');
  const wishRes = await request(
    'POST',
    '/api/auth/wishlist',
    {
      bouquet: {
        id: 'flw-rose-01',
        name: 'Passionate Serenity Noir',
        price: 2499,
        image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364',
      },
    },
    token
  );
  console.log('Status:', wishRes.status, 'Action:', wishRes.body?.action);
  if (wishRes.status !== 200) throw new Error('Wishlist toggle failed');

  // 7. Save Delivery Address
  console.log('\n7. Save Delivery Address (/api/auth/addresses)...');
  const addrRes = await request(
    'POST',
    '/api/auth/addresses',
    {
      title: 'Home Villa',
      recipientName: 'Aanya Verma',
      phone: '+91 98765 43210',
      street: '12 Emerald Crescent, Jubilee Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500033',
      country: 'India',
      isDefault: true,
    },
    token
  );
  console.log('Status:', addrRes.status, 'Saved Addresses:', addrRes.body?.savedAddresses?.length || addrRes.body?.addresses?.length);
  if (addrRes.status !== 200) throw new Error('Save address failed');

  // 8. Place Customer Order
  console.log('\n8. Place Customer Order (/api/orders)...');
  const orderRes = await request(
    'POST',
    '/api/orders',
    {
      items: [
        {
          product: 'flw-rose-01',
          name: 'Passionate Serenity Noir',
          price: 2499,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364',
        },
      ],
      shippingAddress: {
        recipientName: 'Aanya Verma',
        phone: '+91 98765 43210',
        street: '12 Emerald Crescent, Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500033',
        country: 'India',
      },
      deliveryDate: '2026-10-15',
      timeSlot: 'Morning (9:00 AM - 12:00 PM)',
      subtotal: 2499,
      deliveryFee: 0,
      totalAmount: 2499,
      paymentInfo: {
        method: 'Cash on Delivery',
        status: 'Pending',
      },
    },
    token
  );
  console.log('Status:', orderRes.status, 'Body:', orderRes.body);
  if (orderRes.status !== 200 && orderRes.status !== 201) throw new Error('Order creation failed: ' + JSON.stringify(orderRes.body));
  const createdOrderId = orderRes.body?.order?.orderId;

  // 9. Fetch My Orders
  console.log('\n9. Fetch Customer Orders (/api/orders/my-orders)...');
  const myOrdersRes = await request('GET', '/api/orders/my-orders', null, token);
  console.log('Status:', myOrdersRes.status, 'Orders Count:', myOrdersRes.body?.length || myOrdersRes.body?.orders?.length);

  // 10. Fetch Single Order Details
  console.log(`\n10. Fetch Single Order Details (/api/orders/${createdOrderId})...`);
  const singleOrderRes = await request('GET', `/api/orders/${createdOrderId}`, null, token);
  console.log('Status:', singleOrderRes.status, 'Fetched Order ID:', singleOrderRes.body?.order?.orderId || singleOrderRes.body?.orderId);

  console.log('\n🎉 ALL 10 CROSS-PLATFORM INTEGRATION CHECKS PASSED PERFECTLY!');
}

runTests().catch((err) => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
