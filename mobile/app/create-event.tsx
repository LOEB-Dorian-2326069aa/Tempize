
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import EventDatePicker from "../components/EventDatePicker";

const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ??
  "http://localhost:3000/api/v1"
).replace(/\/$/, "");

const categories = [
  "Food & café",
  "Plein air",
  "Culture",
  "Sport",
  "Jeux",
  "Musique",
  "Autre",
];

export default function CreateEvent() {
  const [nom, setNom] = useState("");
  const [categorie, setCategorie] = useState("Food & café");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [debut, setDebut] = useState(() => {
    const d = new Date();
    d.setHours(14, 0, 0, 0);
    return d;
  });
  const [fin, setFin] = useState(() => {
    const d = new Date();
    d.setHours(16, 0, 0, 0);
    return d;
  });
  const [adresse, setAdresse] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [places, setPlaces] = useState("6");
  const [participation, setParticipation] = useState("Gratuit");
  const [visible, setVisible] = useState(true);
  const [acces, setAcces] = useState<"Libre" | "Sur validation">("Libre");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  // Connexion si aucun token n'est disponible
  const connecter = async (): Promise<string> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
        mot_de_passe: password,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.access_token) {
      throw new Error(
        Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message || "Identifiants incorrects."
      );
    }

    const token: string = data.access_token;
    await AsyncStorage.setItem("tempize_token", token);

    return token;
  };

  const publier = async () => {
    if (loading) return;

    setMessage("");
    setSuccess(false);

    if (
      !nom.trim() ||
      !description.trim() ||
      !adresse.trim() 
    ) {
      setMessage("Remplis tous les champs obligatoires.");
      return;
    }

    const nbPlaces = Number(places);

    if (
      !Number.isInteger(nbPlaces) ||
      nbPlaces < 2 ||
      nbPlaces > 1000
    ) {
      setMessage("Choisis entre 2 et 1000 places.");
      return;
    }

    const dateDebut = new Date(date);
    dateDebut.setHours(debut.getHours(), debut.getMinutes(), 0, 0);
    const dateFin = new Date(date);
    dateFin.setHours(fin.getHours(), fin.getMinutes(), 0, 0);

    if (
      !Number.isFinite(dateDebut.getTime()) ||
      !Number.isFinite(dateFin.getTime()) ||
      dateDebut <= new Date() ||
      dateFin <= dateDebut
    ) {
      setMessage("Vérifie la date et les horaires de l'événement.");
      return;
    }

    const lat = Number(latitude.replace(",", "."));
    const lon = Number(longitude.replace(",", "."));

    if (
      !latitude.trim() ||
      !longitude.trim() ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      setMessage("Renseigne des coordonnées GPS valides.");
      return;
    }

    setLoading(true);

    try {
      let token = await AsyncStorage.getItem("tempize_token");

      if (!token) {
        if (!email.trim() || !password) {
          throw new Error(
            "Renseigne ton email et ton mot de passe."
          );
        }

        token = await connecter();
      }

      const evenement = {
        titre: nom.trim(),
        description: description.trim(),
        adresse: adresse.trim(),
        latitude: lat,
        longitude: lon,
        date_debut: dateDebut.toISOString(),
        date_fin: dateFin.toISOString(),
        nb_places_max: nbPlaces,
        type_acces:
          acces === "Libre" ? "public" : "sur_validation",
        tag_ids: [],
      };

      const envoyer = (jwt: string) =>
        fetch(`${API_URL}/events`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify(evenement),
        });

      let response = await envoyer(token);

      // Reconnexion si le token n'est plus valable
      if (response.status === 401) {
        await AsyncStorage.removeItem("tempize_token");

        if (!email.trim() || !password) {
          throw new Error(
            "Session expirée. Reconnecte-toi pour publier."
          );
        }

        token = await connecter();
        response = await envoyer(token);
      }

      const result = await response.json();

      if (!response.ok) {
        const erreur = Array.isArray(result.message)
          ? result.message.join(", ")
          : result.message || "Impossible de créer l'événement.";

        throw new Error(`Erreur ${response.status} : ${erreur}`);
      }

      setSuccess(true);
      setMessage("Ton événement a été créé avec succès !");
    } catch (error) {
      setSuccess(false);
      setMessage(
        error instanceof Error
          ? error.message
          : "Impossible de contacter le serveur."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Créer un événement</Text>
      <Text style={styles.subtitle}>
        Organise une activité et rencontre de nouvelles personnes.
      </Text>

      <Text style={styles.label}>Nom de l'événement *</Text>
      <TextInput
        style={styles.input}
        placeholder="Café & nouvelles têtes"
        placeholderTextColor="#777"
        value={nom}
        onChangeText={setNom}
      />

      <Text style={styles.label}>Catégorie *</Text>
      <View style={styles.rowWrap}>
        {categories.map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setCategorie(item)}
            style={[
              styles.chip,
              categorie === item && styles.selected,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                categorie === item && styles.selectedText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Description *</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Décris ton événement..."
        placeholderTextColor="#777"
        value={description}
        onChangeText={setDescription}
        multiline
        textAlignVertical="top"
      />

      <Text style={styles.label}>Date de l'événement *</Text>

      <EventDatePicker
        mode="date"
        value={date}
        onChange={setDate}
      />

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>Heure de début *</Text>
          <EventDatePicker
            mode="time"
            value={debut}
            onChange={setDebut}
          />
        </View>

        <View style={styles.half}>
          <Text style={styles.label}>Heure de fin *</Text>
          <EventDatePicker
            mode="time"
            value={fin}
            onChange={setFin}
          />
        </View>
      </View>

      <Text style={styles.label}>Lieu et adresse *</Text>
      <TextInput
        style={styles.input}
        placeholder="Nom du lieu, rue, ville..."
        placeholderTextColor="#777"
        value={adresse}
        onChangeText={setAdresse}
      />

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>Latitude *</Text>
          <TextInput
            style={styles.input}
            placeholder="48.8566"
            placeholderTextColor="#777"
            value={latitude}
            onChangeText={setLatitude}
            keyboardType="numbers-and-punctuation"
          />
        </View>

        <View style={styles.half}>
          <Text style={styles.label}>Longitude *</Text>
          <TextInput
            style={styles.input}
            placeholder="2.3522"
            placeholderTextColor="#777"
            value={longitude}
            onChangeText={setLongitude}
            keyboardType="numbers-and-punctuation"
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>Places au total *</Text>
          <TextInput
            style={styles.input}
            value={places}
            onChangeText={setPlaces}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.half}>
          <Text style={styles.label}>Participation</Text>
          <TextInput
            style={styles.input}
            value={participation}
            onChangeText={setParticipation}
          />
        </View>
      </View>

      <View style={styles.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.switchTitle}>
            Visible par la communauté
          </Text>
          <Text style={styles.smallText}>
            Tout le monde peut voir cet événement.
          </Text>
        </View>

        <Switch
          value={visible}
          onValueChange={setVisible}
          trackColor={{
            false: "#444",
            true: "#FF4D67",
          }}
          thumbColor="#FFF"
        />
      </View>

      <Text style={styles.label}>Type d'accès *</Text>
      <View style={styles.rowWrap}>
        {(["Libre", "Sur validation"] as const).map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setAcces(item)}
            style={[
              styles.chip,
              acces === item && styles.selected,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                acces === item && styles.selectedText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Connexion Tempize</Text>
      <Text style={styles.smallText}>
        Si tu es déjà connecté, laisse ces champs vides.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Adresse email"
        placeholderTextColor="#777"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        placeholderTextColor="#777"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[
          styles.button,
          loading && styles.disabledButton,
        ]}
        onPress={publier}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <>
            <Ionicons
              name="calendar-outline"
              size={20}
              color="#FFF"
            />
            <Text style={styles.buttonText}>
              Créer l'événement
            </Text>
          </>
        )}
      </TouchableOpacity>

      {message !== "" && (
        <View
          style={[
            styles.messageBox,
            {
              borderColor: success ? "#4CAF50" : "#FF4D67",
            },
          ]}
        >
          <Text style={styles.messageText}>{message}</Text>
        </View>
      )}

      {success && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/(tabs)/events")}
        >
          <Text style={styles.backText}>
            Voir mes événements →
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  content: {
    padding: 20,
    paddingBottom: 50,
  },
  title: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "#999",
    fontSize: 14,
    marginBottom: 22,
  },
  label: {
    color: "#DDD",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 17,
  },
  input: {
    backgroundColor: "#1E1E1E",
    color: "#FFF",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    marginBottom: 5,
  },
  multiline: {
    height: 100,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  half: {
    flex: 1,
    minWidth: 0,
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: "#1E1E1E",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 25,
  },
  selected: {
    backgroundColor: "#40212D",
    borderColor: "#FF4D67",
  },
  chipText: {
    color: "#AAA",
    fontSize: 13,
  },
  selectedText: {
    color: "#FF4D67",
    fontWeight: "bold",
  },
  switchRow: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#333",
  },
  switchTitle: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  smallText: {
    color: "#888",
    fontSize: 12,
    marginTop: 5,
    marginBottom: 8,
  },
  sectionTitle: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "bold",
    marginTop: 28,
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#FF4D67",
    padding: 17,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 30,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  messageBox: {
    backgroundColor: "#1E1E1E",
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
  },
  messageText: {
    color: "#FFF",
    fontSize: 14,
    textAlign: "center",
  },
  backButton: {
    alignItems: "center",
    marginTop: 24,
  },
  backText: {
    color: "#FF4D67",
    fontSize: 15,
    fontWeight: "bold",
  },
});
