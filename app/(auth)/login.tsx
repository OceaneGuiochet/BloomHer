import { Link, router } from "expo-router";
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { loginWithEmail } from "../../src/services/auth.service";
import { auth } from "../../src/config/firebase";
import { getUserById } from "../../src/services/user.service";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function login() {
    try {
      await loginWithEmail(email, password);

      if (!auth.currentUser) {
        Alert.alert("Erreur", "Utilisateur introuvable");
        return;
      }

      const userProfile = await getUserById(auth.currentUser.uid);

      if (!userProfile || userProfile.isProfileComplete !== true) {
        router.replace("/complete-profile");
      } else {
        router.replace("/home");
      }
    } catch (error: any) {
      Alert.alert("Erreur", error.message ?? "Impossible de se connecter");
    }
  }

  return (
    <View>
      <Text>BloomHer</Text>
      <Text>Connexion</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity onPress={login}>
        <Text>Se connecter</Text>
      </TouchableOpacity>

      <Link href="/register">
        Pas encore de compte ? S&apos;inscrire
      </Link>
    </View>
  );
}