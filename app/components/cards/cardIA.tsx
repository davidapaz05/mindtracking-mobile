// components/CustomButton.tsx
import React from "react";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ViewStyle,
} from "react-native";

const { width, height } = Dimensions.get("window");

type Props = {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
};

export default function CustomButton({ title, onPress, style }: Props) {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: width * 0.65,
    height: height * 0.06,
    backgroundColor: "#29374F",
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#2544F4",
    justifyContent: "center",
    alignItems: "center",

    // 🔥 sombra moderna (iOS + Android)
    boxShadow: "0px 0px 12px 2px #2544F4",
  },

  text: {
    fontSize: height * 0.016,
    color: "#fff",
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    paddingHorizontal: width * 0.03,
  },
});
