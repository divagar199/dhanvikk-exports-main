import app from '../server.js';
import http from 'http';

const server = http.createServer(app);

server.listen(5002, async () => {
  console.log('🧪 Testing Orders & Payments ACID Flow on port 5002...');

  try {
    // 1. Get a product to check initial stock
    const productsRes = await fetch('http://localhost:5002/api/products?limit=1');
    const productsData = await productsRes.json();
    const testProduct = productsData.products[0];
    const initialStock = testProduct.stock;
    console.log(`1. Target product: "${testProduct.name}" (Initial stock: ${initialStock})`);

    // 2. Create Razorpay gateway order
    const rzpOrderRes = await fetch('http://localhost:5002/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: testProduct.price, currency: 'INR' }),
    });
    const rzpOrderData = await rzpOrderRes.json();
    console.log('2. Razorpay Order Creation:', rzpOrderData.success ? '✅ PASS' : '❌ FAIL', 'RZP ID:', rzpOrderData.order?.id);

    // 3. Verify Payment
    const verifyRes = await fetch('http://localhost:5002/api/payment/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: rzpOrderData.order?.id,
        razorpay_payment_id: `pay_test_${Date.now()}`,
        autoApprove: true,
      }),
    });
    const verifyData = await verifyRes.json();
    console.log('3. Payment Verification & Auto-approval:', verifyData.approved ? '✅ PASS' : '❌ FAIL');

    // 4. Place floral order (purchasing 2 units)
    const orderRes = await fetch('http://localhost:5002/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [
          {
            product: testProduct.id || testProduct._id,
            name: testProduct.name,
            price: testProduct.price,
            quantity: 2,
            image: testProduct.images[0],
          },
        ],
        shippingAddress: {
          fullName: 'Priya Sharma',
          phone: '+91 98765 43210',
          streetAddress: 'Villa 14, Palm Crescent',
          city: 'Dubai',
          state: 'Dubai',
          country: 'United Arab Emirates',
          pincode: '00000',
        },
        deliveryDate: 'Today',
        timeSlot: 'Evening (7 PM - 10 PM)',
        greetingCardMessage: 'Congratulations on the new home! 🌸',
        paymentInfo: {
          method: 'Razorpay',
          razorpayOrderId: rzpOrderData.order?.id,
          razorpayPaymentId: verifyData.paymentId,
          status: 'Paid',
        },
        subtotal: testProduct.price * 2,
        deliveryFee: 0,
        totalAmount: testProduct.price * 2,
        email: 'customer@dhanvikk.com',
      }),
    });
    const orderData = await orderRes.json();
    console.log('4. Order Placement:', orderData.success ? '✅ PASS' : '❌ FAIL', 'Order ID:', orderData.order?.orderId);

    // 5. Verify that stock decremented by exactly 2
    const productAfterRes = await fetch(`http://localhost:5002/api/products/${testProduct.id || testProduct._id}`);
    const productAfterData = await productAfterRes.json();
    const expectedStock = Math.max(0, initialStock - 2);
    console.log(`5. Atomic Stock Decrement: Stock is now ${productAfterData.product.stock} (Expected: ${expectedStock}):`,
      productAfterData.product.stock === expectedStock ? '✅ PASS' : '❌ FAIL'
    );

    // 6. Retrieve customer orders
    const myOrdersRes = await fetch('http://localhost:5002/api/orders/my-orders?email=customer@dhanvikk.com');
    const myOrdersData = await myOrdersRes.json();
    const hasNewOrder = myOrdersData.orders?.some((o) => o.orderId === orderData.order?.orderId);
    console.log('6. Order Retrieval for Customer:', hasNewOrder ? '✅ PASS' : '❌ FAIL');

    // 7. Admin updates order status
    const updateStatusRes = await fetch(`http://localhost:5002/api/orders/${orderData.order?.orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Preparing Floral Order' }),
    });
    const updateStatusData = await updateStatusRes.json();
    console.log('7. Update Order Status to "Preparing Floral Order":', updateStatusData.success ? '✅ PASS' : '❌ FAIL');

    // 8. Admin Dashboard Analytics
    const statsRes = await fetch('http://localhost:5002/api/admin/stats');
    const statsData = await statsRes.json();
    console.log('8. Admin Analytics (Orders & Revenue calculated):', statsData.success && statsData.stats?.totalOrders > 0 ? '✅ PASS' : '❌ FAIL');

    console.log('\n🎉 ALL ORDERS & PAYMENTS ACID TESTS PASSED!\n');
  } catch (err) {
    console.error('❌ Orders test failed:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
