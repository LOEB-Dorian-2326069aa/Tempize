import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore, Tag } from '../../store/authStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Profil Connecté */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={48} color="#FFF" />
        </View>
        <Text style={styles.userName}>{user?.nom || user?.pseudo || 'Mon Profil'}</Text>
        <Text style={styles.userEmail}>{user?.email || ''}</Text>
        {user?.bio ? <Text style={styles.userBio}>{user.bio}</Text> : null}

        <View style={styles.premiumBadge}>
          <Ionicons
            name={user?.est_premium ? 'diamond' : 'star'}
            size={16}
            color="#FFD166"
          />
          <Text style={styles.premiumText}>
            {user?.est_premium ? 'Membre Premium 💎' : 'Membre Standard'}
          </Text>
        </View>
      </View>

      {/* Tags / Centres d'intérêt */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes Centres d'intérêt</Text>
        <View style={styles.tagsContainer}>
          {user?.tags && user.tags.length > 0 ? (
            user.tags.map((tag: Tag) => (
              <View key={tag.id_tag} style={styles.tagPill}>
                <Text style={styles.tagText}>#{tag.libelle}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyTagsText}>Aucun centre d'intérêt renseigné</Text>
          )}
        </View>
      </View>

      {/* Options / Paramètres */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Préférences</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="location-outline" size={20} color="#AAA" />
          <Text style={styles.menuItemText}>
            Rayon de recherche ({user?.est_premium ? 'Illimité' : '15 km'})
          </Text>
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

      {/* Bouton Premium CTA si non premium */}
      {!user?.est_premium && (
        <TouchableOpacity style={styles.upgradeCard}>
          <View style={styles.upgradeContent}>
            <Ionicons name="diamond" size={28} color="#FFD166" />
            <View>
              <Text style={styles.upgradeTitle}>Passez à Tempize Premium</Text>
              <Text style={styles.upgradeSubtitle}>
                Rewind illimité • Mode Passeport • Pass-Droit
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#FFD166" />
        </TouchableOpacity>
      )}

      {/* Bouton Déconnexion si connecté */}
      {isAuthenticated && (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF476F" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      )}
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
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  avatarContainer: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#2D2D2D',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FF4D67',
    marginBottom: 6,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userEmail: {
    fontSize: 13,
    color: '#888',
  },
  userBio: {
    fontSize: 14,
    color: '#AAA',
    textAlign: 'center',
    maxWidth: 280,
    marginTop: 4,
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
    marginTop: 6,
  },
  premiumText: {
    color: '#FFD166',
    fontSize: 12,
    fontWeight: '600',
  },
  guestBanner: {
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    gap: 12,
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  guestSubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  loginCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF4D67',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 6,
  },
  loginCtaText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
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
  emptyTagsText: {
    color: '#666',
    fontSize: 13,
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: 'rgba(239, 71, 111, 0.3)',
    paddingVertical: 14,
    borderRadius: 14,
  },
  logoutText: {
    color: '#EF476F',
    fontWeight: '700',
    fontSize: 14,
  },
});
