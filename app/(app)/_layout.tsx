import { auth } from "@/src/config/firebase";
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { router } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { signOut } from "firebase/auth";
import { View, StyleSheet, Text } from "react-native";

function CustomDrawerContent(props: any) {
  async function logout() {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.log("Erreur logout :", error);
    }
  }

  return (
    <View style={styles.drawerContainer}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>BloomHer</Text>
        </View>

        <View style={styles.menuSection}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <DrawerItem
          label="Se déconnecter"
          onPress={logout}
          labelStyle={styles.logoutLabel}
          style={styles.logoutItem}
        />
      </View>
    </View>
  );
}

export default function AppLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerTitle: "",
        headerTransparent: true,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: "transparent",
        },
        drawerStyle: styles.drawerStyle,
        drawerActiveTintColor: "#ffffff",
        drawerInactiveTintColor: "#666",
        drawerActiveBackgroundColor: "#e84478",
        drawerLabelStyle: styles.drawerLabel,
      }}
    >
      <Drawer.Screen
        name="home"
        options={{
          title: "Accueil",
        }}
      />

      <Drawer.Screen
        name="profile"
        options={{
          title: "Profil",
        }}
      />

      <Drawer.Screen
        name="settings"
        options={{
          title: "Paramètres",
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: "#f8f3ea",
  },
  scrollContent: {
    paddingTop: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  logo: {
    fontSize: 32,
    fontWeight: "900",
    color: "#16245c",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 15,
    color: "#666",
  },
  menuSection: {
    paddingHorizontal: 8,
  },
  footer: {
    paddingHorizontal: 12,
    paddingBottom: 30,
  },
  logoutItem: {
    borderRadius: 16,
    backgroundColor: "#fff",
  },
  logoutLabel: {
    color: "#e84478",
    fontWeight: "700",
    fontSize: 15,
  },
  drawerStyle: {
    backgroundColor: "#f8f3ea",
    width: 280,
  },
  drawerLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
});