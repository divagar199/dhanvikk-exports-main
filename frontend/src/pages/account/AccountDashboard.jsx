import React, { useState, useEffect } from 'react';
import SEO from '../../components/common/SEO';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation, useParams, Link, Navigate } from 'react-router-dom';
import { logoutUser, logoutImmediate, setUserProfile, loginUser, loginWithGoogleThunk } from '../../store/slices/authSlice';
import { addItem, setUserCart } from '../../store/slices/cartSlice';
import { removeFromWishlist, setWishlist } from '../../store/slices/wishlistSlice';
import { useCurrency } from '../../context/CurrencyContext';
import { authService } from '../../services/authService';
import { getUserAvatarUrl, getProductImageUrl } from '../../utils/imageUrl';
import Logo from '../../components/common/Logo';
import Button from '../../components/common/Button';
import Breadcrumb from '../../components/common/Breadcrumb';
import Spinner from '../../components/common/Spinner';
import {
  LogOut,
  Package,
  Heart,
  MapPin,
  Edit3,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  ShoppingBag,
  Truck,
  ShieldCheck,
  User,
  Phone,
  Mail,
  RefreshCw,
  X,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import {
  COUNTRIES_LIST,
  getCountryData,
  getStatesForCountry,
  getDistrictsAndCityForState,
} from '../../data/countriesData';

export default function AccountDashboard() {
  const { formatPrice } = useCurrency();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistFromStore = useSelector((state) => state.wishlist?.items || []);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { encryptedKey } = useParams();

  // Active view tab (responsive to ?tab= query parameter)
  const queryTab = new URLSearchParams(location.search).get('tab');
  const [activeTab, setActiveTab] = useState(() => {
    const valid = ['orders', 'wishlist', 'addresses', 'security'];
    return valid.includes(queryTab) ? queryTab : 'orders';
  });

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    if (tab && ['orders', 'wishlist', 'addresses', 'security'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  // Profile data states
  const [profileData, setProfileData] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [savedBouquets, setSavedBouquets] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Synchronized wishlist items (prioritizes active store, falls back to profile data)
  const displayWishlist = wishlistFromStore.length > 0 ? wishlistFromStore : savedBouquets;

  // Modals
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', avatar: '' });

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    id: '',
    title: 'New Address',
    recipientName: '',
    phone: '',
    street: '',
    district: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United Arab Emirates',
    isDefault: false,
  });

  // Dynamic country and geographic resolution for address modal
  const modalCountryData = getCountryData(addressForm.country);
  const modalAvailableStates = getStatesForCountry(addressForm.country);
  const modalDistrictsData = getDistrictsAndCityForState(addressForm.state);
  const modalAvailableDistricts = modalDistrictsData?.districts || [];

  const handleModalCountrySelect = (newCountry) => {
    const cData = getCountryData(newCountry);
    const states = getStatesForCountry(newCountry);
    const nextState = states[0] || cData.defaultState || '';
    const distInfo = getDistrictsAndCityForState(nextState);
    setAddressForm({
      ...addressForm,
      country: newCountry,
      state: nextState,
      city: distInfo.city || cData.defaultCity || '',
      district: distInfo.districts[0] || cData.defaultDistrict || '',
      postalCode: cData.defaultPostal || '',
      phone: (!addressForm.phone || addressForm.phone.startsWith('+')) ? `${cData.phoneCode} ` : addressForm.phone,
    });
  };

  const handleModalStateSelect = (newState) => {
    const distInfo = getDistrictsAndCityForState(newState);
    setAddressForm({
      ...addressForm,
      state: newState,
      city: distInfo.city || newState,
      district: distInfo.districts[0] || '',
    });
  };

  // Login drawer for unauthenticated state
  const [loginMode, setLoginMode] = useState('google'); // 'google' | 'email'
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Sync user-specific cart whenever cart items change
  useEffect(() => {
    if (user?.email && Array.isArray(cartItems)) {
      authService.saveUserCart(cartItems).catch(() => {});
    }
  }, [cartItems, user?.email]);

  // Check for session/token verification or load data on account page
  useEffect(() => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('dhanvikk_auth_token') || sessionStorage.getItem('dhanvikk_auth_token')
        : null;

    if (isAuthenticated || user || token) {
      sessionStorage.removeItem('dhanvikk_logged_out');
    }

    const isExplicitlyLoggedOut = sessionStorage.getItem('dhanvikk_logged_out') === 'true';
    if (isExplicitlyLoggedOut && !isAuthenticated && !token) {
      setIsLoading(false);
      return;
    }

    // Check if returning from Google Redirect
    (async () => {
      try {
        const { checkGoogleRedirectResult } = await import('../../config/firebase');
        const res = await checkGoogleRedirectResult();
        if (res?.user) {
          sessionStorage.removeItem('dhanvikk_logged_out');
          await dispatch(loginWithGoogleThunk(res.user));
          return;
        }
      } catch (e) {
        console.warn('Account redirect check note:', e);
      }
    })();

    const params = new URLSearchParams(location.search);
    const key = encryptedKey || params.get('portalKey') || params.get('key');
    if (key) {
      handlePortalVerification(key);
    } else if (isAuthenticated || token) {
      loadUserData();
    } else {
      setIsLoading(false);
    }
  }, [encryptedKey, location.search, isAuthenticated, user?.email]);

  // Load user data from backend API
  const loadUserData = async () => {
    if (sessionStorage.getItem('dhanvikk_logged_out') === 'true') {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const email = user?.email;
      if (!email) {
        setIsLoading(false);
        return;
      }
      const data = await authService.getProfileData(email);
      if (data?.success) {
        setProfileData(data.user);
        setSavedAddresses(data.savedAddresses || []);
        if (Array.isArray(data.savedBouquets) && data.savedBouquets.length > 0) {
          setSavedBouquets(data.savedBouquets);
          if (wishlistFromStore.length === 0) {
            dispatch(setWishlist(data.savedBouquets));
          }
        }
        setRecentOrders(data.recentOrders || []);

        if (Array.isArray(data.cart) && data.cart.length > 0) {
          dispatch(setUserCart(data.cart));
        }
      }
    } catch (err) {
      console.warn('Profile data load note:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Verify portal key directly (if user arrives with an external key parameter)
  const handlePortalVerification = async (key) => {
    try {
      setIsLoading(true);
      const res = await authService.verifyPortalKey(key);
      if (res?.success) {
        sessionStorage.removeItem('dhanvikk_logged_out');
        dispatch(setUserProfile(res.user));
        localStorage.setItem('dhanvikk_auth_token', res.token);
        localStorage.setItem('dhanvikk_user', JSON.stringify(res.user));

        if (Array.isArray(res.cart) && res.cart.length > 0) {
          dispatch(setUserCart(res.cart));
        }

        setProfileData(res.user);
        if (res.savedAddresses) setSavedAddresses(res.savedAddresses);
        if (res.savedBouquets) setSavedBouquets(res.savedBouquets);
        if (res.recentOrders) setRecentOrders(res.recentOrders);

        // Keep clean /account URL
        if (location.pathname !== '/account') {
          navigate('/account', { replace: true });
        }

        toast.success(`Welcome to your account, ${res.user.name} 🌸`);
      } else {
        toast.error('Invalid or expired access key');
      }
    } catch (err) {
      console.warn('Portal verification note:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler - immediate reset, session flag, and redirect to /login
  const handleLogout = async () => {
    sessionStorage.setItem('dhanvikk_logged_out', 'true');
    setProfileData(null);
    setSavedAddresses([]);
    setSavedBouquets([]);
    setRecentOrders([]);
    dispatch(logoutImmediate());
    try {
      await dispatch(logoutUser());
    } catch (e) {
      console.warn('Logout error note:', e);
    }
    toast.success('You have been logged out.');
    navigate('/login', { replace: true });
  };

  // One-click Google Login
  const handleGoogleLogin = async () => {
    try {
      setAuthSubmitting(true);
      sessionStorage.removeItem('dhanvikk_logged_out');
      const res = await dispatch(loginWithGoogleThunk()).unwrap();
      if (res?.redirecting) {
        toast.info('Opening Google sign-in...');
        return;
      }
      toast.success(`Welcome back, ${res.user?.name || res.user?.email || 'Valued Customer'}! 🌸`);
      await loadUserData();
    } catch (err) {
      if (typeof err === 'string' && err.includes('canceled')) {
        toast.info(err);
      } else {
        toast.error(err || 'Google sign-in could not be completed.');
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  // Email/Password Login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('Please enter both email and password');
      return;
    }
    try {
      setAuthSubmitting(true);
      sessionStorage.removeItem('dhanvikk_logged_out');
      const res = await dispatch(loginUser({ email: loginEmail, password: loginPassword })).unwrap();
      toast.success(`Welcome, ${res.user?.name || 'Customer'}! 🌸`);
      await loadUserData();
    } catch (err) {
      toast.error(err || 'Login failed. Please check your credentials.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  // Update profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const email = user?.email || profileData?.email || 'customer@dhanvikk.com';
      const res = await authService.updateProfile({
        email,
        name: editForm.name,
        phone: editForm.phone,
        avatar: editForm.avatar,
      });

      if (res?.success) {
        dispatch(setUserProfile(res.user));
        setProfileData(res.user);
        setShowEditProfileModal(false);
        toast.success('Your profile details and encrypted key have been updated! ✨');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  // Save address
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const email = user?.email || profileData?.email || 'customer@dhanvikk.com';
      const res = await authService.saveAddress({
        ...addressForm,
        email,
      });

      if (res?.success) {
        setSavedAddresses(res.addresses);
        setShowAddressModal(false);
        toast.success(res.message || 'Delivery address saved! 🏡');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    }
  };

  // Delete address
  const handleDeleteAddress = async (addressId) => {
    try {
      const email = user?.email || profileData?.email || 'customer@dhanvikk.com';
      const res = await authService.deleteAddress(addressId);
      if (res?.success) {
        setSavedAddresses(res.addresses);
        toast.success('Address removed from your profile.');
      }
    } catch (err) {
      toast.error('Failed to remove address');
    }
  };

  // Toggle or remove bouquet from wishlist
  const handleRemoveBouquet = async (bouquet) => {
    try {
      const bId = bouquet.id || bouquet._id || bouquet.slug;
      dispatch(removeFromWishlist(bId));
      setSavedBouquets((prev) =>
        prev.filter((b) => b.id !== bouquet.id && b._id !== bouquet._id && b.slug !== bouquet.slug)
      );
      toast.success('Removed from wishlist');
      await authService.toggleWishlist(bouquet);
    } catch (err) {
      console.warn('Backend wishlist sync note:', err?.message);
    }
  };

  // Add bouquet to shopping cart
  const handleAddToCart = (item) => {
    dispatch(
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        currency: item.currency || 'INR',
        category: item.category || 'Flowers',
        quantity: 1,
      })
    );
    toast.success(`Added ${item.name} to your luxury bag! 🛍️`);
  };

  // If loading user or verifying key
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" color="#C2185B" />
          <span className="text-xs uppercase tracking-widest text-[#777777]">Loading Account...</span>
        </div>
      </div>
    );
  }

  const activeUser = user || profileData;
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('dhanvikk_auth_token') || sessionStorage.getItem('dhanvikk_auth_token')
      : null;

  if (!activeUser && !isAuthenticated && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userAvatar = getUserAvatarUrl(activeUser);

  return (
    <>
      <SEO
        title="My Account | Dhanvikk Luxury Botanicals"
        description="Manage your orders, addresses, and wishlist at Dhanvikk Blooms."
        canonical="/account"
        noindex={true}
      />

      <div className="min-h-screen bg-[#FFFDF9] text-[#242124] selection:bg-[#EC407A]/20 selection:text-[#C2185B]">
        {/* Top Luxury Navigation Header */}
        <header className="sticky-mobile-nav border-b border-[#F2ECE6] bg-white/95 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-4">
            <Logo />
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/"
              className="text-xs text-[#666666] hover:text-[#C2185B] font-medium transition-colors hidden md:inline-block"
            >
              Explore Collection
            </Link>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setEditForm({
                    name: activeUser.name || '',
                    phone: activeUser.phone || '',
                  });
                  setShowEditProfileModal(true);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF7F2] hover:bg-[#F2ECE6] border border-[#E8DFD5] transition-all text-xs"
              >
                <span className="w-5 h-5 rounded-full bg-[#FFF0F4] border border-[#F2D7DE] text-[#C2185B] flex items-center justify-center text-[10px] font-bold">
                  {activeUser.name ? activeUser.name.charAt(0).toUpperCase() : <User className="w-3 h-3" />}
                </span>
                <span className="font-medium text-[#242124] max-w-[100px] sm:max-w-[150px] truncate">
                  {activeUser.name?.split(' ')[0]}
                </span>
              </button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-1.5 text-xs border-[#FCC1C5] text-[#C2185B] hover:bg-[#FFF0F4] hover:border-[#C2185B]"
              >
                <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Breadcrumb Navigation */}
          <Breadcrumb
            items={[
              { label: 'Home', path: '/' },
              { label: 'Client Sanctuary', path: '/account' },
              {
                label:
                  activeTab === 'orders'
                    ? 'Recent Orders'
                    : activeTab === 'wishlist'
                    ? 'Saved Bouquets'
                    : activeTab === 'addresses'
                    ? 'Saved Addresses'
                    : 'Account Security',
              },
            ]}
            className="mb-5"
          />

          {/* User Digital Member ID & Encrypted Identity Card */}
          <div className="bg-white border border-[#EFE7DE] rounded-3xl p-6 sm:p-8 mb-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#FFF0F4] via-transparent to-transparent pointer-events-none" />

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
              {/* Profile Avatar and Details */}
              <div className="flex items-center gap-5">
                <div className="relative group flex-shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#FFF0F4] to-[#FAF7F2] border-2 border-[#F2D7DE] flex items-center justify-center shadow-xs">
                    <span className="text-2xl sm:text-3xl font-extrabold font-['Poppins'] text-[#C2185B]">
                      {activeUser.name ? activeUser.name.charAt(0).toUpperCase() : 'D'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setEditForm({
                        name: activeUser.name || '',
                        phone: activeUser.phone || '',
                      });
                      setShowEditProfileModal(true);
                    }}
                    className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-full bg-[#C2185B] hover:bg-[#AD1457] text-white shadow-md border border-white transition-transform active:scale-95 cursor-pointer"
                    title="Edit Profile"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    {(activeUser.role === 'admin' || activeUser.role === 'super_admin') && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FFF0F4] border border-[#FCC1C5] text-[#C2185B]">
                        Super Admin
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[11px] text-[#059669] font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" /> Verified Member
                    </span>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-bold font-['Poppins'] text-[#242124] mt-1">
                    {activeUser.name || 'Valued Client'}
                  </h1>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#666666] mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-[#C2185B]" /> {activeUser.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-[#C2185B]" /> {activeUser.phone || '+91 98765 43210'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditForm({
                      name: activeUser.name || '',
                      phone: activeUser.phone || '',
                      avatar: activeUser.avatar || '',
                    });
                    setShowEditProfileModal(true);
                  }}
                  className="gap-1.5 text-xs border-[#E5DFDA] text-[#444444] hover:bg-[#FAF7F2]"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Summary Cards (The 3 Core Requested Data Items) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {/* 1. Recent Orders Card */}
            <div
              onClick={() => setActiveTab('orders')}
              className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 relative overflow-hidden ${
                activeTab === 'orders'
                  ? 'bg-white border-[#C2185B] shadow-md ring-2 ring-[#C2185B]/15'
                  : 'bg-white/90 border-[#EFE7DE] hover:border-[#C2185B]/40 hover:bg-white hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFF0F4] text-[#C2185B] border border-[#FCC1C5] flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                  Live Status
                </span>
              </div>
              <h3 className="font-semibold text-base text-[#242124] font-['Poppins']">Recent Orders</h3>
              <p className="text-xs text-[#666666] mt-1 font-medium">
                {recentOrders.length > 0 ? `${recentOrders.length} active floral delivery scheduled` : 'No active orders'}
              </p>
              <p className="text-[11px] text-[#888888] mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#C2185B]" /> {recentOrders[0]?.timeSlot || 'Scheduled delivery window'}
              </p>
            </div>
            {/* 2. Saved Bouquets Card */}
            <div
              onClick={() => setActiveTab('wishlist')}
              className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 relative overflow-hidden ${
                activeTab === 'wishlist'
                  ? 'bg-white border-[#C2185B] shadow-md ring-2 ring-[#C2185B]/15'
                  : 'bg-white/90 border-[#EFE7DE] hover:border-[#C2185B]/40 hover:bg-white hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFF0F4] text-[#C2185B] border border-[#FCC1C5] flex items-center justify-center">
                  <Heart className="w-5 h-5 fill-[#C2185B]" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFF0F4] text-[#C2185B] border border-[#FCC1C5]">
                  {displayWishlist.length} Curated
                </span>
              </div>
              <h3 className="font-semibold text-base text-[#242124] font-['Poppins']">Saved Bouquets</h3>
              <p className="text-xs text-[#666666] mt-1 font-medium">{displayWishlist.length} signature {displayWishlist.length === 1 ? 'rose' : 'roses'} in wishlist</p>
              <p className="text-[11px] text-[#888888] mt-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#C2185B]" /> Preserved & fresh botanical treasures
              </p>
            </div>

            {/* 3. Saved Addresses Card */}
            <div
              onClick={() => setActiveTab('addresses')}
              className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 relative overflow-hidden ${
                activeTab === 'addresses'
                  ? 'bg-white border-[#C2185B] shadow-md ring-2 ring-[#C2185B]/15'
                  : 'bg-white/90 border-[#EFE7DE] hover:border-[#C2185B]/40 hover:bg-white hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFF0F4] text-[#C2185B] border border-[#FCC1C5] flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                  {savedAddresses.length} Destinations
                </span>
              </div>
              <h3 className="font-semibold text-base text-[#242124] font-['Poppins']">Saved Addresses</h3>
              <p className="text-xs text-[#666666] mt-1 font-medium">
                {savedAddresses.length > 0 ? (savedAddresses.map((a) => a.title).slice(0, 2).join(' & ') + (savedAddresses.length > 2 ? ` +${savedAddresses.length - 2} more` : '')) : 'No saved addresses'}
              </p>
              <p className="text-[11px] text-[#888888] mt-2 flex items-center gap-1">
                <Truck className="w-3 h-3 text-[#C2185B]" /> Verified concierge delivery routes
              </p>
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <div className="flex border-b border-[#EFE7DE] mb-8 overflow-x-auto gap-2 pb-1">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'border-b-2 border-[#C2185B] text-[#C2185B] bg-[#FFF0F4]/60'
                  : 'text-[#666666] hover:text-[#242124]'
              }`}
            >
              <Package className="w-4 h-4 text-[#C2185B]" /> Recent Orders ({recentOrders.length})
            </button>

            <button
              onClick={() => setActiveTab('wishlist')}
              className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'wishlist'
                  ? 'border-b-2 border-[#C2185B] text-[#C2185B] bg-[#FFF0F4]/60'
                  : 'text-[#666666] hover:text-[#242124]'
              }`}
            >
              <Heart className="w-4 h-4 text-[#EC407A]" /> Saved Bouquets ({displayWishlist.length})
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'addresses'
                  ? 'border-b-2 border-[#C2185B] text-[#C2185B] bg-[#FFF0F4]/60'
                  : 'text-[#666666] hover:text-[#242124]'
              }`}
            >
              <MapPin className="w-4 h-4 text-[#C2185B]" /> Saved Addresses ({savedAddresses.length})
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'security'
                  ? 'border-b-2 border-[#C2185B] text-[#C2185B] bg-[#FFF0F4]/60'
                  : 'text-[#666666] hover:text-[#242124]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#059669]" /> Account Security
            </button>
          </div>

          {/* TAB 1: RECENT ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {recentOrders.length === 0 ? (
                <div className="bg-white border border-[#EFE7DE] rounded-3xl p-8 sm:p-12 text-center shadow-sm">
                  <div className="w-16 h-16 rounded-2xl bg-[#FFF0F4] text-[#C2185B] border border-[#FCC1C5] flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-[#242124] font-['Poppins']">No Orders Yet</h4>
                  <p className="text-xs sm:text-sm text-[#666666] max-w-md mx-auto mt-1 mb-6">
                    You haven't scheduled any botanical deliveries yet. Explore our signature collection of Ecuadorian roses and royal traditional garlands.
                  </p>
                  <Link to="/">
                    <Button variant="primary" size="md" className="gap-2 bg-[#C2185B] hover:bg-[#AD1457] text-white">
                      <Sparkles className="w-4 h-4" /> Explore Botanical Collection
                    </Button>
                  </Link>
                </div>
              ) : (
                recentOrders.map((order, idx) => (
                  <div
                    key={order.id || order.orderId || idx}
                    className="bg-white border border-[#EFE7DE] rounded-3xl p-6 sm:p-8 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#F2ECE6]">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs uppercase tracking-widest text-[#C2185B] font-semibold">
                            Active Dispatch #{order.orderId || 'DHN-2026-8941'}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                            {order.status || order.orderStatus || 'Preparing Floral Order'}
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-[#242124] mt-1">
                          {order.items?.length || 1} floral item{order.items?.length === 1 ? '' : 's'} scheduled
                        </h4>
                        <p className="text-xs text-[#666666]">
                          Scheduled for: <strong className="text-[#242124]">{order.deliveryDate || 'Today'}</strong> • Slot: <strong className="text-[#242124]">{order.timeSlot || order.deliverySlot || 'Evening (7 PM - 10 PM)'}</strong>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-[#888888]">Total Paid</span>
                        <p className="text-xl font-bold font-['Poppins'] text-[#C2185B]">
                          ₹{Number(order.totalAmount || 2499).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Real-time Botanical Cold-Chain Tracking Timeline */}
                    <div className="py-6">
                      <h5 className="text-xs font-semibold text-[#C2185B] uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Truck className="w-3.5 h-3.5" /> Concierge Dispatch Milestones
                      </h5>

                      <div className="grid grid-cols-4 gap-2 relative">
                        <div className="text-center">
                          <div className="w-8 h-8 mx-auto rounded-full bg-[#059669] text-white font-bold flex items-center justify-center text-xs mb-1.5 shadow-sm">
                            ✓
                          </div>
                          <span className="text-[11px] font-semibold text-[#242124] block">Confirmed</span>
                          <span className="text-[9px] text-[#777777]">Order Received</span>
                        </div>

                        <div className="text-center">
                          <div className="w-8 h-8 mx-auto rounded-full bg-[#C2185B] text-white font-bold flex items-center justify-center text-xs mb-1.5 shadow-md shadow-[#C2185B]/20 ring-4 ring-[#FCC1C5]">
                            2
                          </div>
                          <span className="text-[11px] font-bold text-[#C2185B] block">Artistry In Progress</span>
                          <span className="text-[9px] text-[#059669] font-semibold">Active Right Now</span>
                        </div>

                        <div className="text-center opacity-70">
                          <div className="w-8 h-8 mx-auto rounded-full bg-[#F2ECE6] text-[#777777] font-medium flex items-center justify-center text-xs mb-1.5">
                            3
                          </div>
                          <span className="text-[11px] font-medium text-[#555555] block">Cold-Chain Transit</span>
                          <span className="text-[9px] text-[#888888]">Expected 6:30 PM</span>
                        </div>

                        <div className="text-center opacity-70">
                          <div className="w-8 h-8 mx-auto rounded-full bg-[#F2ECE6] text-[#777777] font-medium flex items-center justify-center text-xs mb-1.5">
                            4
                          </div>
                          <span className="text-[11px] font-medium text-[#555555] block">Hand-Delivered</span>
                          <span className="text-[9px] text-[#888888]">Concierge Handoff</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Items & Recipient Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#F2ECE6] text-xs">
                      <div className="space-y-2.5">
                        {(order.items && order.items.length > 0 ? order.items : [
                          {
                            name: 'Passionate Serenity Noir',
                            notes: 'Ecuadorian Obsidian Rose Bouquet',
                            price: order.totalAmount || 2499,
                            quantity: 1,
                            image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=400&q=80',
                          },
                        ]).map((item, iIdx) => (
                          <div
                            key={item.id || item.product || iIdx}
                            className="flex items-center gap-3 bg-[#FAF7F2] p-3 rounded-2xl border border-[#EFE7DE]"
                          >
                            <img
                              src={getProductImageUrl(item.image || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=400&q=80')}
                              alt={`${item.name} order item`}
                              className="w-14 h-14 object-cover rounded-xl border border-[#FCC1C5]"
                              loading="lazy"
                              decoding="async"
                            />
                            <div className="flex-1 min-w-0">
                              <h6 className="font-semibold text-[#242124] truncate">{item.name}</h6>
                              <p className="text-[11px] text-[#666666] truncate">
                                {item.notes || 'Luxury Botanical Floral Arrangement'}
                              </p>
                              <span className="text-[11px] text-[#C2185B] font-semibold">
                                Qty: {item.quantity || 1} • ₹{Number(item.price || 0).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EFE7DE] flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-[#888888] uppercase font-semibold">Delivery Destination</span>
                          <p className="text-[#242124] font-medium mt-0.5">
                            {order.shippingAddress?.fullName || order.recipientName || activeUser.name} ({order.shippingAddress?.phone || order.recipientPhone || activeUser.phone})
                          </p>
                          <p className="text-[11px] text-[#666666]">
                            {order.shippingAddress?.streetAddress || order.deliveryAddress?.street || 'Primary Delivery Address'}, {order.shippingAddress?.city || order.deliveryAddress?.city || 'Dubai'} {order.shippingAddress?.country ? `• ${order.shippingAddress.country}` : ''}
                          </p>
                        </div>

                        {(order.greetingCardMessage || order.greetingMessage) && (
                          <p className="text-[11px] italic text-[#C2185B] mt-2 pt-2 border-t border-[#EFE7DE] line-clamp-2">
                            Card: "{order.greetingCardMessage || order.greetingMessage}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: SAVED BOUQUETS (WISHLIST) */}
          {activeTab === 'wishlist' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold font-['Poppins'] text-[#242124]">
                    {displayWishlist.length} {displayWishlist.length === 1 ? 'Signature Bloom' : 'Signature Blooms'} in Wishlist
                  </h3>
                  <p className="text-xs text-[#666666]">
                    Hand-curated botanical pieces preserved for your personal celebration.
                  </p>
                </div>
                <Link to="/category/flowers">
                  <Button variant="outline" size="sm" className="text-xs border-[#FCC1C5] text-[#C2185B] hover:bg-[#FFF0F4]">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Discover More
                  </Button>
                </Link>
              </div>

              {displayWishlist.length === 0 ? (
                <div className="bg-white border border-[#EFE7DE] rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FFF3F6] flex items-center justify-center text-[#E11D48]">
                    <Heart className="w-8 h-8 fill-[#E11D48]/20" />
                  </div>
                  <h4 className="text-base font-bold text-[#242124] mb-1 font-['Poppins']">
                    Your Wishlist is Empty
                  </h4>
                  <p className="text-xs text-[#777777] max-w-sm mx-auto mb-6">
                    Tap the heart icon on any floral arrangement or botanical treasure across the store to save it here.
                  </p>
                  <Link to="/category/flowers">
                    <Button variant="primary" size="sm" className="bg-[#C2185B] hover:bg-[#AD1457] text-white">
                      Explore Curated Blooms
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {displayWishlist.map((item) => (
                    <div
                      key={item.id || item.slug}
                      className="bg-white border border-[#EFE7DE] rounded-2xl overflow-hidden hover:border-[#FCC1C5] transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
                    >
                      <div>
                        <div className="h-44 overflow-hidden relative">
                          <img
                            src={getProductImageUrl(item.image)}
                            alt={`${item.name} saved in wishlist`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                            decoding="async"
                          />
                          <button
                            onClick={() => handleRemoveBouquet(item)}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-[#E11D48] text-[#666666] hover:text-white transition-colors shadow-xs cursor-pointer"
                            title="Remove from wishlist"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-white/90 backdrop-blur-md text-[#C2185B] border border-[#FCC1C5]">
                            {item.category || 'Luxury Flowers'}
                          </span>
                        </div>

                        <div className="p-4">
                          <h4 className="font-semibold text-sm text-[#242124] group-hover:text-[#C2185B] transition-colors line-clamp-1">
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-[#666666] line-clamp-2 mt-1">
                            {item.notes || 'Exclusive luxury hand-tied arrangement'}
                          </p>
                          <p className="text-base font-bold font-['Poppins'] text-[#C2185B] mt-2">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 pt-0">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAddToCart(item)}
                          className="w-full text-xs gap-1.5 bg-[#C2185B] hover:bg-[#AD1457] text-white border-0 shadow-xs cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> Move to Bag
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SAVED ADDRESSES */}
          {activeTab === 'addresses' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold font-['Poppins'] text-[#242124]">
                    Primary Residence & Gifting Address
                  </h3>
                  <p className="text-xs text-[#666666]">
                    Stored delivery destinations for seamless chilled concierge drop-offs.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setAddressForm({
                      id: '',
                      title: 'Residence',
                      recipientName: activeUser.name || '',
                      phone: activeUser.phone || '',
                      street: '',
                      district: '',
                      city: 'Dubai',
                      state: 'Dubai',
                      postalCode: '',
                      country: 'United Arab Emirates',
                      isDefault: false,
                    });
                    setShowAddressModal(true);
                  }}
                  className="text-xs gap-1.5 bg-gradient-to-r from-[#C2185B] to-[#EC407A] text-white border-0 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Address
                </Button>
              </div>

              {savedAddresses.length === 0 ? (
                <div className="bg-white border border-[#EFE7DE] rounded-3xl p-8 sm:p-12 text-center shadow-sm">
                  <div className="w-16 h-16 rounded-2xl bg-[#FFF0F4] text-[#C2185B] border border-[#FCC1C5] flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-[#242124] font-['Poppins']">No Saved Addresses</h4>
                  <p className="text-xs sm:text-sm text-[#666666] max-w-md mx-auto mt-1 mb-6">
                    Add your residence or gifting address for effortless concierge flower dispatch.
                  </p>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      setAddressForm({
                        id: '',
                        title: 'Primary Residence',
                        recipientName: activeUser.name || '',
                        phone: activeUser.phone || '',
                        street: '',
                        district: '',
                        city: 'Dubai',
                        state: 'Dubai',
                        postalCode: '',
                        country: 'United Arab Emirates',
                        isDefault: true,
                      });
                      setShowAddressModal(true);
                    }}
                    className="gap-2 bg-[#C2185B] hover:bg-[#AD1457] text-white"
                  >
                    <Plus className="w-4 h-4" /> Add Delivery Address
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="bg-white border border-[#EFE7DE] rounded-2xl p-5 shadow-sm relative flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm text-[#242124] font-['Poppins']">
                            {addr.title}
                          </span>
                          {addr.isDefault && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                              Primary Default
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-[#666666] space-y-1">
                          <p className="font-semibold text-[#242124]">{addr.recipientName}</p>
                          <p>{addr.street}</p>
                          <p>
                            {addr.district ? `${addr.district}, ` : ''}
                            {addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postalCode}
                          </p>
                          <p className="text-[#C2185B] font-medium">{addr.country}</p>
                          <p className="text-[11px] text-[#888888] flex items-center gap-1 mt-1">
                            <Phone className="w-3 h-3 text-[#C2185B]" /> {addr.phone}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#F2ECE6]">
                        <button
                          onClick={() => {
                            setAddressForm(addr);
                            setShowAddressModal(true);
                          }}
                          className="px-3 py-1 text-xs text-[#C2185B] hover:text-[#9E0B2B] bg-[#FFF0F4] hover:bg-[#FFE4ED] rounded-lg transition-colors font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="px-3 py-1 text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ACCOUNT SECURITY & PRIVACY */}
          {activeTab === 'security' && (
            <div className="bg-white border border-[#EFE7DE] rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="max-w-2xl">
                <span className="text-[11px] uppercase tracking-widest text-[#C2185B] font-semibold">
                  Privacy & Authentication
                </span>
                <h3 className="text-xl font-bold font-['Poppins'] text-[#242124] mt-1">
                  Account Security & Session Protection
                </h3>
                <p className="text-xs text-[#666666] mt-2 leading-relaxed">
                  Your Dhanvikk account is protected by verified OAuth authentication, end-to-end encrypted session tokens, and secure cold-chain delivery protocols. All personal contact details and delivery addresses are kept strictly confidential.
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EFE7DE]">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#242124] mb-1">
                      <ShieldCheck className="w-4 h-4 text-[#059669]" />
                      <span>Authenticated Session</span>
                    </div>
                    <p className="text-[11px] text-[#666666]">
                      Signed in as <strong className="text-[#242124]">{activeUser.email}</strong>. Session secured with encrypted tokens.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EFE7DE]">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#242124] mb-1">
                      <Sparkles className="w-4 h-4 text-[#C2185B]" />
                      <span>Concierge Support</span>
                    </div>
                    <p className="text-[11px] text-[#666666]">
                      Need assistance with your orders or account? Reach our priority concierge team directly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* MODAL: EDIT PROFILE */}
        {showEditProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white border border-[#EFE7DE] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-[#242124]">
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="absolute top-5 right-5 text-[#888888] hover:text-[#242124]"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold font-['Poppins'] text-[#242124] mb-4">
                Edit Member Details
              </h3>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#444444] mb-1 font-semibold">Full Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] focus:outline-none focus:border-[#C2185B] focus:ring-1 focus:ring-[#C2185B]"
                  />
                </div>

                <div>
                  <label className="block text-[#444444] mb-1 font-semibold">Mobile Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] focus:outline-none focus:border-[#C2185B] focus:ring-1 focus:ring-[#C2185B]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEditProfileModal(false)}
                    className="border-[#DCD5CD] text-[#555555] hover:bg-[#FAF7F2]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="bg-gradient-to-r from-[#C2185B] to-[#EC407A] text-white border-0 shadow-sm"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT ADDRESS */}
        {showAddressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white border border-[#EFE7DE] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative text-[#242124]">
              <button
                onClick={() => setShowAddressModal(false)}
                className="absolute top-5 right-5 text-[#888888] hover:text-[#242124]"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold font-['Poppins'] text-[#242124] mb-4">
                {addressForm.id ? 'Edit Destination Address' : 'Add Delivery Address'}
              </h3>

              <form onSubmit={handleSaveAddress} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#444444] mb-1 font-semibold">Address Label</label>
                    <input
                      type="text"
                      value={addressForm.title}
                      onChange={(e) => setAddressForm({ ...addressForm, title: e.target.value })}
                      placeholder="e.g. Primary Residence or Gifting Address"
                      required
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] focus:border-[#C2185B] focus:outline-none focus:ring-1 focus:ring-[#C2185B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#444444] mb-1 font-semibold">Recipient Name</label>
                    <input
                      type="text"
                      value={addressForm.recipientName}
                      onChange={(e) => setAddressForm({ ...addressForm, recipientName: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] focus:border-[#C2185B] focus:outline-none focus:ring-1 focus:ring-[#C2185B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#444444] mb-1 font-semibold">Contact Mobile</label>
                  <input
                    type="text"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] focus:border-[#C2185B] focus:outline-none focus:ring-1 focus:ring-[#C2185B]"
                  />
                </div>

                <div>
                  <label className="block text-[#444444] mb-1 font-semibold">Street & Building</label>
                  <input
                    type="text"
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                    required
                    placeholder="Villa 14, Palm Crescent"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] focus:border-[#C2185B] focus:outline-none focus:ring-1 focus:ring-[#C2185B]"
                  />
                </div>

                {/* Country & State (Dynamically Driven) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#444444] mb-1 font-semibold">
                      Country <span className="text-[#C2185B]">*</span>
                    </label>
                    <select
                      value={addressForm.country}
                      onChange={(e) => handleModalCountrySelect(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] focus:border-[#C2185B] focus:outline-none focus:ring-1 focus:ring-[#C2185B] cursor-pointer"
                    >
                      {COUNTRIES_LIST.map((c) => (
                        <option key={c.code} value={c.name}>
                          {c.flag} {c.name} ({c.currency})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#444444] mb-1 font-semibold">
                      {modalCountryData.stateLabel} <span className="text-[#C2185B]">*</span>
                    </label>
                    {modalAvailableStates.length > 0 ? (
                      <select
                        value={addressForm.state}
                        onChange={(e) => handleModalStateSelect(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] focus:border-[#C2185B] focus:outline-none focus:ring-1 focus:ring-[#C2185B] cursor-pointer"
                      >
                        {modalAvailableStates.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                        <option value="Other">Other / Custom</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        placeholder={`Enter ${modalCountryData.stateLabel}`}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] focus:border-[#C2185B] focus:outline-none focus:ring-1 focus:ring-[#C2185B]"
                      />
                    )}
                  </div>
                </div>

                {/* District, City & Postal Code (Dynamically Driven) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[#444444] mb-1 font-semibold">
                      {modalCountryData.districtLabel} <span className="text-[#C2185B]">*</span>
                    </label>
                    <input
                      type="text"
                      list="modal-district-presets"
                      value={addressForm.district}
                      onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                      placeholder={modalAvailableDistricts[0] ? `e.g. ${modalAvailableDistricts[0]}` : `Enter ${modalCountryData.districtLabel}`}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] focus:border-[#C2185B] focus:outline-none focus:ring-1 focus:ring-[#C2185B]"
                    />
                    {modalAvailableDistricts.length > 0 && (
                      <datalist id="modal-district-presets">
                        {modalAvailableDistricts.map((d) => (
                          <option key={d} value={d} />
                        ))}
                      </datalist>
                    )}
                  </div>

                  <div>
                    <label className="block text-[#444444] mb-1 font-semibold">
                      City <span className="text-[#C2185B]">*</span>
                    </label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      placeholder="e.g. Dubai or Chennai"
                      required
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] focus:border-[#C2185B] focus:outline-none focus:ring-1 focus:ring-[#C2185B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#444444] mb-1 font-semibold">
                      {modalCountryData.postalLabel} {modalCountryData.postalRequired ? '*' : ''}
                    </label>
                    <input
                      type="text"
                      value={addressForm.postalCode}
                      onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                      placeholder={modalCountryData.postalPlaceholder}
                      required={modalCountryData.postalRequired}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#DCD5CD] text-[#242124] focus:border-[#C2185B] focus:outline-none focus:ring-1 focus:ring-[#C2185B]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="rounded border-[#DCD5CD] text-[#C2185B] focus:ring-[#C2185B]"
                  />
                  <label htmlFor="isDefault" className="text-[#333333] text-xs cursor-pointer">
                    Set as default primary delivery residence
                  </label>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddressModal(false)}
                    className="border-[#DCD5CD] text-[#555555] hover:bg-[#FAF7F2]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="bg-gradient-to-r from-[#C2185B] to-[#EC407A] text-white border-0 shadow-sm"
                  >
                    Save Address
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
