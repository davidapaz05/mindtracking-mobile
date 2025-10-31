import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { resetPassword } from "../../service/passwordService";
import ButtonBase from "../components/common/button/button";
import InputBase from "../components/common/input/inputBase"; // seu input já pronto
// Pega altura e largura da tela
const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  const router = useRouter();

  const params = useLocalSearchParams();
  const fromParam = String(params.from || "");
  const emailParam = String(params.email || "");

  const API_BASE_URL = "http://44.220.11.145";

  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const validateAndSubmit = async () => {
    if (!senha || !confirmSenha) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }
    if (senha !== confirmSenha) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }
    // optional: enforce a minimum length similar to registro1 (assumption: >= 6)
    if (senha.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setLoading(true);
    try {
      let emailToSend = (await AsyncStorage.getItem("email")) || emailParam || "";
      if (!emailToSend) {
        Alert.alert("Erro", "Email não disponível. Volte e tente novamente.");
        setLoading(false);
        return;
      }

      const payload: any = { email: emailToSend, senha, confirmarSenha: confirmSenha };
      const resp = await resetPassword(payload);
      if (resp && resp.success) {
        if (fromParam === "change") {
          router.replace("/(tabs)/perfil");
        } else {
          router.replace("/auth/login");
        }
      } else {
        Alert.alert("Erro", resp?.message || "Erro ao redefinir senha");
      }
    } catch (err: any) {
      console.log("redefinir-senha error:", err?.message || err);
      Alert.alert("Erro", err?.message || "Erro ao redefinir senha");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
              <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => router.back()}>
                  <Image
                    source={require('@assets/icons/seta.png')}
                    style={styles.seta}
                  />
                </TouchableOpacity>
      
                <View style={styles.textContainer}>
                  <Text style={styles.perfilText}>Alterar senha</Text>
                </View>
      
                <View style={{ width: width * 0.09 }} />
              </View>
      <View style={styles.topo}>
        

        <View style={styles.titulos}>
          <Text style={styles.title}>Criar nova senha</Text>
          <Text style={styles.subtitle}>Crie uma nova senha para sua conta</Text>
        </View>
      </View>

      <View style={styles.inputsContainer}>
        <InputBase
          iconLeft="senha"
          placeholder="Nova senha"
          eyeOpenIcon={require("@assets/icons/eye.png")}
          eyeClosedIcon={require("@assets/icons/eye-off.png")}
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <InputBase
          iconLeft="senha"
          placeholder="Confirmar nova senha"
          eyeOpenIcon={require("@assets/icons/eye.png")}
          eyeClosedIcon={require("@assets/icons/eye-off.png")}
          value={confirmSenha}
          onChangeText={setConfirmSenha}
          secureTextEntry
        />
        </View>

      
   
      <View style={styles.botoes}>
  <ButtonBase title={loading ? "Enviando..." : "Redefinir senha"} onPress={validateAndSubmit} disabled={loading} />

       
       


        
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
    marginTop: 0,
    
  },
    inputsContainer: {
        gap: height * 0.001,
    },
  topo: {
    gap: height * 0.07, 
    marginTop: height * 0.08,
  },
  titulos: {
    gap: height * 0.008,
  },
  botoes: {
    marginBottom: height * 0.1,
    gap: height * 0.001,
  },
  title: {
    fontSize: width * 0.06,
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
  forgotText: {
    color: "#ffffffff",
    fontSize: width * 0.033, 
    fontFamily: "Inter_700Bold",
    textAlign: "right",
    marginTop: height * 0.015,
    marginBottom: height * 0.015,
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
  registerButton: {
    borderWidth: 1,
    borderColor: "#2563EA",
    paddingVertical: height * 0.015,
    borderRadius: 24,
  },
  registerText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "500",
    fontSize: width * 0.04,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: height * 0.02,
    top: -height * 0.17,
  },
  seta: {
    width: width * 0.09,
    height: width * 0.08,
    top: height * 0.01,
    tintColor: "#fff",
    resizeMode: "contain",
    marginBottom: height * 0.025,
    transform: [{ rotate: "90deg" }],
  },
  textContainer: {
    flex: 1,
    alignItems: "center",
  },
  perfilText: {
    color: "#fff",
    fontSize: Math.max(width * 0.05, 14),
    fontFamily: "Inter_600SemiBold",
  },
});
