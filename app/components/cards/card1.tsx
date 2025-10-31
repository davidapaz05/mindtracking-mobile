// FeatureCard.tsx
import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const variants = {
  checkin: {
    icon: require("@assets/icons/clipboard.png"),
    title: "Check-in\nDiário",
    subtitle: "Um momento para registrar suas emoções",
  },
  athena: {
    icon: require("@assets/icons/logo.png"),
    title: "Conversar\ncom Athena",
    subtitle: "Sua assistente para clareza mental",
  },
};

type Props = {
  variant: keyof typeof variants;
  done?: boolean;
  onPress?: () => void;
};

export default function FeatureCard({ variant, done = false, onPress }: Props) {
  const { icon, title, subtitle } = variants[variant];

  return (
    <TouchableOpacity
      style={[styles.card, done && styles.cardDone]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      {/* 🔥 Wrapper garante alinhamento dos ícones */}
      <View style={styles.iconWrapper}>
        <Image source={icon} style={styles.icon} resizeMode="contain" />
      </View>

      <View style={styles.textWrapper}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {done && (
        <View style={styles.centralizeContainer}>
          <View style={styles.overlay} />
          <Image
            source={require("@assets/icons/check.png")}
            style={styles.checkIcon}
            resizeMode="contain"
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    height: height * 0.225,
    backgroundColor: "#29374F",
    borderRadius: 16,
    paddingTop: height * 0.012,
    paddingLeft: width * 0.05,
    marginHorizontal: width * 0.015,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  cardDone: {
    borderWidth: 2,
    borderColor: "#16A34A",
  },

  /* 🔥 Wrapper para fixar altura do ícone */
  iconWrapper: {
    height: height * 0.07, // sempre a mesma altura
    justifyContent: "center",
    alignItems: "flex-start",
    marginBottom: height * 0.012,
  },
  icon: {
    width: width * 0.12,
    height: "75%",
  },

  textWrapper: {
    maxWidth: 124,
  },
  title: {
    fontSize: height * 0.02,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
    marginBottom: height * 0.01,
  },
  subtitle: {
    fontSize: height * 0.015,
    color: "#9199AA",
    fontFamily: "Inter_500Medium",
    marginBottom: height * 0.01,
  },

  centralizeContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 16,
  },
  checkIcon: {
    width: width * 0.12,
    height: height * 0.1,
  },
});
