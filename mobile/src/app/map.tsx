import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { colors, radius, spacing } from '@/constants/theme';

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const [region, setRegion] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Location Notice',
            'Location access allows us to pinpoint your delivery hub. You can still set delivery addresses manually.'
          );
          // Default to Chennai coordinates
          setRegion({
            latitude: 13.0827,
            longitude: 80.2707,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          });
          return;
        }
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        });
      } catch (err) {
        setRegion({
          latitude: 13.0827,
          longitude: 80.2707,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        });
      }
    })();
  }, []);

  return (
    <View style={[s.page, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={s.header}>
        <Pressable
          style={s.backBtn}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/account'))}
        >
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={s.headerTitle}>Delivery Map</Text>
        <View style={{ width: 38 }} />
      </View>

      <View style={s.mapContainer}>
        {region ? (
          <MapView
            style={s.map}
            initialRegion={region}
            showsUserLocation
            showsMyLocationButton
          >
            <Marker coordinate={region} title="Dhanvikk Delivery Point" />
          </MapView>
        ) : (
          <View style={s.loading}>
            <Text style={s.loadingText}>Locating delivery coordinates…</Text>
          </View>
        )}

        <View style={[s.sheet, { bottom: Math.max(insets.bottom, 20) + 10 }]}>
          <View style={s.sheetHeader}>
            <Ionicons name="navigate" size={18} color={colors.primaryDeep} />
            <Text style={s.title}>Precision Delivery</Text>
          </View>
          <Text style={s.text}>
            Fresh bouquets are temperature-managed and dispatched from your closest botanical hub.
          </Text>
          <Pressable style={s.ctaBtn} onPress={() => router.push('/(tabs)/shop')}>
            <Text style={s.ctaBtnText}>Shop available blooms</Text>
          </Pressable>
        </View>
      </View>
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
    maxWidth: 840,
    width: '100%',
    alignSelf: 'center',
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
  mapContainer: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.muted,
    fontSize: 13,
  },
  sheet: {
    position: 'absolute',
    left: 16,
    right: 16,
    maxWidth: 540,
    alignSelf: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.line,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.ink,
  },
  text: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  ctaBtn: {
    backgroundColor: colors.primary,
    borderRadius: 22,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnText: {
    color: colors.white,
    fontWeight: '900',
    fontSize: 13,
  },
});