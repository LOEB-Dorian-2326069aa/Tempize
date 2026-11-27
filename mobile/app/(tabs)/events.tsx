
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ??
  "http://localhost:3000/api/v1"
).replace(/\/$/, "");

type Evenement = {
  id_evenement?: number;
  id?: number;
  titre: string;
  description?: string;
  adresse?: string;
  date_debut?: string;
  date_fin?: string;
  nb_places_max?: number;
  nb_inscrits?: number;
  type_acces?: string;
  image_url?: string;
};

export default function EventsScreen() {
  const [activeTab, setActiveTab] = useState<
    "joined" | "organized"
  >("organized");

  const [mesEvenements, setMesEvenements] = useState<Evenement[]>([]);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");

  // Charger les événements depuis NestJS
  const chargerEvenements = useCallback(async () => {
    setChargement(true);
    setErreur("");

    try {
      const token = await AsyncStorage.getItem("tempize_token");

      if (!token) {
        setMesEvenements([]);
        setErreur("Connecte-toi pour voir tes événements.");
        return;
      }

      const response = await fetch(
        `${API_URL}/events/my-events`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Session expirée. Reconnecte-toi."
            : `Erreur HTTP ${response.status}`
        );
      }

      const data = await response.json();

      const evenements = Array.isArray(data)
        ? data
        : Array.isArray(data.organises)
        ? data.organises
        : Array.isArray(data.organized)
        ? data.organized
        : Array.isArray(data.events)
        ? data.events
        : [];

      setMesEvenements(evenements);
    } catch (error) {
      setErreur(
        error instanceof Error
          ? error.message
          : "Impossible de charger les événements."
      );
    } finally {
      setChargement(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      chargerEvenements();
    }, [chargerEvenements])
  );

  // Formatage des dates
  const formaterDate = (date?: string) => {
    if (!date) return "DATE À DÉFINIR";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
      return "DATE INVALIDE";
    }

    return d
      .toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
      .toUpperCase();
  };

  const formaterHeure = (date?: string) => {
    if (!date) return "--:--";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
      return "--:--";
    }

    return d.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const modifierEvenement = (event: Evenement) => {
    Alert.alert(
      "Modifier l'événement",
      `L'édition de "${event.titre}" sera disponible lorsque la route de modification sera intégrée.`
    );
  };

  const publierActualite = (event: Evenement) => {
    Alert.alert(
      "Publier une actualité",
      `La publication d'actualités pour "${event.titre}" sera ajoutée prochainement.`
    );
  };

  // Carte d'événement
  const renderEvenement = (event: Evenement, index: number) => {
    const debut = formaterHeure(event.date_debut);
    const fin = formaterHeure(event.date_fin);

    const nombreInscrits =
      typeof event.nb_inscrits === "number"
        ? event.nb_inscrits
        : null;

    return (
      <View
        key={String(event.id_evenement ?? event.id ?? index)}
        style={styles.eventCard}
      >
        <View style={styles.cardContent}>
          {/* Image de l'événement */}
          <View style={styles.imageContainer}>
            {event.image_url ? (
              <Image
                source={{ uri: event.image_url }}
                style={styles.eventImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons
                  name="calendar-outline"
                  size={42}
                  color="#E18BBB"
                />
              </View>
            )}
          </View>

          {/* Informations */}
          <View style={styles.eventDetails}>
            <Text style={styles.eventDate}>
              {formaterDate(event.date_debut)}
              {" · "}
              {debut}–{fin}
            </Text>

            <Text
              style={styles.eventTitle}
              numberOfLines={2}
            >
              {event.titre}
            </Text>

            <Text
              style={styles.eventAddress}
              numberOfLines={2}
            >
              {event.adresse || "Adresse non renseignée"}
            </Text>

            <Text style={styles.eventPlaces}>
              {nombreInscrits !== null
                ? `${nombreInscrits} inscrits sur ${event.nb_places_max ?? "?"} places`
                : `${event.nb_places_max ?? "?"} places au total`}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => modifierEvenement(event)}
          >
            <Text style={styles.actionText}>
              Modifier
            </Text>

            <Ionicons
              name="arrow-up-outline"
              size={19}
              color="#E18BBB"
              style={{ transform: [{ rotate: "45deg" }] }}
            />
          </TouchableOpacity>

          <View style={styles.actionDivider} />

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => publierActualite(event)}
          >
            <Text
              style={styles.actionText}
              numberOfLines={1}
            >
              Publier une actualité
            </Text>

            <Ionicons
              name="chatbubble-outline"
              size={19}
              color="#E18BBB"
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Onglets */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "joined" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("joined")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "joined" && styles.activeTabText,
            ]}
          >
            Je Participe
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "organized" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("organized")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "organized" && styles.activeTabText,
            ]}
          >
            J'Organise
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "joined" ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="calendar-outline"
              size={54}
              color="#777"
            />

            <Text style={styles.emptyTitle}>
              Aucune sortie prévue pour l'instant
            </Text>

            <Text style={styles.emptySubtitle}>
              Découvre des événements et rejoins une activité !
            </Text>
          </View>
        ) : (
          <View style={styles.organizedContent}>
            {/* En-tête */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                J'organise
              </Text>

              {!chargement && (
                <Text style={styles.eventCount}>
                  {mesEvenements.length}{" "}
                  {mesEvenements.length > 1
                    ? "événements"
                    : "événement"}
                </Text>
              )}
            </View>

            {/* Liste */}
            {chargement ? (
              <ActivityIndicator
                size="large"
                color="#E18BBB"
                style={{ marginVertical: 35 }}
              />
            ) : erreur ? (
              <View style={styles.emptyState}>
                <Text style={styles.errorText}>
                  {erreur}
                </Text>

                <TouchableOpacity
                  onPress={chargerEvenements}
                >
                  <Text style={styles.retryText}>
                    Réessayer
                  </Text>
                </TouchableOpacity>
              </View>
            ) : mesEvenements.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="calendar-outline"
                  size={50}
                  color="#777"
                />

                <Text style={styles.emptyTitle}>
                  Aucun événement organisé
                </Text>

                <Text style={styles.emptySubtitle}>
                  Crée ton premier événement pour rencontrer
                  de nouvelles personnes.
                </Text>
              </View>
            ) : (
              mesEvenements.map(renderEvenement)
            )}

            {/* Bouton créer */}
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push("/create-event")}
            >
              <Ionicons
                name="add-circle-outline"
                size={22}
                color="#FFF"
              />

              <Text style={styles.createButtonText}>
                Créer un événement
              </Text>
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
    backgroundColor: "#171218",
  },

  tabSwitcher: {
    flexDirection: "row",
    backgroundColor: "#251D27",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 15,
    padding: 4,
  },

  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
  },

  activeTabButton: {
    backgroundColor: "#42303E",
  },

  tabText: {
    color: "#AFA4AC",
    fontSize: 14,
    fontWeight: "600",
  },

  activeTabText: {
    color: "#FFF",
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 45,
  },

  organizedContent: {
    gap: 18,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 4,
  },

  sectionTitle: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#FFF",
  },

  eventCount: {
    color: "#B4AAB4",
    fontSize: 15,
  },

  eventCard: {
    backgroundColor: "#261E27",
    borderRadius: 27,
    borderWidth: 1.5,
    borderColor: "#493748",
    overflow: "hidden",
  },

  cardContent: {
    flexDirection: "row",
    padding: 18,
    gap: 16,
    minHeight: 188,
  },

  imageContainer: {
    width: 128,
    height: 150,
    borderRadius: 17,
    overflow: "hidden",
  },

  eventImage: {
    width: "100%",
    height: "100%",
  },

  imagePlaceholder: {
    flex: 1,
    backgroundColor: "#3A2B39",
    justifyContent: "center",
    alignItems: "center",
  },

  eventDetails: {
    flex: 1,
    justifyContent: "center",
    gap: 8,
  },

  eventDate: {
    color: "#E18BBB",
    fontSize: 13,
    fontWeight: "800",
  },

  eventTitle: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "bold",
    lineHeight: 27,
  },

  eventAddress: {
    color: "#BDB2BC",
    fontSize: 15,
  },

  eventPlaces: {
    color: "#E18BBB",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 2,
  },

  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#493748",
    minHeight: 65,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 12,
  },

  actionButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 9,
    paddingVertical: 15,
  },

  actionText: {
    color: "#E18BBB",
    fontSize: 15,
    fontWeight: "500",
  },

  actionDivider: {
    height: 28,
    width: 1,
    backgroundColor: "#493748",
    marginHorizontal: 4,
  },

  createButton: {
    backgroundColor: "#FF4D67",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },

  createButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 45,
  },

  emptyTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },

  emptySubtitle: {
    color: "#AAA",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },

  errorText: {
    color: "#FF4D67",
    fontSize: 14,
    textAlign: "center",
  },

  retryText: {
    color: "#E18BBB",
    fontSize: 15,
    fontWeight: "bold",
  },
});
