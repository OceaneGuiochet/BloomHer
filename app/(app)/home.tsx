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
  lon2: number
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
            user.longitude
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
        <Text>Chargement...</Text>
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
        {currentProfile.photos && currentProfile.photos.length > 0 ? (
          <>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(event) => {
                const largeur = Dimensions.get("window").width * 0.88;
                const x = event.nativeEvent.contentOffset.x;
                const index = Math.round(x / largeur);
                setPhotoIndex(index);
              }}
              scrollEventThrottle={16}
            >
              {currentProfile.photos.map((photo: string, index: number) => (
                <Image
                  key={index}
                  source={{ uri: photo }}
                  style={{
                    width: 350,
                    height: 400,
                  }}
                />
              ))}
            </ScrollView>

            <View style={styles.pointsContainer}>
              {currentProfile.photos.map((_: any, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.point,
                    index === photoIndex && styles.pointActif,
                  ]}
                />
              ))}
            </View>
          </>
        ) : (
          <View style={styles.noImage}>
            <Text>Pas de photo</Text>
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
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={handlePass}>
          <Image
            source={require("../../assets/images/close.png")}
            style={styles.icon}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={like}>
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
    alignItems: "center",
    paddingTop: "5%",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "90%",
    height: "75%",
    backgroundColor: "#f6f6f6",
    borderRadius: 20,
    overflow: "hidden",
  },
  noImage: {
    height: 300,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
  },
  city: {
    color: "#666",
    marginTop: 4,
  },
  bio: {
    marginTop: 10,
  },
  pointsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  point: {
    width: 8,
    height: 8,
    backgroundColor: "#ccc",
    borderRadius: 4,
    margin: 3,
  },
  pointActif: {
    backgroundColor: "#7a1541",
  },
  actions: {
    flexDirection: "row",
    marginTop: 20,
    gap: 40,
  },
  icon: {
    width: 40,
    height: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  emptyText: {
    marginTop: 10,
  },
});