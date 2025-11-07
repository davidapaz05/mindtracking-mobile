import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import api from "../../service/api";
import ButtonBase from "../components/common/button/button";
import InputBase from "../components/common/input/inputBase";
import BirthDateInput from "../components/common/input/inputData";
import InputGender from "../components/common/input/inputGenero";
import PhoneInput from "../components/common/input/inputPhone";

const { width, height } = Dimensions.get("window");
const API_BASE_URL = "http://44.220.11.145";

function formatDateToIso(date: string) {
  if (!date) return "";
  const parts = date.split("/");
  if (parts.length !== 3) return date;
  const [dia, mes, ano] = parts;
  return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
}

export default function RegisterScreen2() {
  const router = useRouter();
  const params = useLocalSearchParams();

  console.log("Params vindos da tela 1:", params);

  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [genero, setGenero] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNext = async () => {
    if (!nome || !dataNascimento || !telefone || !genero) {
      setError("Preencha todos os campos.");
      return;
    }
    setError("");
    setLoading(true);

  const dataNascIso = formatDateToIso(dataNascimento);

  
    const senha = params.senha || params.password || "";
    const confirmarSenha = params.confirmarSenha || params.confirmPassword || "";
    const email = params.email || "";

    if (!senha || !confirmarSenha || !email) {
      setError("Campos de senha e email obrigatórios estão faltando.");
      setLoading(false);
      return;
    }
   
    const nomeTrim = nome.trim();
    const generoTrim = genero.trim();

    let generoMapped = generoTrim;
    const g = generoTrim.toLowerCase();
    if (g === "masculino") generoMapped = "masculino";
    else if (g === "feminino") generoMapped = "feminino";
    else if (g === "outro") generoMapped = "outro";
    const telefoneSanitized = telefone.replace(/[^0-9+]/g, "").trim();

    try {
      const payload: any = {
        nome: nomeTrim,
        data_nascimento: dataNascIso,
        genero: generoMapped,
        telefone: telefoneSanitized,
      };

      const response = await api.put("", payload);

      if (response && (response.status === 200 || response.status === 201)) {
        
        try {
          await AsyncStorage.setItem("nome", String(nomeTrim));
          await AsyncStorage.setItem("telefone", String(telefoneSanitized));
          if (generoMapped) await AsyncStorage.setItem("genero", String(generoMapped));
        } catch {}

        router.replace("/(tabs)/perfil");
      } else {
        setError(response?.data?.message || "Erro ao salvar perfil");
      }
    } catch (err: any) {
      console.log("Erro ao atualizar perfil:", err);
      setError(err?.response?.data?.message || err?.message || "Erro ao salvar perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
        <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                  <Image source={require("../../assets/icons/seta.png")} style={styles.seta} />
                </TouchableOpacity>
                <View style={styles.textContainer} />
                <View style={{ width: width * 0.09 }} />
        </View>
      <View style={styles.topo}>
        <Image source={require("../../assets/icons/logo.png")} style={styles.logo} resizeMode="contain" />
        <View style={styles.titulos}>
          <Text style={styles.title}>Editar perfil</Text>
           </View>
      </View>

      <View style={styles.inputs}>
        <InputBase placeholder="Nome" iconLeft="user" value={nome} onChangeText={setNome} />
        <BirthDateInput value={dataNascimento} onChange={setDataNascimento} />
        <PhoneInput value={telefone} onChange={setTelefone} />
        <InputGender value={genero} onChange={setGenero} />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      <View style={styles.botoes}>
        <ButtonBase title={loading ? "Salvando..." : "Salvar"} onPress={handleNext} disabled={loading} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    paddingHorizontal: width * 0.08,
    paddingTop: height * 0.12,
    paddingBottom: height * 0.06,
    justifyContent: "center",
  },
  logo: {
    width: width * 0.22,
    height: height * 0.08,
  },
  inputs: {
    justifyContent: "flex-start",
  },
  header: {
    position: "absolute",
    top: height * 0.07,
    left: width * 0.07,
    right: width * 0.08,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 50,
  },
  seta: {
    width: width * 0.09,
    height: width * 0.08,
    tintColor: "#fff",
    resizeMode: "contain",
    transform: [{ rotate: "90deg" }],
    zIndex: 60,
    elevation: 6,
  },
    textContainer: {
    flex: 1,
    alignItems: "center",
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
});
