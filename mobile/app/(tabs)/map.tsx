import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

type Coordinates = {
  latitude: number;
  longitude: number;
};

type MapRegion = Coordinates & {
  latitudeDelta: number;
  longitudeDelta: number;
};

const DEFAULT_REGION: MapRegion = {
  latitude: 48.8566,
  longitude: 2.3522,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const MAP_ZOOM = {
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const RADIUS_METERS = 15_000;
const ANIMATION_DURATION = 500;

const MAP_COLORS = {
  primary: '#FF4D67',
  background: '#121212',
  card: '#1E1E1E',
};

export default function MapScreen() {
  const mapRef = useRef<any>(null);

  const [region, setRegion] = useState<MapRegion>(DEFAULT_REGION);
  const [userCoordinate, setUserCoordinate] =
    useState<Coordinates | null>(null);

  /**
   * Récupère la position de l'utilisateur.
   */
  const getUserLocation = useCallback(async (): Promise<Coordinates | null> => {
    try {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Erreur de géolocalisation :', error);
      return null;
    }
  }, []);

  /**
   * Met à jour la position et recentre la carte.
   */
  const updateLocation = useCallback(async () => {
    const coordinates = await getUserLocation();

    if (!coordinates) return;

    const nextRegion: MapRegion = {
      ...coordinates,
      ...MAP_ZOOM,
    };

    setUserCoordinate(coordinates);
    setRegion(nextRegion);

    mapRef.current?.animateToRegion(
      nextRegion,
      ANIMATION_DURATION
    );
  }, [getUserLocation]);

  /**
   * Récupération initiale de la position.
   */
  useEffect(() => {
    if (Platform.OS === 'web') return;

    let isMounted = true;

    const initializeLocation = async () => {
      const coordinates = await getUserLocation();

      if (!coordinates || !isMounted) return;

      const nextRegion: MapRegion = {
        ...coordinates,
        ...MAP_ZOOM,
      };

      setUserCoordinate(coordinates);
      setRegion(nextRegion);
      mapRef.current?.animateToRegion(
        nextRegion,
        ANIMATION_DURATION
      );
    };

    initializeLocation();

    return () => {
      isMounted = false;
    };
  }, [getUserLocation]);

  /**
   * Affichage de la carte native.
   */
  const renderNativeMap = () => {
    const { default: MapView, Circle } = require('react-native-maps');

    return (
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={DEFAULT_REGION}
        showsUserLocation
        showsMyLocationButton={false}
        onRegionChangeComplete={setRegion}
      >
        {userCoordinate && (
          <Circle
            center={userCoordinate}
            radius={RADIUS_METERS}
            fillColor="rgba(255, 77, 103, 0.10)"
            strokeColor="rgba(255, 77, 103, 0.65)"
            strokeWidth={2}
          />
        )}
      </MapView>
    );
  };

  /**
   * Affichage de la carte Web.
   */
  const renderWebMap = () => {
    const { latitude, longitude } = region;

    const bbox = [
      longitude - 0.12,
      latitude - 0.08,
      longitude + 0.12,
      latitude + 0.08,
    ].join(',');

    const mapUrl =
      `https://www.openstreetmap.org/export/embed.html` +
      `?bbox=${bbox}&layer=mapnik` +
      `&marker=${latitude},${longitude}`;

    return React.createElement('iframe', {
      src: mapUrl,
      title: 'Carte des événements',
      style: styles.webMap,
    });
  };

  return (
    <View style={styles.container}>
      {Platform.OS === 'web'
        ? renderWebMap()
        : renderNativeMap()}

      {Platform.OS !== 'web' && (
        <Pressable
          style={styles.recenterButton}
          onPress={updateLocation}
        >
          <Ionicons
            name="navigate"
            size={20}
            color="#FFFFFF"
          />
        </Pressable>
      )}

      <View style={styles.radiusCard}>
        <Ionicons
          name="navigate-circle"
          size={22}
          color="#FFD166"
        />
        <Text style={styles.radiusText}>
          Rayon actuel : {RADIUS_METERS / 1000} km
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MAP_COLORS.background,
  },
  map: {
    flex: 1,
  },
  webMap: {
    border: 0,
    width: '100%',
    height: '100%',
  } as any,
  radiusCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: MAP_COLORS.card,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  radiusText: {
    color: '#DDD',
    fontSize: 13,
    fontWeight: '500',
  },
  recenterButton: {
    position: 'absolute',
    right: 16,
    bottom: 74,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MAP_COLORS.primary,
    elevation: 4,
  },
});
