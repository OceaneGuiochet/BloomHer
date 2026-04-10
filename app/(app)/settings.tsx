import { View, Text, TouchableOpacity, Alert, TextInput } from "react-native";
import { useState } from "react";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { auth } from "@/src/config/firebase";

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
        oldPassword,
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      await updatePassword(auth.currentUser, newPassword);

      Alert.alert("Succès", "Mot de passe modifié avec succès");

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
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        Modifier le mot de passe
      </Text>

      <TextInput
        placeholder="Ancien mot de passe"
        secureTextEntry
        value={oldPassword}
        onChangeText={setOldPassword}
        style={{ borderBottomWidth: 1, marginBottom: 15 }}
      />

      <TextInput
        placeholder="Nouveau mot de passe"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        style={{ borderBottomWidth: 1, marginBottom: 15 }}
      />

      <TextInput
        placeholder="Confirmer le mot de passe"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={{ borderBottomWidth: 1, marginBottom: 20 }}
      />

      <TouchableOpacity onPress={changePassword}>
        <Text style={{ color: "blue" }}>Valider</Text>
      </TouchableOpacity>
    </View>
  );
}
