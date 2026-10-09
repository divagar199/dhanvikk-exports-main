import * as Location from 'expo-location';

export interface GeocodedAddress {
  street: string;
  district: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
}

/**
 * Requests location permission and returns current GPS position and reverse-geocoded address
 */
export async function getCurrentLiveLocation(): Promise<GeocodedAddress | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
    });

    const { latitude, longitude } = position.coords;
    return await reverseGeocodeCoordinates(latitude, longitude);
  } catch (error) {
    console.warn('getCurrentLiveLocation error:', error);
    return null;
  }
}

/**
 * Reverse geocode coordinates into a fully analyzed, human-readable address with full components
 */
export async function reverseGeocodeCoordinates(
  latitude: number,
  longitude: number
): Promise<GeocodedAddress> {
  try {
    const reverse = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (reverse && reverse.length > 0) {
      const place = reverse[0];

      // Formulate detailed street components
      const streetPart = [place.streetNumber, place.street || place.name]
        .filter(Boolean)
        .join(' ')
        .trim();

      const district = place.district || place.subregion || '';
      const city = place.city || place.subregion || place.region || 'Dubai';
      const state = place.region || place.subregion || (place.country === 'India' ? 'Maharashtra' : 'Dubai');
      const country = place.country || (latitude > 22 && latitude < 27 && longitude > 52 && longitude < 57 ? 'United Arab Emirates' : 'India');
      const pincode = place.postalCode || '';

      const addressTokens = [
        streetPart,
        district,
        city,
        state,
        pincode ? `PIN: ${pincode}` : '',
        country,
      ].filter(Boolean);

      const formattedAddress = addressTokens.join(', ');

      return {
        street: streetPart || district || `${city} Central`,
        district: district || city,
        city,
        state,
        country,
        pincode,
        formattedAddress: formattedAddress || `${city}, ${country}`,
        latitude,
        longitude,
      };
    }
  } catch (err) {
    console.warn('reverseGeocodeCoordinates error:', err);
  }

  // Sensible geographical fallback based on coordinates
  const isLikelyUAE = latitude > 22 && latitude < 27 && longitude > 51 && longitude < 57;
  const isLikelyIndia = latitude > 8 && latitude < 36 && longitude > 68 && longitude < 98;

  const defaultCountry = isLikelyUAE ? 'United Arab Emirates' : isLikelyIndia ? 'India' : 'United Arab Emirates';
  const defaultCity = isLikelyUAE ? 'Dubai' : isLikelyIndia ? 'Mumbai' : 'Dubai';
  const defaultState = isLikelyUAE ? 'Dubai' : isLikelyIndia ? 'Maharashtra' : 'Dubai';

  return {
    street: `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
    district: defaultCity,
    city: defaultCity,
    state: defaultState,
    country: defaultCountry,
    pincode: '',
    formattedAddress: `${defaultCity}, ${defaultState}, ${defaultCountry} [${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E]`,
    latitude,
    longitude,
  };
}

/**
 * Searches real-world locations by text query and analyzes coordinates into full address details
 */
export async function searchLocationAddress(query: string): Promise<GeocodedAddress | null> {
  if (!query || !query.trim()) return null;
  try {
    const results = await Location.geocodeAsync(query.trim());
    if (results && results.length > 0) {
      const first = results[0];
      return await reverseGeocodeCoordinates(first.latitude, first.longitude);
    }
  } catch (err) {
    console.warn('searchLocationAddress error:', err);
  }
  return null;
}

