import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import Verification from "../components/common/input/inputCode";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { sendRecoveryCode, verifyEmail } from "../../service/verifyService";
import ButtonBase from "../components/common/button/button";

const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [code, setCode] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const API_BASE_URL = "http://3.132.241.219";

  const handleVerify = async () => {
    const email = String(params.email || (await AsyncStorage.getItem("email")) || "");
    const codigo = code.join("").trim();
    if (!email || codigo.length === 0) {
      setError("Preencha o código enviado por email.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const resp = await verifyEmail(email, codigo);

      if (resp && resp.success) {
        if (resp && resp.success) {
  if (resp.token) {
    await AsyncStorage.setItem("token", String(resp.token));
  }
  // Redirecionamentos condicionais adicionais:
  if (resp.user && resp.user.questionario_inicial === false) {
    router.push("/auth/questionario");
  } else {
    const from = String(params.from || "register");
    if (from === "register") {
      router.push("/auth/welcome");
    } else if (from === "recover") {
      router.push({ pathname: "/auth/redefined2", params: { email: String(email), from: "recover" } });
    } else if (from === "change") {
      router.push({ pathname: "/auth/redefined2", params: { from: "change" } });
    } else {
      router.push("/auth/welcome");
    }
  }
}
      } else {
        const msg = String(resp?.message || "");
        const from = String(params.from || "register");
        const alreadyVerified = /já verificado|ja verificado|already verified/i.test(msg);
        if ((from === "recover" || from === "change") && alreadyVerified) {
          if (from === "recover") {
            router.push({ pathname: "/auth/redefined2", params: { email: String(email), from: "recover" } });
          } else {
            router.push({ pathname: "/auth/redefined2", params: { from: "change" } });
          }
        } else {
          setError(msg || "Código inválido");
        }
      }
    } catch (err: any) {

      const from = String(params.from || "register");
      const errMsg = err?.message || "Erro ao verificar código";
      const alreadyVerified = /já verificado|ja verificado|already verified/i.test(String(errMsg));
      if ((from === "recover" || from === "change") && alreadyVerified) {
        if (from === "recover") {
          router.push({ pathname: "/auth/redefined2", params: { email: String(email), from: "recover" } });
        } else {
          router.push({ pathname: "/auth/redefined2", params: { from: "change" } });
        }
        return;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // If user is changing password while logged in, send the verification code automatically
  useEffect(() => {
    let mounted = true;
    const trySendCodeForChange = async () => {
      const from = String(params.from || "");
      if (from !== "change") return;
      // if email param provided, use it; otherwise read from AsyncStorage
      const email = String(params.email || (await AsyncStorage.getItem("email")) || "");
      if (!email) {
        if (mounted) {

          router.replace("/auth/login");
        }
        return;
      }

      // don't resend if already sent
      if (codeSent) return;
      setSendingCode(true);
      try {
        const resp = await sendRecoveryCode(email);

        if (resp && resp.success) {
          if (mounted) {
            setCodeSent(true);

          }
        } else {
          if (mounted) {

          }
        }
      } catch (err: any) {

        if (mounted) {

        }
      } finally {
        if (mounted) setSendingCode(false);
      }
    };

    trySendCodeForChange();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.topo}>
        <Image
          source={require("../../assets/icons/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.titulos}>
          <Text style={styles.title}>Enviamos um código para seu e-mail</Text>
          <Text style={styles.subtitle}>
             Digite o código abaixo para confirmar sua identidade.
          </Text>
        </View>
      </View>
      <View style={styles.inputs}>
        <Verification code={code} setCode={setCode} />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

    

      <View style={styles.botoes}>
        <ButtonBase title={loading ? "Verificando..." : "Finalizar cadastro"} onPress={handleVerify} disabled={loading} />
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
    backgroundColor: "#3a3a3aff",
  },
  orText: {
    marginHorizontal: width * 0.08,
    color: "#ffffffff",
    fontFamily: "Inter_800ExtraBold",
    fontSize: width * 0.04,
  },
});
