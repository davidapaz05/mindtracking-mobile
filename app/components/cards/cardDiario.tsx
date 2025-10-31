import React from "react";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width, height } = Dimensions.get("window");

type DiarioType = {
  titulo: string;
  data: string;
  texto: string;
};

export default function CardDiario({ diario, onAnalyze }: { diario: DiarioType; onAnalyze?: () => void }) {
  const displayDate = (() => {
    if (diario.data && String(diario.data).trim().length > 0) return String(diario.data);
    try {
      return new Date().toLocaleString();
    } catch (e) {
      return String(diario.data ?? "");
    }
  })();

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{diario.titulo}</Text>
        <Text style={styles.cardDate}>{displayDate}</Text>
      </View>

      <Text style={styles.cardText}>{diario.texto}</Text>

      <TouchableOpacity style={styles.button} onPress={onAnalyze} activeOpacity={0.8}>
        <View style={styles.iconBox}>
          <Image source={require("@assets/icons/analise.png")} style={styles.buttonIcon} />
        </View>
        <Text style={styles.buttonText}>Ver Análise</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: width * 0.05,
    marginTop: height * 0.01,
    borderWidth: 2.5,
    borderColor: "#2563EA",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: height * 0.01,
  },
  cardTitle: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: Math.max(width * 0.045, 15),
  },
  cardDate: {
    color: "#D8E9FF",
    fontSize: Math.max(width * 0.032, 12),
    fontFamily: "Inter_400Regular",
  },
  cardText: {
    color: "#fff",
    fontSize: Math.max(width * 0.038, 13),
    fontFamily: "Inter_400Regular",
    marginBottom: height * 0.015,
  },
  button: {
    backgroundColor: "#2563EA",
    borderRadius: 28,
    paddingVertical: height * 0.001,
    paddingHorizontal: width * 0.04,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    alignSelf: "flex-start",
    flexDirection: "row",
  },
  iconBox: {
    width: Math.max(width * 0.065, 22),
    height: Math.max(width * 0.07, 22),
    alignItems: "center",
    justifyContent: "center",
    marginRight: width * 0.02,
    marginTop: height * 0.01,
  },
  buttonIcon: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    tintColor: "#FFFFFF",
  },
  buttonText: {
    color: "#fff",
    fontSize: Math.max(width * 0.033, 13),
    fontFamily: "Inter_500Medium",
    marginLeft: 0,
    paddingRight: width * 0.01,
  },
});
