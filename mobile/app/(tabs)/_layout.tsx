import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { Colors, Typography } from '../../constants/theme';

/**
 * Layout des onglets — Expo Router Tabs avec tabBar native cachée.
 * Chaque écran déclare son propre <BottomNav /> pour la navigation.
 * Les écrans sont déclarés ici pour qu'Expo Router les connaisse.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // On cache la tabBar native — BottomNav custom est dans chaque écran
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen
        name="swipe"
        options={{ title: 'Découvrir' }}
      />
      <Tabs.Screen
        name="create"
        options={{ title: 'Créer' }}
      />
      <Tabs.Screen
        name="events"
        options={{ title: 'Événements' }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profil' }}
      />
      <Tabs.Screen
        name="map"
        options={{ title: 'Carte', href: null }}
      />
    </Tabs>
  );
}
