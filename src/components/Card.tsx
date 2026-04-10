import { View, StyleSheet } from "react-native";

export default function Card({
  children,
}: {
  children: React.ReactNode;
}) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    width: "100%",
    backgroundColor: "#f8f3ea",
    overflow: "hidden",
  },
});