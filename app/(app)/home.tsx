import { View, Text, TouchableOpacity, Image } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../../src/config/firebase";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { getUserById } from "@/src/services/user.service";

export default function HomeScreen() {
  const [user, setUser] = useState<any>(null);

  async function logout() {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.log("Erreur logout :", error);
    }
  }

  useEffect(() => {
    async function loadUser() {
      if (!auth.currentUser) return;

      const data = await getUserById(auth.currentUser.uid);
      setUser(data);
    }

    loadUser();
  }, []);

  return (
    <View>
      <Text>Bienvenue sur BloomHer</Text>

      <Text>{auth.currentUser?.email}</Text>

      {user ? (
        <View>
          <Text>{user.firstname}</Text>

          {user.photo ? (
            <Image
              source={{ uri: user.photo }}
              style={{ width: 100, height: 100 }}
            />
          ) : null}
        </View>
      ) : (
        <Text>Chargement...</Text>
      )}

      <TouchableOpacity onPress={logout}>
        <Text>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}