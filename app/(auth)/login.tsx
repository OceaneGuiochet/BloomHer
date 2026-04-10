import { Link, router } from "expo-router";
import { useState } from "react";
import { View, Text, Alert, TouchableOpacity, StyleSheet } from "react-native";
import { loginWithEmail } from "../../src/services/auth.service";
import { auth } from "../../src/config/firebase";
import { getUserById } from "../../src/services/user.service";
import Card from "../../src/components/Card";
import Input from "../../src/components/Input";
import Button from "../../src/components/Button";

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

      let userProfile = await getUserById(auth.currentUser.uid);

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
    <View style={styles.container}>
      <Card>
        <View />
        <View style={styles.content}>
          <Text style={styles.title}>BloomHer</Text>
          <Text style={styles.subtitle}>Connexion</Text>
          <View style={styles.form}>
            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Input
              placeholder="Mot de passe"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Button title="Se connecter" onPress={login} />
          </View>

          <Link href="/register" asChild>
            <TouchableOpacity style={styles.registerButton}>
              <Text style={styles.registerText}>
                Pas encore de compte ? S&apos;inscrire
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#d9d8e3",
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 42,
    fontWeight: "900",
    color: "#16245c",
    textAlign: "center",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 25,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  registerButton: {
    marginTop: 20,
  },
  registerText: {
    color: "#16245c",
    fontWeight: "600",
    textAlign: "center",
  },
});
