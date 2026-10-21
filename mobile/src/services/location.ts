import * as Location from 'expo-location';
import { Alert, Linking, Platform } from 'react-native';

export interface DetectedLocationResult {
  latitude: number;
  longitude: number;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  formattedAddress?: string;
}

/**
 * Requests GPS and foreground location permission from the operating system.
 * Returns true if granted, false otherwise.
 */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
    if (existingStatus === 'granted') {
      return true;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      return true;
    }

    Alert.alert(
      'Location Access Required',
      'Please allow GPS and location access in your device settings to automatically detect your delivery address and locate nearby flower ateliers.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          },
        },
      ]
    );
    return false;
  } catch (error) {
    console.warn('[Location] Permission request failed:', error);
    return false;
  }
}

/**
 * Gets the device's current GPS location and reverse-geocodes it into human-readable address fields.
 */
export async function getCurrentDeviceLocation(): Promise<DetectedLocationResult | null> {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) return null;

  try {
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = loc.coords;
    let street = '';
    let city = '';
    let state = '';
    let postalCode = '';
    let country = 'India';

    try {
      const reverseList = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (reverseList && reverseList.length > 0) {
        const place = reverseList[0];
        const streetParts = [
          place.name,
          place.streetNumber,
          place.street,
          place.district,
          place.subregion,
        ].filter(Boolean);

        // Deduplicate and format street
        street = Array.from(new Set(streetParts)).join(', ') || '';
        city = place.city || place.subregion || place.district || 'Chennai';
        state = place.region || 'Tamil Nadu';
        postalCode = place.postalCode || '';
        country = place.country || 'India';
      }
    } catch (geoError) {
      console.warn('[Location] Reverse geocode error:', geoError);
    }

    return {
      latitude,
      longitude,
      street,
      city,
      state,
      postalCode,
      country,
      formattedAddress: [street, city, state, postalCode].filter(Boolean).join(', '),
    };
  } catch (err: any) {
    console.warn('[Location] Failed to get current position:', err);
    return null;
  }
}
