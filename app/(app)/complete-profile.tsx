import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import { auth } from "@/src/config/firebase";
import { completeUserProfile } from "@/src/services/user.service";
import { router } from "expo-router";

function generateRandomPhotos() {
  const count = Math.floor(Math.random() * 3) + 1;
  const usedIndexes = new Set<number>();
  const photos: string[] = [];

  while (photos.length < count) {
    const randomIndex = Math.floor(Math.random() * 100);

    if (!usedIndexes.has(randomIndex)) {
      usedIndexes.add(randomIndex);
      photos.push(
        `https://randomuser.me/api/portraits/women/${randomIndex}.jpg`
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
      location.longitude
    );

    router.replace("/(app)/home");
  }

  return (
    <View>
      <Text>Compléter mon profil</Text>

      <TextInput
        placeholder="Prénom"
        value={firstname}
        onChangeText={setFirstname}
      />

      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={{ marginTop: 20 }}
      >
        <Text>
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

      <Text style={{ marginTop: 20 }}>Photos attribuées automatiquement :</Text>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
        {photos.map((photo, i) => (
          <Image
            key={i}
            source={{ uri: photo }}
            style={{ width: 100, height: 100 }}
          />
        ))}
      </View>

      <TouchableOpacity onPress={saveProfile} style={{ marginTop: 20 }}>
        <Text>Valider</Text>
      </TouchableOpacity>
    </View>
  );
}