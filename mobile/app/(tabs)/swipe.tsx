import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import BottomNav from '../../components/BottomNav';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface EventItem {
  id: number;
  titre: string;
  tags: string[];
  categorie: string;
  distance: string;
  placesRestantes: number;
  placesTotal: number;
  date: string;
  lieu: string;
  organisateur: string;
  typeAcces: 'public' | 'sur_validation';
  gratuit: boolean;
}

const INITIAL_EVENTS: EventItem[] = [
  {
    id: 1,
    titre: 'Pique-nique au canal',
    tags: ['Plein air', 'Gratuit'],
    categorie: 'PLEIN AIR',
    distance: '1.2 km',
    placesRestantes: 4,
    placesTotal: 12,
    date: 'SAM. 14 JUIN · 18:30',
    lieu: 'Canal Saint-Martin, Paris 10e',
    organisateur: 'Léa Martin',
    typeAcces: 'public',
    gratuit: true,
  },
  {
    id: 2,
    titre: 'Café & nouvelles têtes',
    tags: ['Culture', 'Gratuit'],
    categorie: 'CULTURE',
    distance: '0.8 km',
    placesRestantes: 6,
    placesTotal: 10,
    date: 'DIM. 15 JUIN · 10:30',
    lieu: 'Café des Arts, Paris 11e',
    organisateur: 'Marie D.',
    typeAcces: 'public',
    gratuit: true,
  },
  {
    id: 3,
    titre: 'Session Running Parc',
    tags: ['Sport', 'Plein air'],
    categorie: 'SPORT',
    distance: '2.5 km',
    placesRestantes: 8,
    placesTotal: 15,
    date: 'LUN. 16 JUIN · 07:00',
    lieu: 'Parc de la Villette, Paris 19e',
    organisateur: 'Camille R.',
    typeAcces: 'public',
    gratuit: true,
  },
];

const FilterPill = ({ label, active = false }: { label: string; active?: boolean }) => (
  <TouchableOpacity
    style={[styles.filterPill, active && styles.filterPillActive]}
    activeOpacity={0.75}
  >
    <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default function SwipeScreen() {
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [lastSwiped, setLastSwiped] = useState<EventItem | null>(null);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const handleSwipeComplete = (direction: 'left' | 'right') => {
    if (events.length === 0) return;
    const current = events[0];
    setLastSwiped(current);
    setEvents((prev) => prev.slice(1));
    translateX.value = 0;
    translateY.value = 0;
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.3;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withSpring(SCREEN_WIDTH * 1.5, {}, () => {
          runOnJS(handleSwipeComplete)('right');
        });
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-SCREEN_WIDTH * 1.5, {}, () => {
          runOnJS(handleSwipeComplete)('left');
        });
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-8, 0, 8],
    );
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const participerBadgeStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateX.value, [15, SWIPE_THRESHOLD * 0.75], [0, 1]);
    const scale = interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0.85, 1.05]);
    return {
      opacity,
      transform: [{ rotate: '-8deg' }, { scale }],
    };
  });

  const passerBadgeStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateX.value, [-SWIPE_THRESHOLD * 0.75, -15], [1, 0]);
    const scale = interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1.05, 0.85]);
    return {
      opacity,
      transform: [{ rotate: '8deg' }, { scale }],
    };
  });

  const handleRewind = () => {
    if (lastSwiped) {
      setEvents((prev) => [lastSwiped, ...prev]);
      setLastSwiped(null);
    }
  };

  const currentEvent = events[0];
  const nextEvent = events[1];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header avec logo */}
      <AppHeader showLogo city="Paris" />

      {/* Titre + sous-titre */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Moins de scroll.{'\n'}Plus de rencontres.</Text>
        <Text style={styles.heroSub}>Ton prochain bon moment est juste ici.</Text>
      </View>

      {/* Filtres */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersContent}
      >
        <FilterPill label="⚙ Filtres · 2" active />
        <FilterPill label="Ce week-end" />
        <FilterPill label="À 5 km" />
      </ScrollView>
      <TouchableOpacity style={styles.locationRow}>
        <Ionicons name="locate-outline" size={14} color={Colors.secondaire} />
        <Text style={styles.locationText}>Rayon &amp; localisation</Text>
      </TouchableOpacity>

      {/* Deck de cartes */}
      <View style={styles.deckWrapper}>
        {events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle-outline" size={64} color={Colors.contour} />
            <Text style={styles.emptyTitle}>Plus d'événements</Text>
            <Text style={styles.emptySubtitle}>
              Revenez plus tard ou élargissez votre rayon de recherche.
            </Text>
          </View>
        ) : (
          <View style={styles.cardContainer}>
            {/* Carte suivante (dessous) */}
            {nextEvent && (
              <View style={styles.cardBehind}>
                <View style={styles.cardImagePlaceholder} />
              </View>
            )}

            {/* Carte principale */}
            <GestureDetector gesture={panGesture}>
              <Animated.View style={[styles.card, animatedCardStyle]}>
                {/* Overlay central de feedback de swipe */}
                <View style={styles.centerBadgeOverlay} pointerEvents="none">
                  {/* Coeur (swipe droite - Participer) */}
                  <Animated.View style={[styles.centerIconCircle, styles.centerHeartCircle, participerBadgeStyle]}>
                    <Ionicons name="heart" size={38} color={Colors.prune} />
                  </Animated.View>

                  {/* Croix (swipe gauche - Passer) */}
                  <Animated.View style={[styles.centerIconCircle, styles.centerCrossCircle, passerBadgeStyle]}>
                    <Ionicons name="close" size={40} color={Colors.secondaire} />
                  </Animated.View>
                </View>

                {/* Image placeholder */}
                <View style={styles.cardImage}>
                  <View style={styles.categorieTag}>
                    <Text style={styles.categorieText}>{currentEvent.categorie}</Text>
                    {currentEvent.gratuit && (
                      <Text style={styles.categorieText}> · GRATUIT</Text>
                    )}
                  </View>
                  <View style={styles.distancePill}>
                    <Ionicons name="navigate" size={11} color={Colors.white} />
                    <Text style={styles.distanceText}>{currentEvent.distance}</Text>
                  </View>
                </View>

                {/* Infos de la carte */}
                <View style={styles.cardBody}>
                  <View>
                    <Text style={styles.cardDate}>{currentEvent.date}</Text>
                    <Text style={styles.cardTitle}>{currentEvent.titre}</Text>
                    <Text style={styles.cardLieu}>{currentEvent.lieu}</Text>
                  </View>

                  <View style={styles.cardFooter}>
                    <View style={styles.avatarRow}>
                      {[0, 1, 2].map((i) => (
                        <View key={i} style={[styles.avatar, { marginLeft: i > 0 ? -8 : 0 }]}>
                          <Ionicons name="person" size={12} color={Colors.secondaire} />
                        </View>
                      ))}
                    </View>
                    <Text style={styles.inscritsText}>
                      {currentEvent.placesTotal - currentEvent.placesRestantes} inscrits · {currentEvent.placesRestantes} places libres
                    </Text>
                  </View>
                </View>
              </Animated.View>
            </GestureDetector>
          </View>
        )}
      </View>

      {/* Boutons d'action */}
      {events.length > 0 && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.btnPasser}
            onPress={() => handleSwipeComplete('left')}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={20} color={Colors.secondaire} />
            <Text style={styles.btnPasserText}>Passer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnParticiper}
            onPress={() => handleSwipeComplete('right')}
            activeOpacity={0.8}
          >
            <Ionicons name="heart" size={20} color={Colors.white} />
            <Text style={styles.btnParticiperText}>Participer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Rewind */}
      <TouchableOpacity
        style={[styles.rewindRow, !lastSwiped && styles.rewindDisabled]}
        onPress={handleRewind}
        disabled={!lastSwiped}
      >
        <Ionicons name="refresh" size={16} color={lastSwiped ? Colors.prune : Colors.contour} />
        <Text style={[styles.rewindText, !lastSwiped && styles.rewindTextDisabled]}>
          Rewind verrouillé · <Text style={styles.rewindLink}>Découvrir Premium</Text>
        </Text>
      </TouchableOpacity>

      {/* Hint swipe */}
      <View style={styles.hintRow}>
        <Text style={styles.hintText}>← Glisse pour passer</Text>
        <Text style={styles.hintText}>Glisse pour participer →</Text>
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
  heroSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  heroTitle: {
    fontSize: Typography.screenTitle,
    fontWeight: Typography.bold,
    color: Colors.encre,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: Typography.body,
    color: Colors.secondaire,
    marginTop: 4,
  },
  filtersScroll: {
    maxHeight: 44,
    marginTop: Spacing.sm,
  },
  filtersContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.contour,
    backgroundColor: Colors.light.surface,
  },
  filterPillActive: {
    borderColor: Colors.prune,
    backgroundColor: `${Colors.prune}10`,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: Typography.medium,
    color: Colors.secondaire,
  },
  filterPillTextActive: {
    color: Colors.prune,
    fontWeight: Typography.bold,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  locationText: {
    fontSize: 13,
    color: Colors.secondaire,
    textDecorationLine: 'underline',
  },
  deckWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    marginVertical: 4,
  },
  cardContainer: {
    flex: 1,
    width: '100%',
    maxHeight: Math.min(SCREEN_HEIGHT * 0.48, 420),
    minHeight: 280,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadows.card,
    borderWidth: 1,
    borderColor: Colors.contour,
    flexDirection: 'column',
  },
  cardBehind: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.contour,
    transform: [{ scale: 0.95 }, { translateY: 4 }],
    opacity: 0.6,
    overflow: 'hidden',
  },
  cardImage: {
    flex: 1,
    backgroundColor: '#D9D1D6',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
  },
  cardImagePlaceholder: {
    flex: 1,
    backgroundColor: '#D9D1D6',
  },
  categorieTag: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },
  categorieText: {
    fontSize: Typography.meta,
    fontWeight: Typography.bold,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  distancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },
  distanceText: {
    fontSize: Typography.meta,
    fontWeight: Typography.bold,
    color: Colors.white,
  },
  cardBody: {
    paddingHorizontal: Spacing.md,
    paddingTop: 10,
    paddingBottom: Spacing.md,
    gap: 4,
    backgroundColor: Colors.light.surface,
  },
  cardDate: {
    fontSize: Typography.meta,
    fontWeight: Typography.bold,
    color: Colors.secondaire,
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: Typography.cardTitle,
    fontWeight: Typography.bold,
    color: Colors.encre,
    marginTop: 2,
    lineHeight: 24,
  },
  cardLieu: {
    fontSize: Typography.body,
    color: Colors.secondaire,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 6,
  },
  avatarRow: {
    flexDirection: 'row',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.contour,
    borderWidth: 1.5,
    borderColor: Colors.light.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inscritsText: {
    fontSize: Typography.body,
    color: Colors.secondaire,
  },
  centerBadgeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  centerIconCircle: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    ...Shadows.card,
  },
  centerHeartCircle: {
    borderColor: Colors.prune,
    shadowColor: Colors.prune,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  centerCrossCircle: {
    borderColor: Colors.secondaire,
    shadowColor: Colors.secondaire,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginTop: 6,
    marginBottom: 4,
  },
  btnPasser: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.contour,
    backgroundColor: Colors.light.surface,
  },
  btnPasserText: {
    fontSize: Typography.action,
    fontWeight: Typography.bold,
    color: Colors.encre,
  },
  btnParticiper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: Radius.md,
    backgroundColor: Colors.prune,
  },
  btnParticiperText: {
    fontSize: Typography.action,
    fontWeight: Typography.bold,
    color: Colors.white,
  },
  rewindRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
  },
  rewindDisabled: {
    opacity: 0.5,
  },
  rewindText: {
    fontSize: 12,
    color: Colors.secondaire,
  },
  rewindTextDisabled: {
    color: Colors.contour,
  },
  rewindLink: {
    color: Colors.prune,
    fontWeight: Typography.medium,
  },
  hintRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  hintText: {
    fontSize: Typography.meta,
    color: Colors.contour,
  },
  emptyContainer: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: Typography.bold,
    color: Colors.encre,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: Typography.body,
    color: Colors.secondaire,
    textAlign: 'center',
    lineHeight: 22,
  },
});
