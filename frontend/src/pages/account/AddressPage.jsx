import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import Navbar from '../../components/navigation/Navbar';
import AnnouncementBar from '../../components/navigation/AnnouncementBar';
import SubNav from '../../components/navigation/SubNav';
import Footer from '../../components/navigation/Footer';
import CartDrawer from '../../components/cart/CartDrawer';
import Breadcrumb from '../../components/common/Breadcrumb';
import Spinner from '../../components/common/Spinner';
import { authService } from '../../services/authService';
import {
  COUNTRIES_LIST,
  getCountryData,
  getStatesForCountry,
  getDistrictsAndCityForState,
} from '../../data/countriesData';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Star,
  Home,
  Building,
  Sparkles,
  Phone,
  User,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';

export default function AddressPage() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'

  const [form, setForm] = useState({
    id: '',
    title: 'Home Residence',
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

  const modalCountryData = getCountryData(form.country);
  const modalAvailableStates = getStatesForCountry(form.country);
  const modalDistrictsData = getDistrictsAndCityForState(form.state);
  const modalAvailableDistricts = modalDistrictsData?.districts || [];

  // Default address presets if none in store
  const DEFAULT_SAMPLE_ADDRESSES = [
    {
      id: 'addr-default-1',
      title: 'Dubai Luxury Residence',
      recipientName: user?.name || 'Amina Al-Mansoor',
      phone: user?.phone || '+971 50 123 4567',
      street: 'Villa 18, Al Safa 2, Jumeirah',
      district: 'Jumeirah',
      city: 'Dubai',
      state: 'Dubai',
      country: 'United Arab Emirates',
      postalCode: '00000',
      isDefault: true,
    },
    {
      id: 'addr-default-2',
      title: 'Bengaluru Residence',
      recipientName: user?.name || 'Amina Al-Mansoor',
      phone: user?.phone || '+91 98450 12345',
      street: 'Penthouse 402, Prestige Hermitage, 100 Feet Rd',
      district: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      postalCode: '560038',
      isDefault: false,
    },
  ];

  useEffect(() => {
    loadAddresses();
  }, [user]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const email = user?.email;
      if (email) {
        const res = await authService.getProfileData(email);
        if (res?.success && Array.isArray(res.savedAddresses) && res.savedAddresses.length > 0) {
          setAddresses(res.savedAddresses);
          return;
        }
      }
      // Check localStorage
      const local = localStorage.getItem('dhanvikk_saved_addresses');
      if (local) {
        setAddresses(JSON.parse(local));
      } else {
        setAddresses(DEFAULT_SAMPLE_ADDRESSES);
        localStorage.setItem('dhanvikk_saved_addresses', JSON.stringify(DEFAULT_SAMPLE_ADDRESSES));
      }
    } catch {
      const local = localStorage.getItem('dhanvikk_saved_addresses');
      setAddresses(local ? JSON.parse(local) : DEFAULT_SAMPLE_ADDRESSES);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    const defaultCountry = 'United Arab Emirates';
    const states = getStatesForCountry(defaultCountry);
    const firstState = states[0] || 'Dubai';
    const distData = getDistrictsAndCityForState(firstState);

    setForm({
      id: `addr_${Date.now()}`,
      title: 'Home Residence',
      recipientName: user?.name || '',
      phone: user?.phone || '',
      street: '',
      state: firstState,
      city: distData.city || firstState,
      district: distData.districts[0] || '',
      postalCode: '',
      country: defaultCountry,
      isDefault: addresses.length === 0,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (addr) => {
    setModalMode('edit');
    setForm({ ...addr });
    setShowModal(true);
  };

  const handleCountryChange = (newCountry) => {
    const states = getStatesForCountry(newCountry);
    const firstState = states[0] || '';
    const distData = getDistrictsAndCityForState(firstState);
    setForm({
      ...form,
      country: newCountry,
      state: firstState,
      city: distData.city || firstState,
      district: distData.districts[0] || '',
    });
  };

  const handleStateChange = (newState) => {
    const distData = getDistrictsAndCityForState(newState);
    setForm({
      ...form,
      state: newState,
      city: distData.city || newState,
      district: distData.districts[0] || '',
    });
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!form.recipientName.trim()) {
      toast.error('Recipient name is required');
      return;
    }
    if (!form.street.trim()) {
      toast.error('Street address is required');
      return;
    }

    let updatedList;
    if (modalMode === 'create') {
      const newAddr = {
        ...form,
        id: form.id || `addr_${Date.now()}`,
      };
      if (newAddr.isDefault) {
        updatedList = addresses.map((a) => ({ ...a, isDefault: false }));
        updatedList.push(newAddr);
      } else {
        updatedList = [...addresses, newAddr];
      }
      toast.success('New delivery address added');
    } else {
      updatedList = addresses.map((a) => {
        if (a.id === form.id) {
          return { ...form };
        }
        return form.isDefault ? { ...a, isDefault: false } : a;
      });
      toast.success('Address updated successfully');
    }

    setAddresses(updatedList);
    localStorage.setItem('dhanvikk_saved_addresses', JSON.stringify(updatedList));

    // Also persist via API if available
    try {
      await authService.saveAddress(form);
    } catch {}

    setShowModal(false);
  };

  const handleDeleteAddress = (id) => {
    const remaining = addresses.filter((a) => a.id !== id);
    if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
      remaining[0].isDefault = true;
    }
    setAddresses(remaining);
    localStorage.setItem('dhanvikk_saved_addresses', JSON.stringify(remaining));
    toast.success('Address removed from address book');

    try {
      authService.deleteAddress(id).catch(() => {});
    } catch {}
  };

  const handleSetDefault = (id) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    setAddresses(updated);
    localStorage.setItem('dhanvikk_saved_addresses', JSON.stringify(updated));
    toast.success('Default delivery address updated');
  };

  return (
    <>
      <SEO
        title="Delivery Address Book | Dhanvikk Blooms Luxury Florist"
        description="Manage your saved doorstep delivery destinations across Dubai, UAE, India and global destinations for seamless checkout."
        canonical="/address"
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
              { label: 'Address Book' },
            ]}
            className="mb-6"
          />

          {/* Hero Header Card */}
          <div className="bg-gradient-to-r from-[#FFF0F4] via-[#FFFDF9] to-[#FFF0F4] rounded-3xl p-6 sm:p-8 border border-[#F2D7DE] shadow-xs mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-5 h-5 text-[#EC407A]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C2185B]">
                    Doorstep Logistics Destinations
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#242124] font-['Poppins']">
                  Saved Delivery Addresses
                </h1>
                <p className="text-xs sm:text-sm text-[#777777] mt-1 max-w-xl">
                  Store residence, office, and celebratory venue addresses for instant refrigerated dispatch selection during checkout.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#EC407A] hover:bg-[#C2185B] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Address</span>
              </button>
            </div>
          </div>

          {/* Address Cards Grid */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Spinner size="lg" color="#EC407A" />
              <span className="text-xs uppercase tracking-widest text-[#777777]">
                Loading your delivery address book...
              </span>
            </div>
          ) : addresses.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#EFE7DE] shadow-xs space-y-4 max-w-lg mx-auto my-8">
              <div className="w-16 h-16 rounded-full bg-[#FFF0F4] text-[#EC407A] flex items-center justify-center mx-auto">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#242124] font-['Poppins']">
                No Addresses Saved Yet
              </h3>
              <p className="text-xs text-[#777777] leading-relaxed max-w-sm mx-auto">
                Add your home or office address to enable 1-click doorstep dispatches for luxury floral curations.
              </p>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#EC407A] hover:bg-[#C2185B] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Address</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {addresses.map((addr) => {
                const countryData = getCountryData(addr.country);

                return (
                  <div
                    key={addr.id}
                    className={`rounded-3xl p-6 transition-all border flex flex-col justify-between relative bg-white ${
                      addr.isDefault
                        ? 'border-[#EC407A] shadow-md ring-1 ring-[#EC407A]/20'
                        : 'border-[#EFE7DE] shadow-xs hover:border-[#FCC1C5] hover:shadow-md'
                    }`}
                  >
                    <div>
                      {/* Top Title & Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-xl bg-[#FFF0F4] text-[#EC407A] flex items-center justify-center">
                            {addr.title?.toLowerCase().includes('office') ? (
                              <Building className="w-4 h-4" />
                            ) : (
                              <Home className="w-4 h-4" />
                            )}
                          </span>
                          <h3 className="font-bold text-sm text-[#242124] truncate">
                            {addr.title || 'Delivery Address'}
                          </h3>
                        </div>

                        {addr.isDefault && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#EC407A] text-white shadow-2xs">
                            <Star className="w-3 h-3 fill-current" /> Default
                          </span>
                        )}
                      </div>

                      {/* Recipient Details */}
                      <div className="space-y-1.5 text-xs text-[#555555] pt-1">
                        <p className="font-bold text-[#242124] flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#EC407A]" />
                          <span>{addr.recipientName}</span>
                        </p>

                        <p className="flex items-center gap-1.5 text-[#777777]">
                          <Phone className="w-3.5 h-3.5 text-[#EC407A]" />
                          <span>{addr.phone}</span>
                        </p>

                        <div className="pt-2 border-t border-[#F7F2ED] space-y-0.5">
                          <p className="text-[#242124] font-medium leading-relaxed">
                            {addr.street}
                          </p>
                          <p className="text-[#777777]">
                            {[addr.district, addr.city, addr.state].filter(Boolean).join(', ')}
                          </p>
                          <p className="text-[#777777] flex items-center gap-1.5 pt-0.5">
                            <span>{countryData?.flag || '🌐'}</span>
                            <span className="font-semibold text-[#242124]">{addr.country}</span>
                            {addr.postalCode && <span>• {addr.postalCode}</span>}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Bottom Strip */}
                    <div className="pt-4 mt-4 border-t border-[#F7F2ED] flex items-center justify-between gap-2">
                      {!addr.isDefault ? (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(addr.id)}
                          className="text-[11px] font-bold text-[#EC407A] hover:underline cursor-pointer"
                        >
                          Set as Default
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Primary Delivery Location
                        </span>
                      )}

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(addr)}
                          className="p-2 rounded-xl bg-[#FAF7F2] hover:bg-[#FFF0F4] text-[#EC407A] transition-colors cursor-pointer"
                          title="Edit Address"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="p-2 rounded-xl bg-[#FAF7F2] hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                          title="Delete Address"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Add / Edit Address Modal */}
        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
            onClick={() => setShowModal(false)}
          >
            <div
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#EFE7DE] shadow-2xl space-y-5 overflow-y-auto max-h-[92vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#F7F2ED]">
                <div>
                  <h3 className="text-lg font-bold text-[#242124] font-['Poppins']">
                    {modalMode === 'create' ? 'Add Delivery Destination' : 'Edit Delivery Address'}
                  </h3>
                  <p className="text-xs text-[#777777]">Accurate details ensure seamless cold-chain courier delivery</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#EC407A] hover:bg-[#FFF0F4] flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveAddress} className="space-y-4">
                {/* Title Preset / Custom */}
                <div>
                  <label className="block text-xs font-semibold text-[#555555] mb-1">
                    Address Label
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Home, Downtown Atelier, Office"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#DCD5CD] text-[#242124] focus:outline-none focus:border-[#EC407A]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#555555] mb-1">
                      Recipient Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.recipientName}
                      onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                      placeholder="e.g. Fatima Al-Mansoor"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#DCD5CD] text-[#242124] focus:outline-none focus:border-[#EC407A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#555555] mb-1">
                      Recipient Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+971 50 123 4567"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#DCD5CD] text-[#242124] focus:outline-none focus:border-[#EC407A]"
                    />
                  </div>
                </div>

                {/* Country Selection */}
                <div>
                  <label className="block text-xs font-semibold text-[#555555] mb-1">
                    Country
                  </label>
                  <select
                    value={form.country}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#DCD5CD] text-[#242124] bg-white focus:outline-none focus:border-[#EC407A]"
                  >
                    {COUNTRIES_LIST.map((c) => (
                      <option key={c.code} value={c.name}>
                        {c.flag} {c.name} ({c.currency})
                      </option>
                    ))}
                  </select>
                </div>

                {/* State / Emirate Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#555555] mb-1">
                      State / Emirate
                    </label>
                    <select
                      value={form.state}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#DCD5CD] text-[#242124] bg-white focus:outline-none focus:border-[#EC407A]"
                    >
                      {modalAvailableStates.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#555555] mb-1">
                      District / Area
                    </label>
                    {modalAvailableDistricts.length > 0 ? (
                      <select
                        value={form.district}
                        onChange={(e) => setForm({ ...form, district: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#DCD5CD] text-[#242124] bg-white focus:outline-none focus:border-[#EC407A]"
                      >
                        {modalAvailableDistricts.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={form.district}
                        onChange={(e) => setForm({ ...form, district: e.target.value })}
                        placeholder="District / Area"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#DCD5CD] text-[#242124] focus:outline-none focus:border-[#EC407A]"
                      />
                    )}
                  </div>
                </div>

                {/* Street Address */}
                <div>
                  <label className="block text-xs font-semibold text-[#555555] mb-1">
                    Street Address & Villa / Apartment # *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={form.street}
                    onChange={(e) => setForm({ ...form, street: e.target.value })}
                    placeholder="e.g. Villa 14, Al Safa 2, Jumeirah, Near Sunset Mall"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#DCD5CD] text-[#242124] focus:outline-none focus:border-[#EC407A] resize-none"
                  />
                </div>

                {/* Postal Code & Default Checkbox */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="w-full sm:w-44">
                    <label className="block text-xs font-semibold text-[#555555] mb-1">
                      Postal Code / PIN
                    </label>
                    <input
                      type="text"
                      value={form.postalCode}
                      onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                      placeholder="e.g. 00000 or 560038"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#DCD5CD] text-[#242124] focus:outline-none focus:border-[#EC407A]"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#242124] pt-2 sm:pt-4">
                    <input
                      type="checkbox"
                      checked={form.isDefault}
                      onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                      className="w-4 h-4 text-[#EC407A] rounded accent-[#EC407A] cursor-pointer"
                    />
                    <span>Set as primary default address</span>
                  </label>
                </div>

                {/* Form Buttons */}
                <div className="pt-4 border-t border-[#F7F2ED] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-full border border-[#DCD5CD] text-xs font-semibold text-[#777777] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-[#EC407A] hover:bg-[#C2185B] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    {modalMode === 'create' ? 'Save Address' : 'Update Address'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
}
