import { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";

type Props = {
  title: string;
  onPress: () => void | Promise<void>;
  disabled?: boolean;
};

export default function ButtonBase({ title, onPress, disabled = false }: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: false,
    }).start(() => {
      if (!disabled) onPress();
    });
  };

  const bgColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#2563EA", "#3B81F5"],
  });

  const borderColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", "#1D4ED7"],
  });

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ width: "100%" }}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.button,
          { backgroundColor: disabled ? "#374151" : (bgColor as any), borderColor: disabled ? "transparent" : (borderColor as any), opacity: disabled ? 0.7 : 1 },
        ]}
      >
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
    borderWidth: 4,
  },
  text: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    fontSize: 16,
  },
});
