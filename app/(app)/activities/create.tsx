import Button from "@/src/components/Button";
import Input from "@/src/components/Input";
import { auth } from "@/src/config/firebase";
import { createActivity } from "@/src/services/activity.service";
import { Place, searchPlaces } from "@/src/services/location.service";
import { ACTIVITY_CATEGORIES, ActivityCategory } from "@/src/types/activity";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CreateActivityScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ActivityCategory>("cafe");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [placeQuery, setPlaceQuery] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [maxParticipants, setMaxParticipants] = useState("4");
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  async function handleSearchPlaces() {
    if (!placeQuery.trim()) {
      Alert.alert("Erreur", "Entre un lieu à rechercher");
      return;
    }

    try {
      setLoadingPlaces(true);

      const results = await searchPlaces(placeQuery);

      setPlaces(results);

      if (results.length === 0) {
        Alert.alert("Info", "Aucun lieu trouvé");
      }
    } catch (error: any) {
      console.log("Erreur lieu :", error);
      Alert.alert("Erreur", "Impossible de rechercher le lieu");
    } finally {
      setLoadingPlaces(false);
    }
  }

  function handleSelectPlace(place: Place) {
    setSelectedPlace(place);
    setPlaceQuery(place.name);
    setPlaces([]);
  }

  function handleClearPlace() {
    setSelectedPlace(null);
    setPlaceQuery("");
    setPlaces([]);
  }

  async function handleCreateActivity() {
    if (!auth.currentUser) {
      Alert.alert("Erreur", "Utilisateur non connecté");
      return;
    }
    if (
      !title ||
      !description ||
      !date ||
      !time ||
      !selectedPlace ||
      !maxParticipants
    ) {
      Alert.alert("Erreur", "Remplis tous les champs");
      return;
    }

    const max = Number(maxParticipants);

    if (isNaN(max) || max < 2) {
      Alert.alert("Erreur", "Minimum 2 participantes");
      return;
    }
    try {
      const activityId = await createActivity({
        title,
        description,
        category,
        date,
        time,
        placeName: selectedPlace.name,
        placeAddress: selectedPlace.address,
        latitude: selectedPlace.latitude,
        longitude: selectedPlace.longitude,
        maxParticipants: max,
        creatorId: auth.currentUser.uid,
      });
      router.replace(`/activities/${activityId}`);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de créer l'activité");
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Bouton fermer */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.back()}
      >
        <Text style={styles.closeButtonText}>×</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Ajouter une activité</Text>

      <Input placeholder="Titre" value={title} onChangeText={setTitle} />

      <Input
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        style={styles.textArea}
      />

      <Text style={styles.label}>Catégorie</Text>

      <View style={styles.categoriesContainer}>
        {ACTIVITY_CATEGORIES.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.categoryButton,
              category === item && styles.categoryButtonActive,
            ]}
            onPress={() => setCategory(item)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                category === item && styles.categoryButtonTextActive,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Input
        placeholder="Date (JJ/MM/AAAA)"
        value={date}
        onChangeText={setDate}
      />
      <Input placeholder="Heure (19:30)" value={time} onChangeText={setTime} />
      <Text style={styles.label}>Lieu public</Text>
      <Input
        placeholder="Rechercher un lieu (ex: bowling Nantes)"
        value={placeQuery}
        onChangeText={setPlaceQuery}
      />
      <View style={styles.searchButton}>
        <Button
          title={loadingPlaces ? "Recherche..." : "Rechercher"}
          onPress={handleSearchPlaces}
        />
      </View>

      {selectedPlace && (
        <View style={styles.selectedPlaceBox}>
          <Text style={styles.selectedPlaceTitle}>Lieu sélectionné</Text>
          <Text style={styles.selectedPlaceName}>{selectedPlace.name}</Text>
          <Text style={styles.selectedPlaceAddress}>
            {selectedPlace.address}
          </Text>

          <TouchableOpacity onPress={handleClearPlace}>
            <Text style={styles.clearPlaceText}>Changer</Text>
          </TouchableOpacity>
        </View>
      )}

      {places.map((place) => (
        <TouchableOpacity
          key={place.id}
          style={styles.placeCard}
          onPress={() => handleSelectPlace(place)}
        >
          <Text style={styles.placeName}>{place.name}</Text>
          <Text style={styles.placeAddress}>{place.address}</Text>
        </TouchableOpacity>
      ))}

      <Input
        placeholder="Nombre max de participantes"
        value={maxParticipants}
        onChangeText={setMaxParticipants}
        keyboardType="numeric"
      />

      <View style={styles.createButton}>
        <Button title="Créer l'activité" onPress={handleCreateActivity} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f3ea",
  },
  content: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },

  closeButton: {
    position: "absolute",
    top: 48,
    right: 20,
    zIndex: 10,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 30,
    color: "#16245c",
    fontWeight: "700",
  },

  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#16245c",
    marginBottom: 20,
  },

  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#16245c",
    marginBottom: 10,
  },

  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },

  categoryButton: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },

  categoryButtonActive: {
    backgroundColor: "#e84478",
  },

  categoryButtonText: {
    color: "#16245c",
  },

  categoryButtonTextActive: {
    color: "#ffffff",
  },

  searchButton: {
    marginBottom: 16,
  },

  placeCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },

  placeName: {
    fontWeight: "700",
    color: "#16245c",
  },

  placeAddress: {
    color: "#666",
  },

  selectedPlaceBox: {
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
  },

  selectedPlaceTitle: {
    fontSize: 12,
    color: "#777",
  },

  selectedPlaceName: {
    fontWeight: "700",
    color: "#16245c",
  },

  selectedPlaceAddress: {
    color: "#666",
  },

  clearPlaceText: {
    color: "#e84478",
    marginTop: 8,
  },

  createButton: {
    marginTop: 20,
  },
});
