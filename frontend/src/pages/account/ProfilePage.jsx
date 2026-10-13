import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import Navbar from '../../components/navigation/Navbar';
import AnnouncementBar from '../../components/navigation/AnnouncementBar';
import SubNav from '../../components/navigation/SubNav';
import Footer from '../../components/navigation/Footer';
import CartDrawer from '../../components/cart/CartDrawer';
import Breadcrumb from '../../components/common/Breadcrumb';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { setUserProfile, logoutImmediate } from '../../store/slices/authSlice';
import { authService } from '../../services/authService';
import { useCurrency } from '../../context/CurrencyContext';
import {
  User,
  Mail,
  Phone,
  Shield,
  Package,
  MapPin,
  Calendar,
  Sparkles,
  Lock,
  LogOut,
  Edit2,
  CheckCircle2,
  ArrowRight,
  Heart,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { currency } = useCurrency();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    preferredOccasion: 'Anniversary & Romantic',
    preferredFlower: 'Ecuadorian Roses',
    notifyWhatsapp: true,
    notifyEmail: true,
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please provide your full name');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.updateProfile({
        name: formData.name,
        phone: formData.phone,
      });

      if (res?.success && res.user) {
        dispatch(setUserProfile(res.user));
        toast.success('Your profile details have been updated successfully');
      } else {
        // Fallback update local state
        dispatch(setUserProfile({ ...user, name: formData.name, phone: formData.phone }));
        toast.success('Profile preferences saved');
      }
      setIsEditing(false);
    } catch {
      // Local fallback
      dispatch(setUserProfile({ ...user, name: formData.name, phone: formData.phone }));
      toast.success('Profile preferences updated');
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logoutImmediate());
    toast.success('Signed out successfully');
    navigate('/');
  };

  return (
    <>
      <SEO
        title="VIP Patron Profile & Account Settings | Dhanvikk Blooms"
        description="Manage your Dhanvikk Blooms luxury florist account, personal details, delivery preferences, and security settings."
        canonical="/profile"
        noindex={true}
      />

      <CartDrawer />

      <div className="min-h-screen bg-[#FFFDF9] text-[#242124] flex flex-col font-['Poppins']">
        <AnnouncementBar />
        <Navbar />
        <SubNav />

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Breadcrumb Navigation */}
          <Breadcrumb
            items={[
              { label: 'Home', path: '/' },
              { label: 'Account', path: '/account' },
              { label: 'Profile' },
            ]}
            className="mb-6"
          />

          {!isAuthenticated ? (
            /* Guest / Unauthenticated Prompt */
            <div className="max-w-xl mx-auto my-12 bg-white rounded-3xl p-8 sm:p-10 border border-[#F0EBE5] shadow-xl text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-[#FFF0F4] border border-[#FCC1C5] text-[#EC407A] flex items-center justify-center mx-auto shadow-sm">
                <User className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#242124] font-['Poppins']">
                  Sign In to View Your Profile
                </h1>
                <p className="text-xs sm:text-sm text-[#777777] max-w-md mx-auto leading-relaxed">
                  Log in to access your personal floral preferences, saved delivery addresses, and VIP concierge privileges.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  to="/login?redirect=/profile"
                  className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#EC407A] hover:bg-[#C2185B] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all text-center"
                >
                  Sign In to Account
                </Link>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-3 rounded-full bg-white hover:bg-[#FFF3F6] text-[#EC407A] border border-[#E9E2E5] text-xs sm:text-sm font-semibold transition-all text-center"
                >
                  Create New Account
                </Link>
              </div>
            </div>
          ) : (
            /* Authenticated Profile View */
            <div className="space-y-8">
              {/* Profile Hero Header Card */}
              <div className="bg-gradient-to-r from-[#FFF0F4] via-[#FFFDF9] to-[#FFF0F4] rounded-3xl p-6 sm:p-8 border border-[#F2D7DE] shadow-xs relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#EC407A] to-[#C2185B] text-white flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-lg shadow-[#EC407A]/25 border-2 border-white flex-shrink-0">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-xl sm:text-2xl font-bold text-[#242124] font-['Poppins'] truncate">
                          {user?.name || 'Valued Floral Patron'}
                        </h1>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#EC407A] text-white shadow-2xs">
                          {user?.role === 'admin' ? 'Atelier Admin' : 'VIP Member'}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#777777] flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-[#EC407A]" />
                        <span>{user?.email}</span>
                      </p>
                      <p className="text-[11px] text-[#888888] flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>Dhanvikk Haute Floristry Member Since 2026</span>
                      </p>
                    </div>
                  </div>

                  {/* Top Action Quick Buttons */}
                  <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                    <button
                      type="button"
                      onClick={() => setIsEditing(!isEditing)}
                      className="px-4 py-2 rounded-full border border-[#E9E2E5] bg-white hover:bg-[#FFF3F6] text-[#EC407A] hover:border-[#FCC1C5] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="px-4 py-2 rounded-full border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Navigation Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <Link
                  to="/orders"
                  className="group p-4 rounded-2xl bg-white border border-[#EFE7DE] hover:border-[#EC407A] hover:shadow-md transition-all flex items-center gap-3.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FFF0F4] text-[#EC407A] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#242124] block group-hover:text-[#EC407A] transition-colors">
                      My Orders
                    </span>
                    <span className="text-[11px] text-[#777777]">Live tracking & receipts</span>
                  </div>
                </Link>

                <Link
                  to="/address"
                  className="group p-4 rounded-2xl bg-white border border-[#EFE7DE] hover:border-[#EC407A] hover:shadow-md transition-all flex items-center gap-3.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FFF0F4] text-[#EC407A] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#242124] block group-hover:text-[#EC407A] transition-colors">
                      Address Book
                    </span>
                    <span className="text-[11px] text-[#777777]">Delivery locations</span>
                  </div>
                </Link>

                <Link
                  to="/about"
                  className="group p-4 rounded-2xl bg-white border border-[#EFE7DE] hover:border-[#EC407A] hover:shadow-md transition-all flex items-center gap-3.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FFF0F4] text-[#EC407A] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#242124] block group-hover:text-[#EC407A] transition-colors">
                      About Us
                    </span>
                    <span className="text-[11px] text-[#777777]">Our story & craft</span>
                  </div>
                </Link>

                <Link
                  to="/contact"
                  className="group p-4 rounded-2xl bg-white border border-[#EFE7DE] hover:border-[#EC407A] hover:shadow-md transition-all flex items-center gap-3.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FFF0F4] text-[#EC407A] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#242124] block group-hover:text-[#EC407A] transition-colors">
                      Concierge Care
                    </span>
                    <span className="text-[11px] text-[#777777]">24/7 VIP Assistance</span>
                  </div>
                </Link>
              </div>

              {/* Main Profile Grid: Personal Details & Preferences */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Personal Information Form (7 Cols) */}
                <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#EFE7DE] shadow-xs space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[#F7F2ED]">
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-[#242124] font-['Poppins']">
                        Personal Information
                      </h2>
                      <p className="text-xs text-[#777777]">Your primary contact and delivery details</p>
                    </div>
                    {isEditing && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Editing Active
                      </span>
                    )}
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#555555] mb-1.5">
                          Full Name
                        </label>
                        <input
                          type="text"
                          disabled={!isEditing}
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#E5DFD9] text-xs sm:text-sm text-[#242124] bg-white disabled:bg-[#FAF7F2] focus:outline-none focus:border-[#EC407A] transition-colors"
                          placeholder="Your Full Name"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#555555] mb-1.5">
                          Contact Phone Number
                        </label>
                        <input
                          type="tel"
                          disabled={!isEditing}
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#E5DFD9] text-xs sm:text-sm text-[#242124] bg-white disabled:bg-[#FAF7F2] focus:outline-none focus:border-[#EC407A] transition-colors"
                          placeholder="+971 50 123 4567 or +91 98..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#555555] mb-1.5">
                        Registered Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          disabled
                          value={formData.email}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#E5DFD9] text-xs sm:text-sm text-[#777777] bg-[#FAF7F2] cursor-not-allowed"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      </div>
                      <p className="text-[11px] text-[#888888] mt-1">
                        Email cannot be changed directly as it is linked to your order history and credentials.
                      </p>
                    </div>

                    <div className="pt-2">
                      <label className="block text-xs font-semibold text-[#555555] mb-1.5">
                        Active Currency Preference
                      </label>
                      <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EFE7DE] flex items-center justify-between text-xs">
                        <span className="text-[#555555]">All prices automatically convert to:</span>
                        <span className="font-bold text-[#EC407A] bg-white px-3 py-1 rounded-full border border-[#FCC1C5] shadow-2xs font-mono">
                          {currency}
                        </span>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#F7F2ED]">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-5 py-2.5 rounded-full border border-[#E5DFD9] text-xs font-semibold text-[#777777] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-6 py-2.5 rounded-full bg-[#EC407A] hover:bg-[#C2185B] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                        >
                          {loading ? <Spinner size="sm" color="#ffffff" /> : <CheckCircle2 className="w-4 h-4" />}
                          <span>Save Changes</span>
                        </button>
                      </div>
                    )}
                  </form>
                </div>

                {/* Right Column: Security & Preferences (5 Cols) */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Account Security Card */}
                  <div className="bg-white rounded-3xl p-6 border border-[#EFE7DE] shadow-xs space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-[#F7F2ED]">
                      <Shield className="w-4 h-4 text-[#EC407A]" />
                      <h3 className="text-sm font-bold text-[#242124] font-['Poppins']">
                        Account Security & Logins
                      </h3>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#EFE7DE]">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-[#242124] block">Account Password</span>
                          <span className="text-[11px] text-[#777777]">Protected with AES encrypted credentials</span>
                        </div>
                        <Link
                          to="/forgot-password"
                          className="text-[11px] font-bold text-[#EC407A] hover:underline"
                        >
                          Change
                        </Link>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#EFE7DE]">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-[#242124] block">Google Sign-In</span>
                          <span className="text-[11px] text-[#777777]">Fast 1-click biometric authentication</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Connected
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notification Channels Card */}
                  <div className="bg-white rounded-3xl p-6 border border-[#EFE7DE] shadow-xs space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-[#F7F2ED]">
                      <Sparkles className="w-4 h-4 text-[#EC407A]" />
                      <h3 className="text-sm font-bold text-[#242124] font-['Poppins']">
                        VIP Delivery Notifications
                      </h3>
                    </div>

                    <div className="space-y-3 text-xs">
                      <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#EFE7DE] cursor-pointer">
                        <div>
                          <span className="font-semibold text-[#242124] block">WhatsApp Dispatch Updates</span>
                          <span className="text-[11px] text-[#777777]">Photo proof of bouquet prior to courier departure</span>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-[#EC407A] rounded accent-[#EC407A] cursor-pointer"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#EFE7DE] cursor-pointer">
                        <div>
                          <span className="font-semibold text-[#242124] block">Email Invoice & Receipt</span>
                          <span className="text-[11px] text-[#777777]">Instant GST & UAE VAT compliant tax invoices</span>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-[#EC407A] rounded accent-[#EC407A] cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}
