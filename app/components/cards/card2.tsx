import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
// Aqui você define os 3 tipos de card
const variants = {
  diario: {
    icon: require("@assets/icons/diario.png"),
    title: "Seu Diário Emocional",
    subtitle: "Ultima vez usado 01/08 as 12h",
  },
  recomendacao: {
    icon: require("@assets/icons/recomendacoes.png"),
    title: "Recomendação",
    subtitle: "“As vezes, tudo que precisamos é...”",
  },
  apoio: {
    icon: require("@assets/icons/apoio.png"),
    title: "Precisa de apoio agora?",
    subtitle: "Ligue 180 (CVV) - Apoio 24h",
  },
};

type Props = {
  variant: keyof typeof variants; // garante que só aceita "diario" | "recomendacao" | "apoio"
  onPress?: () => void;
};

export default function InfoCard({ variant, onPress }: Props) {
  const { icon, title, subtitle } = variants[variant];

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <Image source={icon} style={styles.icon} resizeMode="contain" />

      <View style={styles.textWrapper}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    height: height*0.075,
    backgroundColor: "#29374F",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 24,
  },
  icon: {
    width: width * 0.07,
    height: height *0.04,
    marginRight: 22,
  },
  textWrapper: {
    flexDirection: "column",
    justifyContent: "center",
  },
  title: {
    fontSize: width* 0.04,
    fontFamily:"Inter_600SemiBold",
    color: "#fff",
    marginBottom: height*0.005,
  },
  subtitle: {
    fontSize: width*0.035,
    fontFamily:"Inter_500Medium",
    color: "#9199AA",
  },
});
