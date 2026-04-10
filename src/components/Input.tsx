import { TextInput, StyleSheet } from "react-native";

export default function Input(props: any) {
  return (
    <TextInput
      {...props}
      placeholderTextColor="#8f8f8f"
      style={[styles.input, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    fontSize: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#f1dede",
  },
});