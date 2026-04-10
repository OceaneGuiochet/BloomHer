import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import * as Location from "expo-location";
import { auth } from "@/src/config/firebase";
import { getUserById, updateUserProfile } from "@/src/services/user.service";
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
      location.longitude,
    );

    Alert.alert("Succès", "Profil mis à jour");
  }

  return (
    <View style={styles.container}>
      <Card>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={true}
        >
          <Text style={styles.title}>Mon profil</Text>

          <View style={styles.form}>
            <Input
              placeholder="Prénom"
              value={firstname}
              onChangeText={setFirstname}
            />

            <Input
              placeholder="Date de naissance (JJ/MM/AAAA)"
              value={birthDate}
              onChangeText={setBirthDate}
              keyboardType="numeric"
            />

            <View style={styles.ageBox}>
              <Text style={styles.ageLabel}>Âge</Text>
              <Text style={styles.ageValue}>
                {calculateAge(birthDate) || "-"}
              </Text>
            </View>

            <Input
              placeholder="Bio"
              value={bio}
              onChangeText={setBio}
              multiline
              style={styles.bioInput}
            />

            <Text style={styles.sectionTitle}>Mes photos</Text>

            <View style={styles.photosContainer}>
              {photos.map((photo, index) => (
                <Image
                  key={index}
                  source={{ uri: photo }}
                  style={styles.photo}
                />
              ))}

              <TouchableOpacity style={styles.addPhoto} onPress={refreshPhotos}>
                <Text style={styles.addPhotoText}>+</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.saveButton}>
              <Button title="Enregistrer" onPress={saveProfile} />
            </View>
          </View>
        </ScrollView>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f3ea",
    padding: 20,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 30,
  },
  title: {
    fontSize: 42,
    fontWeight: "900",
    color: "#16245c",
    textAlign: "center",
    marginBottom: 25,
  },
  form: {
    width: "100%",
  },
  ageBox: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#f1dede",
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  ageLabel: {
    fontSize: 13,
    color: "#777",
    marginBottom: 4,
  },
  ageValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#16245c",
  },
  bioInput: {
    minHeight: 110,
    textAlignVertical: "top",
    paddingTop: 14,
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "700",
    color: "#16245c",
  },
  photosContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 18,
  },
  addPhoto: {
    width: 100,
    height: 100,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#f1dede",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  addPhotoText: {
    fontSize: 36,
    color: "#16245c",
    fontWeight: "300",
  },
  saveButton: {
    marginTop: 10,
  },
});