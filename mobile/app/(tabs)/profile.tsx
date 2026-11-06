import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Profil */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={48} color="#FFF" />
        </View>
        <Text style={styles.userName}>Lucas Martin</Text>
        <Text style={styles.userBio}>Passionné de jeux de société et de sorties sportives 🧗</Text>

        <View style={styles.premiumBadge}>
          <Ionicons name="star" size={16} color="#FFD166" />
          <Text style={styles.premiumText}>Membre Standard</Text>
        </View>
      </View>

      {/* Tags / Centres d'intérêt */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes Centres d'intérêt</Text>
        <View style={styles.tagsContainer}>
          {['Sport', 'Jeux de société', 'Musique', 'Randonnée', 'Bar'].map((tag, i) => (
            <View key={i} style={styles.tagPill}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Options / Paramètres */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Préférences</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="location-outline" size={20} color="#AAA" />
          <Text style={styles.menuItemText}>Rayon de recherche (15 km)</Text>
          <Ionicons name="chevron-forward" size={18} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="notifications-outline" size={20} color="#AAA" />
          <Text style={styles.menuItemText}>Notifications & Alertes</Text>
          <Ionicons name="chevron-forward" size={18} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#AAA" />
          <Text style={styles.menuItemText}>Confidentialité & RGPD</Text>
          <Ionicons name="chevron-forward" size={18} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Bouton Premium CTA */}
      <TouchableOpacity style={styles.upgradeCard}>
        <View style={styles.upgradeContent}>
          <Ionicons name="diamond" size={28} color="#FFD166" />
          <View>
            <Text style={styles.upgradeTitle}>Passez à Tempize Premium</Text>
            <Text style={styles.upgradeSubtitle}>Rewind illimité • Mode Passeport • Pass-Droit</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={22} color="#FFD166" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    padding: 20,
    gap: 24,
  },
  header: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  avatarContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#2D2D2D',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FF4D67',
    marginBottom: 8,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userBio: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    maxWidth: 280,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    marginTop: 4,
  },
  premiumText: {
    color: '#FFD166',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  tagText: {
    color: '#FF4D67',
    fontSize: 12,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  menuItemText: {
    flex: 1,
    color: '#DDD',
    fontSize: 14,
    fontWeight: '500',
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 77, 103, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 103, 0.3)',
    marginTop: 8,
  },
  upgradeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  upgradeTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  upgradeSubtitle: {
    color: '#AAA',
    fontSize: 12,
    marginTop: 2,
  },
});
