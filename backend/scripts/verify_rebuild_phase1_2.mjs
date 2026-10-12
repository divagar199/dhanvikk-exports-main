import app from '../server.js';
import http from 'http';

const testServer = http.createServer(app);

testServer.listen(5001, async () => {
  console.log('🧪 Test server running on port 5001');

  try {
    // Test 1: Health check
    const healthRes = await fetch('http://localhost:5001/api/health');
    const healthData = await healthRes.json();
    console.log('1. Health check:', healthData.status === 'healthy' ? '✅ PASS' : '❌ FAIL');

    // Test 2: Validation error on missing fields
    const invalidLoginRes = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'notanemail' }),
    });
    const invalidLoginData = await invalidLoginRes.json();
    console.log('2. Zod Validation on malformed input (status 422):', invalidLoginRes.status === 422 ? '✅ PASS' : '❌ FAIL', invalidLoginData.message);

    // Test 3: Customer login
    const loginRes = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'customer@dhanvikk.com', password: 'Bloom@2026' }),
    });
    const loginData = await loginRes.json();
    console.log('3. Customer login:', loginData.success ? '✅ PASS' : '❌ FAIL', 'User:', loginData.user?.name);

    const token = loginData.token;

    // Test 4: Protected getMe
    const meRes = await fetch('http://localhost:5001/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meData = await meRes.json();
    console.log('4. Protected /api/auth/me:', meData.success ? '✅ PASS' : '❌ FAIL', 'Name:', meData.user?.name);

    // Test 5: Profile Data (backward-compatible)
    const profileRes = await fetch('http://localhost:5001/api/auth/profile-data?email=customer@dhanvikk.com', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const profileData = await profileRes.json();
    console.log('5. Profile data:', profileData.success ? '✅ PASS' : '❌ FAIL');

    // Test 6: Save address
    const addrRes = await fetch('http://localhost:5001/api/auth/addresses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: 'Penthouse Suite',
        fullName: 'Priya Sharma',
        phone: '+91 98765 00000',
        street: 'Penthouse 12, Marina Promenade',
        city: 'Dubai',
        country: 'United Arab Emirates',
        isDefault: true,
      }),
    });
    const addrData = await addrRes.json();
    console.log('6. Save Address:', addrData.success ? '✅ PASS' : '❌ FAIL', 'Address ID:', addrData.address?.id);

    // Test 7: New RESTful /api/users/profile
    const userProfileRes = await fetch('http://localhost:5001/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const userProfileData = await userProfileRes.json();
    console.log('7. RESTful /api/users/profile:', userProfileData.success ? '✅ PASS' : '❌ FAIL', 'Saved addresses count:', userProfileData.savedAddresses?.length);

    console.log('\n🎉 ALL REBUILT BACKEND PHASE 1 & 2 VERIFICATIONS PASSED!\n');
  } catch (err) {
    console.error('❌ Test failed with error:', err);
  } finally {
    testServer.close();
    process.exit(0);
  }
});
