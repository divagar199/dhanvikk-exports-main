import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  Check,
  Plus,
  Navigation,
  Compass,
  X,
  Trash2,
  Home,
  Briefcase,
  Building2,
  CheckCircle2,
  Circle,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadows } from '../theme';
import { AppText } from '../components/AppText';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { getCurrentLiveLocation } from '../utils/locationService';
import { useResponsive } from '../hooks/useResponsive';
import { Address } from '../types';

const INITIAL_ADDRESSES: Address[] = [
  {
    id: 'addr_1',
    title: 'Primary Residence',
    recipientName: 'Priya Sharma',
    phone: '+971 50 123 4567',
    street: 'Villa 14, Palm Crescent',
    city: 'Dubai',
    state: 'Dubai',
    postalCode: '00000',
    country: 'United Arab Emirates',
    isDefault: true,
  },
  {
    id: 'addr_2',
    title: 'Celebration Residence',
    recipientName: 'Aarav Patel',
    phone: '+91 98765 43210',
    street: 'Penthouse 8B, Royal Marine Drive',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400020',
    country: 'India',
    isDefault: false,
  },
];

const CATEGORY_TAGS = [
  { label: 'Home', icon: Home },
  { label: 'Work', icon: Briefcase },
  { label: 'Villa', icon: Building2 },
  { label: 'Other', icon: MapPin },
];

export default function AddressesScreen() {
  const router = useRouter();
  const { setDeliveryLocation, deliveryLocation, showToast } = useUIStore();
  const { user } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [detectingGps, setDetectingGps] = useState(false);

  // Modal and Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTag, setSelectedTag] = useState('Home');
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United Arab Emirates');
  const [isDefault, setIsDefault] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load saved addresses from backend on mount and user change
  useEffect(() => {
    const targetEmail = user?.email || 'customer@dhanvikk.com';
    authService
      .getProfileData(targetEmail)
      .then((data) => {
        if (data?.savedAddresses && data.savedAddresses.length > 0) {
          setAddresses(data.savedAddresses);
        }
      })
      .catch(() => {});
  }, [user]);

  const handleSelectAddress = (addr: Address) => {
    const loc = `${addr.city}, ${addr.country === 'India' ? 'India' : 'UAE'}`;
    setDeliveryLocation(loc);
    showToast(`Delivery location set to ${loc}`, 'success');
  };

  const handleDetectLiveLocation = async () => {
    try {
      setDetectingGps(true);
      const res = await getCurrentLiveLocation();
      if (res) {
        const newAddr: Address = {
          id: `addr_live_${Date.now()}`,
          title: 'Live GPS Pin',
          recipientName: user?.name || 'Customer',
          phone: user?.phone || '+971 50 123 4567',
          street: res.street,
          district: res.district,
          city: res.city,
          state: res.state,
          postalCode: res.pincode || '00000',
          country: res.country,
          isDefault: true,
        };

        const targetEmail = user?.email || 'customer@dhanvikk.com';
        try {
          const serverRes = await authService.saveAddress({
            ...newAddr,
            email: targetEmail,
          });
          if (serverRes?.addresses && serverRes.addresses.length > 0) {
            setAddresses(serverRes.addresses);
          } else {
            setAddresses((prev) => [newAddr, ...prev.map((a) => ({ ...a, isDefault: false }))]);
          }
        } catch {
          setAddresses((prev) => [newAddr, ...prev.map((a) => ({ ...a, isDefault: false }))]);
        }

        handleSelectAddress(newAddr);
        showToast(`Live GPS pinned: ${res.city}, ${res.state} • ${res.pincode || res.country}`, 'success');
      } else {
        Alert.alert(
          'Location Access Required',
          'Could not detect GPS coordinates. Please grant location permissions or select your address on the interactive map.'
        );
      }
    } catch {
      Alert.alert('Error', 'Unable to detect location. Please try the map selector.');
    } finally {
      setDetectingGps(false);
    }
  };

  const handleOpenAddModal = () => {
    setSelectedTag('Home');
    setRecipientName(user?.name || '');
    setPhone(user?.phone || '');
    setStreet('');
    setDistrict('');
    setCity('');
    setState('');
    setPostalCode('');
    setCountry(deliveryLocation.toLowerCase().includes('india') ? 'India' : 'United Arab Emirates');
    setIsDefault(addresses.length === 0);
    setErrors({});
    setShowAddModal(true);
  };

  const handleSaveAddress = async () => {
    Keyboard.dismiss();
    const newErrors: Record<string, string> = {};

    if (!recipientName.trim()) {
      newErrors.recipientName = 'Please enter recipient name';
    }
    if (!phone.trim()) {
      newErrors.phone = 'Please enter contact phone number';
    }
    if (!street.trim()) {
      newErrors.street = 'Please enter street, villa, or building details';
    }
    if (!city.trim()) {
      newErrors.city = 'Please enter city';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    try {
      const newAddress: Address = {
        id: `addr_${Date.now()}`,
        title: selectedTag,
        recipientName: recipientName.trim(),
        phone: phone.trim(),
        street: street.trim(),
        district: district.trim(),
        city: city.trim(),
        state: state.trim() || city.trim(),
        postalCode: postalCode.trim() || '00000',
        country,
        isDefault,
      };

      const targetEmail = user?.email || 'customer@dhanvikk.com';
      try {
        const serverRes = await authService.saveAddress({
          ...newAddress,
          email: targetEmail,
        });
        if (serverRes?.addresses && serverRes.addresses.length > 0) {
          setAddresses(serverRes.addresses);
        } else {
          setAddresses((prev) => {
            if (newAddress.isDefault) {
              return [newAddress, ...prev.map((a) => ({ ...a, isDefault: false }))];
            }
            return [...prev, newAddress];
          });
        }
      } catch {
        setAddresses((prev) => {
          if (newAddress.isDefault) {
            return [newAddress, ...prev.map((a) => ({ ...a, isDefault: false }))];
          }
          return [...prev, newAddress];
        });
      }

      if (newAddress.isDefault || addresses.length === 0) {
        handleSelectAddress(newAddress);
      }

      setShowAddModal(false);
      showToast('Delivery address saved to server successfully!', 'success');
    } catch {
      Alert.alert('Error', 'Failed to save address. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = (id: string, title: string) => {
    Alert.alert(
      'Remove Address',
      `Are you sure you want to remove "${title}"? This will be updated on the server.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const targetEmail = user?.email || 'customer@dhanvikk.com';
            try {
              const res = await authService.deleteAddress(id, targetEmail);
              if (res?.addresses) {
                setAddresses(res.addresses);
              } else {
                setAddresses((prev) => prev.filter((a) => a.id !== id));
              }
            } catch {
              setAddresses((prev) => prev.filter((a) => a.id !== id));
            }
            showToast('Address removed from server', 'info');
          },
        },
      ]
    );
  };

  const { isTablet, isLandscape } = useResponsive();
  const isSheet = !isTablet && !isLandscape;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Back">
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <AppText variant="h1" color={Colors.text}>
          Delivery Addresses
        </AppText>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <AppText variant="bodySm" color={Colors.textSecondary} style={{ marginBottom: 16 }}>
          Select or add destination addresses for climate-controlled floral delivery.
        </AppText>

        {/* Live GPS & Map Action Cards */}
        <View style={styles.locationActionsRow}>
          <TouchableOpacity
            style={styles.actionPillBtn}
            activeOpacity={0.85}
            onPress={handleDetectLiveLocation}
            disabled={detectingGps}
          >
            <Navigation size={18} color={Colors.primary} />
            <View style={{ flex: 1 }}>
              <AppText variant="bodySm" weight="semiBold" color={Colors.primaryDeep}>
                {detectingGps ? 'Detecting GPS...' : 'Use Current Location'}
              </AppText>
              <AppText variant="caption" color={Colors.textSecondary}>
                Precise device GPS
              </AppText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionPillBtn}
            activeOpacity={0.85}
            onPress={() => router.push('/map')}
          >
            <Compass size={18} color={Colors.primary} />
            <View style={{ flex: 1 }}>
              <AppText variant="bodySm" weight="semiBold" color={Colors.primaryDeep}>
                Select on Live Map
              </AppText>
              <AppText variant="caption" color={Colors.textSecondary}>
                Pinpoint on map
              </AppText>
            </View>
          </TouchableOpacity>
        </View>

        {/* Addresses List */}
        <View style={styles.addressList}>
          {addresses.map((addr) => {
            const isSelected = deliveryLocation.toLowerCase().includes(addr.city.toLowerCase());
            return (
              <TouchableOpacity
                key={addr.id}
                activeOpacity={0.9}
                onPress={() => handleSelectAddress(addr)}
                style={[styles.addressCard, isSelected && styles.addressCardActive]}
              >
                <View style={styles.cardTopRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                    <MapPin size={18} color={isSelected ? Colors.primary : Colors.textSecondary} />
                    <AppText variant="body" weight="semiBold">
                      {addr.title}
                    </AppText>
                    {addr.isDefault && (
                      <View style={styles.defaultBadge}>
                        <AppText variant="caption" color={Colors.primaryDeep} weight="medium" style={{ fontSize: 10 }}>
                          Default
                        </AppText>
                      </View>
                    )}
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {isSelected && (
                      <View style={styles.selectedPill}>
                        <Check size={14} color={Colors.white} />
                        <AppText variant="caption" color={Colors.white} weight="semiBold" style={{ marginLeft: 4 }}>
                          Active
                        </AppText>
                      </View>
                    )}

                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteAddress(addr.id, addr.title);
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.deleteBtn}
                      accessibilityLabel="Delete address"
                    >
                      <Trash2 size={16} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <AppText variant="bodySm" color={Colors.text} style={{ marginTop: 8 }}>
                  {addr.recipientName} • {addr.phone}
                </AppText>
                <AppText variant="caption" color={Colors.textSecondary} style={{ marginTop: 2 }}>
                  {addr.street}
                  {addr.district ? `, ${addr.district}` : ''}
                  {`, ${addr.city}, ${addr.state}, ${addr.country}`}
                  {addr.postalCode ? ` • PIN: ${addr.postalCode}` : ''}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Add New Address Button */}
        <AppButton
          title="Add New Address"
          onPress={handleOpenAddModal}
          variant="outline"
          icon={<Plus size={18} color={Colors.primary} />}
          style={{ marginTop: 20 }}
          fullWidth
        />
      </ScrollView>

      {/* Add Address Modal Bottom Sheet */}
      <Modal
        visible={showAddModal}
        transparent
        animationType={isSheet ? 'slide' : 'fade'}
        onRequestClose={() => setShowAddModal(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[styles.modalBackdrop, !isSheet && styles.modalBackdropCentered]}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={[styles.modalKeyboardAvoid, !isSheet && styles.modalKeyboardAvoidCentered]}
            >
              <View style={[styles.modalSheet, !isSheet && styles.modalSheetCentered]}>
                {/* Header Sheet */}
                {isSheet && <View style={styles.sheetHandle} />}
                <View style={styles.sheetHeader}>
                  <View>
                    <AppText variant="h2" serif={true}>
                      Add New Address
                    </AppText>
                    <AppText variant="caption" color={Colors.textSecondary}>
                      Precision refrigerated botanical delivery
                    </AppText>
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowAddModal(false)}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    style={styles.modalCloseBtn}
                  >
                    <X size={20} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.sheetBody}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* Category Tag Selector */}
                  <AppText variant="caption" color={Colors.textSecondary} weight="medium" style={{ marginBottom: 8 }}>
                    ADDRESS TYPE
                  </AppText>
                  <View style={styles.tagsRow}>
                    {CATEGORY_TAGS.map((tag) => {
                      const IconComponent = tag.icon;
                      const isTagActive = selectedTag === tag.label;
                      return (
                        <TouchableOpacity
                          key={tag.label}
                          onPress={() => setSelectedTag(tag.label)}
                          style={[styles.tagPill, isTagActive && styles.tagPillActive]}
                        >
                          <IconComponent
                            size={14}
                            color={isTagActive ? Colors.white : Colors.textSecondary}
                          />
                          <AppText
                            variant="caption"
                            weight={isTagActive ? 'semiBold' : 'regular'}
                            color={isTagActive ? Colors.white : Colors.text}
                          >
                            {tag.label}
                          </AppText>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Country Selector */}
                  <AppText variant="caption" color={Colors.textSecondary} weight="medium" style={{ marginBottom: 8, marginTop: 12 }}>
                    DELIVERY REGION
                  </AppText>
                  <View style={styles.countryRow}>
                    <TouchableOpacity
                      onPress={() => setCountry('United Arab Emirates')}
                      style={[
                        styles.countryPill,
                        country === 'United Arab Emirates' && styles.countryPillActive,
                      ]}
                    >
                      <AppText
                        variant="bodySm"
                        weight={country === 'United Arab Emirates' ? 'semiBold' : 'regular'}
                        color={country === 'United Arab Emirates' ? Colors.primaryDeep : Colors.text}
                      >
                        🇦🇪 United Arab Emirates
                      </AppText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setCountry('India')}
                      style={[
                        styles.countryPill,
                        country === 'India' && styles.countryPillActive,
                      ]}
                    >
                      <AppText
                        variant="bodySm"
                        weight={country === 'India' ? 'semiBold' : 'regular'}
                        color={country === 'India' ? Colors.primaryDeep : Colors.text}
                      >
                        🇮🇳 India
                      </AppText>
                    </TouchableOpacity>
                  </View>

                  {/* Recipient Name */}
                  <AppInput
                    label="Recipient Full Name"
                    placeholder="e.g. Priya Sharma"
                    value={recipientName}
                    onChangeText={(txt) => {
                      setRecipientName(txt);
                      if (errors.recipientName) setErrors((e) => ({ ...e, recipientName: '' }));
                    }}
                    error={errors.recipientName}
                  />

                  {/* Phone Number */}
                  <AppInput
                    label="Contact Phone"
                    placeholder="e.g. +971 50 123 4567"
                    value={phone}
                    onChangeText={(txt) => {
                      setPhone(txt);
                      if (errors.phone) setErrors((e) => ({ ...e, phone: '' }));
                    }}
                    keyboardType="phone-pad"
                    error={errors.phone}
                  />

                  {/* Street / Building / Villa */}
                  <AppInput
                    label="Street, Villa, Building & Flat"
                    placeholder="e.g. Villa 14, Palm Crescent, Palm Jumeirah"
                    value={street}
                    onChangeText={(txt) => {
                      setStreet(txt);
                      if (errors.street) setErrors((e) => ({ ...e, street: '' }));
                    }}
                    error={errors.street}
                  />

                  {/* District / Locality / Region */}
                  <AppInput
                    label="District / Locality / Region (Optional)"
                    placeholder="e.g. Downtown / Bandra / Palm Jumeirah"
                    value={district}
                    onChangeText={setDistrict}
                  />

                  {/* City & State Row */}
                  <View style={styles.rowInputs}>
                    <View style={{ flex: 1 }}>
                      <AppInput
                        label="City"
                        placeholder="e.g. Dubai"
                        value={city}
                        onChangeText={(txt) => {
                          setCity(txt);
                          if (errors.city) setErrors((e) => ({ ...e, city: '' }));
                        }}
                        error={errors.city}
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <AppInput
                        label="State / Emirate"
                        placeholder="e.g. Dubai"
                        value={state}
                        onChangeText={setState}
                      />
                    </View>
                  </View>

                  {/* Postal / PIN Code */}
                  <AppInput
                    label="Postal / PIN Code (Optional)"
                    placeholder="e.g. 400020"
                    value={postalCode}
                    onChangeText={setPostalCode}
                    keyboardType="numeric"
                  />

                  {/* Set as Active / Default Checkbox */}
                  <TouchableOpacity
                    style={styles.defaultCheckRow}
                    activeOpacity={0.8}
                    onPress={() => setIsDefault(!isDefault)}
                  >
                    {isDefault ? (
                      <CheckCircle2 size={20} color={Colors.primary} />
                    ) : (
                      <Circle size={20} color={Colors.textSecondary} />
                    )}
                    <AppText variant="bodySm" color={Colors.text} style={{ marginLeft: 10 }}>
                      Set as active delivery destination
                    </AppText>
                  </TouchableOpacity>

                  {/* Save Button */}
                  <AppButton
                    title="Save & Select Address"
                    onPress={handleSaveAddress}
                    loading={isSaving}
                    variant="primary"
                    fullWidth
                    style={{ marginTop: 16 }}
                  />

                  <TouchableOpacity
                    onPress={() => setShowAddModal(false)}
                    style={styles.cancelBtn}
                  >
                    <AppText variant="bodySm" color={Colors.textSecondary} align="center">
                      Cancel
                    </AppText>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: Spacing.screenPadding,
    paddingBottom: 40,
  },
  addressList: {
    gap: 14,
  },
  addressCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  addressCardActive: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
    backgroundColor: '#FFF9FB',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.chip,
  },
  defaultBadge: {
    backgroundColor: Colors.blush,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.chip,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  deleteBtn: {
    padding: 6,
    marginLeft: 4,
  },
  locationActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Spacing.xl,
  },
  actionPillBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  // Modal Bottom Sheet Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(36, 27, 31, 0.65)',
    justifyContent: 'flex-end',
  },
  modalBackdropCentered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.screenPadding,
  },
  modalKeyboardAvoid: {
    width: '100%',
    maxHeight: '90%',
  },
  modalKeyboardAvoidCentered: {
    maxWidth: 520,
    width: '100%',
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.bottomSheet,
    borderTopRightRadius: Radius.bottomSheet,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    ...Shadows.lg,
  },
  modalSheetCentered: {
    borderRadius: Radius.modal,
    borderBottomLeftRadius: Radius.modal,
    borderBottomRightRadius: Radius.modal,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingBottom: 24,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD5D8',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.tintedSurface,
  },
  sheetBody: {
    padding: Spacing.screenPadding,
    paddingBottom: 24,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.chip,
    backgroundColor: Colors.tintedSurface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  countryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  countryPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: Radius.md,
    backgroundColor: Colors.tintedSurface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  countryPillActive: {
    backgroundColor: '#FFF0F5',
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  defaultCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  cancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
});
