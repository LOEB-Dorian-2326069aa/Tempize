import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { eventsService } from '../../services/events.service';

interface TagItem {
  id_tag: number;
  libelle: string;
}

// Tags de secours si le backend est hors ligne
const DEFAULT_TAGS: TagItem[] = [
  { id_tag: 1, libelle: 'Sport' },
  { id_tag: 2, libelle: 'Jeux de société' },
  { id_tag: 3, libelle: 'Musique' },
  { id_tag: 4, libelle: 'Bar' },
  { id_tag: 5, libelle: 'Randonnée' },
  { id_tag: 6, libelle: 'Soirée' },
  { id_tag: 7, libelle: 'Plein air' },
  { id_tag: 8, libelle: 'Culture' },
  { id_tag: 9, libelle: 'Cuisine' },
  { id_tag: 10, libelle: 'Jeux vidéo' },
  { id_tag: 11, libelle: 'Cinéma' },
  { id_tag: 12, libelle: 'Voyage' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    nom?: string;
    pseudo?: string;
    email: string;
    password: string;
    bio?: string;
  }>();

  const { register, isLoading, error, clearError } = useAuthStore();

  const [availableTags, setAvailableTags] = useState<TagItem[]>(DEFAULT_TAGS);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([2, 4]); // par défaut quelques-uns sélectionnés
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer les tags réels depuis l'API
    eventsService
      .getTags()
      .then((tags: TagItem[]) => {
        if (tags && tags.length > 0) {
          setAvailableTags(tags);
        }
      })
      .catch(() => {
        // Conserve les tags par défaut
      });
  }, []);

  const toggleTag = (id: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
    if (localError) setLocalError(null);
  };

  const handleFinish = async () => {
    setLocalError(null);
    clearError();

    if (selectedTagIds.length === 0) {
      setLocalError('Veuillez sélectionner au moins un centre d’intérêt.');
      return;
    }

    try {
      const nomComplet = params.nom || params.pseudo || 'Utilisateur';
      await register({
        nom: nomComplet,
        pseudo: nomComplet,
        email: params.email || '',
        mot_de_passe: params.password || '',
        bio: params.bio,
        tag_ids: selectedTagIds,
      });

      // Redirection vers le flux de swipe
      router.replace('/(tabs)/swipe');
    } catch {
      // Erreur gérée dans le store
    }
  };

  const displayError = localError || error;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.stepBadge}>Étape 2 sur 2</Text>
          <Text style={styles.title}>Vos Centres d'Intérêt</Text>
          <Text style={styles.subtitle}>
            Sélectionnez les activités qui vous plaisent pour recevoir des suggestions adaptées à vos goûts !
          </Text>
        </View>

        {displayError && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#EF476F" />
            <Text style={styles.errorText}>{displayError}</Text>
          </View>
        )}

        {/* Grille de Chips / Tags */}
        <View style={styles.tagsGrid}>
          {availableTags.map((tag) => {
            const isSelected = selectedTagIds.includes(tag.id_tag);
            return (
              <TouchableOpacity
                key={tag.id_tag}
                style={[styles.tagChip, isSelected && styles.selectedTagChip]}
                onPress={() => toggleTag(tag.id_tag)}
                activeOpacity={0.7}
              >
                {isSelected && (
                  <Ionicons name="checkmark" size={16} color="#FFF" style={styles.checkIcon} />
                )}
                <Text style={[styles.tagText, isSelected && styles.selectedTagText]}>
                  #{tag.libelle}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bouton de confirmation */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.finishButton, isLoading && styles.disabledButton]}
            onPress={handleFinish}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.finishButtonText}>Finaliser mon inscription</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFF" />
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.hintText}>
            {selectedTagIds.length} sélectionné{selectedTagIds.length > 1 ? 's' : ''} • Vous pourrez modifier vos choix à tout moment
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 54 : 32,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  stepBadge: {
    color: '#FFD166',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#888888',
    marginTop: 6,
    lineHeight: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 71, 111, 0.15)',
    borderWidth: 1,
    borderColor: '#EF476F',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF476F',
    fontSize: 13,
    flex: 1,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 12,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333333',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  selectedTagChip: {
    backgroundColor: '#FF4D67',
    borderColor: '#FF4D67',
  },
  checkIcon: {
    marginRight: 6,
  },
  tagText: {
    color: '#DDD',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedTagText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  footer: {
    gap: 12,
    marginTop: 24,
    alignItems: 'center',
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF4D67',
    height: 50,
    width: '100%',
    borderRadius: 14,
  },
  disabledButton: {
    opacity: 0.6,
  },
  finishButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  hintText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
});
