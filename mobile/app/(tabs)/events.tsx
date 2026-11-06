import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function EventsScreen() {
  const [activeTab, setActiveTab] = useState<'joined' | 'organized'>('joined');

  return (
    <View style={styles.container}>
      {/* Switcher Tab */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'joined' && styles.activeTabButton]}
          onPress={() => setActiveTab('joined')}
        >
          <Text style={[styles.tabText, activeTab === 'joined' && styles.activeTabText]}>
            Je Participe
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'organized' && styles.activeTabButton]}
          onPress={() => setActiveTab('organized')}
        >
          <Text style={[styles.tabText, activeTab === 'organized' && styles.activeTabText]}>
            J'Organise
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'joined' ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={54} color="#666" />
            <Text style={styles.emptyTitle}>Aucune sortie prévue pour l'instant</Text>
            <Text style={styles.emptySubtitle}>
              Swippez sur l'écran "Découvrir" pour trouver votre prochaine activité !
            </Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="add-circle-outline" size={54} color="#FF4D67" />
            <Text style={styles.emptyTitle}>Créez votre première activité</Text>
            <Text style={styles.emptySubtitle}>
              Proposez une sortie à vos amis ou ouvrez-la aux membres proches.
            </Text>
            <TouchableOpacity style={styles.createButton}>
              <Ionicons name="add" size={20} color="#FFF" />
              <Text style={styles.createButtonText}>Créer un événement</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    margin: 16,
    borderRadius: 14,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTabButton: {
    backgroundColor: '#2D2D2D',
  },
  tabText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF4D67',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 12,
  },
  createButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
