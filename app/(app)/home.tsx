import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "@/src/config/firebase";
import { useEffect, useState } from "react";
import { likeUser } from "@/src/services/match.service";
import { getOtherUsers, getUserById } from "@/src/services/user.service";

function getDistanceApprox(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const dx = lat1 - lat2;
  const dy = lon1 - lon2;
  return Math.sqrt(dx * dx + dy * dy) * 111;
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

export default function Home() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const cardWidth = Dimensions.get("window").width * 0.88;

  useEffect(() => {
    async function loadProfiles() {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }

      const me = await getUserById(auth.currentUser.uid);
      const users = await getOtherUsers(auth.currentUser.uid);

      if (!me || me.latitude == null || me.longitude == null) {
        setProfiles([]);
        setLoading(false);
        return;
      }

      const filtered = users
        .map((user: any) => {
          if (user.latitude == null || user.longitude == null) return null;

          const distance = getDistanceApprox(
            me.latitude,
            me.longitude,
            user.latitude,
            user.longitude,
          );

          if (distance <= 50) {
            return {
              ...user,
              distance: Math.round(distance),
            };
          }
          return null;
        })
        .filter(Boolean);

      setProfiles(filtered as any[]);
      setLoading(false);
    }
    loadProfiles();
  }, []);

  const currentProfile = profiles[currentIndex];

  async function like() {
    if (!auth.currentUser || !currentProfile) return;

    const isMatch = await likeUser(auth.currentUser.uid, currentProfile.id);

    if (isMatch) {
      Alert.alert("Match", `Toi et ${currentProfile.firstname} avez match !`);
    }
    nextProfile();
  }

  function handlePass() {
    nextProfile();
  }

  function nextProfile() {
    setCurrentIndex((prev) => prev + 1);
    setPhotoIndex(0);
  }
  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }
  if (!currentProfile) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>Plus de profils</Text>
        <Text style={styles.emptyText}>Reviens plus tard</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <ScrollView
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.cardScrollContent}
        >
          {currentProfile.photos && currentProfile.photos.length > 0 ? (
            <View style={styles.imageSection}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(event) => {
                  const x = event.nativeEvent.contentOffset.x;
                  const index = Math.round(x / cardWidth);
                  setPhotoIndex(index);
                }}
                scrollEventThrottle={16}
              >
                {currentProfile.photos.map((photo: string, index: number) => (
                  <Image
                    key={index}
                    source={{ uri: photo }}
                    style={styles.photo}
                  />
                ))}
              </ScrollView>

              <View style={styles.pointsContainer}>
                {currentProfile.photos.map((_: any, index: number) => (
                  <View
                    key={index}
                    style={[
                      styles.point,
                      index === photoIndex && styles.pointActive,
                    ]}
                  />
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.noImage}>
              <Text style={styles.noImageText}>Pas de photo</Text>
            </View>
          )}

          <View style={styles.info}>
            <Text style={styles.name}>
              {currentProfile.firstname}, {calculateAge(currentProfile.birthDate)}
            </Text>
            <Text style={styles.city}>
              {currentProfile.distance == null
                ? "Distance inconnue"
                : currentProfile.distance < 1
                  ? "Moins de 1 km"
                  : `${currentProfile.distance} km`}
            </Text>
            <Text style={styles.bio}>
              {currentProfile.bio
                ? currentProfile.bio
                : "Pas de bio pour le moment"}
            </Text>
          </View>
        </ScrollView>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.passButton} onPress={handlePass}>
          <Image
            source={require("../../assets/images/close.png")}
            style={styles.icon}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.likeButton} onPress={like}>
          <Image
            source={require("../../assets/images/like.png")}
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f3ea",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 30,
  },
  center: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  card: {
    width: "88%",
    height: "70%",
    backgroundColor: "#ffffff",
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  cardScrollContent: {
    paddingBottom: 20,
  },
  imageSection: {
    position: "relative",
  },
  photo: {
    width: Dimensions.get("window").width * 0.88,
    height: 350,
    resizeMode: "cover",
  },
  noImage: {
    height: 350,
    backgroundColor: "#e7e3dc",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    color: "#666",
    fontSize: 16,
  },
  pointsContainer: {
    position: "absolute",
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  point: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.55)",
    marginHorizontal: 4,
  },
  pointActive: {
    width: 20,
    backgroundColor: "#ffffff",
  },
  info: {
    padding: 20,
    paddingTop: 18,
  },
  name: {
    fontSize: 26,
    fontWeight: "900",
    color: "#16245c",
  },
  city: {
    marginTop: 6,
    fontSize: 15,
    color: "#777",
  },
  bio: {
    marginTop: 12,
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 30,
    marginTop: 25,
  },
  passButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  likeButton: {
    width: 70,
    height: 70,
    borderRadius: 40,
    backgroundColor: "#faf8f7",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  icon: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
  emptyTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#16245c",
    textAlign: "center",
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});