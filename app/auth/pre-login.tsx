import { useRouter } from "expo-router";
import { useState } from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import ButtonBase from "../components/common/button/button";
import ButtonBase2 from "../components/common/button/button2";

const { width, height } = Dimensions.get("window");

export default function PreLogin() {
  const router = useRouter();

  // estados da senha
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!password || !confirmPassword) {
      setError("Preencha todos os campos.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setError("");
   
    router.push("/auth/registro1");
  };

  return (
    <View style={styles.container}>
      <View style={styles.topo}>
        <Image
          source={require("../../assets/icons/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.titulos}>
          <Text style={styles.title}>MindTracking</Text>
          <Text style={styles.subtitle}>
            Bem-estar começa com um passo. {"\n"}Dê o primeiro hoje!
          </Text>
        </View>
      </View>

      <View style={styles.botoes}>
        <ButtonBase title="Começar agora" onPress={() => router.push("/auth/registro1")} />

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.orText}>Ou</Text>
          <View style={styles.line} />
        </View>

        <ButtonBase2
          title="Já tenho uma conta"
          onPress={() => router.push("/auth/login")}
        />
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
  logo: {
    width: width * 0.42,
    height: height * 0.1,
    marginBottom: height * -0.03,
  },
  inputs: {
    justifyContent: "flex-start",
  },
  topo: {
    gap: height * 0.05,
    marginBottom: height * 0.02,
    alignItems: "center",
  },
  titulos: {
    gap: height * 0.02,
    marginBottom: height * 0.05,
  },
  botoes: {
    marginBottom: height * -0.09,
    gap: height * 0.001,
    paddingTop: 15,
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
    gap: height * 1,
    lineHeight: height * 0.04,
  },
  errorText: {
    color: "red",
    fontSize: width * 0.035,
    marginTop: 5,
    textAlign: "center",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#FFFFFF33",
  },
  orText: {
    marginHorizontal: width * 0.08,
    color: "#ffffffff",
    fontFamily: "Inter_800ExtraBold",
    fontSize: width * 0.04,
  },
});
