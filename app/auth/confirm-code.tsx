import { Alert, BackHandler, Dimensions, Image, StyleSheet, Text, View } from "react-native";
import Verification from "../components/common/input/inputCode";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { login as loginService } from "../../service/loginService";
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

  const API_BASE_URL = "https://mindtracking-api-1.onrender.com";

  const isAlreadyVerifiedMsg = (txt?: string) => {
    const m = String(txt || "").toLowerCase();
    // detect Portuguese/English variations like "já foi verificado", "ja verificado", "already verified"
    return (
      (m.includes("verific") && (m.includes("já") || m.includes("ja") || m.includes("foi") || m.includes("anterior"))) ||
      m.includes("already verified") ||
      m.includes("already been verified")
    );
  };

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
    console.log("verify resp:", resp);
   if (resp && resp.success) {
  // Salvar token
  if (resp.token) {
    await AsyncStorage.setItem("token", String(resp.token));
  }

  // Salvar usuario_id do objeto user, para garantir
  if (resp.user?.id) {
    await AsyncStorage.setItem("usuario_id", String(resp.user.id));
  } else if (resp.usuario_id) {
    // fallback antigo
    await AsyncStorage.setItem("usuario_id", String(resp.usuario_id));
  }

      // Se backend não retornou token, tenta login automático
      if (!resp.token) {
        const senhaParam = String(params.senha || params.password || "");
        if (senhaParam && email) {
          try {
            await loginService(email, senhaParam);
            console.log("Autologin successful after verify");
          } catch (loginErr) {
            console.log("Autologin failed after verify:", loginErr);
          }
        }
      }

      const from = String(params.from || "register");
      if (from === "register")
        router.replace("/auth/welcome");
      else if (from === "recover")
        router.push({ pathname: "/auth/redefined2", params: { email: String(email), from: "recover" } });
      else if (from === "change")
        router.push({ pathname: "/auth/redefined2", params: { from: "change" } });
      else
        router.replace("/auth/welcome");
    } else {
      const msg = String(resp?.message || "");
      const from = String(params.from || "register");
      const alreadyVerified = isAlreadyVerifiedMsg(msg);
      if ((from === "recover" || from === "change") && alreadyVerified) {
        if (from === "recover")
          router.push({ pathname: "/auth/redefined2", params: { email: String(email), from: "recover" } });
        else
          router.push({ pathname: "/auth/redefined2", params: { from: "change" } });
      } else {
        setError(msg || "Código inválido");
      }
    }
  } catch (err: any) {
    console.log("verify error:", err?.message || err);
    const from = String(params.from || "register");
    const errMsg = err?.message || "Erro ao verificar código";
    const alreadyVerified = isAlreadyVerifiedMsg(String(errMsg));
    if ((from === "recover" || from === "change") && alreadyVerified) {
      if (from === "recover")
        router.push({ pathname: "/auth/redefined2", params: { email: String(email), from: "recover" } });
      else
        router.push({ pathname: "/auth/redefined2", params: { from: "change" } });
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
          Alert.alert("Erro", "Email não encontrado. Por favor, faça login novamente.");
          router.replace("/auth/login");
        }
        return;
      }

      // don't resend if already sent
      if (codeSent) return;
      setSendingCode(true);
      try {
        const resp = await sendRecoveryCode(email);
        console.log("recuperar-senha (change) resp:", resp);
        if (resp && resp.success) {
          if (mounted) {
            setCodeSent(true);
            Alert.alert("Sucesso", resp.message || "Código enviado para seu e-mail.");
          }
        } else {
          if (mounted) {
            Alert.alert("Erro", resp?.message || "Não foi possível enviar o código.");
          }
        }
      } catch (err: any) {
        console.log("recuperar-senha (change) error:", err?.message || err);
        if (mounted) {
          Alert.alert("Erro", err?.message || "Erro ao enviar código");
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

  // If this confirmation screen was reached from registration flow,
  // force any back action (hardware or header) to go to the login screen.
  useEffect(() => {
    let mounted = true;
    const from = String(params.from || "");
    if (from !== "register") return;

    const onBackPress = () => {
      // replace to remove this screen from the stack and go to login
      router.replace("/auth/login");
      return true; // handled
    };

    const backSub = BackHandler.addEventListener("hardwareBackPress", onBackPress);

    return () => {
      mounted = false;
      // BackHandler.addEventListener returns a subscription with .remove()
      try {
        backSub.remove();
      } catch (e) {
        // ignore if remove is not available
      }
    };
  }, [params.from]);

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
