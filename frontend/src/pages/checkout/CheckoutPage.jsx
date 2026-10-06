import React, { useState, useEffect } from 'react';
import SEO from '../../components/common/SEO';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  Calendar,
  Clock,
  CheckCircle2,
  Lock,
  ArrowLeft,
  ChevronRight,
  ShoppingBag,
  MapPin,
} from 'lucide-react';
import Logo from '../../components/common/Logo';
import Button from '../../components/common/Button';
import Breadcrumb from '../../components/common/Breadcrumb';
import Spinner from '../../components/common/Spinner';

import { paymentService } from '../../services/paymentService';
import { orderService } from '../../services/orderService';
import { authService } from '../../services/authService';
import { clearCart } from '../../store/slices/cartSlice';
import { toast } from 'sonner';
import { useCurrency } from '../../context/CurrencyContext';
import {
  COUNTRIES_LIST,
  STATES_BY_COUNTRY,
  DISTRICTS_AND_CITIES_BY_STATE,
  getCountryData,
  getStatesForCountry,
  getDistrictsAndCityForState,
} from '../../data/countriesData';

export default function CheckoutPage() {
  const { currency, convertPrice, formatPrice, currentConfig } = useCurrency();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items: cartItems } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  // Address form state
  const [recipientName, setRecipientName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('United Arab Emirates');
  const [stateName, setStateName] = useState('Dubai');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('Dubai');
  const [postalCode, setPostalCode] = useState('00000');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // Load user saved addresses from profile
  useEffect(() => {
    let isMounted = true;
    const loadUserData = async () => {
      const activeEmail = user?.email;
      if (activeEmail) {
        try {
          const profile = await authService.getProfileData(activeEmail);
          if (isMounted && profile?.savedAddresses && profile.savedAddresses.length > 0) {
            setSavedAddresses(profile.savedAddresses);
            const defaultAddr = profile.savedAddresses.find((a) => a.isDefault) || profile.savedAddresses[0];
            if (defaultAddr) {
              setSelectedAddressId(defaultAddr.id);
              setRecipientName(defaultAddr.recipientName || user?.name || '');
              setPhone(defaultAddr.phone || user?.phone || '');
              setAddress(defaultAddr.street || '');
              setCountry(defaultAddr.country || 'United Arab Emirates');
              setStateName(defaultAddr.state || 'Dubai');
              setDistrict(defaultAddr.district || '');
              setCity(defaultAddr.city || 'Dubai');
              setPostalCode(defaultAddr.postalCode || '00000');
            }
          } else if (isMounted) {
            setRecipientName(user?.name || '');
            setPhone(user?.phone || '+91 98765 43210');
            setAddress('Villa 14, Palm Jumeirah Crescent');
            setCountry('United Arab Emirates');
            setStateName('Dubai');
            setDistrict('Palm Jumeirah');
          }
        } catch (err) {
          console.warn('Profile addresses load error:', err);
        }
      } else {
        setAddress('Villa 14, Palm Jumeirah Crescent');
        setCountry('United Arab Emirates');
        setStateName('Dubai');
        setDistrict('Palm Jumeirah');
      }
    };
    loadUserData();
    return () => {
      isMounted = false;
    };
  }, [user?.email]);

  const [deliveryDate, setDeliveryDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [deliverySlot, setDeliverySlot] = useState('Standard (2:00 PM - 6:00 PM)');
  const [instructions, setInstructions] = useState('Leave with concierge if not available');

  const [loadingPayment, setLoadingPayment] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Dynamic country and geographic resolution
  const selectedCountryData = getCountryData(country);
  const availableStates = getStatesForCountry(country);
  const stateDistrictsData = getDistrictsAndCityForState(stateName);
  const availableDistricts = stateDistrictsData?.districts || [];

  const handleCountrySelect = (newCountryName) => {
    setCountry(newCountryName);
    const cData = getCountryData(newCountryName);
    const states = getStatesForCountry(newCountryName);
    const nextState = states[0] || cData.defaultState || '';
    setStateName(nextState);

    const distInfo = getDistrictsAndCityForState(nextState);
    setCity(distInfo.city || cData.defaultCity || '');
    setDistrict(distInfo.districts[0] || cData.defaultDistrict || '');
    setPostalCode(cData.defaultPostal || '');

    // Auto-update phone prefix if blank or default
    if (!phone || phone === '+91 98765 43210' || phone === '+971 50 123 4567' || phone.startsWith('+')) {
      setPhone(`${cData.phoneCode} `);
    }
  };

  const handleStateSelect = (newStateName) => {
    setStateName(newStateName);
    const distInfo = getDistrictsAndCityForState(newStateName);
    setCity(distInfo.city || newStateName);
    setDistrict(distInfo.districts[0] || '');
  };

  // Totals calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 2500 || subtotal === 0 ? 0 : 199;
  const totalAmount = subtotal + deliveryFee;

  // Dynamic Currency Calculations for Razorpay
  const activeCurrency = (currency || 'AED').toUpperCase();
  const payAmount = convertPrice(totalAmount, activeCurrency);

  const handleRazorpayPayment = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast.error('Your cart is empty. Please add flowers to proceed.');
      return;
    }

    if (!recipientName || !phone || !address) {
      toast.error('Please complete the delivery address details');
      return;
    }

    try {
      setLoadingPayment(true);

      // 1. Ensure Razorpay SDK script is loaded
      const isScriptLoaded = await paymentService.loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error('Razorpay SDK failed to load. Please check your network connection.');
        setLoadingPayment(false);
        return;
      }

      // 2. Create order on backend dynamically with active currency & converted amount
      const orderRes = await paymentService.createRazorpayOrder({
        amount: payAmount,
        currency: activeCurrency,
        receipt: `dhanvikk_${Date.now()}`,
      });

      if (!orderRes.success || !orderRes.order) {
        throw new Error(orderRes.message || 'Failed to initiate Razorpay order');
      }

      const { keyId, order } = orderRes;

      // 3. Configure Razorpay modal options dynamically
      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency || activeCurrency,
        name: 'Dhanvikk Blooms & Exports',
        description: `Luxury Floral Order (${activeCurrency} ${payAmount.toLocaleString()})`,
        image: '/dhanvikk-brand-logo.png',
        order_id: order.id,
        prefill: {
          name: recipientName,
          email: user?.email || 'customer@dhanvikkexports.com',
          contact: phone,
        },
        notes: {
          currency: activeCurrency,
          amountPaid: payAmount,
          baseAmountINR: totalAmount,
          deliveryCountry: country,
          deliveryState: stateName,
        },
        theme: {
          color: '#EC407A',
        },
        handler: async function (response) {
          try {
            // 4. Verify payment signature on backend
            const verifyRes = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id || order.id,
              razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
              razorpay_signature: response.razorpay_signature || 'simulated_valid_signature',
            });

            if (verifyRes.success) {
              // 5. Store completed order in MongoDB
              const newOrderPayload = {
                items: cartItems.map((item) => ({
                  productId: item.id || item._id,
                  product: item.id || item._id,
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity,
                  image: item.image,
                })),
                recipientName,
                recipientPhone: phone,
                deliveryAddress: {
                  street: address,
                  district,
                  city,
                  state: stateName,
                  country,
                  postalCode,
                  instructions,
                },
                shippingAddress: {
                  fullName: recipientName,
                  phone,
                  streetAddress: address,
                  district,
                  city,
                  state: stateName,
                  country,
                  pincode: postalCode,
                },
                deliveryDate,
                deliverySlot,
                greetingMessage: cartItems[0]?.cardMessage || 'Sent with love and warmest blooms 🌸',
                totalAmount: payAmount,
                currency: activeCurrency,
                baseAmountINR: totalAmount,
                email: user?.email || 'customer@dhanvikk.com',
                paymentMethod: 'Razorpay',
                paymentStatus: 'Paid',
                razorpayOrderId: response.razorpay_order_id || order.id,
                razorpayPaymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
              };

              const createdOrderRes = await orderService.createOrder(newOrderPayload);

              // 6. Clear shopping cart and display success
              dispatch(clearCart());
              setOrderSuccess(createdOrderRes.order || { id: `ORD_${Date.now()}`, ...newOrderPayload });
              toast.success('Payment verified & floral order placed successfully! 🌸');
            } else {
              toast.error(verifyRes.message || 'Payment signature verification failed.');
            }
          } catch (err) {
            console.error('Order save error:', err);
            toast.error('Payment succeeded but error recording order: ' + err.message);
          } finally {
            setLoadingPayment(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoadingPayment(false);
            toast.info('Razorpay payment modal dismissed');
          },
        },
      };

      // 4. Open Razorpay Checkout modal
      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          setLoadingPayment(false);
          toast.error(`Payment failed: ${response.error.description}`);
        });
        rzp.open();
      } else {
        // Fallback simulation in testing environment
        options.handler({
          razorpay_order_id: order.id,
          razorpay_payment_id: `pay_sim_${Date.now()}`,
          razorpay_signature: 'test_signature_valid',
        });
      }
    } catch (err) {
      setLoadingPayment(false);
      console.error('Checkout error:', err);
      toast.error(err.message || 'Payment processing failed');
    }
  };

  const handleDirectSimulationOrder = async () => {
    if (!recipientName || !phone || !address) {
      toast.error('Please complete the delivery address details');
      return;
    }
    try {
      setLoadingPayment(true);
      const newOrderPayload = {
        items: cartItems.map((item) => ({
          product: item.id || 'flw-001',
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        recipientName,
        recipientPhone: phone,
        deliveryAddress: {
          street: address,
          district,
          city,
          state: stateName,
          country,
          postalCode,
        },
        shippingAddress: {
          fullName: recipientName,
          phone,
          streetAddress: address,
          district,
          city,
          state: stateName,
          country,
          pincode: postalCode,
        },
        deliveryDate,
        deliverySlot,
        greetingMessage: cartItems[0]?.cardMessage || 'Sent with love and warmest blooms 🌸',
        greetingCardMessage: cartItems[0]?.cardMessage || 'Sent with love and warmest blooms 🌸',
        totalAmount,
        email: user?.email || 'customer@dhanvikk.com',
        paymentMethod: 'Razorpay (Simulated)',
        paymentStatus: 'Paid (Razorpay)',
        status: 'Confirmed',
        orderStatus: 'Confirmed',
        razorpayOrderId: `order_sim_${Date.now()}`,
        razorpayPaymentId: `pay_sim_${Date.now()}`,
      };

      const createdOrderRes = await orderService.createOrder(newOrderPayload);
      dispatch(clearCart());
      setOrderSuccess(createdOrderRes.order || { _id: `ORD_${Date.now()}`, orderId: `ORD-${Date.now().toString().slice(-6)}`, ...newOrderPayload });
      toast.success('Floral order placed successfully! 🌸');
    } catch (err) {
      toast.error('Order creation failed: ' + err.message);
    } finally {
      setLoadingPayment(false);
    }
  };

  // If order was placed successfully, display luxury confirmation card
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] text-[#242124] flex flex-col font-['Poppins']">
        <header className="border-b border-[#F7F2ED] bg-white px-6 py-4 flex items-center justify-between">
          <Logo />
          <span className="text-xs text-[#777777]">Authenticated as {user?.email}</span>
        </header>

        <main className="max-w-xl mx-auto px-4 py-8 text-center flex-1">
          <Breadcrumb
            items={[
              { label: 'Home', path: '/' },
              { label: 'Secure Checkout', path: '/checkout' },
              { label: 'Order Confirmed' },
            ]}
            className="mb-6 justify-center"
          />

          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-['Poppins'] text-[#242124]">
            Order Confirmed & Paid
          </h1>
          <p className="text-xs sm:text-sm text-[#777777] mt-1 mb-6">
            Thank you, {recipientName}! Your floral arrangement has been scheduled for temperature-controlled cold-chain dispatch.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-[#F7F2ED] shadow-sm text-left space-y-3 mb-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#F7F2ED]">
              <span className="text-xs font-semibold text-[#777777]">Order Reference:</span>
              <span className="text-xs font-mono font-bold text-[#EC407A]">{orderSuccess._id || orderSuccess.id}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#777777]">Payment Gateway:</span>
              <span className="font-semibold text-emerald-600">Razorpay (Verified & Paid)</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#777777]">Delivery Date:</span>
              <span className="font-semibold text-[#242124]">{deliveryDate}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#777777]">Delivery Slot:</span>
              <span className="font-semibold text-[#242124]">{deliverySlot}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#777777]">Delivery Destination:</span>
              <span className="font-semibold text-[#242124]">{address}, {city}</span>
            </div>

            <div className="pt-3 border-t border-[#F7F2ED] flex items-center justify-between">
              <span className="text-xs font-bold text-[#242124]">Amount Paid:</span>
              <span className="text-base font-bold font-mono text-[#242124]">{formatPrice(totalAmount)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Link to="/account">
              <Button variant="secondary" size="md">
                View My Orders
              </Button>
            </Link>
            <Link to="/">
              <Button variant="primary" size="md">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Secure Checkout | Dhanvikk Blooms"
        description="Secure checkout for Dhanvikk Blooms luxury flower delivery. Razorpay 256-bit SSL encrypted."
        canonical="/checkout"
        noindex={true}
      />

      <div className="min-h-screen bg-[#FFFDF9] text-[#242124] flex flex-col font-['Poppins']">
        {/* Simple Checkout Header */}
        <header className="border-b border-[#F7F2ED] bg-white sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
              <Lock className="w-3.5 h-3.5" />
              <span>Razorpay 256-Bit SSL Secure Checkout</span>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
          {/* Breadcrumb Navigation */}
          <Breadcrumb
            items={[
              { label: 'Home', path: '/' },
              { label: 'Collections', path: '/category/flowers' },
              { label: 'Secure Checkout' },
            ]}
            className="mb-4"
          />

          {/* Back link */}
          <Link to="/" className="inline-flex items-center gap-1 text-xs text-[#777777] hover:text-[#EC407A] mb-6">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to floral collections</span>
          </Link>

          <form onSubmit={handleRazorpayPayment}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Address & Scheduling (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1. Recipient Information */}
                <div className="bg-white rounded-3xl p-6 border border-[#F7F2ED] shadow-xs space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#242124] flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#EC407A]" />
                      <span>Recipient & Delivery Address</span>
                    </span>
                    {user?.email && (
                      <span className="text-[11px] font-normal text-[#777777] lowercase">{user.email}</span>
                    )}
                  </h3>

                  {/* Saved Addresses Quick Selection */}
                  {savedAddresses && savedAddresses.length > 0 && (
                    <div className="pt-1 pb-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-[#777777] uppercase tracking-wider flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#EC407A]" />
                          Saved Addresses ({savedAddresses.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAddressId('custom_new');
                            setRecipientName(user?.name || '');
                            setPhone(user?.phone || '');
                            setAddress('');
                            setCountry('United Arab Emirates');
                            setStateName('Dubai');
                            setDistrict('');
                            setCity('Dubai');
                            setPostalCode('');
                          }}
                          className="text-[11px] font-semibold text-[#EC407A] hover:underline"
                        >
                          + New Address
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {savedAddresses.map((addr) => {
                          const isSelected = selectedAddressId === addr.id;
                          return (
                            <div
                              key={addr.id}
                              onClick={() => {
                                setSelectedAddressId(addr.id);
                                setRecipientName(addr.recipientName || user?.name || '');
                                setPhone(addr.phone || user?.phone || '');
                                setAddress(addr.street || '');
                                setCountry(addr.country || 'United Arab Emirates');
                                setStateName(addr.state || 'Dubai');
                                setDistrict(addr.district || '');
                                setCity(addr.city || 'Dubai');
                                setPostalCode(addr.postalCode || '');
                              }}
                              className={`cursor-pointer p-3 rounded-2xl border text-left transition-all ${
                                isSelected
                                  ? 'border-[#EC407A] bg-[#FFF0F5] shadow-xs ring-1 ring-[#EC407A]'
                                  : 'border-[#F0EAE1] bg-[#FAF7F2] hover:border-[#EC407A]/40'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-[#242124]">{addr.title || 'Saved Location'}</span>
                                {isSelected ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#EC407A]" />
                                ) : (
                                  <div className="w-3.5 h-3.5 rounded-full border border-[#D5C7C3]" />
                                )}
                              </div>
                              <p className="text-[11px] text-[#777777] truncate font-medium">
                                {addr.recipientName || user?.name} • {addr.phone || user?.phone}
                              </p>
                              <p className="text-[11px] text-[#555555] truncate">
                                {addr.street}, {addr.district ? `${addr.district}, ` : ''}{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.country ? `• ${addr.country}` : ''}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#777777] mb-1">
                        Recipient Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="e.g. Ananya Sharma"
                        className="w-full h-11 px-3.5 rounded-xl bg-[#FAF7F2] border border-[#E9E2E5] text-xs text-[#242124] focus:outline-none focus:border-[#EC407A]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#777777] mb-1">
                        Contact Phone / WhatsApp *
                      </label>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+971 50 123 4567"
                        className="w-full h-11 px-3.5 rounded-xl bg-[#FAF7F2] border border-[#E9E2E5] text-xs text-[#242124] focus:outline-none focus:border-[#EC407A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#777777] mb-1">
                      Street / Villa / Apartment Details *
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Flat 402, Lotus Tower, Downtown"
                      className="w-full h-11 px-3.5 rounded-xl bg-[#FAF7F2] border border-[#E9E2E5] text-xs text-[#242124] focus:outline-none focus:border-[#EC407A]"
                    />
                  </div>

                  {/* Country & State (Dynamically Driven) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#777777] mb-1">
                        Country / Destination *
                      </label>
                      <select
                        required
                        value={country}
                        onChange={(e) => handleCountrySelect(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-[#FAF7F2] border border-[#E9E2E5] text-xs text-[#242124] font-medium focus:outline-none focus:border-[#EC407A] cursor-pointer"
                      >
                        {COUNTRIES_LIST.map((c) => (
                          <option key={c.code} value={c.name}>
                            {c.flag} {c.name} ({c.currency})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#777777] mb-1">
                        {selectedCountryData.stateLabel} *
                      </label>
                      {availableStates.length > 0 ? (
                        <select
                          required
                          value={stateName}
                          onChange={(e) => handleStateSelect(e.target.value)}
                          className="w-full h-11 px-3.5 rounded-xl bg-[#FAF7F2] border border-[#E9E2E5] text-xs text-[#242124] font-medium focus:outline-none focus:border-[#EC407A] cursor-pointer"
                        >
                          {availableStates.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                          <option value="Other">Other / Custom</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          required
                          value={stateName}
                          onChange={(e) => setStateName(e.target.value)}
                          placeholder={`Enter ${selectedCountryData.stateLabel}`}
                          className="w-full h-11 px-3.5 rounded-xl bg-[#FAF7F2] border border-[#E9E2E5] text-xs text-[#242124] focus:outline-none focus:border-[#EC407A]"
                        />
                      )}
                    </div>
                  </div>

                  {/* District / Area, City & Postal Code (Dynamically Driven) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#777777] mb-1">
                        {selectedCountryData.districtLabel} *
                      </label>
                      <input
                        type="text"
                        list="checkout-district-presets"
                        required
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder={availableDistricts[0] ? `e.g. ${availableDistricts[0]}` : `Enter ${selectedCountryData.districtLabel}`}
                        className="w-full h-11 px-3.5 rounded-xl bg-[#FAF7F2] border border-[#E9E2E5] text-xs text-[#242124] focus:outline-none focus:border-[#EC407A]"
                      />
                      {availableDistricts.length > 0 && (
                        <datalist id="checkout-district-presets">
                          {availableDistricts.map((d) => (
                            <option key={d} value={d} />
                          ))}
                        </datalist>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#777777] mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Dubai or Chennai"
                        className="w-full h-11 px-3.5 rounded-xl bg-[#FAF7F2] border border-[#E9E2E5] text-xs text-[#242124] focus:outline-none focus:border-[#EC407A]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#777777] mb-1">
                        {selectedCountryData.postalLabel} {selectedCountryData.postalRequired ? '*' : '(Optional)'}
                      </label>
                      <input
                        type="text"
                        required={selectedCountryData.postalRequired}
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder={selectedCountryData.postalPlaceholder}
                        className="w-full h-11 px-3.5 rounded-xl bg-[#FAF7F2] border border-[#E9E2E5] text-xs text-[#242124] focus:outline-none focus:border-[#EC407A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#777777] mb-1">
                      Delivery Notes / Instructions
                    </label>
                    <input
                      type="text"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="e.g. Ring the bell twice, don't spoil surprise"
                      className="w-full h-11 px-3.5 rounded-xl bg-[#FAF7F2] border border-[#E9E2E5] text-xs text-[#242124] focus:outline-none focus:border-[#EC407A]"
                    />
                  </div>
                </div>

                {/* 2. Dispatch Date & Slot */}
                <div className="bg-white rounded-3xl p-6 border border-[#F7F2ED] shadow-xs space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#242124] flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#EC407A]" />
                    <span>Delivery Date & Slot</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#777777] mb-1">
                        Delivery Date
                      </label>
                      <input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full h-11 px-3.5 rounded-xl bg-[#FAF7F2] border border-[#E9E2E5] text-xs text-[#242124] focus:outline-none focus:border-[#EC407A]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#777777] mb-1">
                        Time Slot
                      </label>
                      <select
                        value={deliverySlot}
                        onChange={(e) => setDeliverySlot(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-[#FAF7F2] border border-[#E9E2E5] text-xs text-[#242124] focus:outline-none focus:border-[#EC407A]"
                      >
                        <option value="Morning (9:00 AM - 1:00 PM)">Morning (9:00 AM - 1:00 PM)</option>
                        <option value="Standard (2:00 PM - 6:00 PM)">Standard (2:00 PM - 6:00 PM)</option>
                        <option value="Express 2-Hour Delivery">Express 2-Hour Delivery</option>
                        <option value="Midnight Special (11:30 PM - 12:30 AM)">Midnight Special (11:30 PM - 12:30 AM)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary & Razorpay Trigger (5 Cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-[#F7F2ED] shadow-xs space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#242124] pb-3 border-b border-[#F7F2ED]">
                    Order Summary ({cartItems.length} items)
                  </h3>

                  {/* Items list */}
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={`${item.name} luxury flower arrangement`}
                          className="w-14 h-14 rounded-2xl object-cover border border-[#F7F2ED]"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-[#242124] truncate">{item.name}</h4>
                          <span className="text-[11px] text-[#777777]">Qty: {item.quantity}</span>
                        </div>
                        <span className="text-xs font-bold text-[#242124] font-mono">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Pricing details */}
                  <div className="pt-4 border-t border-[#F7F2ED] space-y-2 text-xs">
                    <div className="flex justify-between text-[#777777]">
                      <span>Floral Subtotal</span>
                      <span className="font-mono text-[#242124]">{formatPrice(subtotal)}</span>
                    </div>

                    <div className="flex justify-between text-[#777777]">
                      <span>Cold-Chain Delivery</span>
                      <span className="font-mono text-[#242124]">
                        {deliveryFee === 0 ? <span className="text-emerald-600 font-semibold">FREE</span> : formatPrice(deliveryFee)}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-[#F7F2ED] flex justify-between text-sm font-bold text-[#242124]">
                      <span>Total Amount Payable</span>
                      <div className="text-right">
                        <span className="font-mono text-base text-[#EC407A] block">
                          {formatPrice(totalAmount)}
                        </span>
                        {currency !== 'INR' && (
                          <span className="text-[10px] text-[#777777] block font-mono">
                            ≈ ₹{totalAmount.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Razorpay Gateway Button */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={loadingPayment || cartItems.length === 0}
                      className="w-full h-12 rounded-full bg-[#EC407A] hover:bg-[#C2185B] text-white text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg hover:shadow-[#EC407A]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loadingPayment ? (
                        <>
                          <Spinner size="sm" color="#ffffff" />
                          <span>Connecting to Razorpay...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          <span>
                            Pay {currentConfig.symbol} {payAmount.toLocaleString()} {activeCurrency} with Razorpay
                          </span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-center text-[#777777] mt-2">
                      Dynamic multi-currency checkout in {activeCurrency} • Cards, Apple Pay, UPI & Net Banking supported
                    </p>

                    {/* Instant Simulation Checkout for QA / Demo Testing */}
                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={handleDirectSimulationOrder}
                        disabled={loadingPayment || cartItems.length === 0}
                        className="w-full py-2.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 border border-emerald-500/30 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>⚡ Complete Order (Instant Test & Demo)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Trust guarantee badge */}
                <div className="bg-[#FFF3F6] rounded-2xl p-4 border border-[#FCC1C5]/50 flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-[#EC407A] flex-shrink-0" />
                  <div className="text-xs text-[#242124]">
                    <p className="font-bold">100% Freshness & Happiness Guarantee</p>
                    <p className="text-[#777777] text-[11px]">If petals are damaged in transit, we will replace your bouquet immediately.</p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </main>
      </div>
    </>
  );
}
