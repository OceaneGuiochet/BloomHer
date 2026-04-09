import { View, Text, TouchableOpacity } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../../src/config/firebase";
import { router } from "expo-router";

export default function HomeScreen() {
  async function logout() {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.log("Erreur logout :", error);
    }
  }

  return (
    <View>
      <Text>Bienvenue sur BloomHer</Text>

      <TouchableOpacity onPress={logout}>
        <Text>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}