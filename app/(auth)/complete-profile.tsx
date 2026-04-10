import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import { auth } from "@/src/config/firebase";
import { completeUserProfile } from "@/src/services/user.service";
import { router } from "expo-router";
import Card from "@/src/components/Card";
import Input from "@/src/components/Input";
import Button from "@/src/components/Button";

function generateRandomPhotos() {
  const count = Math.floor(Math.random() * 3) + 1;
  const usedIndexes = new Set<number>();
  const photos: string[] = [];

  while (photos.length < count) {
    const randomIndex = Math.floor(Math.random() * 100);

    if (!usedIndexes.has(randomIndex)) {
      usedIndexes.add(randomIndex);
      photos.push(
        `https://randomuser.me/api/portraits/women/${randomIndex}.jpg`,
      );
    }
  }

  return photos;
}

function formatDate(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export default function CompleteProfile() {
  const [firstname, setFirstname] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date(2000, 0, 1));
  const [showPicker, setShowPicker] = useState(false);
  const [photos] = useState<string[]>(generateRandomPhotos());

  async function getUserLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Erreur", "Active la localisation");
      return null;
    }

    const location = await Location.getCurrentPositionAsync({});

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  }

  async function saveProfile() {
    if (!firstname || !birthDate) {
      Alert.alert("Erreur", "Remplis tous les champs");
      return;
    }

    if (!auth.currentUser) {
      Alert.alert("Erreur", "Utilisateur introuvable");
      return;
    }

    const location = await getUserLocation();
    if (!location) return;

    await completeUserProfile(
      auth.currentUser.uid,
      firstname,
      birthDate,
      photos,
      location.latitude,
      location.longitude,
    );

    router.replace("/(app)/home");
  }

  return (
    <View style={styles.container}>
      <Card>
        <View style={styles.content}>
          <Text style={styles.title}>BloomHer</Text>
          <Text style={styles.subtitle}>Compléter mon profil</Text>

          <View style={styles.form}>
            <Input
              placeholder="Prénom"
              value={firstname}
              onChangeText={setFirstname}
            />

            <TouchableOpacity
              onPress={() => setShowPicker(true)}
              style={styles.dateButton}
            >
              <Text style={styles.dateText}>
                {birthDate
                  ? `Date de naissance : ${birthDate}`
                  : "Choisir une date de naissance"}
              </Text>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                maximumDate={new Date()}
                onChange={(event, date) => {
                  setShowPicker(false);

                  if (date) {
                    setSelectedDate(date);
                    setBirthDate(formatDate(date));
                  }
                }}
              />
            )}

            <Text style={styles.photoLabel}>Photos</Text>

            <View style={styles.photoContainer}>
              {photos.map((photo, i) => (
                <Image key={i} source={{ uri: photo }} style={styles.photo} />
              ))}
            </View>

            <Button title="Valider" onPress={saveProfile} />
          </View>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#d9d8e3",
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 42,
    fontWeight: "900",
    color: "#16245c",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 25,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  dateButton: {
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "#f1dede",
    marginBottom: 14,
  },
  dateText: {
    color: "#555",
    fontSize: 15,
  },
  photoLabel: {
    marginTop: 10,
    marginBottom: 10,
    color: "#16245c",
    fontWeight: "600",
  },
  photoContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
});
