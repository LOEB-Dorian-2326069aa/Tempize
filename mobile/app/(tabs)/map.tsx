import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import BottomNav from '../../components/BottomNav';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../constants/theme';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <AppHeader title="Carte" rightIcon="options-outline" />

      <View style={styles.mapPlaceholder}>
        <View style={styles.pin1}>
          <Ionicons name="location" size={28} color={Colors.prune} />
        </View>
        <View style={styles.pin2}>
          <Ionicons name="location" size={22} color={Colors.framboise} />
        </View>
        <View style={styles.pin3}>
          <Ionicons name="location" size={20} color={Colors.orange} />
        </View>

        <View style={styles.mapOverlay}>
          <Ionicons name="map" size={48} color={Colors.secondaire} style={{ opacity: 0.3 }} />
          <Text style={styles.mapTitle}>Carte Interactive</Text>
          <Text style={styles.mapSub}>
            Visualisez les événements géolocalisés{'\n'}autour de vous.
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoLeft}>
          <View style={styles.infoIcon}>
            <Ionicons name="navigate-circle" size={20} color={Colors.prune} />
          </View>
          <View>
            <Text style={styles.infoTitle}>Rayon actuel : 15 km</Text>
            <Text style={styles.infoSub}>Mode Gratuit · Passez Premium pour étendre</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color={Colors.contour} />
      </View>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#E9E1E5',
    margin: Spacing.lg,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pin1: { position: 'absolute', top: '30%', left: '45%' },
  pin2: { position: 'absolute', top: '55%', left: '25%' },
  pin3: { position: 'absolute', top: '40%', left: '65%' },
  mapOverlay: {
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(250,247,244,0.85)',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.lg,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: Typography.bold,
    color: Colors.encre,
  },
  mapSub: {
    fontSize: Typography.body,
    color: Colors.secondaire,
    textAlign: 'center',
    lineHeight: 22,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.contour,
    ...Shadows.subtle,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${Colors.prune}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: {
    fontSize: Typography.action,
    fontWeight: Typography.bold,
    color: Colors.encre,
  },
  infoSub: {
    fontSize: 12,
    color: Colors.secondaire,
    marginTop: 2,
  },
});
