import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '@/constants/theme';
import { cartTotal, useStore } from '@/store/useStore';
import { createRazorpayOrder, verifyPayment } from '@/services/payments';
import { createOrder } from '@/services/orders';
import { getStoredUser } from '@/lib/storage';
import type { User } from '@/types/models';
import RazorpayCheckout from 'react-native-razorpay';
import { resolveImageUrl } from '@/lib/imageUrl';
import { GoogleSignInModal } from '@/components/GoogleSignInModal';

export default function Checkout() {
  const insets = useSafeAreaInsets();
  const cart = useStore((s) => s.cart);
  const clear = useStore((s) => s.clear);
  const currentUser = useStore((s) => s.user);

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Chennai');
  const [state, setState] = useState('Tamil Nadu');
  const [pincode, setPincode] = useState('600001');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [busy, setBusy] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  useEffect(() => {
    getStoredUser<User>().then((u) => {
      if (u) {
        if (!name && u.name) setName(u.name);
        if (!phone && u.phone) setPhone(u.phone);
      }
    });
  }, []);

  const total = cartTotal(cart);

  const handlePlaceOrder = async () => {
    if (!currentUser) {
      Alert.alert(
        'Sign In Required',
        'Only logged-in customers can place orders. Sign in to link your floral order and receive live delivery tracking.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign In with Google',
            onPress: () => setShowGoogleModal(true),
          },
          {
            text: 'Email Login',
            onPress: () => router.push('/auth/login'),
          },
        ]
      );
      return;
    }

    if (!cart.length) {
      Alert.alert('Empty Bag', 'Please add blooms to your bag before checking out.');
      return;
    }
    if (!name.trim() || !phone.trim() || !street.trim() || !city.trim()) {
      Alert.alert('Missing Details', 'Please enter your recipient name, phone, street address, and city.');
      return;
    }

    setBusy(true);

    try {
      const user = await getStoredUser<User>();

      if (paymentMethod === 'razorpay') {
        let razorpayResult: any = null;
        try {
          const rp = await createRazorpayOrder(total, 'INR');
          razorpayResult = await RazorpayCheckout.open({
            key: rp.keyId,
            amount: rp.order.amount,
            currency: rp.order.currency,
            name: 'Dhanvikk Blooms',
            description: 'Fresh flowers and gifts',
            order_id: rp.order.id,
            prefill: {
              name: name || user?.name || '',
              email: user?.email || 'customer@dhanvikk.com',
              contact: phone,
            },
            theme: { color: colors.primary },
          });

          await verifyPayment({
            razorpay_order_id: razorpayResult.razorpay_order_id,
            razorpay_payment_id: razorpayResult.razorpay_payment_id,
            razorpay_signature: razorpayResult.razorpay_signature,
          });
        } catch (paymentErr: any) {
          const errStr = String(paymentErr?.description || paymentErr?.message || '').toLowerCase();
          if (errStr.includes('cancel')) {
            setBusy(false);
            return;
          }
          // If native Razorpay module fails on device/emulator, offer direct order confirmation
          Alert.alert(
            'Online Payment Notice',
            'Razorpay payment was not completed. Would you like to confirm this order with Cash on Delivery instead?',
            [
              { text: 'Cancel', style: 'cancel', onPress: () => setBusy(false) },
              {
                text: 'Pay on Delivery',
                onPress: () => confirmOrderDirect('Cash on Delivery', 'Pending'),
              },
            ]
          );
          return;
        }

        await confirmOrderDirect('Razorpay', 'Paid', razorpayResult);
      } else {
        await confirmOrderDirect('Cash on Delivery', 'Pending');
      }
    } catch (e: any) {
      Alert.alert('Order Failed', e.message || 'Unable to place order. Please check your network connection.');
      setBusy(false);
    }
  };

  const confirmOrderDirect = async (
    method: string,
    status: string,
    razorpayData?: any
  ) => {
    try {
      const orderRes = await createOrder({
        items: cart.map((i) => ({
          product: i.id || i._id || i.slug || 'prod',
          name: i.name,
          price: i.price,
          quantity: i.quantity || 1,
          image: resolveImageUrl(i.image || i.images?.[0] || ''),
        })),
        shippingAddress: {
          recipientName: name,
          fullName: name,
          phone,
          street,
          streetAddress: street,
          city,
          state,
          postalCode: pincode,
          country: 'India',
        },
        deliveryDate: date,
        timeSlot: 'Standard (9 AM - 1 PM)',
        greetingCardMessage: '',
        subtotal: total,
        deliveryFee: 0,
        totalAmount: total,
        paymentInfo: {
          method,
          status,
          razorpayOrderId: razorpayData?.razorpay_order_id,
          razorpayPaymentId: razorpayData?.razorpay_payment_id,
          razorpaySignature: razorpayData?.razorpay_signature,
        },
      });

      clear();
      Alert.alert(
        'Order Confirmed! 🎉',
        `Your order #${orderRes.order?.orderId || 'DHN-CONFIRMED'} has been received.`,
        [
          {
            text: 'View Orders',
            onPress: () => router.replace('/orders'),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Checkout Error', err.message || 'Could not complete order.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[s.page, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={s.header}>
        <Pressable
          style={s.backBtn}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/cart'))}
        >
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={s.headerTitle}>Checkout</Text>
        <View style={{ width: 38 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            s.content,
            { paddingBottom: Math.max(insets.bottom, 24) + 60 },
          ]}
        >
          {!currentUser && (
            <View style={s.guestBanner}>
              <View style={s.guestBannerLeft}>
                <Ionicons name="lock-closed" size={20} color={colors.primaryDeep} />
                <View style={{ flex: 1 }}>
                  <Text style={s.guestBannerTitle}>Account Sign In Required</Text>
                  <Text style={s.guestBannerSub}>
                    Only logged-in users can place floral orders for security and doorstep tracking.
                  </Text>
                </View>
              </View>
              <View style={s.guestBannerActions}>
                <Pressable
                  style={s.guestGoogleBtn}
                  onPress={() => setShowGoogleModal(true)}
                >
                  <Ionicons name="logo-google" size={16} color="#DB4437" />
                  <Text style={s.guestGoogleText}>Sign In with Google</Text>
                </Pressable>
                <Pressable
                  style={s.guestEmailBtn}
                  onPress={() => router.push('/auth/login')}
                >
                  <Text style={s.guestEmailText}>Email Sign In</Text>
                </Pressable>
              </View>
            </View>
          )}

          <Text style={s.sectionTitle}>Delivery Details</Text>

          <View style={s.card}>
            <Text style={s.inputLabel}>Recipient Name *</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. Priya Sharma"
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={setName}
            />

            <Text style={s.inputLabel}>Phone Number *</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. 9876543210"
              placeholderTextColor={colors.muted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <Text style={s.inputLabel}>Street / Building / Flat *</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. 42 Rose Garden Avenue, Flat 3B"
              placeholderTextColor={colors.muted}
              value={street}
              onChangeText={setStreet}
            />

            <View style={s.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={s.inputLabel}>City *</Text>
                <TextInput
                  style={s.input}
                  placeholder="City"
                  placeholderTextColor={colors.muted}
                  value={city}
                  onChangeText={setCity}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={s.inputLabel}>State</Text>
                <TextInput
                  style={s.input}
                  placeholder="State"
                  placeholderTextColor={colors.muted}
                  value={state}
                  onChangeText={setState}
                />
              </View>
            </View>

            <View style={s.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={s.inputLabel}>PIN Code</Text>
                <TextInput
                  style={s.input}
                  placeholder="PIN"
                  placeholderTextColor={colors.muted}
                  value={pincode}
                  onChangeText={setPincode}
                  keyboardType="number-pad"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={s.inputLabel}>Delivery Date</Text>
                <TextInput
                  style={s.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.muted}
                  value={date}
                  onChangeText={setDate}
                />
              </View>
            </View>
          </View>

          <Text style={s.sectionTitle}>Payment Method</Text>

          <View style={s.card}>
            <Pressable
              style={[s.methodOption, paymentMethod === 'razorpay' && s.methodActive]}
              onPress={() => setPaymentMethod('razorpay')}
            >
              <View style={s.radioCircle}>
                {paymentMethod === 'razorpay' && <View style={s.radioDot} />}
              </View>
              <View style={s.methodText}>
                <Text style={s.methodTitle}>Razorpay (UPI, Cards, NetBanking)</Text>
                <Text style={s.methodSub}>Secure instant payment via native gateway</Text>
              </View>
              <Ionicons name="shield-checkmark" size={20} color={colors.primaryDeep} />
            </Pressable>

            <View style={s.divider} />

            <Pressable
              style={[s.methodOption, paymentMethod === 'cod' && s.methodActive]}
              onPress={() => setPaymentMethod('cod')}
            >
              <View style={s.radioCircle}>
                {paymentMethod === 'cod' && <View style={s.radioDot} />}
              </View>
              <View style={s.methodText}>
                <Text style={s.methodTitle}>Cash on Delivery (COD)</Text>
                <Text style={s.methodSub}>Pay with cash or UPI upon delivery</Text>
              </View>
              <Ionicons name="cash-outline" size={20} color={colors.ink} />
            </Pressable>
          </View>

          <View style={s.orderSummary}>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Total Payable</Text>
              <Text style={s.totalAmount}>₹{total.toLocaleString('en-IN')}</Text>
            </View>
            <Text style={s.securityNote}>
              🔒 Guaranteed fresh florals backed by Dhanvikk Quality Promise.
            </Text>
            <Pressable
              style={[s.payButton, busy && s.payButtonDisabled]}
              onPress={handlePlaceOrder}
              disabled={busy}
            >
              <Text style={s.payButtonText}>
                {busy
                  ? 'Processing Order…'
                  : paymentMethod === 'razorpay'
                  ? `Pay ₹${total.toLocaleString('en-IN')} with Razorpay`
                  : `Confirm Order (₹${total.toLocaleString('en-IN')})`}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <GoogleSignInModal
        visible={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSuccess={(u?: any) => {
          setShowGoogleModal(false);
          if (u?.name) setName(u.name);
          if (u?.phone) setPhone(u.phone);
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.ink,
  },
  content: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.ink,
    marginTop: 12,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 5,
  },
  input: {
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.pale,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    fontSize: 14,
    color: colors.ink,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  methodActive: {
    opacity: 1,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  methodText: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.ink,
  },
  methodSub: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: 10,
  },
  orderSummary: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line,
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.primaryDeep,
  },
  securityNote: {
    fontSize: 12,
    color: colors.muted,
    marginVertical: 12,
    lineHeight: 18,
  },
  payButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: colors.white,
    fontWeight: '900',
    fontSize: 15,
  },
  guestBanner: {
    backgroundColor: '#FFF0F5',
    borderWidth: 1.5,
    borderColor: '#FFD1DC',
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 16,
  },
  guestBannerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  guestBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primaryDeep,
    marginBottom: 3,
  },
  guestBannerSub: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 17,
  },
  guestBannerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  guestGoogleBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  guestGoogleText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.ink,
  },
  guestEmailBtn: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  guestEmailText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.white,
  },
});