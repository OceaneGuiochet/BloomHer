import {
  View,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useState } from "react";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { auth } from "@/src/config/firebase";
import Card from "@/src/components/Card";
import Input from "@/src/components/Input";
import Button from "@/src/components/Button";

export default function Settings() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function changePassword() {
    if (!auth.currentUser || !auth.currentUser.email) {
      Alert.alert("Erreur", "Utilisateur non connecté");
      return;
    }
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Erreur", "Tous les champs sont obligatoires");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        oldPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      await updatePassword(auth.currentUser, newPassword);

      Alert.alert("Succès", "Mot de passe modifié");

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      if (error.code === "auth/wrong-password") {
        Alert.alert("Erreur", "Ancien mot de passe incorrect");
      } else {
        Alert.alert("Erreur", "Impossible de modifier le mot de passe");
      }
    }
  }

  return (
    <View style={styles.container}>
      <Card>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={true}
        >
          <Text style={styles.title}>Paramètres</Text>
          <Text style={styles.subtitle}>Gère ton compte BloomHer</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Compte</Text>

            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>
                {auth.currentUser?.email || "Email introuvable"}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sécurité</Text>

            <Text style={styles.sectionDescription}>
              Modifie ton mot de passe pour sécuriser ton compte.
            </Text>

            <Input
              placeholder="Ancien mot de passe"
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
            />

            <Input
              placeholder="Nouveau mot de passe"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <Input
              placeholder="Confirmer le mot de passe"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <View style={styles.button}>
              <Button title="Changer le mot de passe" onPress={changePassword} />
            </View>
          </View>
        </ScrollView>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f3ea",
    padding: 20,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#16245c",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#16245c",
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#f1dede",
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  infoLabel: {
    fontSize: 13,
    color: "#777",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#16245c",
  },
  button: {
    marginTop: 10,
  },
});