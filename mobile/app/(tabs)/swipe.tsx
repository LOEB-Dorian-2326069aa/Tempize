import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface EventItem {
  id: number;
  titre: string;
  tags: string[];
  distance: string;
  placesRestantes: number;
  date: string;
  organisateur: string;
  typeAcces: 'public' | 'sur_validation';
}

const INITIAL_EVENTS: EventItem[] = [
  {
    id: 1,
    titre: 'Soirée Jeux de Société & Cocktails 🎲',
    tags: ['Jeux de société', 'Bar', 'Rencontres'],
    distance: '1.2 km',
    placesRestantes: 4,
    date: 'Ce soir • 19h30',
    organisateur: 'Lucas M.',
    typeAcces: 'public',
  },
  {
    id: 2,
    titre: 'Session Running Parc de la Tête d’Or 🏃',
    tags: ['Sport', 'Running', 'Plein air'],
    distance: '2.5 km',
    placesRestantes: 8,
    date: 'Demain • 10h00',
    organisateur: 'Camille D.',
    typeAcces: 'public',
  },
  {
    id: 3,
    titre: 'Jam Session Musique Acoustique 🎸',
    tags: ['Musique', 'Concert', 'Art'],
    distance: '3.1 km',
    placesRestantes: 2,
    date: 'Vendredi • 20h30',
    organisateur: 'Alexandre P.',
    typeAcces: 'sur_validation',
  },
];

export default function SwipeScreen() {
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
      translateY.value = e.translationY;
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
      [-10, 0, 10],
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const likeBadgeStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateX.value, [20, SWIPE_THRESHOLD], [0, 1]);
    return { opacity };
  });

  const passBadgeStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateX.value, [-SWIPE_THRESHOLD, -20], [1, 0]);
    return { opacity };
  });

  const handleRewind = () => {
    if (lastSwiped) {
      setEvents((prev) => [lastSwiped, ...prev]);
      setLastSwiped(null);
    }
  };

  const currentEvent = events[0];

  return (
    <View style={styles.container}>
      {currentEvent ? (
        <View style={styles.deckContainer}>
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.card, animatedCardStyle]}>
              {/* Badge PASS */}
              <Animated.View style={[styles.badge, styles.passBadge, passBadgeStyle]}>
                <Text style={styles.passText}>PASSER</Text>
              </Animated.View>

              {/* Badge PARTICIPER */}
              <Animated.View style={[styles.badge, styles.likeBadge, likeBadgeStyle]}>
                <Text style={styles.likeText}>PARTICIPER</Text>
              </Animated.View>

              {/* Card Content */}
              <View style={styles.cardHeader}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeText}>
                    {currentEvent.typeAcces === 'public' ? '🔓 Accès Libre' : '⏳ Sur Validation'}
                  </Text>
                </View>
                <View style={styles.distanceBadge}>
                  <Ionicons name="location-sharp" size={14} color="#FFF" />
                  <Text style={styles.distanceText}>{currentEvent.distance}</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.title}>{currentEvent.titre}</Text>
                <Text style={styles.dateText}>📅 {currentEvent.date}</Text>
                <Text style={styles.organizerText}>Organisé par {currentEvent.organisateur}</Text>

                <View style={styles.tagsContainer}>
                  {currentEvent.tags.map((tag, i) => (
                    <View key={i} style={styles.tagPill}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Ionicons name="people" size={18} color="#FFD166" />
                <Text style={styles.spotsText}>
                  {currentEvent.placesRestantes} places restantes
                </Text>
              </View>
            </Animated.View>
          </GestureDetector>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="sparkles" size={64} color="#FF4D67" />
          <Text style={styles.emptyTitle}>Plus d'événements à proximité !</Text>
          <Text style={styles.emptySubtitle}>
            Revenez plus tard ou élargissez votre rayon de recherche.
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.rewindButton, !lastSwiped && styles.disabledButton]}
          disabled={!lastSwiped}
          onPress={handleRewind}
        >
          <Ionicons name="arrow-undo" size={24} color={lastSwiped ? '#FFD166' : '#555'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.dislikeButton]}
          onPress={() => handleSwipeComplete('left')}
        >
          <Ionicons name="close" size={32} color="#EF476F" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => handleSwipeComplete('right')}
        >
          <Ionicons name="heart" size={32} color="#06D6A0" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  deckContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: SCREEN_WIDTH * 0.9,
    height: '85%',
    backgroundColor: '#1E1E1E',
    borderRadius: 24,
    padding: 24,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  badge: {
    position: 'absolute',
    top: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    zIndex: 10,
  },
  passBadge: {
    right: 24,
    borderColor: '#EF476F',
    backgroundColor: 'rgba(239, 71, 111, 0.2)',
  },
  passText: {
    color: '#EF476F',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 1,
  },
  likeBadge: {
    left: 24,
    borderColor: '#06D6A0',
    backgroundColor: 'rgba(6, 214, 160, 0.2)',
  },
  likeText: {
    color: '#06D6A0',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    backgroundColor: '#2D2D2D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeText: {
    color: '#DDD',
    fontSize: 12,
    fontWeight: '600',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4D67',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  distanceText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  cardBody: {
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 30,
  },
  dateText: {
    fontSize: 14,
    color: '#AAA',
    fontWeight: '500',
  },
  organizerText: {
    fontSize: 13,
    color: '#888',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tagPill: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: '#FFD166',
    fontSize: 12,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    paddingTop: 16,
  },
  spotsText: {
    color: '#FFD166',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  emptyTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    width: '100%',
    paddingBottom: 10,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333',
  },
  rewindButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  dislikeButton: {
    borderColor: 'rgba(239, 71, 111, 0.4)',
  },
  likeButton: {
    borderColor: 'rgba(6, 214, 160, 0.4)',
  },
  disabledButton: {
    opacity: 0.4,
  },
});
