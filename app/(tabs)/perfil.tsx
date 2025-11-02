import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CardDenominado from "../components/cards/cardPerfil";
import { recoverPassword } from "../../service/passwordService";

const { width, height } = Dimensions.get("window");
const AVATAR_SIZE = width * 0.442; // Responsivo, igual ao seu avatar
const EDIT_SIZE = AVATAR_SIZE * 0.24; // Proporcional ao avatar

// Helper: search object (possibly nested) for first matching key from candidates
function findFirstMatch(obj: any, candidates: string[]): any {
  if (!obj || typeof obj !== "object") return null;
  for (const k of candidates) {
    if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k]) return obj[k];
  }
  // deep search
  for (const key of Object.keys(obj)) {
    try {
      const val = obj[key];
      if (val && typeof val === "object") {
        const found = findFirstMatch(val, candidates);
        if (found) return found;
      }
    } catch (e) {
      // ignore
    }
  }
  return null;
}

export default function Perfil() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [nome, setNome] = useState<string | null>(null);
  const [foto, setFoto] = useState<string | null>(null);
  const [numero, setNumero] = useState<string | null>(null);
  const [genero, setGenero] = useState<string | null>(null);

  // Re-run profile load every time the screen is focused so updates are reflected
  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      async function loadProfilePreferLocal() {
        try {
          // Prefer token as source of truth for user info
          const token = await AsyncStorage.getItem("token");
          if (token) {
            try {
              const parts = token.split(".");
              if (parts.length >= 2) {
                const payloadB64 = parts[1];
                const padded = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
                // pad base64
                const pad = padded.length % 4;
                const withPad = pad === 0 ? padded : padded + "=".repeat(4 - pad);
                let json: string | null = null;
                const atobFn = (global as any).atob || (globalThis as any).atob;
                if (typeof atobFn === "function") {
                  const decoded = atobFn(withPad);
                  try {
                    json = decodeURIComponent(
                      Array.prototype
                        .map.call(decoded, function (c: string) {
                          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
                        })
                        .join("")
                    );
                  } catch (e) {
                    json = decoded;
                  }
                } else if (typeof (global as any).Buffer !== "undefined") {
                  json = (global as any).Buffer.from(withPad, "base64").toString("utf8");
                }

                if (json) {
                  try {
                    const parsed = JSON.parse(json);

                    // robust lookup across many possible key names and nested objects
                    const nameCandidates = [
                      "nome",
                      "name",
                      "fullName",
                      "full_name",
                      "username",
                      "usuario",
                      "user",
                      "given_name",
                    ];
                    const emailCandidates = ["email", "mail", "usuario_email"];
                    const phoneCandidates = ["numero", "phone", "phone_number", "celular", "telefone"];
                    const genderCandidates = ["genero", "gender", "sexo"];

                    const serverNome = findFirstMatch(parsed, nameCandidates) ?? null;
                    const serverEmail = findFirstMatch(parsed, emailCandidates) ?? null;
                    const serverNumero = findFirstMatch(parsed, phoneCandidates) ?? null;
                    const serverGenero = findFirstMatch(parsed, genderCandidates) ?? null;

                    // Busca nome armazenado localmente no AsyncStorage
                    const nomeLocal = await AsyncStorage.getItem("nome");

                    if (mounted) {
                      // Prioriza nome do token, se não existir usa o local
                      setNome(serverNome ?? nomeLocal ?? "");
                      if (serverEmail) setEmail(String(serverEmail));
                      if (serverNumero) setNumero(String(serverNumero));
                      if (serverGenero) setGenero(String(serverGenero));
                    }

                    // still load photo from AsyncStorage if present
                    const f = await AsyncStorage.getItem("foto");
                    if (mounted && f) setFoto(f);

                    // persist these values locally for other flows if desired
                    try {
                      if (serverNome) await AsyncStorage.setItem("nome", String(serverNome));
                      if (serverEmail) await AsyncStorage.setItem("email", String(serverEmail));
                    } catch (e) {
                      // ignore
                    }
                  } catch (e) {
                    // ignore parse error
                  }
                }
              }
            } catch (e) {
              // ignore
            }
          } else {
            // No token: fall back to local storage for name/email/foto
            const [n, e, f] = await Promise.all([
              AsyncStorage.getItem("nome"),
              AsyncStorage.getItem("email"),
              AsyncStorage.getItem("foto"),
            ]);
            if (mounted) {
              if (n) setNome(n);
              if (e) setEmail(e);
              if (f) setFoto(f);
            }
          }
        } catch (err) {
          // ignore
        }
      }

      loadProfilePreferLocal();

      return () => {
        mounted = false;
      };
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/(tabs)/home")}>
          <Image source={require("../../assets/icons/seta.png")} style={styles.seta} />
        </TouchableOpacity>
        <View style={styles.textContainer}>
          <Text style={styles.perfilText}>Perfil</Text>
        </View>
        <View style={{ width: width * 0.09 }} />
      </View>
      <View style={styles.topo}>
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: foto ?? "https://i.pravatar.cc/100" }} style={styles.avatar} />
          <Pressable style={styles.editButton} onPress={() => router.push("/(tabs)/alterarfoto")}>
            <View style={styles.editCircle}>
              <Image source={require("@assets/icons/Edit.png")} style={styles.editIcon} />
            </View>
          </Pressable>
        </View>
        <Text style={styles.name}>{nome ?? ""}</Text>
      </View>

      <View style={styles.cardsContainer}>
        <CardDenominado tipo="progresso" onPress={() => router.push("/(tabs)/dashboard")} />
        <CardDenominado
  tipo="alterarSenha"
  onPress={async () => {
    try {
      const email = await AsyncStorage.getItem("email");
      if (!email) {
        Alert.alert("Erro", "Email não encontrado. Faça login novamente.");
        router.replace("/auth/login");
        return;
      }
      const resp = await recoverPassword(email);
      if (resp && resp.success) {
        router.push({ pathname: "/auth/confirm-code", params: { email, from: "recover" } });
      } else {
        Alert.alert("Erro", resp?.message || "Email não identificado");
      }
    } catch (err: any) {
      Alert.alert("Erro", err?.message || "Erro ao enviar código");
    }
  }}
/>
        <CardDenominado tipo="editarPerfil" onPress={() => router.push("/(tabs)/alterarfoto")} />
        <CardDenominado
          tipo="sairDaConta"
          onPress={async () => {
            await AsyncStorage.removeItem("token");
            try {
              await AsyncStorage.removeItem("email");
              await AsyncStorage.removeItem("nome");
            } catch (e) {
              // ignore
            }
            router.replace("/auth/login");
          }}
        />
      </View>

      {/* Debug button to inspect token and storage for troubleshooting */}
      <View style={{ paddingHorizontal: width * 0.07, marginTop: 16 }}>
        <TouchableOpacity
          style={styles.debugBtn}
          onPress={async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              const nomeStored = await AsyncStorage.getItem("nome");
              const emailStored = await AsyncStorage.getItem("email");
              const fotoStored = await AsyncStorage.getItem("foto");
              const usuarioId = await AsyncStorage.getItem("usuario_id");
              let parsed: any = null;
              if (token) {
                try {
                  const parts = token.split(".");
                  if (parts.length >= 2) {
                    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
                    const pad = b64.length % 4;
                    const withPad = pad === 0 ? b64 : b64 + "=".repeat(4 - pad);
                    const atobFn = (global as any).atob || (globalThis as any).atob;
                    let decoded = "";
                    if (typeof atobFn === "function") decoded = atobFn(withPad);
                    else if (typeof (global as any).Buffer !== "undefined")
                      decoded = (global as any).Buffer.from(withPad, "base64").toString("utf8");
                    try {
                      parsed = JSON.parse(decoded);
                    } catch (e) {
                      parsed = decoded;
                    }
                  }
                } catch (e) {
                  // ignore
                }
              }

              console.log(
                "PROFILE DEBUG -> token:",
                token,
                "parsed:",
                parsed,
                "nomeStored:",
                nomeStored,
                "emailStored:",
                emailStored,
                "fotoStored:",
                fotoStored,
                "usuarioId:",
                usuarioId
              );
              Alert.alert(
                "Profile Debug",
                JSON.stringify({ token: !!token, parsed, nomeStored, emailStored, fotoStored, usuarioId }, null, 2)
              );
            } catch (err) {
              console.log("Debug error", err);
              Alert.alert("Erro", String(err));
            }
          }}
        >
          <Text style={styles.debugText}>Debug Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    paddingHorizontal: width * 0.07,
    paddingTop: height * 0.06,
  },
  cardsContainer: {},
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: height * 0.02,
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
  topo: {
    alignItems: "center",
    gap: height * 0.002,
    marginBottom: height * 0.05,
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
  avatarWrapper: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    position: "relative", // Permite posicionamento absoluto do botão
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3,
    borderColor: "#1E293B",
  },
  editButton: {
    position: "absolute",
    right: width * 0.009, // Sempre no canto direito da foto
    bottom: 0, // Sempre embaixo da foto
  },
  editCircle: {
    width: EDIT_SIZE,
    height: EDIT_SIZE,
    borderRadius: EDIT_SIZE / 2,
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  editIcon: {
    width: EDIT_SIZE * 0.6,
    height: EDIT_SIZE * 0.6,
    resizeMode: "contain",
  },
  name: {
    color: "#fff",
    fontSize: Math.max(width * 0.06, 16),
    fontFamily: "Inter_600SemiBold",
    marginTop: width * 0.05,
  },
  email: {
    color: "#fff",
    opacity: 0.7,
    fontFamily: "Inter_400Regular",
    fontSize: Math.max(width * 0.03, 14),
    marginTop: width * 0.01,
  },
  debugBtn: {
    backgroundColor: "#374151",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  debugText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
  },
});
