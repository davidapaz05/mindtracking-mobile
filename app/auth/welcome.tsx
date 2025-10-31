import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
// Pega altura e largura da tela
const { width, height } = Dimensions.get("window");

export default function Welcome() {
  const router = useRouter();
  const [nome, setNome] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const n = await AsyncStorage.getItem("nome");
        if (mounted) setNome(n);
      } catch (e) {}
    }
    load();
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
          <Text style={styles.title}>Vamos começar, {nome ?? ""}</Text>
          <Text style={styles.subtitle}>Para que Athena possa te conhecer melhor, vamos fazer algumas perguntas rápidas. Isso criará uma base para sua jornada de autoconhecimento.</Text>
        </View>
      </View>


    <View style={styles.buttonContainer}>
      <View style={{ flex: 1 }} />
      <TouchableOpacity style={styles.button} onPress={() => router.push("/auth/questionario")}> 
        <Text style={styles.buttonText}>Começar</Text>
      </TouchableOpacity>
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
  topo: {
    gap: height * 0.01, 
    marginBottom: height * 0.09,
  },
  titulos: {
    gap: height * 0.009,
    marginVertical: height * 0.20,
  },
  botoes: {
    marginBottom: height * 0.1,
    gap: height * 0.001,
  },
  title: {
    fontSize: 27,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    fontFamily: "Inter_600SemiBold,",
    
    
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 14 * 1.5,
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
  buttonContainer: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: height * 0.05, // dá um respiro depois do texto
  paddingHorizontal: width * 0.02,
},
button: {
  paddingVertical: height * 0.015,
},
buttonText: {
  color: "#FFFFFF",
  fontSize: width * 0.04,
  fontWeight: "bold",
},
buttonLast: {
  backgroundColor: "#2E5BFF",
  borderRadius: 50,
  paddingHorizontal: width * 0.04,
},
buttonLastText: {
  color: "#FFFFFF",
},

});
