import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
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

export default function Profile() {
  const [firstname, setFirstname] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    async function loadUser() {
      if (!auth.currentUser) return;

      const data = await getUserById(auth.currentUser.uid);

      if (!data) return;

      setFirstname(data.firstname || "");
      setAge(data.age ? String(data.age) : "");
      setCity(data.city || "");
      setBio(data.bio || "");
      setPhotos(data.photos || []);
    }

    loadUser();
  }, []);

  function refreshPhotos() {
    setPhotos(generateRandomPhotos());
  }

  async function saveProfile() {
    if (!auth.currentUser) {
      Alert.alert("Erreur", "Utilisateur introuvable");
      return;
    }

    if (!firstname || !age || !city || photos.length === 0) {
      Alert.alert("Erreur", "Remplis les champs obligatoires");
      return;
    }

    await updateUserProfile(
      auth.currentUser.uid,
      firstname,
      Number(age),
      city,
      bio,
      photos
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
        placeholder="Âge"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />

      <TextInput
        placeholder="Ville"
        value={city}
        onChangeText={setCity}
      />

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
            style={{ width: 100, height: 100, borderRadius: 10 }}
          />
        ))}
      </View>

      <TouchableOpacity onPress={refreshPhotos} style={{ marginTop: 20 }}>
        <Text>Changer mes photos</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={saveProfile} style={{ marginTop: 20 }}>
        <Text>Enregistrer</Text>
      </TouchableOpacity>
    </View>
  );
}