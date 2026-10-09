import React, { useState } from 'react';
import SEO from '../../components/common/SEO';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Compass,
  Home,
  Briefcase,
  Gift,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import Logo from '../../components/common/Logo';
import AuthTrustMessage from '../../components/auth/AuthTrustMessage';
import AuthBrandPanel from '../../components/auth/AuthBrandPanel';
import { registerUser, loginWithGoogleThunk, clearAuthError } from '../../store/slices/authSlice';
import { signInWithGoogleFirebase, checkGoogleRedirectResult } from '../../config/firebase';

const COUNTRY_CODES = [
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA/CA', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+968', country: 'Oman', flag: '🇴🇲' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦' },
];

const PRESET_CITIES = {
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Al Ain'],
  'India': ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Madurai'],
  'International': ['Singapore', 'London', 'Muscat', 'Doha', 'Riyadh', 'New York'],
};

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading: authLoading, error: authError } = useSelector((state) => state.auth);

  // Form states
  const [googleUser, setGoogleUser] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    countryCode: '+971',
    phone: '',
    country: 'United Arab Emirates',
    state: 'Dubai',
    district: '',
    city: 'Dubai',
    street: '',
    postalCode: '',
    addressType: 'Primary Residence',
  });

  const [formErrors, setFormErrors] = useState({});

  // Check if returning from Google Redirect
  React.useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await checkGoogleRedirectResult();
        if (res?.user && isMounted) {
          setGoogleUser(res.user);
          setFormData((prev) => ({
            ...prev,
            name: prev.name || res.user.name || '',
            email: res.user.email || prev.email,
          }));
          const actionResult = await dispatch(
            loginWithGoogleThunk({
              googleUid: res.user.id,
              name: res.user.name,
              email: res.user.email,
              avatar: res.user.avatar,
              phone: res.user.phone || '',
              isNewRegistration: true,
            })
          );
          if (loginWithGoogleThunk.fulfilled.match(actionResult)) {
            toast.success(`🌸 Welcome to Dhanvikk Blooms, ${res.user.name || 'Valued Customer'}!`);
            navigate('/account', { replace: true });
          }
        }
      } catch (e) {
        console.warn('Register redirect check note:', e);
      }
    })();
    return () => { isMounted = false; };
  }, [dispatch, navigate]);

  // Fast Google Sign-In & Registration on Create Account page
  const handleGooglePreFill = async () => {
    dispatch(clearAuthError());
    setGoogleLoading(true);
    try {
      const fbRes = await signInWithGoogleFirebase();
      if (fbRes?.redirecting) {
        toast.info('Opening Google sign-in...');
        return;
      }
      if (fbRes?.user) {
        setGoogleUser(fbRes.user);
        setFormData((prev) => ({
          ...prev,
          name: prev.name || fbRes.user.name || '',
          email: fbRes.user.email || prev.email,
        }));

        // Immediately complete Google Sign Up & Login
        const actionResult = await dispatch(
          loginWithGoogleThunk({
            googleUid: fbRes.user.id,
            name: fbRes.user.name,
            email: fbRes.user.email,
            avatar: fbRes.user.avatar,
            phone: fbRes.user.phone || '',
            isNewRegistration: true,
          })
        );

        if (loginWithGoogleThunk.fulfilled.match(actionResult)) {
          toast.success(`🌸 Welcome to Dhanvikk Blooms, ${fbRes.user.name || 'Valued Customer'}!`);
          navigate('/account', { replace: true });
          return;
        } else {
          toast.error(actionResult.payload || 'Google sign-up could not be completed.');
        }
      }
    } catch (err) {
      console.warn('Google pre-fill notice:', err);
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        toast.info('Google sign-in was canceled.');
      } else if (err.code === 'auth/popup-blocked') {
        toast.error('Google sign-in popup was blocked. Please allow popups or enter details manually.');
      } else {
        toast.error(err?.message || 'Google connection could not be opened. You can enter details manually.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // HTML5 Geolocation detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const addr = data.address || {};
          const detectedCity = addr.city || addr.town || addr.county || addr.state_district || 'Dubai';
          const detectedCountry = addr.country || 'United Arab Emirates';
          const detectedState = addr.state || detectedCity;
          const detectedPostcode = addr.postcode || '';

          const detectedDistrict = addr.suburb || addr.neighbourhood || addr.state_district || addr.county || '';

          setFormData((prev) => ({
            ...prev,
            country: detectedCountry.includes('India')
              ? 'India'
              : detectedCountry.includes('Emirates') || detectedCountry.includes('UAE')
              ? 'United Arab Emirates'
              : detectedCountry,
            city: detectedCity,
            state: detectedState,
            district: detectedDistrict || prev.district,
            postalCode: detectedPostcode || prev.postalCode,
            street: prev.street || `${addr.suburb || addr.neighbourhood || ''} ${addr.road || ''}`.trim(),
          }));

          toast.success(`📍 Location detected: ${detectedCity}, ${detectedCountry}`);
        } catch {
          toast.info('Location coordinates captured. Please confirm your city & street.');
        } finally {
          setDetectingLocation(false);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        toast.error('Could not detect location. Please select your city manually.');
        setDetectingLocation(false);
      },
      { timeout: 8000 }
    );
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim()) errs.email = 'Valid email is required';
    if (!googleUser && (!formData.password || formData.password.length < 4)) {
      errs.password = 'Password must be at least 4 characters';
    }
    if (!formData.phone.trim()) errs.phone = 'Contact number is required';
    if (!formData.street.trim()) errs.street = 'Street address or villa number is required';
    if (!formData.city.trim()) errs.city = 'City is required';

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please complete all required fields.');
      return;
    }

    dispatch(clearAuthError());

    const fullPhone = `${formData.countryCode} ${formData.phone}`.trim();
    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password || `GoogleAuth_${Date.now()}`,
      phone: fullPhone,
      street: formData.street.trim(),
      district: formData.district.trim(),
      city: formData.city.trim(),
      state: formData.state.trim() || formData.city.trim(),
      country: formData.country,
      postalCode: formData.postalCode.trim(),
      addressType: formData.addressType,
      isNewRegistration: true,
    };

    try {
      let actionResult = null;

      if (googleUser) {
        actionResult = await dispatch(
          loginWithGoogleThunk({
            ...payload,
            avatar: googleUser.avatar,
            googleUid: googleUser.id,
          })
        );
      } else {
        actionResult = await dispatch(registerUser(payload));
      }

      if (
        registerUser.fulfilled.match(actionResult) ||
        loginWithGoogleThunk.fulfilled.match(actionResult)
      ) {
        toast.success('🌸 Welcome to Dhanvikk Blooms! Account created.');
        navigate('/account');
      } else {
        toast.error(actionResult.payload || 'Account creation failed. Please check your inputs.');
      }
    } catch {
      toast.error('An unexpected error occurred during account creation.');
    }
  };

  return (
    <>
      <SEO
        title="Create Account | Dhanvikk Blooms"
        description="Create your Dhanvikk Blooms account. Save delivery addresses, access bespoke Ecuadorian roses, and track luxury floral orders."
        canonical="/register"
        noindex={true}
      />

      <AuthLayout brandPanel={<AuthBrandPanel />}>
        <div className="w-full max-w-[480px] sm:max-w-[510px] mx-auto py-4">
          {/* Main Bright Luxury Card Container */}
          <div className="relative w-full bg-white border border-[#EFE7DE] rounded-3xl p-6 sm:p-8 shadow-[0_16px_48px_rgba(194,24,91,0.06)] text-left">
            {/* Subtle Top Rose Hairline Gradient Accent */}
            <div className="absolute inset-x-10 top-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#EC407A] to-transparent pointer-events-none" />

            {/* Logo */}
            <div className="text-center pt-1 mb-3.5 flex justify-center">
              <Logo />
            </div>

            {/* Heading Section */}
            <div className="text-center mb-5">
              <h1 className="text-2xl sm:text-[26px] font-bold text-[#1F191D] tracking-tight font-['Poppins']">
                Create Your Account
              </h1>
              <p className="text-xs sm:text-[13px] text-[#666666] mt-1 max-w-sm mx-auto">
                Join for seamless floral gifting, saved addresses & express delivery.
              </p>
            </div>

            {/* Google 1-Click Sign-Up Button */}
            <div className="mb-4">
              {googleUser ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                  <div className="flex items-center gap-2.5">
                    {googleUser.avatar ? (
                      <img
                        src={googleUser.avatar}
                        alt={`${googleUser.name || 'User'} Google Profile Avatar`}
                        className="w-8 h-8 rounded-full border border-emerald-300 object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    )}
                    <div>
                      <p className="text-xs font-bold leading-tight">{googleUser.name || 'Google Connected'}</p>
                      <p className="text-[11px] text-emerald-700 leading-tight">{googleUser.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                    Verified ✓
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleGooglePreFill}
                  disabled={googleLoading || authLoading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white border border-[#E5DFD9] hover:border-[#EC407A] hover:bg-[#FAF8F5] text-[#EC407A] text-xs sm:text-[13.5px] font-medium transition-all shadow-xs hover:shadow-sm cursor-pointer group"
                >
                  {googleLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner size="sm" color="#EC407A" />
                      <span className="text-[#666666]">Connecting to Google...</span>
                    </span>
                  ) : (
                    <>
                      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.28-2.09 3.665-5.17 3.665-9.12z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.28v3.13C3.26 21.3 7.33 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.28C.46 8.2 0 10.04 0 12s.46 3.8 1.28 5.42l4-3.13z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.7 1.28 6.58l4 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
                        />
                      </svg>
                      <span>1-Click Sign Up with Google</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-3.5">
              <div className="absolute inset-x-0 h-px bg-[#EFE7DE]" />
              <span className="relative px-3 bg-white text-[10.5px] font-semibold text-[#888888] uppercase tracking-wider">
                {googleUser ? 'Complete Delivery Profile' : 'Or Register With Details'}
              </span>
            </div>

            {/* Server Error Alert */}
            {authError && (
              <div className="mb-3.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {authError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* SECTION 1: Personal Details */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#555555] mb-1">
                    Full Name <span className="text-[#C2185B]">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
                    <input
                      type="text"
                      placeholder="e.g. Priya Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-3.5 h-11 text-xs sm:text-sm rounded-xl border border-[#E5DFD9] bg-[#FAF7F2]/60 focus:bg-white focus:border-[#EC407A] focus:outline-none transition-all text-[#242124]"
                    />
                  </div>
                  {formErrors.name && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#555555] mb-1">
                    Contact / WhatsApp <span className="text-[#C2185B]">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.countryCode}
                      onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                      className="w-28 px-2.5 h-11 text-xs rounded-xl border border-[#E5DFD9] bg-[#FAF7F2] text-[#242124] font-medium focus:outline-none focus:border-[#EC407A] cursor-pointer flex-shrink-0"
                    >
                      {COUNTRY_CODES.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.flag} {item.code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      placeholder="50 123 4567 / 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 h-11 text-xs sm:text-sm rounded-xl border border-[#E5DFD9] bg-[#FAF7F2]/60 focus:bg-white focus:border-[#EC407A] focus:outline-none transition-all text-[#242124]"
                    />
                  </div>
                  {formErrors.phone && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#555555] mb-1">
                    Email Address <span className="text-[#C2185B]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      readOnly={Boolean(googleUser)}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full pl-10 pr-3.5 h-11 text-xs sm:text-sm rounded-xl border border-[#E5DFD9] focus:outline-none transition-all text-[#242124] ${
                        googleUser
                          ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                          : 'bg-[#FAF7F2]/60 focus:bg-white focus:border-[#EC407A]'
                      }`}
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.email}</p>
                  )}
                </div>

                {!googleUser && (
                  <div>
                    <label className="block text-xs font-semibold text-[#555555] mb-1">
                      Password <span className="text-[#C2185B]">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create password (min. 4 characters)"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-10 pr-10 h-11 text-xs sm:text-sm rounded-xl border border-[#E5DFD9] bg-[#FAF7F2]/60 focus:bg-white focus:border-[#EC407A] focus:outline-none transition-all text-[#242124]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#EC407A] transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {formErrors.password && (
                      <p className="text-[11px] text-rose-600 mt-1">{formErrors.password}</p>
                    )}
                  </div>
                )}
              </div>

              {/* SECTION 2: Saved Delivery Address */}
              <div className="p-4 sm:p-4.5 rounded-2xl bg-[#FAF7F2] border border-[#EFE7DE] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#242124] uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#EC407A]" />
                    Delivery Destination Address
                  </span>

                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={detectingLocation}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white hover:bg-[#FFF0F4] text-[#C2185B] border border-[#EBE3DC] hover:border-[#EC407A] text-[10.5px] font-semibold transition-all cursor-pointer shadow-2xs"
                  >
                    <Compass className={`w-3 h-3 ${detectingLocation ? 'animate-spin' : ''}`} />
                    <span>{detectingLocation ? 'Detecting...' : '📍 Auto-Detect'}</span>
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#666666] mb-1">
                    Street Address / Villa / Apartment <span className="text-[#C2185B]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Villa 14, Palm Crescent, Palm Jumeirah"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    className="w-full px-3.5 h-10 text-xs sm:text-sm rounded-xl border border-[#E5DFD9] bg-white focus:border-[#EC407A] focus:outline-none transition-all text-[#242124]"
                  />
                  {formErrors.street && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.street}</p>
                  )}
                </div>

                {/* Country & State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#666666] mb-1">
                      Country <span className="text-[#C2185B]">*</span>
                    </label>
                    <input
                      type="text"
                      list="register-country-presets"
                      placeholder="e.g. United Arab Emirates or India"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-3.5 h-10 text-xs sm:text-sm rounded-xl border border-[#E5DFD9] bg-white focus:border-[#EC407A] focus:outline-none transition-all text-[#242124]"
                    />
                    <datalist id="register-country-presets">
                      <option value="United Arab Emirates" />
                      <option value="India" />
                      <option value="Oman" />
                      <option value="Singapore" />
                      <option value="Malaysia" />
                      <option value="Saudi Arabia" />
                      <option value="Qatar" />
                      <option value="United Kingdom" />
                      <option value="United States" />
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#666666] mb-1">
                      State / Province / Emirate <span className="text-[#C2185B]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dubai, Abu Dhabi, or Maharashtra"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3.5 h-10 text-xs sm:text-sm rounded-xl border border-[#E5DFD9] bg-white focus:border-[#EC407A] focus:outline-none transition-all text-[#242124]"
                    />
                  </div>
                </div>

                {/* District, City & Postal Code */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#666666] mb-1">
                      District / Area <span className="text-[#C2185B]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Palm Jumeirah or South Mumbai"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full px-3.5 h-10 text-xs sm:text-sm rounded-xl border border-[#E5DFD9] bg-white focus:border-[#EC407A] focus:outline-none transition-all text-[#242124]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#666666] mb-1">
                      City / Emirate <span className="text-[#C2185B]">*</span>
                    </label>
                    <input
                      type="text"
                      list="city-suggestions"
                      placeholder="e.g. Dubai"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3.5 h-10 text-xs sm:text-sm rounded-xl border border-[#E5DFD9] bg-white focus:border-[#EC407A] focus:outline-none transition-all text-[#242124]"
                    />
                    <datalist id="city-suggestions">
                      {(PRESET_CITIES[formData.country] || []).map((cty) => (
                        <option key={cty} value={cty} />
                      ))}
                    </datalist>
                    {formErrors.city && (
                      <p className="text-[11px] text-rose-600 mt-1">{formErrors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#666666] mb-1">
                      Postal Code / Area Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 00000"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full px-3.5 h-10 text-xs sm:text-sm rounded-xl border border-[#E5DFD9] bg-white focus:border-[#EC407A] focus:outline-none transition-all text-[#242124]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#666666] mb-1">
                    Address Label
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    {[
                      { id: 'Primary Residence', icon: Home, label: 'Home' },
                      { id: 'Corporate / Office', icon: Briefcase, label: 'Office' },
                      { id: 'Gifting / Surprise Address', icon: Gift, label: 'Gifting' },
                    ].map((item) => {
                      const IconComponent = item.icon;
                      const active = formData.addressType === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, addressType: item.id })}
                          className={`py-1.5 px-2 rounded-xl border flex items-center justify-center gap-1.5 font-medium transition-all cursor-pointer ${
                            active
                              ? 'bg-[#FFF0F4] border-[#EC407A] text-[#C2185B] font-bold shadow-2xs'
                              : 'bg-white border-[#E5DFD9] text-[#666666] hover:bg-[#FAF7F2]'
                          }`}
                        >
                          <IconComponent className="w-3.5 h-3.5" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#EC407A] to-[#C2185B] hover:from-[#d8356d] hover:to-[#a9144e] text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {authLoading ? (
                    <>
                      <Spinner size="sm" color="#ffffff" />
                      <span>Creating Your Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account & Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Redirect to Login */}
            <div className="mt-4 pt-3.5 border-t border-[#EFE7DE] text-center text-xs text-[#666666]">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-[#C2185B] hover:text-[#EC407A] ml-1 transition-colors hover:underline"
              >
                Sign In →
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-3.5 pt-2 text-center border-t border-[#F2ECE6]">
              <AuthTrustMessage />
            </div>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}
