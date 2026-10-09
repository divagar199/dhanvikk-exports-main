import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import {
  ArrowLeft,
  MapPin,
  Navigation,
  Building2,
  Crosshair,
  ShieldCheck,
  Search,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Compass,
  Home,
  Briefcase,
  CheckCircle2,
  Map as MapIcon,
  Sparkles,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadows } from '../theme';
import { AppText } from '../components/AppText';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import {
  getCurrentLiveLocation,
  reverseGeocodeCoordinates,
  searchLocationAddress,
  GeocodedAddress,
} from '../utils/locationService';

// Prestigious botanical hubs in UAE & India
const PRESET_HUBS = [
  { name: 'Downtown Dubai', city: 'Dubai', country: 'United Arab Emirates', lat: 25.1972, lng: 55.2744 },
  { name: 'Palm Jumeirah', city: 'Dubai', country: 'United Arab Emirates', lat: 25.1124, lng: 55.1390 },
  { name: 'Dubai Marina', city: 'Dubai', country: 'United Arab Emirates', lat: 25.0805, lng: 55.1403 },
  { name: 'Marine Drive', city: 'Mumbai', country: 'India', lat: 18.9438, lng: 72.8232 },
  { name: 'Bandra West', city: 'Mumbai', country: 'India', lat: 19.0596, lng: 72.8295 },
  { name: 'Poes Garden', city: 'Chennai', country: 'India', lat: 13.0451, lng: 80.2529 },
  { name: 'Connaught Place', city: 'New Delhi', country: 'India', lat: 28.6304, lng: 77.2177 },
];

const ADDRESS_TAGS = [
  { label: 'Home', icon: Home },
  { label: 'Work', icon: Briefcase },
  { label: 'Villa', icon: Building2 },
  { label: 'Other', icon: MapPin },
];

export default function MapScreen() {
  const router = useRouter();
  const { setDeliveryLocation, showToast } = useUIStore();
  const { user } = useAuthStore();

  const [loadingLocation, setLoadingLocation] = useState(false);
  const [searching, setSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(15);
  const [selectedTag, setSelectedTag] = useState('Home');
  const [apartmentDetails, setApartmentDetails] = useState('');
  const [recipientName, setRecipientName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [selectedHub, setSelectedHub] = useState<typeof PRESET_HUBS[0] | null>(PRESET_HUBS[0]);

  const [currentAddress, setCurrentAddress] = useState<GeocodedAddress>({
    street: 'Sheikh Mohammed bin Rashid Blvd',
    district: 'Downtown Dubai',
    city: 'Dubai',
    state: 'Dubai',
    country: 'United Arab Emirates',
    pincode: '00000',
    formattedAddress: 'Sheikh Mohammed bin Rashid Blvd, Downtown Dubai, Dubai, United Arab Emirates',
    latitude: 25.1972,
    longitude: 55.2744,
  });

  // Calculate real-world static map imagery URL
  const mapImageUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${currentAddress.latitude},${currentAddress.longitude}&zoom=${zoomLevel}&size=800x480&maptype=mapnik`;

  const analyzeAndUpdateLocation = useCallback(async (lat: number, lng: number) => {
    setLoadingLocation(true);
    try {
      const geocoded = await reverseGeocodeCoordinates(lat, lng);
      setCurrentAddress(geocoded);
    } catch (err) {
      console.warn('Location analysis err:', err);
    } finally {
      setLoadingLocation(false);
    }
  }, []);

  // Detect live GPS location
  const handleDetectLiveLocation = async (showNotification = true) => {
    try {
      setLoadingLocation(true);
      const res = await getCurrentLiveLocation();
      if (res) {
        setCurrentAddress(res);
        setSelectedHub(null);
        if (showNotification) {
          showToast(`Live GPS detected: ${res.city}, ${res.country} 📍`, 'success');
        }
      } else if (showNotification) {
        Alert.alert(
          'Location Permission Required',
          'Please enable device location permissions to pinpoint your live address, or search for any location.'
        );
      }
    } catch (err) {
      console.warn('GPS detection err:', err);
    } finally {
      setLoadingLocation(false);
    }
  };

  // Attempt live GPS detection on initial mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await getCurrentLiveLocation();
        if (res && isMounted) {
          setCurrentAddress(res);
          setSelectedHub(null);
        }
      } catch (err) {
        console.warn('Initial GPS detection err:', err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // Search real-world place or address
  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;
    try {
      setSearching(true);
      const geocoded = await searchLocationAddress(searchQuery.trim());
      if (geocoded) {
        setCurrentAddress(geocoded);
        setSelectedHub(null);
        showToast(`Located: ${geocoded.city}, ${geocoded.country} ✨`, 'success');
      } else {
        Alert.alert(
          'Location Not Found',
          `Could not find coordinates for "${searchQuery}". Please try searching with city, district, or landmark name.`
        );
      }
    } catch (err) {
      console.warn('Search location err:', err);
      Alert.alert('Search Error', 'Unable to complete location search. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectPreset = async (hub: typeof PRESET_HUBS[0]) => {
    setSelectedHub(hub);
    await analyzeAndUpdateLocation(hub.lat, hub.lng);
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setZoomLevel((prev) => {
      if (direction === 'in') return Math.min(prev + 1, 18);
      return Math.max(prev - 1, 10);
    });
  };

  // Open native Google Maps or Apple Maps app on device
  const handleOpenRealWorldMaps = () => {
    const lat = currentAddress.latitude;
    const lng = currentAddress.longitude;
    const label = encodeURIComponent(currentAddress.street || 'Dhanvikk Delivery Location');

    const appleMapsUrl = `maps:0,0?q=${label}@${lat},${lng}`;
    const googleMapsAppUrl = `geo:${lat},${lng}?q=${lat},${lng}(${label})`;
    const webGoogleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    const preferredUrl = Platform.OS === 'ios' ? appleMapsUrl : googleMapsAppUrl;

    Linking.canOpenURL(preferredUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(preferredUrl);
        }
        return Linking.openURL(webGoogleMapsUrl);
      })
      .catch(() => {
        Linking.openURL(webGoogleMapsUrl);
      });
  };

  // Nudge coordinates slightly to simulate fine-tuning pin
  const handleNudge = (deltaLat: number, deltaLng: number) => {
    const newLat = currentAddress.latitude + deltaLat;
    const newLng = currentAddress.longitude + deltaLng;
    analyzeAndUpdateLocation(newLat, newLng);
  };

  // Confirm location and save to server
  const handleConfirmAndSaveLocation = async () => {
    setIsSaving(true);
    const fullStreet = apartmentDetails
      ? `${apartmentDetails}, ${currentAddress.street}`
      : currentAddress.street;

    const locString = `${currentAddress.city}, ${
      currentAddress.country === 'India' ? 'India' : 'UAE'
    }`;

    // Update global UI delivery location
    setDeliveryLocation(locString);

    // Save full analyzed address to server database
    const targetEmail = user?.email || 'customer@dhanvikk.com';
    const addressPayload = {
      id: `addr_map_${Date.now()}`,
      title: selectedTag,
      recipientName: recipientName.trim() || user?.name || 'Customer',
      phone: phone.trim() || user?.phone || '+971 50 123 4567',
      street: fullStreet,
      district: currentAddress.district,
      city: currentAddress.city,
      state: currentAddress.state,
      postalCode: currentAddress.pincode || '00000',
      country: currentAddress.country,
      isDefault: true,
      email: targetEmail,
    };

    try {
      await authService.saveAddress(addressPayload);
      showToast(`Address saved to server: ${locString} 🌺`, 'success');
    } catch (err) {
      console.warn('Save address to server err:', err);
      showToast(`Delivery location set to ${locString}`, 'success');
    } finally {
      setIsSaving(false);
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Back"
        >
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <AppText variant="h2" color={Colors.text}>
            Interactive Real-World Map
          </AppText>
          <AppText variant="caption" color={Colors.textSecondary}>
            GPS Pinpoint • Full Address Analysis • Server Sync
          </AppText>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Real-World Place Search Bar */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchInputWrap}>
            <Search size={18} color={Colors.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search street, city, landmark or PIN code..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchLocation}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity
            style={styles.searchBtn}
            activeOpacity={0.85}
            onPress={handleSearchLocation}
            disabled={searching}
          >
            {searching ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <AppText variant="caption" weight="semiBold" color={Colors.white}>
                Find
              </AppText>
            )}
          </TouchableOpacity>
        </View>

        {/* Real-World Map Canvas */}
        <View style={styles.mapCanvas}>
          {/* Real World Map Satellite / Standard Imagery */}
          <Image
            source={{ uri: mapImageUrl }}
            style={styles.mapImage}
            contentFit="cover"
            transition={300}
          />

          {/* Map Loading Indicator Overlay */}
          {loadingLocation && (
            <View style={styles.mapLoadingOverlay}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <AppText variant="caption" weight="semiBold" color={Colors.primaryDeep} style={{ marginTop: 8 }}>
                Analyzing Real-World Coordinates...
              </AppText>
            </View>
          )}

          {/* Central Pin Marker */}
          <View style={styles.pinWrapper} pointerEvents="none">
            <View style={styles.pulseRing} />
            <View style={styles.pinMarker}>
              <MapPin size={24} color={Colors.white} />
            </View>
            <View style={styles.pinShadow} />
          </View>

          {/* Floating GPS Button */}
          <TouchableOpacity
            style={styles.floatingGpsBtn}
            activeOpacity={0.85}
            onPress={() => handleDetectLiveLocation(true)}
            disabled={loadingLocation}
          >
            {loadingLocation ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Navigation size={18} color={Colors.primary} />
            )}
            <AppText
              variant="caption"
              weight="semiBold"
              color={Colors.primaryDeep}
              style={{ marginLeft: 6 }}
            >
              Device GPS
            </AppText>
          </TouchableOpacity>

          {/* Zoom and Fine-Tuning Controls */}
          <View style={styles.mapControlsWrap}>
            <TouchableOpacity
              style={styles.controlPillBtn}
              onPress={() => handleZoom('in')}
              disabled={zoomLevel >= 18}
            >
              <ZoomIn size={18} color={Colors.text} />
            </TouchableOpacity>
            <View style={styles.controlDivider} />
            <TouchableOpacity
              style={styles.controlPillBtn}
              onPress={() => handleZoom('out')}
              disabled={zoomLevel <= 10}
            >
              <ZoomOut size={18} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {/* Directional Nudge N/S/E/W Controls */}
          <View style={styles.nudgePad}>
            <TouchableOpacity
              style={styles.nudgeBtn}
              onPress={() => handleNudge(0.0015, 0)}
              accessibilityLabel="Pan North"
            >
              <AppText variant="caption" weight="bold" color={Colors.primaryDeep}>▲</AppText>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 14 }}>
              <TouchableOpacity
                style={styles.nudgeBtn}
                onPress={() => handleNudge(0, -0.0015)}
                accessibilityLabel="Pan West"
              >
                <AppText variant="caption" weight="bold" color={Colors.primaryDeep}>◀</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.nudgeBtn}
                onPress={() => handleNudge(0, 0.0015)}
                accessibilityLabel="Pan East"
              >
                <AppText variant="caption" weight="bold" color={Colors.primaryDeep}>▶</AppText>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.nudgeBtn}
              onPress={() => handleNudge(-0.0015, 0)}
              accessibilityLabel="Pan South"
            >
              <AppText variant="caption" weight="bold" color={Colors.primaryDeep}>▼</AppText>
            </TouchableOpacity>
          </View>

          {/* Map Coordinates & Zoom Badge */}
          <View style={styles.coordsBadge}>
            <Crosshair size={12} color={Colors.primaryDeep} />
            <AppText variant="caption" color={Colors.primaryDeep} weight="medium" style={{ fontSize: 11 }}>
              {currentAddress.latitude.toFixed(4)}°N, {currentAddress.longitude.toFixed(4)}°E (Zoom {zoomLevel}x)
            </AppText>
          </View>
        </View>

        {/* Real-World External Map Launcher */}
        <TouchableOpacity
          style={styles.openExternalMapBtn}
          activeOpacity={0.85}
          onPress={handleOpenRealWorldMaps}
        >
          <View style={styles.externalMapIconWrap}>
            <MapIcon size={20} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="bodySm" weight="semiBold" color={Colors.text}>
              Open in Native Real-World Maps
            </AppText>
            <AppText variant="caption" color={Colors.textSecondary}>
              Launch in Google Maps or Apple Maps app to view live traffic & satellite imagery
            </AppText>
          </View>
          <ExternalLink size={18} color={Colors.primary} />
        </TouchableOpacity>

        {/* Quick Selection Hubs */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeaderRow}>
            <Compass size={16} color={Colors.primary} />
            <AppText variant="caption" color={Colors.primaryDeep} weight="semiBold" style={{ marginLeft: 6 }}>
              SIGNATURE BOTANICAL HUBS (UAE & INDIA)
            </AppText>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hubsRow}>
            {PRESET_HUBS.map((hub) => {
              const isSelected = selectedHub?.name === hub.name;
              return (
                <TouchableOpacity
                  key={hub.name}
                  activeOpacity={0.8}
                  onPress={() => handleSelectPreset(hub)}
                  style={[styles.hubCard, isSelected && styles.hubCardActive]}
                >
                  <Building2
                    size={16}
                    color={isSelected ? Colors.primary : Colors.textSecondary}
                  />
                  <AppText
                    variant="caption"
                    weight={isSelected ? 'semiBold' : 'regular'}
                    color={isSelected ? Colors.primaryDeep : Colors.text}
                    style={{ marginTop: 4 }}
                  >
                    {hub.name}
                  </AppText>
                  <AppText variant="caption" color={Colors.textSecondary} style={{ fontSize: 10 }}>
                    {hub.city}, {hub.country === 'India' ? 'India' : 'UAE'}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Fully Analyzed Location Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.cardHeaderBadge}>
            <Sparkles size={14} color={Colors.primary} />
            <AppText variant="caption" color={Colors.primaryDeep} weight="semiBold" style={{ marginLeft: 4 }}>
              FULLY ANALYZED ADDRESS BREAKDOWN
            </AppText>
          </View>

          {/* Full Formatted Address Banner */}
          <View style={styles.formattedAddressBox}>
            <MapPin size={20} color={Colors.primary} style={{ marginTop: 2 }} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <AppText variant="bodySm" weight="semiBold" color={Colors.text}>
                {currentAddress.formattedAddress}
              </AppText>
            </View>
          </View>

          {/* Structured Key Address Fields Grid */}
          <View style={styles.analysisGrid}>
            {/* Street */}
            <View style={styles.gridCell}>
              <AppText variant="caption" color={Colors.textSecondary} weight="medium">
                STREET / PREMISE
              </AppText>
              <AppText variant="bodySm" weight="semiBold" color={Colors.text} numberOfLines={2}>
                {currentAddress.street || 'Central'}
              </AppText>
            </View>

            {/* District / Region */}
            <View style={styles.gridCell}>
              <AppText variant="caption" color={Colors.textSecondary} weight="medium">
                DISTRICT / REGION
              </AppText>
              <AppText variant="bodySm" weight="semiBold" color={Colors.primaryDeep} numberOfLines={1}>
                {currentAddress.district || currentAddress.city}
              </AppText>
            </View>

            {/* City */}
            <View style={styles.gridCell}>
              <AppText variant="caption" color={Colors.textSecondary} weight="medium">
                CITY / LOCALITY
              </AppText>
              <AppText variant="bodySm" weight="semiBold" color={Colors.text} numberOfLines={1}>
                {currentAddress.city}
              </AppText>
            </View>

            {/* State */}
            <View style={styles.gridCell}>
              <AppText variant="caption" color={Colors.textSecondary} weight="medium">
                STATE / EMIRATE
              </AppText>
              <AppText variant="bodySm" weight="semiBold" color={Colors.text} numberOfLines={1}>
                {currentAddress.state}
              </AppText>
            </View>

            {/* Postal / PIN Code */}
            <View style={styles.gridCell}>
              <AppText variant="caption" color={Colors.textSecondary} weight="medium">
                PIN / POSTAL CODE
              </AppText>
              <AppText variant="bodySm" weight="semiBold" color={Colors.text} numberOfLines={1}>
                {currentAddress.pincode ? currentAddress.pincode : 'Verified via Geo-Pin'}
              </AppText>
            </View>

            {/* Country */}
            <View style={styles.gridCell}>
              <AppText variant="caption" color={Colors.textSecondary} weight="medium">
                COUNTRY
              </AppText>
              <AppText variant="bodySm" weight="semiBold" color={Colors.text} numberOfLines={1}>
                {currentAddress.country}
              </AppText>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Address Category Tag */}
          <AppText variant="caption" color={Colors.textSecondary} weight="medium" style={{ marginBottom: 8 }}>
            SAVE AS
          </AppText>
          <View style={styles.tagsRow}>
            {ADDRESS_TAGS.map((tag) => {
              const IconComp = tag.icon;
              const isTagActive = selectedTag === tag.label;
              return (
                <TouchableOpacity
                  key={tag.label}
                  onPress={() => setSelectedTag(tag.label)}
                  style={[styles.tagPill, isTagActive && styles.tagPillActive]}
                >
                  <IconComp size={14} color={isTagActive ? Colors.white : Colors.textSecondary} />
                  <AppText
                    variant="caption"
                    weight={isTagActive ? 'semiBold' : 'regular'}
                    color={isTagActive ? Colors.white : Colors.text}
                    style={{ marginLeft: 4 }}
                  >
                    {tag.label}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Optional Details */}
          <AppInput
            label="Apartment / Villa / Floor Number (Optional)"
            placeholder="e.g. Penthouse 1402, Royal Palms, Tower B"
            value={apartmentDetails}
            onChangeText={setApartmentDetails}
            containerStyle={{ marginTop: Spacing.sm, marginBottom: Spacing.sm }}
          />

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <AppInput
                label="Contact Name"
                placeholder="Recipient name"
                value={recipientName}
                onChangeText={setRecipientName}
              />
            </View>
            <View style={{ flex: 1 }}>
              <AppInput
                label="Contact Phone"
                placeholder="Phone number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.assuranceRow}>
            <ShieldCheck size={18} color={Colors.primary} />
            <AppText variant="caption" color={Colors.textSecondary} style={{ flex: 1, marginLeft: 8 }}>
              Hydrated botanical packages will be delivered in climate-controlled transport to this analyzed pin.
            </AppText>
          </View>

          {/* Save & Confirm Button */}
          <AppButton
            title="Confirm & Save Address to Server"
            onPress={handleConfirmAndSaveLocation}
            loading={isSaving}
            variant="primary"
            size="large"
            fullWidth
            icon={<CheckCircle2 size={18} color={Colors.white} />}
            style={{ marginTop: Spacing.lg }}
          />
        </View>
      </ScrollView>
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
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitleWrap: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  searchBarContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 10,
    alignItems: 'center',
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.tintedSurface,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    paddingVertical: 0,
  },
  searchBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapCanvas: {
    height: 300,
    backgroundColor: '#EBE7DE',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapLoadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30,
  },
  pinWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  pulseRing: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(154, 33, 67, 0.2)',
  },
  pinMarker: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  pinShadow: {
    width: 16,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginTop: 4,
  },
  floatingGpsBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.md,
    zIndex: 20,
  },
  mapControlsWrap: {
    position: 'absolute',
    right: 14,
    bottom: 40,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.md,
    zIndex: 20,
  },
  controlPillBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  nudgePad: {
    position: 'absolute',
    left: 14,
    top: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: Radius.md,
    padding: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    zIndex: 20,
  },
  nudgeBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.tintedSurface,
    borderRadius: 4,
  },
  coordsBadge: {
    position: 'absolute',
    bottom: 10,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  openExternalMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.screenPadding,
    marginTop: Spacing.md,
    backgroundColor: '#FFF5F8',
    padding: Spacing.md,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.primary + '33',
    gap: 12,
    ...Shadows.sm,
  },
  externalMapIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionWrap: {
    paddingHorizontal: Spacing.screenPadding,
    marginTop: Spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  hubsRow: {
    gap: 10,
    paddingRight: Spacing.screenPadding,
  },
  hubCard: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 110,
    alignItems: 'center',
  },
  hubCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.palePink,
  },
  detailsCard: {
    marginHorizontal: Spacing.screenPadding,
    marginTop: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  cardHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.palePink,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    marginBottom: 12,
  },
  formattedAddressBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.tintedSurface,
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  analysisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridCell: {
    width: '48%',
    backgroundColor: Colors.background,
    padding: 10,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
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
  assuranceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: Radius.sm,
    marginTop: Spacing.sm,
  },
});
