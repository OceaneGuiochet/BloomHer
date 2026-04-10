import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { useEffect, useState } from "react";
import * as Location from "expo-location";
import { auth } from "@/src/config/firebase";
import { getUserById, updateUserProfile } from "@/src/services/user.service";

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

function isValidBirthDate(value: string) {
  const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
  return regex.test(value);
}

function calculateAge(birthDate: string) {
  if (!birthDate) return "";

  const [day, month, year] = birthDate.split("/").map(Number);
  const today = new Date();
  const birth = new Date(year, month - 1, day);

  if (isNaN(birth.getTime())) return "";

  let age = today.getFullYear() - birth.getFullYear();

  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() &&
      today.getDate() >= birth.getDate());

  if (!hasHadBirthdayThisYear) {
    age--;
  }

  return String(age);
}

export default function Profile() {
  const [firstname, setFirstname] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [bio, setBio] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    async function loadUser() {
      if (!auth.currentUser) return;

      const data = await getUserById(auth.currentUser.uid);

      if (!data) return;

      setFirstname(data.firstname || "");
      setBirthDate(data.birthDate || "");
      setBio(data.bio || "");
      setPhotos(data.photos || []);
    }

    loadUser();
  }, []);

  async function getUserLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Erreur", "Permission localisation refusée");
      return null;
    }

    const location = await Location.getCurrentPositionAsync({});

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  }

  function refreshPhotos() {
    setPhotos(generateRandomPhotos());
  }

  async function saveProfile() {
    if (!auth.currentUser) {
      Alert.alert("Erreur", "Utilisateur introuvable");
      return;
    }

    if (!firstname || !birthDate) {
      Alert.alert("Erreur", "Remplis les champs obligatoires");
      return;
    }

    if (!isValidBirthDate(birthDate)) {
      Alert.alert("Erreur", "Entre une date au format JJ/MM/AAAA");
      return;
    }

    const location = await getUserLocation();
    if (!location) return;

    await updateUserProfile(
      auth.currentUser.uid,
      firstname,
      birthDate,
      bio,
      photos,
      location.latitude,
      location.longitude
    );

    Alert.alert("Succès", "Profil mis à jour");
  }

  return (
    <View>
      <Text>Mon profil</Text>

      <TextInput
        placeholder="Prénom"
        value={firstname}
        onChangeText={setFirstname}
      />

      <TextInput
        placeholder="Date de naissance (JJ/MM/AAAA)"
        value={birthDate}
        onChangeText={setBirthDate}
        keyboardType="numeric"
      />

      <Text>Âge : {calculateAge(birthDate) || "-"}</Text>

      <TextInput
        placeholder="Bio"
        value={bio}
        onChangeText={setBio}
      />

      <Text style={{ marginTop: 20 }}>Mes photos</Text>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
        {photos.map((photo, index) => (
          <Image
            key={index}
            source={{ uri: photo }}
            style={{ width: 100, height: 100 }}
          />
        ))}
      </View>

      <TouchableOpacity onPress={refreshPhotos}>
        <Text>Changer mes photos</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={saveProfile}>
        <Text>Enregistrer</Text>
      </TouchableOpacity>
    </View>
  );
}