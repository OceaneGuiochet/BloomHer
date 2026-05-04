import Button from "@/src/components/Button";
import { auth } from "@/src/config/firebase";
import { getActivityById, joinActivity } from "@/src/services/activity.service";
import { Activity } from "@/src/types/activity";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ActivityDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivity();
  }, [id]);

  async function loadActivity() {
    if (!id) {
      return;
    }
    try {
      setLoading(true);
      const data = await getActivityById(id);
      setActivity(data);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger l'activité");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinActivity() {
    if (!auth.currentUser || !activity) {
      return;
    }
    try {
      await joinActivity(activity.id, auth.currentUser.uid);
      Alert.alert("Succès", "Tu es inscrite à l'activité");
      await loadActivity();
    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Impossible de s'inscrire");
    }
  }
  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Chargement...</Text>
      </View>
    );
  }
  if (!activity) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Activité introuvable</Text>
      </View>
    );
  }

  const isAlreadyParticipant =
    auth.currentUser != null &&
    activity.participantIds.includes(auth.currentUser.uid);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.back()}
      >
        <Text style={styles.closeButtonText}>x</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{activity.title}</Text>

      <Text style={styles.info}>
        {activity.category} • {activity.date} • {activity.time}
      </Text>

      <Text style={styles.place}>{activity.placeName}</Text>
      <Text style={styles.address}>{activity.placeAddress}</Text>

      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.description}>{activity.description}</Text>

      <Text style={styles.sectionTitle}>Participantes</Text>
      <Text style={styles.participants}>
        {activity.participantIds.length} / {activity.maxParticipants}
      </Text>

      <View style={styles.buttonContainer}>
        <Button
          title={isAlreadyParticipant ? "Déjà inscrite" : "S'inscrire"}
          onPress={handleJoinActivity}
        />
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

  // ✅ Ajout uniquement ici
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
    fontSize: 30,
    fontWeight: "900",
    color: "#16245c",
    marginBottom: 10,
  },
  info: {
    color: "#666",
    fontSize: 15,
    marginBottom: 14,
  },
  place: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e84478",
    marginBottom: 4,
  },
  address: {
    color: "#666",
    lineHeight: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#16245c",
    marginBottom: 8,
    marginTop: 10,
  },
  description: {
    color: "#444",
    lineHeight: 22,
  },
  participants: {
    color: "#444",
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 24,
  },
  center: {
    flex: 1,
    backgroundColor: "#f8f3ea",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  message: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
  },
});
