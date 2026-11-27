import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#1A1A1A',
        },
        headerTitleStyle: {
          color: '#FFFFFF',
          fontWeight: '700',
        },
        tabBarStyle: {
          backgroundColor: '#1A1A1A',
          borderTopColor: '#2D2D2D',
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#FF4D67',
        tabBarInactiveTintColor: '#888888',
      }}
    >
      <Tabs.Screen
        name="swipe"
        options={{
          title: 'Découvrir',
          headerTitle: 'Tempize',
          tabBarIcon: (props: any) => (
            <Ionicons name="flame" size={props.size} color={props.color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Carte',
          headerTitle: 'Événements autour de moi',
          tabBarIcon: (props: any) => (
            <Ionicons name="map" size={props.size} color={props.color} />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Mes Sorties',
          headerTitle: 'Mes Événements',
          tabBarIcon: (props: any) => (
            <Ionicons name="calendar" size={props.size} color={props.color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          headerTitle: 'Mon Profil',
          tabBarIcon: (props: any) => (
            <Ionicons name="person" size={props.size} color={props.color} />
          ),
        }}
      />
    </Tabs>
  );
}
