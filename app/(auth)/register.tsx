import { Link, router } from "expo-router";
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { registerWithEmail } from "../../src/services/auth.service";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function register() {
    try {
      await registerWithEmail(email, password);
      Alert.alert("Succès", "Compte créé avec succès");
      router.replace("/home");
    } catch (error: any) {
      Alert.alert("Erreur", error.message ?? "Impossible de créer le compte");
    }
  }

  return (
    <View>
      <Text>BloomHer</Text>
      <Text>Inscription</Text>

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

      <TouchableOpacity onPress={register}>
        <Text>Créer un compte</Text>
      </TouchableOpacity>

      <Link href="/login">Déjà un compte ? Se connecter</Link>
    </View>
  );
}
