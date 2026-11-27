
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useLocalSearchParams,
  useFocusEffect,
} from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ??
  "http://localhost:3000/api/v1"
).replace(/\/$/, "");

type Evenement = {
  id_evenement: number;
  titre: string;
  adresse?: string;
  description?: string;
  date_debut?: string;
  date_fin?: string;
  nb_places_max?: number;
  nb_inscrits?: number;
  image_url?: string;
  type_acces?: string;
};

type Actualite = {
  id_annonce: number;
  id_evenement: number;
  id_organisateur: number;
  contenu: string;
  date_publication: string;
};

async function lireReponse(response: Response) {
  const texte = await response.text();

  try {
    return JSON.parse(texte);
  } catch {
    return { message: texte };
  }
}

function erreurAPI(data: any, fallback: string) {
  if (Array.isArray(data?.message)) {
    return data.message.join(", ");
  }

  return typeof data?.message === "string"
    ? data.message
    : fallback;
}

function formaterDate(value?: string) {
  if (!value) return "Date à définir";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date indisponible";
  }

  return date.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formaterHeure(value?: string) {
  if (!value) return "--:--";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formaterPublication(value?: string) {
  if (!value) return "Date indisponible";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date indisponible";
  }

  return date.toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function lireActualite(contenu: string) {
  const separation = contenu.indexOf("\n\n");

  if (separation === -1) {
    return {
      titre: "",
      message: contenu,
    };
  }

  return {
    titre: contenu.slice(0, separation),
    message: contenu.slice(separation + 2),
  };
}

export default function ManageEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { width } = useWindowDimensions();

  const isDesktop = width >= 900;
  const isTablet = width >= 600 && width < 900;
  const isMobile = width < 600;

  const [evenement, setEvenement] =
    useState<Evenement | null>(null);

  const [actualites, setActualites] =
    useState<Actualite[]>([]);

  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");

  const [chargement, setChargement] = useState(true);
  const [publication, setPublication] = useState(false);

  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");

  const charger = useCallback(
    async (estActif: () => boolean = () => true) => {
      if (!id || !/^\d+$/.test(id)) {
        if (estActif()) {
          setErreur("Identifiant d'événement invalide.");
          setChargement(false);
        }
        return;
      }

      setChargement(true);
      setErreur("");

      try {
        const token = await AsyncStorage.getItem(
          "tempize_token"
        );

        if (!token) {
          throw new Error(
            "Tu dois être connecté pour gérer cet événement."
          );
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [eventResponse, actusResponse] =
          await Promise.all([
            fetch(`${API_URL}/events/${id}`, { headers }),
            fetch(`${API_URL}/announcements/event/${id}`, {
              headers,
            }),
          ]);

        const eventData = await lireReponse(eventResponse);
        const actusData = await lireReponse(actusResponse);

        if (!eventResponse.ok) {
          throw new Error(
            erreurAPI(
              eventData,
              "Impossible de charger l'événement."
            )
          );
        }

        if (!actusResponse.ok) {
          throw new Error(
            erreurAPI(
              actusData,
              "Impossible de charger les actualités."
            )
          );
        }

        if (!estActif()) return;

        setEvenement(eventData);

        const liste: Actualite[] = Array.isArray(actusData)
          ? actusData
          : Array.isArray(actusData?.annonces)
          ? actusData.annonces
          : [];

        setActualites(
          [...liste].sort(
            (a, b) =>
              new Date(b.date_publication).getTime() -
              new Date(a.date_publication).getTime()
          )
        );
      } catch (error) {
        if (estActif()) {
          setErreur(
            error instanceof Error
              ? error.message
              : "Une erreur est survenue."
          );
        }
      } finally {
        if (estActif()) {
          setChargement(false);
        }
      }
    },
    [id]
  );

  useFocusEffect(
    useCallback(() => {
      let actif = true;

      charger(() => actif);

      return () => {
        actif = false;
      };
    }, [charger])
  );

  const publier = async () => {
    if (publication || !evenement) return;

    setErreur("");
    setMessage("");

    const titreNettoye = titre.trim();
    const texteNettoye = contenu.trim();

    if (!texteNettoye) {
      setErreur("Renseigne le texte de ton actualité.");
      return;
    }

    const texteComplet = titreNettoye
      ? `${titreNettoye}\n\n${texteNettoye}`
      : texteNettoye;

    if (
      texteComplet.length < 3 ||
      texteComplet.length > 1000
    ) {
      setErreur(
        "L'actualité doit contenir entre 3 et 1000 caractères."
      );
      return;
    }

    setPublication(true);

    try {
      const token = await AsyncStorage.getItem(
        "tempize_token"
      );

      if (!token) {
        throw new Error(
          "Session expirée. Reconnecte-toi."
        );
      }

      const response = await fetch(
        `${API_URL}/announcements`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id_evenement: evenement.id_evenement,
            contenu: texteComplet,
          }),
        }
      );

      const data = await lireReponse(response);

      if (!response.ok) {
        throw new Error(
          erreurAPI(
            data,
            `Erreur HTTP ${response.status}`
          )
        );
      }

      setTitre("");
      setContenu("");

      setMessage("Ton actualité a été publiée !");

      const refresh = await fetch(
        `${API_URL}/announcements/event/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (refresh.ok) {
        const liste = await lireReponse(refresh);

        const nouvellesActualites: Actualite[] =
          Array.isArray(liste)
            ? liste
            : Array.isArray(liste?.annonces)
            ? liste.annonces
            : [];

        setActualites(
          [...nouvellesActualites].sort(
            (a, b) =>
              new Date(b.date_publication).getTime() -
              new Date(a.date_publication).getTime()
          )
        );
      } else {
        setMessage(
          "Actualité publiée ! L'historique sera actualisé à la prochaine ouverture."
        );
      }
    } catch (error) {
      setErreur(
        error instanceof Error
          ? error.message
          : "Impossible de publier l'actualité."
      );
    } finally {
      setPublication(false);
    }
  };

  if (chargement) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#E58BC4"
        />
        <Text style={styles.secondary}>
          Chargement de l'événement...
        </Text>
      </View>
    );
  }

  if (!evenement) {
    return (
      <View style={styles.center}>
        <Ionicons
          name="alert-circle-outline"
          size={42}
          color="#FF4D67"
        />

        <Text style={styles.errorText}>
          {erreur || "Événement introuvable."}
        </Text>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const resumeEvenement = (
    <View style={styles.eventCard}>
      <View
        style={[
          styles.eventRow,
          isMobile && styles.eventRowMobile,
        ]}
      >
        {evenement.image_url ? (
          <Image
            source={{ uri: evenement.image_url }}
            style={[
              styles.eventImage,
              isMobile && styles.eventImageMobile,
            ]}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.imageFallback,
              isMobile && styles.eventImageMobile,
            ]}
          >
            <Ionicons
              name="calendar-outline"
              size={34}
              color="#E58BC4"
            />
          </View>
        )}

        <View style={styles.eventDetails}>
          <Text style={styles.eventDate}>
            {formaterDate(
              evenement.date_debut
            ).toUpperCase()}
            {" · "}
            {formaterHeure(evenement.date_debut)}
            {"–"}
            {formaterHeure(evenement.date_fin)}
          </Text>

          <Text
            style={styles.eventTitle}
            numberOfLines={2}
          >
            {evenement.titre}
          </Text>

          <Text
            style={styles.eventAddress}
            numberOfLines={2}
          >
            {evenement.adresse ||
              "Adresse non renseignée"}
          </Text>

          <Text style={styles.eventPlaces}>
            {evenement.nb_inscrits !== undefined
              ? `${evenement.nb_inscrits} inscrits sur ${evenement.nb_places_max ?? "?"} places`
              : `${evenement.nb_places_max ?? "?"} places au total`}
          </Text>
        </View>
      </View>

      <View style={styles.addressRow}>
        <Ionicons
          name="location-outline"
          size={17}
          color="#B7A8B6"
        />

        <Text style={styles.addressText}>
          {evenement.adresse || "Lieu à définir"}
        </Text>
      </View>
    </View>
  );

  const boutonModifier = (
    <TouchableOpacity
      style={styles.editButton}
      onPress={() =>
        router.push({
          pathname: "/edit-event/[id]",
          params: {
            id: String(evenement.id_evenement),
          },
        })
      }
    >
      <Ionicons
        name="pencil-outline"
        size={20}
        color="#E58BC4"
      />

      <Text style={styles.editText}>
        Modifier l'événement
      </Text>
    </TouchableOpacity>
  );

  const blocInscrits = (
    <View style={styles.participantsSection}>
      <View style={styles.sectionHeaderCompact}>
        <Text style={styles.sectionTitle}>
          Les inscrits
        </Text>

        <Text style={styles.count}>
          {evenement.nb_inscrits !== undefined
            ? `${evenement.nb_inscrits} sur ${evenement.nb_places_max ?? "?"} places`
            : `${evenement.nb_places_max ?? "?"} places`}
        </Text>
      </View>

      <View style={styles.participantsCard}>
        <Ionicons
          name="people-outline"
          size={27}
          color="#E58BC4"
        />

        <View style={{ flex: 1, gap: 6 }}>
          <Text style={styles.participantsTitle}>
            {evenement.nb_inscrits !== undefined
              ? `${evenement.nb_inscrits} participations`
              : "Participations"}
          </Text>

          <Text style={styles.participantsDescription}>
            {evenement.nb_inscrits !== undefined &&
            evenement.nb_places_max !== undefined
              ? `${Math.max(
                  0,
                  evenement.nb_places_max -
                    evenement.nb_inscrits
                )} places encore disponibles`
              : "Consulte les informations de ton événement."}
          </Text>
        </View>
      </View>
    </View>
  );

  const formulaireActualite = (
    <View style={styles.publicationSection}>
      <Text style={styles.sectionTitle}>
        Publier une actualité
      </Text>

      <View style={styles.notice}>
        <Ionicons
          name="megaphone-outline"
          size={21}
          color="#E58BC4"
        />

        <View style={{ flex: 1 }}>
          <Text style={styles.noticeTitle}>
            Seul l'organisateur publie
          </Text>

          <Text style={styles.noticeText}>
            Partage une information importante avec les
            participants de ton événement.
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.formCard,
          isMobile && styles.formCardMobile,
        ]}
      >
        <View style={styles.audienceRow}>
          <Ionicons
            name="people-outline"
            size={19}
            color="#E58BC4"
          />

          <Text style={styles.audienceText}>
            Aux participants de l'événement
          </Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Titre de l'actualité
          </Text>

          <TextInput
            style={styles.input}
            value={titre}
            onChangeText={setTitre}
            placeholder="Ex. Notre rendez-vous de dimanche"
            placeholderTextColor="#817481"
            maxLength={120}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Ton actualité *
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.textarea,
              isDesktop && styles.textareaDesktop,
            ]}
            value={contenu}
            onChangeText={setContenu}
            multiline
            textAlignVertical="top"
            placeholder="Hâte de vous retrouver ! Voici les dernières informations..."
            placeholderTextColor="#817481"
          />
        </View>

        <View style={styles.draftRow}>
          <Text style={styles.draftText}>
            Brouillon · non publié
          </Text>

          <Text style={styles.draftText}>
            {(titre.trim()
              ? titre.trim().length + 2
              : 0) + contenu.trim().length}/1000
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.publishButton,
            publication && styles.disabledButton,
          ]}
          disabled={publication}
          onPress={publier}
        >
          {publication ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons
                name="megaphone-outline"
                size={20}
                color="#FFF"
              />

              <Text style={styles.publishText}>
                Publier l'actualité
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {erreur !== "" && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            {erreur}
          </Text>
        </View>
      )}

      {message !== "" && (
        <View style={styles.successBox}>
          <Ionicons
            name="checkmark-circle-outline"
            size={20}
            color="#8DE2AE"
          />

          <Text style={styles.successText}>
            {message}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        isMobile && styles.contentMobile,
        isTablet && styles.contentTablet,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* En-tête */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backCircle}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#FFF"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Gérer mon événement
        </Text>
      </View>

      {/* Introduction */}
      <View style={styles.introduction}>
        <Text style={styles.eyebrow}>
          J'ORGANISE
        </Text>

        <Text
          style={[
            styles.heading,
            isMobile && styles.headingMobile,
          ]}
        >
          Tout pour se retrouver.
        </Text>

        <Text style={styles.secondary}>
          Gère ton événement et tiens tes inscrits au courant.
        </Text>
      </View>

      {/* Grille principale */}
      <View
        style={[
          styles.mainGrid,
          isDesktop && styles.mainGridDesktop,
        ]}
      >
        {/* Colonne gauche */}
        <View style={styles.leftColumn}>
          {resumeEvenement}
          {boutonModifier}
          {blocInscrits}
        </View>

        {/* Colonne droite */}
        <View style={styles.rightColumn}>
          {formulaireActualite}
        </View>
      </View>

      {/* Historique des actualités */}
      <View style={styles.historySection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Déjà publiées
          </Text>

          <Text style={styles.count}>
            {actualites.length}{" "}
            {actualites.length === 1
              ? "actualité"
              : "actualités"}
          </Text>
        </View>

        {actualites.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={34}
              color="#AA8FA7"
            />

            <Text style={styles.secondary}>
              Aucune actualité publiée pour le moment.
            </Text>
          </View>
        ) : (
          <View
            style={[
              styles.announcementsGrid,
              isDesktop && styles.announcementsGridDesktop,
            ]}
          >
            {actualites.map((actu) => {
              const texte = lireActualite(actu.contenu);

              return (
                <View
                  key={actu.id_annonce}
                  style={[
                    styles.announcementCard,
                    isDesktop &&
                      styles.announcementCardDesktop,
                  ]}
                >
                  <View style={styles.authorRow}>
                    <View style={styles.avatar}>
                      <Ionicons
                        name="person"
                        size={18}
                        color="#95115F"
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.authorName}>
                        Organisateur
                      </Text>

                      <Text style={styles.publicationDate}>
                        {formaterPublication(
                          actu.date_publication
                        )}
                      </Text>
                    </View>
                  </View>

                  {texte.titre !== "" && (
                    <Text style={styles.announcementTitle}>
                      {texte.titre}
                    </Text>
                  )}

                  <Text style={styles.announcementBody}>
                    {texte.message}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#171218",
  },

  center: {
    flex: 1,
    backgroundColor: "#171218",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 24,
  },

  content: {
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 90,
  },

  contentMobile: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 60,
  },

  contentTablet: {
    paddingHorizontal: 24,
    paddingTop: 28,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 36,
  },

  backCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#453441",
    backgroundColor: "#281F29",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 17,
  },

  introduction: {
    gap: 7,
  },

  eyebrow: {
    color: "#E58BC4",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
  },

  heading: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 40,
  },

  headingMobile: {
    fontSize: 27,
    lineHeight: 35,
  },

  secondary: {
    color: "#B8AAB6",
    fontSize: 14,
    lineHeight: 22,
  },

  mainGrid: {
    flexDirection: "column",
    gap: 28,
    marginTop: 32,
    marginBottom: 42,
  },

  mainGridDesktop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 32,
  },

  leftColumn: {
    flex: 1,
    minWidth: 0,
    gap: 18,
  },

  rightColumn: {
    flex: 1.15,
    minWidth: 0,
  },

  eventCard: {
    backgroundColor: "#261E27",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#493747",
    padding: 20,
    gap: 18,
  },

  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },

  eventRowMobile: {
    gap: 12,
  },

  eventImage: {
    width: 110,
    height: 120,
    borderRadius: 14,
  },

  eventImageMobile: {
    width: 85,
    height: 105,
  },

  imageFallback: {
    width: 110,
    height: 120,
    borderRadius: 14,
    backgroundColor: "#3B2938",
    alignItems: "center",
    justifyContent: "center",
  },

  eventDetails: {
    flex: 1,
    minWidth: 0,
    gap: 8,
  },

  eventDate: {
    color: "#E58BC4",
    fontSize: 11,
    fontWeight: "800",
  },

  eventTitle: {
    color: "#FFF",
    fontSize: 19,
    fontWeight: "700",
    lineHeight: 26,
  },

  eventAddress: {
    color: "#B9ACB6",
    fontSize: 13,
    lineHeight: 19,
  },

  eventPlaces: {
    color: "#E58BC4",
    fontSize: 13,
    fontWeight: "700",
  },

  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#493747",
  },

  addressText: {
    color: "#B9ACB6",
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },

  editButton: {
    backgroundColor: "#352734",
    borderWidth: 1,
    borderColor: "#493747",
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },

  editText: {
    color: "#E58BC4",
    fontSize: 15,
    fontWeight: "700",
  },

  participantsSection: {
    marginTop: 14,
    gap: 14,
  },

  participantsCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#261E27",
    borderWidth: 1,
    borderColor: "#493747",
    borderRadius: 18,
    padding: 20,
  },

  participantsTitle: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },

  participantsDescription: {
    color: "#B9ACB6",
    fontSize: 13,
    lineHeight: 20,
  },

  sectionTitle: {
    color: "#FFF",
    fontSize: 21,
    fontWeight: "700",
    lineHeight: 28,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 20,
  },

  sectionHeaderCompact: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  count: {
    color: "#C994BA",
    fontSize: 13,
  },

  publicationSection: {
    gap: 18,
  },

  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: "#493747",
    backgroundColor: "#261E27",
    borderRadius: 16,
  },

  noticeTitle: {
    color: "#E58BC4",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },

  noticeText: {
    color: "#B9ACB6",
    fontSize: 13,
    lineHeight: 21,
  },

  formCard: {
    backgroundColor: "#261E27",
    borderWidth: 1,
    borderColor: "#493747",
    borderRadius: 20,
    padding: 24,
    gap: 20,
  },

  formCardMobile: {
    padding: 16,
    gap: 17,
  },

  fieldGroup: {
    gap: 9,
  },

  audienceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  audienceText: {
    color: "#E58BC4",
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
  },

  separator: {
    height: 1,
    backgroundColor: "#493747",
  },

  label: {
    color: "#C0B2BD",
    fontSize: 13,
    fontWeight: "500",
  },

  input: {
    color: "#FFF",
    backgroundColor: "#352936",
    borderWidth: 1,
    borderColor: "#504050",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 15,
  },

  textarea: {
    minHeight: 140,
    textAlignVertical: "top",
    lineHeight: 23,
  },

  textareaDesktop: {
    minHeight: 180,
  },

  draftRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  draftText: {
    color: "#A99CAA",
    fontSize: 12,
  },

  publishButton: {
    backgroundColor: "#A40C70",
    borderRadius: 13,
    paddingVertical: 18,
    paddingHorizontal: 20,
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  disabledButton: {
    opacity: 0.6,
  },

  publishText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
  },

  errorBox: {
    backgroundColor: "#40212D",
    borderColor: "#FF4D67",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },

  errorText: {
    color: "#FF9AAC",
    fontSize: 13,
    lineHeight: 20,
  },

  successBox: {
    backgroundColor: "#203629",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  successText: {
    color: "#8DE2AE",
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },

  historySection: {
    width: "100%",
    gap: 4,
  },

  announcementsGrid: {
    flexDirection: "column",
    gap: 16,
  },

  announcementsGridDesktop: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
  },

  announcementCard: {
    backgroundColor: "#261E27",
    borderWidth: 1,
    borderColor: "#493747",
    borderRadius: 20,
    padding: 24,
    gap: 16,
  },

  announcementCardDesktop: {
    width: "48%",
  },

  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F8E9F4",
    alignItems: "center",
    justifyContent: "center",
  },

  authorName: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },

  publicationDate: {
    color: "#A99CAA",
    fontSize: 12,
    marginTop: 4,
  },

  announcementTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 23,
  },

  announcementBody: {
    color: "#BFB3BE",
    fontSize: 14,
    lineHeight: 23,
  },

  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    padding: 32,
    borderWidth: 1,
    borderColor: "#493747",
    backgroundColor: "#261E27",
    borderRadius: 18,
  },

  link: {
    color: "#E58BC4",
    fontSize: 15,
    fontWeight: "700",
  },
});
