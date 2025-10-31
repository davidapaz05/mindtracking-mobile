import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Dimensions, StyleSheet, Text, View } from "react-native";
import { recoverPassword } from "../../service/passwordService";
import ButtonBase from "../components/common/button/button";
import InputBase from "../components/common/input/inputBase";

const { width, height } = Dimensions.get("window");

const API_BASE_URL = "http://44.220.11.145";

export default function Redefined1() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email) {
      Alert.alert("Erro", "Por favor, preencha o e-mail.");
      return;
    }
    setLoading(true);
    try {
      const resp = await recoverPassword(email);
      if (resp && resp.success) {
        router.push({ pathname: "/auth/confirm-code", params: { email: String(email), from: "recover" } });
      } else {
        Alert.alert("Erro", resp?.message || "Email não identificado");
      }
    } catch (err: any) {
      console.log("recuperar-senha error:", err?.message || err);
      Alert.alert("Erro", err?.message || "Email não identificado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Esta tela não tem header; apenas conteúdo central */}
      <View style={styles.topo}>
        <View style={styles.titulos}>
          <Text style={styles.title}>Recuperar senha</Text>
          <Text style={styles.subtitle}>Informe o email associado à sua conta. Enviaremos um código para ele.</Text>
        </View>
      </View>

      <InputBase
        placeholder="Digite seu email"
        iconLeft="email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <View style={styles.botoes}>
        <ButtonBase title={loading ? "Enviando..." : "Enviar código"} onPress={handleSend} disabled={loading} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    paddingHorizontal: width * 0.08,
    paddingVertical: height * 0.06,
    justifyContent: "center",
  },
  topo: {
    gap: height * 0.07,
    marginBottom: height * 0.02,
  },
  titulos: {
    gap: height * 0.008,
    alignItems: "center",
  },
  title: {
    fontSize: width * 0.08,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    fontFamily: "Inter_500Medium",
  },
  subtitle: {
    fontSize: width * 0.04,
    color: "#ffffffff",
    textAlign: "center",
    marginBottom: height * 0.03,
    fontFamily: "Inter_600SemiBold",
  },
  botoes: {
    marginTop: height * 0.03,
  },
});
