
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import EventDatePicker from "../../components/EventDatePicker";

const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ??
  "http://localhost:3000/api/v1"
).replace(/\/$/, "");

type EventData = {
  id_evenement: number;
  titre: string;
  description: string;
  adresse: string;
  latitude: number | string;
  longitude: number | string;
  date_debut: string;
  date_fin: string;
  nb_places_max: number;
  type_acces: string;
  id_organisateur: number;
};

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [adresse, setAdresse] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [places, setPlaces] = useState("6");
  const [acces, setAcces] = useState<
    "Libre" | "Sur validation"
  >("Libre");

  const [date, setDate] = useState(new Date());
  const [debut, setDebut] = useState(new Date());
  const [fin, setFin] = useState(new Date());

  const [chargement, setChargement] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState(false);

  const chargerEvenement = useCallback(async () => {
    setChargement(true);
    setErreur("");

    try {
      const token = await AsyncStorage.getItem("tempize_token");

      if (!token) {
        throw new Error("Connecte-toi pour modifier cet événement.");
      }

      const response = await fetch(`${API_URL}/events/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Impossible de charger l'événement."
        );
      }

      const event = data as EventData;

      setNom(event.titre ?? "");
      setDescription(event.description ?? "");
      setAdresse(event.adresse ?? "");
      setLatitude(String(event.latitude ?? ""));
      setLongitude(String(event.longitude ?? ""));
      setPlaces(String(event.nb_places_max ?? 6));

      setAcces(
        event.type_acces === "public"
          ? "Libre"
          : "Sur validation"
      );

      const dateDebut = new Date(event.date_debut);
      const dateFin = new Date(event.date_fin);

      if (
        Number.isNaN(dateDebut.getTime()) ||
        Number.isNaN(dateFin.getTime())
      ) {
        throw new Error("Les dates de l'événement sont invalides.");
      }

      setDate(dateDebut);
      setDebut(dateDebut);
      setFin(dateFin);
    } catch (error) {
      setErreur(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue."
      );
    } finally {
      setChargement(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      chargerEvenement();
    } else {
      setErreur("Identifiant de l'événement manquant.");
      setChargement(false);
    }
  }, [id, chargerEvenement]);

  const enregistrer = async () => {
    if (enregistrement) return;

    setErreur("");
    setSucces(false);

    if (!nom.trim() || !description.trim() || !adresse.trim()) {
      setErreur("Remplis tous les champs obligatoires.");
      return;
    }

    if (nom.trim().length < 3 || nom.trim().length > 150) {
      setErreur("Le titre doit contenir entre 3 et 150 caractères.");
      return;
    }

    const nbPlaces = Number(places);
    const lat = Number(latitude.replace(",", "."));
    const lon = Number(longitude.replace(",", "."));

    if (!Number.isInteger(nbPlaces) || nbPlaces < 2 || nbPlaces > 1000) {
      setErreur("Choisis entre 2 et 1000 places.");
      return;
    }

    if (
      !latitude.trim() || !longitude.trim() ||
      !Number.isFinite(lat) || !Number.isFinite(lon) ||
      lat < -90 || lat > 90 ||
      lon < -180 || lon > 180
    ) {
      setErreur("Les coordonnées GPS sont invalides.");
      return;
    }

    const dateDebut = new Date(date);
    dateDebut.setHours(debut.getHours(), debut.getMinutes(), 0, 0);

    const dateFin = new Date(date);
    dateFin.setHours(fin.getHours(), fin.getMinutes(), 0, 0);

    if (
      Number.isNaN(dateDebut.getTime()) ||
      Number.isNaN(dateFin.getTime()) ||
      dateFin <= dateDebut
    ) {
      setErreur("L'heure de fin doit être après l'heure de début.");
      return;
    }

    setEnregistrement(true);

    try {
      const token = await AsyncStorage.getItem("tempize_token");

      if (!token) {
        throw new Error("Session expirée. Reconnecte-toi.");
      }

      const modifications = {
        titre: nom.trim(),
        description: description.trim(),
        adresse: adresse.trim(),
        latitude: lat,
        longitude: lon,
        date_debut: dateDebut.toISOString(),
        date_fin: dateFin.toISOString(),
        nb_places_max: nbPlaces,
        type_acces: acces === "Libre" ? "public" : "sur_validation",
      };

      const response = await fetch(`${API_URL}/events/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(modifications),
      });

      const result = await response.json();

      if (!response.ok) {
        const message = Array.isArray(result.message)
          ? result.message.join(", ")
          : result.message || "Impossible d'enregistrer.";

        throw new Error(`Erreur ${response.status} : ${message}`);
      }

      setSucces(true);

      // Retour vers les événements organisés
      router.replace("/(tabs)/events");
    } catch (error) {
      setErreur(
        error instanceof Error
          ? error.message
          : "Erreur de connexion au serveur."
      );
    } finally {
      setEnregistrement(false);
    }
  };

  if (chargement) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF4D67" />
        <Text style={styles.info}>Chargement de l'événement...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" color="#FFF" size={24} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Modifier l'événement</Text>
          <Text style={styles.subtitle}>
            Mets à jour les informations de ta sortie.
          </Text>
        </View>
      </View>

      {erreur !== "" && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{erreur}</Text>
        </View>
      )}

      <Text style={styles.label}>Nom de l'événement *</Text>
      <TextInput
        style={styles.input}
        value={nom}
        onChangeText={setNom}
        placeholder="Nom de l'événement"
        placeholderTextColor="#777"
        maxLength={150}
      />

      <Text style={styles.label}>Description *</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={description}
        onChangeText={setDescription}
        multiline
        textAlignVertical="top"
        placeholderTextColor="#777"
        placeholder="Description"
      />

      <Text style={styles.label}>Date de l'événement *</Text>
      <EventDatePicker
        mode="date"
        value={date}
        onChange={setDate}
      />

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>Début *</Text>
          <EventDatePicker
            mode="time"
            value={debut}
            onChange={setDebut}
          />
        </View>

        <View style={styles.half}>
          <Text style={styles.label}>Fin *</Text>
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
        value={adresse}
        onChangeText={setAdresse}
        placeholder="Adresse de l'événement"
        placeholderTextColor="#777"
      />

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>Latitude *</Text>
          <TextInput
            style={styles.input}
            value={latitude}
            onChangeText={setLatitude}
            keyboardType="numbers-and-punctuation"
            placeholderTextColor="#777"
          />
        </View>

        <View style={styles.half}>
          <Text style={styles.label}>Longitude *</Text>
          <TextInput
            style={styles.input}
            value={longitude}
            onChangeText={setLongitude}
            keyboardType="numbers-and-punctuation"
            placeholderTextColor="#777"
          />
        </View>
      </View>

      <Text style={styles.label}>Nombre de places *</Text>
      <TextInput
        style={styles.input}
        value={places}
        onChangeText={setPlaces}
        keyboardType="number-pad"
      />

      <Text style={styles.label}>Type d'accès *</Text>
      <View style={styles.row}>
        {(["Libre", "Sur validation"] as const).map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.chip,
              acces === item && styles.chipSelected,
            ]}
            onPress={() => setAcces(item)}
          >
            <Text
              style={[
                styles.chipText,
                acces === item && styles.chipTextSelected,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.saveButton,
          enregistrement && { opacity: 0.5 },
        ]}
        onPress={enregistrer}
        disabled={enregistrement}
      >
        {enregistrement ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <>
            <Ionicons name="save-outline" size={21} color="#FFF" />
            <Text style={styles.saveText}>
              Enregistrer les modifications
            </Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
      >
        <Text style={styles.cancelText}>Annuler</Text>
      </TouchableOpacity>
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
    gap: 15,
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 24,
  },
  title: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#FFF",
  },
  subtitle: {
    color: "#AAA",
    fontSize: 13,
    marginTop: 5,
  },
  info: {
    color: "#AAA",
  },
  label: {
    color: "#DDD",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 9,
  },
  input: {
    backgroundColor: "#261E27",
    borderColor: "#493748",
    borderWidth: 1,
    borderRadius: 13,
    padding: 15,
    color: "#FFF",
    fontSize: 15,
  },
  multiline: {
    height: 110,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  half: {
    flex: 1,
    minWidth: 0,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#493748",
    backgroundColor: "#261E27",
  },
  chipSelected: {
    backgroundColor: "#40212D",
    borderColor: "#FF4D67",
  },
  chipText: {
    color: "#AAA",
    fontWeight: "600",
  },
  chipTextSelected: {
    color: "#FF4D67",
  },
  saveButton: {
    backgroundColor: "#FF4D67",
    borderRadius: 15,
    padding: 18,
    marginTop: 35,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  saveText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  cancelButton: {
    alignItems: "center",
    padding: 17,
    marginTop: 10,
  },
  cancelText: {
    color: "#AAA",
    fontSize: 15,
  },
  errorBox: {
    backgroundColor: "#40212D",
    borderColor: "#FF4D67",
    borderWidth: 1,
    padding: 14,
    borderRadius: 12,
  },
  errorText: {
    color: "#FF9AAC",
    fontSize: 14,
  },
});
