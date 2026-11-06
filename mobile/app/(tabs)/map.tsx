import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="map-outline" size={64} color="#FF4D67" />
        <Text style={styles.title}>Carte Interactive</Text>
        <Text style={styles.subtitle}>
          Visualisez les événements géolocalisés autour de votre position et filtrez par rayon.
        </Text>
        <View style={styles.placeholderCard}>
          <Ionicons name="navigate-circle" size={24} color="#FFD166" />
          <Text style={styles.placeholderText}>Rayon actuel : 15 km (Mode Gratuit)</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    gap: 16,
    maxWidth: 400,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 22,
  },
  placeholderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    marginTop: 8,
  },
  placeholderText: {
    color: '#DDD',
    fontSize: 13,
    fontWeight: '500',
  },
});
