import { useRouter } from "expo-router";
import { useState } from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import ButtonBase from "../components/common/button/button";
import ButtonBase2 from "../components/common/button/button2";
import InputBase from "../components/common/input/inputBase";

const { width, height } = Dimensions.get("window");

export default function RegisterScreen1() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (!email || !password || !confirmPassword) {
      setError("Preencha todos os campos.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setError("");

    router.push({
      pathname: "/auth/registro2",
      params: {
        email,
        password,
        confirmarSenha: confirmPassword, // chave corrigida para o backend
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topo}>
        <Image source={require("../../assets/icons/logo.png")} style={styles.logo} resizeMode="contain" />
        <View style={styles.titulos}>
          <Text style={styles.title}>Vamos começar!</Text>
          <Text style={styles.subtitle}>O primeiro passo na sua jornada de autoconhecimento começa agora.</Text>
        </View>
      </View>

      <View style={styles.inputs}>
        <InputBase
          placeholder="Digite seu email"
          iconLeft="email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <InputBase
          iconLeft="senha"
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          eyeOpenIcon={require("@assets/icons/eye.png")}
          eyeClosedIcon={require("@assets/icons/eye-off.png")}
          secureTextEntry
        />
        <InputBase
          iconLeft="senha"
          placeholder="Confirme sua senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          eyeOpenIcon={require("@assets/icons/eye.png")}
          eyeClosedIcon={require("@assets/icons/eye-off.png")}
          secureTextEntry
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      <View style={styles.botoes}>
        <ButtonBase title="Próxima etapa" onPress={handleNext} disabled={loading} />
        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.orText}>Ou</Text>
          <View style={styles.line} />
        </View>
        <ButtonBase2 title="Já tem uma conta?" onPress={() => router.push("/auth/login")} />
      </View>
    </View>
  );
}

// mantenha seu styles igual ao código anterior



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    paddingHorizontal: width * 0.08,
    paddingVertical: height * 0.06,
    justifyContent: "center",
  },
  logo: {
    width: width * 0.22,
    height: height * 0.08,
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
    gap: height * 0.008,
  },
  botoes: {
    marginBottom: height * 0.01,
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
