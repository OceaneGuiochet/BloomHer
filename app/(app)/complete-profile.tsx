import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { auth } from "@/src/config/firebase";
import { completeUserProfile } from "@/src/services/user.service";
import { router } from "expo-router";

export default function CompleteProfile() {
  const [firstname, setFirstname] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [photo, setPhoto] = useState("");

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  }

  async function saveProfile() {
    if (!firstname || !age || !city || !photo) {
      Alert.alert("Erreur", "Remplis tous les champs");
      return;
    }

    if (!auth.currentUser) {
      Alert.alert("Erreur", "Utilisateur introuvable");
      return;
    }

    await completeUserProfile(
      auth.currentUser.uid,
      firstname,
      Number(age),
      city,
      photo
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

      <TouchableOpacity onPress={pickImage}>
        <Text>Choisir une photo</Text>
      </TouchableOpacity>

      {photo ? <Image source={{ uri: photo }} style={{ width: 100, height: 100 }} /> : null}

      <TouchableOpacity onPress={saveProfile} disabled={!photo}>
        <Text>Valider</Text>
      </TouchableOpacity>
    </View>
  );
}