import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../src/config/firebase";
import { getUserById } from "../src/services/user.service";

export default function Index() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        setLoading(false);
        return;
      }

      const userProfile = await getUserById(user.uid);

      if (!userProfile || userProfile.isProfileComplete === false) {
        router.replace("/complete-profile");
      } else {
        router.replace("/home");
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return null;
}
