import { auth } from "@/src/config/firebase";
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { router } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { signOut } from "firebase/auth";
import { View } from "react-native";

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
    <View style={{ flex: 1, paddingBottom: 40 }}>
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <DrawerItem label="Se déconnecter" onPress={logout} />
    </View>
  );
}

export default function AppLayout() {
  return (
    <Drawer drawerContent={(props) => <CustomDrawerContent {...props} />}>
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
        name="complete-profile"
        options={{
          title: "Compléter le profil",
          drawerItemStyle: { display: "none" },
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
