import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/src/config/firebase";
import { getUserById } from "@/src/services/user.service";

export default function Index() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          router.replace("/login");
          return;
        }

        const userProfile = await getUserById(user.uid);

        if (!userProfile || userProfile.isProfileComplete !== true) {
          router.replace("/complete-profile");
          return;
        }
        router.replace("/home");
      } catch (error) {
        console.log("Erreur redirection :", error);
        router.replace("/login");
      }
    });

    return unsubscribe;
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#f8f3ea",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator size="large" color="#e84478" />
    </View>
  );
}