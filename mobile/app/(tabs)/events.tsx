import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import BottomNav from '../../components/BottomNav';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../constants/theme';

const MOCK_EVENTS = [
  {
    id: 1,
    titre: 'Pique-nique au canal',
    date: 'Sam. 14 juin · 18:30',
    lieu: 'Canal Saint-Martin, Paris 10e',
    categorie: 'Plein air',
    statut: 'confirmé',
    inscrits: 8,
    placesLibres: 4,
  },
  {
    id: 2,
    titre: 'Café & nouvelles têtes',
    date: 'Dim. 15 juin · 10:30',
    lieu: 'Café des Arts, Paris 11e',
    categorie: 'Culture',
    statut: 'en_attente',
    inscrits: 5,
    placesLibres: 5,
  },
];

export default function EventsScreen() {
  const [activeTab, setActiveTab] = useState<'joined' | 'organized'>('joined');

  return (
    <View style={styles.container}>
      <AppHeader title="Événements" />

      <View style={styles.switcher}>
        <TouchableOpacity
          style={[styles.switcherBtn, activeTab === 'joined' && styles.switcherBtnActive]}
          onPress={() => setActiveTab('joined')}
          activeOpacity={0.8}
        >
          <Text style={[styles.switcherText, activeTab === 'joined' && styles.switcherTextActive]}>
            Je participe
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.switcherBtn, activeTab === 'organized' && styles.switcherBtnActive]}
          onPress={() => setActiveTab('organized')}
          activeOpacity={0.8}
        >
          <Text style={[styles.switcherText, activeTab === 'organized' && styles.switcherTextActive]}>
            J'organise
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'joined' ? (
          MOCK_EVENTS.length > 0 ? (
            <View style={styles.list}>
              {MOCK_EVENTS.map((event) => (
                <TouchableOpacity key={event.id} style={styles.eventCard} activeOpacity={0.8}>
                  <View style={styles.eventCardTop}>
                    <View style={styles.categoryPill}>
                      <Text style={styles.categoryPillText}>{event.categorie}</Text>
                    </View>
                    <View style={[
                      styles.statutBadge,
                      event.statut === 'confirmé' ? styles.statutConfirme : styles.statutAttente
                    ]}>
                      <Text style={[
                        styles.statutText,
                        event.statut === 'confirmé' ? styles.statutConfirmeText : styles.statutAttenteText
                      ]}>
                        {event.statut === 'confirmé' ? '✓ Confirmé' : '⏳ En attente'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.eventTitle}>{event.titre}</Text>

                  <View style={styles.eventMeta}>
                    <View style={styles.eventMetaRow}>
                      <Ionicons name="calendar-outline" size={14} color={Colors.secondaire} />
                      <Text style={styles.eventMetaText}>{event.date}</Text>
                    </View>
                    <View style={styles.eventMetaRow}>
                      <Ionicons name="location-outline" size={14} color={Colors.secondaire} />
                      <Text style={styles.eventMetaText}>{event.lieu}</Text>
                    </View>
                  </View>

                  <View style={styles.eventCardFooter}>
                    <Text style={styles.inscritsText}>
                      {event.inscrits} inscrits · {event.placesLibres} places libres
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={Colors.contour} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={56} color={Colors.contour} />
              <Text style={styles.emptyTitle}>Aucune sortie prévue</Text>
              <Text style={styles.emptySubtitle}>
                Swipez sur "Découvrir" pour trouver votre prochaine activité !
              </Text>
            </View>
          )
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="add-circle-outline" size={56} color={Colors.prune} />
            <Text style={styles.emptyTitle}>Créez votre première activité</Text>
            <Text style={styles.emptySubtitle}>
              Proposez une sortie à des membres proches de chez vous.
            </Text>
            <TouchableOpacity style={styles.createBtn} activeOpacity={0.8}>
              <Ionicons name="add" size={18} color={Colors.white} />
              <Text style={styles.createBtnText}>Créer un événement</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  switcher: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    backgroundColor: Colors.contour,
    borderRadius: Radius.md,
    padding: 3,
  },
  switcherBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Radius.sm + 2,
  },
  switcherBtnActive: {
    backgroundColor: Colors.light.surface,
    ...Shadows.subtle,
  },
  switcherText: {
    fontSize: Typography.action,
    fontWeight: Typography.medium,
    color: Colors.secondaire,
  },
  switcherTextActive: {
    color: Colors.encre,
    fontWeight: Typography.bold,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: Spacing.lg,
    flexGrow: 1,
  },
  list: { gap: Spacing.md },
  eventCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.contour,
    ...Shadows.subtle,
  },
  eventCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryPill: {
    backgroundColor: `${Colors.prune}12`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  categoryPillText: {
    fontSize: Typography.meta,
    fontWeight: Typography.bold,
    color: Colors.prune,
  },
  statutBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  statutConfirme: { backgroundColor: Colors.confirmeBackground },
  statutAttente: { backgroundColor: `${Colors.orange}18` },
  statutText: { fontSize: Typography.meta, fontWeight: Typography.bold },
  statutConfirmeText: { color: Colors.confirme },
  statutAttenteText: { color: Colors.orange },
  eventTitle: {
    fontSize: Typography.cardTitle,
    fontWeight: Typography.bold,
    color: Colors.encre,
  },
  eventMeta: { gap: 6 },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventMetaText: {
    fontSize: Typography.body,
    color: Colors.secondaire,
  },
  eventCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.contour,
  },
  inscritsText: {
    fontSize: 13,
    color: Colors.secondaire,
    fontWeight: Typography.medium,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: Typography.bold,
    color: Colors.encre,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: Typography.body,
    color: Colors.secondaire,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.prune,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: Radius.md,
    marginTop: Spacing.sm,
  },
  createBtnText: {
    color: Colors.white,
    fontWeight: Typography.bold,
    fontSize: Typography.action,
  },
});
