import ActivityMap from "@/src/components/ActivityMap";
import { getActivities } from "@/src/services/activity.service";
import { Activity } from "@/src/types/activity";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ActivitiesScreen() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<"list" | "map">("list");

  useFocusEffect(
    useCallback(() => {
      loadActivities();
    }, []),
  );

  async function loadActivities() {
    try {
      setLoading(true);
      const data = await getActivities();
      setActivities(data);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les activités");
    } finally {
      setLoading(false);
    }
  }

  function openActivity(id: string) {
    router.push(`/activities/${id}`);
  }

  function openCreateActivity() {
    router.push("/activities/create");
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activités</Text>

        <TouchableOpacity style={styles.addButton} onPress={openCreateActivity}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === "list" && styles.activeTabButton,
          ]}
          onPress={() => setSelectedTab("list")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "list" && styles.activeTabText,
            ]}
          >
            Liste
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === "map" && styles.activeTabButton,
          ]}
          onPress={() => setSelectedTab("map")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "map" && styles.activeTabText,
            ]}
          >
            Carte
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <Text style={styles.message}>Chargement...</Text>
        </View>
      ) : selectedTab === "list" ? (
        <ScrollView contentContainerStyle={styles.listContent}>
          {activities.length === 0 ? (
            <Text style={styles.message}>Aucune activité disponible</Text>
          ) : (
            activities.map((activity) => (
              <TouchableOpacity
                key={activity.id}
                style={styles.card}
                onPress={() => openActivity(activity.id)}
              >
                <Text style={styles.cardTitle}>{activity.title}</Text>

                <Text style={styles.cardInfo}>
                  {activity.category} • {activity.date} • {activity.time}
                </Text>

                <Text style={styles.cardPlace}>{activity.placeName}</Text>

                <Text style={styles.cardDescription} numberOfLines={2}>
                  {activity.description}
                </Text>

                <Text style={styles.cardParticipants}>
                  {activity.participantIds.length} / {activity.maxParticipants}{" "}
                  participantes
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      ) : (
        <View style={styles.mapContainer}>
          <ActivityMap activities={activities} onOpenActivity={openActivity} />

          {activities.length === 0 && (
            <View style={styles.mapOverlay}>
              <Text style={styles.mapOverlayTitle}>
                Aucune activité pour le moment
              </Text>
              <Text style={styles.mapOverlayText}>
                Les prochaines sorties apparaîtront ici dès qu’une utilisatrice
                en ajoutera une.
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f3ea",
    padding: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#16245c",
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e84478",
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginTop: -2,
  },
  tabs: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  activeTabButton: {
    backgroundColor: "#e84478",
  },
  tabText: {
    color: "#16245c",
    fontWeight: "600",
  },
  activeTabText: {
    color: "#ffffff",
  },
  listContent: {
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#16245c",
  },
  cardInfo: {
    marginTop: 6,
    color: "#666",
    fontSize: 14,
  },
  cardPlace: {
    marginTop: 8,
    color: "#e84478",
    fontWeight: "600",
  },
  cardDescription: {
    marginTop: 10,
    color: "#444",
    lineHeight: 20,
  },
  cardParticipants: {
    marginTop: 12,
    color: "#777",
    fontSize: 13,
  },
  mapContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
  },
  mapOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  mapOverlayTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
  },
  mapOverlayText: {
    color: "#ffffff",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
});
