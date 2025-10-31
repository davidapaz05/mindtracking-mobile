import { Pressable, Text, StyleSheet, Animated } from "react-native";
import { useRef } from "react";

type Props = {
  title: string;
  onPress: () => void;
};

export default function ButtonBase2({ title, onPress }: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 120,
      useNativeDriver: false,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: false,
    }).start(() => onPress());
  };

  const bgColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", "rgba(12,74,110,0.2)"], // 20% opacidade
  });

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ width: "100%" }}
    >
      <Animated.View style={[styles.button, { backgroundColor: bgColor }]}>
        <Text style={styles.text}>{title}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: "#2563EA",
  },
  text: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    fontSize: 16,
  },
});
