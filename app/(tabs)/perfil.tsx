import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    Alert,
    Dimensions,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { getProfile } from "../../service/authService";
import { recoverPassword } from "../../service/passwordService";
import CardDenominado from "../components/cards/cardPerfil";
import ButtonBase from "../components/common/button/button";
import ButtonBase2 from "../components/common/button/button2";

const { width, height } = Dimensions.get("window");
const AVATAR_SIZE = width * 0.442;
const EDIT_SIZE = AVATAR_SIZE * 0.24;

export default function Perfil() {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [nome, setNome] = useState<string | null>(null);
  const [foto, setFoto] = useState<string | null>(null);
  const [numero, setNumero] = useState<string | null>(null);
  const [genero, setGenero] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      async function loadProfilePreferLocal() {
        try {
          // Primeiro tenta servidor para pegar foto atualizada
          try {
            const res = await getProfile();
            const profile = res?.data || res?.user || res || null;
            if (profile && mounted) {
              const serverFoto = profile.foto_perfil_url || profile.foto || null;
              const serverNome = profile.nome || profile.name || null;
              const serverEmail = profile.email || null;
              if (serverFoto) {
                const busted = `${String(serverFoto)}?t=${Date.now()}`;
                setFoto(busted);
              }
              if (serverNome) {
                setNome(String(serverNome));
                try { await AsyncStorage.setItem("nome", String(serverNome)); } catch {}
              }
              if (serverEmail) {
                setEmail(String(serverEmail));
                try { await AsyncStorage.setItem("email", String(serverEmail)); } catch {}
              }
            }
          } catch {}

          const token = await AsyncStorage.getItem("token");
          if (token) {
            try {
              const parts = token.split(".");
              if (parts.length >= 2) {
                const payloadB64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
                const pad = payloadB64.length % 4;
                const withPad = pad === 0 ? payloadB64 : payloadB64 + "=".repeat(4 - pad);
                const atobFn = (global as any).atob || (globalThis as any).atob;
                let decoded = "";
                if (typeof atobFn === "function") decoded = atobFn(withPad);
                else if (typeof (global as any).Buffer !== "undefined")
                  decoded = (global as any).Buffer.from(withPad, "base64").toString("utf8");
                let parsed: any = null;
                try {
                  parsed = JSON.parse(decoded);
                } catch {
                  parsed = decoded;
                }

                const findFirstMatch = (obj: any, candidates: string[]): any => {
                  if (!obj || typeof obj !== "object") return null;
                  for (const k of candidates) {
                    if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k]) return obj[k];
                  }
                  for (const key of Object.keys(obj)) {
                    try {
                      const val = obj[key];
                      if (val && typeof val === "object") {
                        const found = findFirstMatch(val, candidates);
                        if (found) return found;
                      }
                    } catch {}
                  }
                  return null;
                };

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
                const photoCandidates = ["foto", "foto_perfil_url", "profile_picture", "picture", "avatar"];

                const serverNome = findFirstMatch(parsed, nameCandidates) ?? null;
                const serverEmail = findFirstMatch(parsed, emailCandidates) ?? null;
                const serverNumero = findFirstMatch(parsed, phoneCandidates) ?? null;
                const serverGenero = findFirstMatch(parsed, genderCandidates) ?? null;
                const serverFoto = findFirstMatch(parsed, photoCandidates) ?? null;

                const nomeLocal = await AsyncStorage.getItem("nome");
                const emailLocal = await AsyncStorage.getItem("email");

                if (mounted) {
                  setNome(serverNome ?? nomeLocal ?? "");
                  if (serverEmail) setEmail(String(serverEmail));
                  else if (emailLocal) setEmail(emailLocal);
                  if (serverNumero) setNumero(String(serverNumero));
                  if (serverGenero) setGenero(String(serverGenero));
                  if (serverFoto) {
                    const busted = `${String(serverFoto)}?t=${Date.now()}`;
                    setFoto(busted);
                  }
                }

                try {
                  if (serverNome) await AsyncStorage.setItem("nome", String(serverNome));
                  if (serverEmail) await AsyncStorage.setItem("email", String(serverEmail));
                } catch {}
              }
            } catch {}
          } else {
            // No token fallback to local storage
            const [n, e] = await Promise.all([
              AsyncStorage.getItem("nome"),
              AsyncStorage.getItem("email"),
            ]);
            if (mounted) {
              if (n) setNome(n);
              if (e) setEmail(e);
              // Foto não vem de storage: sempre via GET profile
            }
          }
        } catch {}
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
          <Image
            source={foto ? { uri: foto } : undefined}
            style={styles.avatar}
          />
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
        <CardDenominado tipo="editarPerfil" onPress={() => router.push("/(tabs)/editarperfil")} />
        <CardDenominado tipo="sairDaConta" onPress={() => setShowLogoutModal(true)} />
      </View>

      

      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sair da conta</Text>
            <Text style={styles.modalSubtitle}>
              Tem certeza que deseja sair da sua conta?
            </Text>

            <View style={{ marginTop: 8 }} />

            <ButtonBase2 title="Não" onPress={() => setShowLogoutModal(false)} />
            <ButtonBase
              title="Sim"
              onPress={async () => {
                try {
                  // Limpa AsyncStorage
                  try {
                    await AsyncStorage.multiRemove([
                      "token",
                      "email",
                      "nome",
                      "foto",
                      "usuario_id",
                      "telefone",
                      "genero",
                      "questionario_pending",
                      "data_nascimento",
                    ]);
                  } catch {}

                  // Limpa localStorage (quando disponível, ex.: web)
                  try {
                    const ls = (globalThis as any)?.localStorage;
                    if (ls && typeof ls.clear === "function") {
                      ls.clear();
                    }
                  } catch {}

                  setShowLogoutModal(false);
                  router.replace("/auth/login");
                } catch (err: any) {
                  Alert.alert("Erro", err?.message || "Erro ao sair da conta");
                  setShowLogoutModal(false);
                }
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Loader para exportação de PDF removido do Perfil */}
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
    position: "relative",
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
    right: width * 0.009,
    bottom: 0,
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
  
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: width * 0.02,
  },
  modalContent: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: height * 0.03,
    paddingTop: height * 0.04,
    width: "90%",
    
  },
  modalTitle: {
    fontSize: width * 0.05,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    marginBottom: height * 0.025,
    flexShrink: 1,
    alignContent: "center",
    textAlign: "center",
  },
  modalSubtitle: {
    textAlign: "center",
    fontSize: width * 0.042,
    fontFamily: "Inter_500Medium",
    color: "#fff",
    marginBottom: height * 0.03,
    lineHeight: height * 0.028,
    flexShrink: 1,
  },
});
