import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    Dimensions,
    Image,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { getProfile } from "../../service/authService";
import { exportUserPdf } from "../../service/reportService";
import FeatureCard from "../components/cards/card1";
import InfoCard from "../components/cards/card2";

const { width, height } = Dimensions.get("window");

// Arrays para nomes em português
const diasSemana = ['Domingo', 'Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sábado'];
const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export default function Dashboard() {
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [foto, setFoto] = useState<string | undefined>(undefined);

  // Adiciona estado para data atual do sistema
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    // Atualiza a cada minuto para garantir troca automática do dia
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          // Atualiza avatar pelo backend primeiro
          try {
            const res = await getProfile();
            const profile = res?.data || res?.user || res || null;
            const serverFoto = profile?.foto_perfil_url || profile?.foto || null;
            if (serverFoto && active) {
              const busted = `${String(serverFoto)}?t=${Date.now()}`;
              setFoto(busted);
            } else if (active) {
              setFoto(undefined);
            }
          } catch {
            if (active) setFoto(undefined);
          }

          const last = await AsyncStorage.getItem("diario_last_done");
          const showFlag = await AsyncStorage.getItem("diario_show_modal");
          const today = new Date().toISOString().slice(0, 10);

          if (active) {
            setDone(last === today);
            if (showFlag === "true") {
              setShowModal(true);
              await AsyncStorage.removeItem("diario_show_modal");
            }
          }
        } catch (e) {
          console.log("Erro ao ler estado diário:", e);
        }
      })();

      return () => {
        active = false;
      };
    }, [])
  );

  const handleCardPress = () => {
    if (!done) {
      router.push({ pathname: "/auth/questionario", params: { mode: "diario" } });
      return;
    }
    setShowModal(true);
  };

  const handleConfirm = () => {
    setDone(true);
    setShowModal(false);
  };

  // Formatação dinâmica das datas para o topo
  const diaSemana = diasSemana[currentDate.getDay()];
  const dia = currentDate.getDate();
  const mes = meses[currentDate.getMonth()];

  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.screen}>
          {/* TOPO */}
          <View style={styles.header}>
            <View style={{ flexShrink: 1 }}>
              <Text style={styles.day} numberOfLines={1} ellipsizeMode="tail">
                {diaSemana}
              </Text>
              <Text style={styles.date} numberOfLines={1} ellipsizeMode="tail">
                {dia} de {mes}
              </Text>
            </View>
            <Image
              source={foto ? { uri: foto } : undefined}
              style={styles.avatar}
            />
          </View>

          {/* PERGUNTA */}
          <Text
            style={styles.question}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            Como você está se sentindo hoje?
          </Text>

          {/* CARDS DE AÇÃO */}
          <View style={styles.actionRow}>
            <FeatureCard variant="checkin" done={done} onPress={handleCardPress} />
            <FeatureCard variant="athena" onPress={() => router.push('/(tabs)/ia')} />

          </View>

          <View style={styles.section}>
            <Text
              style={styles.sectionTitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              O que você deseja?
            </Text>
            <Text
              style={styles.sectionSubtitle}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              Opções para melhorar seu dia
            </Text>
          </View>

          <View style={styles.infoList}>
            <InfoCard variant="diario" />
            <InfoCard variant="recomendacao" />
            <InfoCard
              variant="apoio"
              onPress={async () => {
                try {
                  setShowModal(false);
                  await exportUserPdf();
                } catch (err: any) {
                  console.log("Exportar PDF erro:", err?.message || err);
                }
              }}
            />
          </View>

          <View style={{ height: height * 0.05 }} />
        </View>
      </SafeAreaView>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Seu questionário diário de hoje já foi salvo
            </Text>
            <Text style={styles.modalSubtitle}>
              Athena agradece por você compartilhar como você se sentiu hoje.{"\n"}
              Para manter a clareza de seus insights, cada dia tem um único
              check-in.{"\n"}Um novo dia trará uma nova oportunidade para se
              conectar consigo mesmo(a).
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.modalButtonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  screen: {
    flex: 1,
    paddingHorizontal: width * 0.065,
    paddingBottom: height * 0.06, 
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: height * 0.025,
    marginTop: height * 0.08,
    overflow: "hidden",
  },
  day: {
    fontSize: Math.max(width * 0.05, 14),
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    flexShrink: 1,
  },
  date: {
    fontSize: Math.max(width * 0.035, 12),
    color: "#9199AA",
    fontFamily: "Inter_600SemiBold",
    flexShrink: 1,
  },
  avatar: {
    width: width * 0.18,
    height: width * 0.18,
    borderRadius: 100,
  },
  question: {
    fontSize: Math.max(width * 0.045, 13),
    color: "#fff",
    marginBottom: height * 0.025,
    fontFamily: "Inter_600SemiBold",
    flexShrink: 1,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: width * 0.001,
    marginBottom: height * 0.025,
    overflow: "hidden",
  },
  section: {
    marginBottom: height * 0.02,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: Math.max(width * 0.045, 13),
    color: "#fff",
    marginBottom: height * 0.008,
    fontFamily: "Inter_600SemiBold",
    flexShrink: 1,
  },
  sectionSubtitle: {
    fontSize: Math.max(width * 0.035, 12),
    marginBottom: height * 0.012,
    color: "#9199AA",
    fontFamily: "Inter_600SemiBold",
    flexShrink: 1,
  },
  infoList: {
    gap: height * 0.012,
    marginBottom: height * 0.02,
    overflow: "hidden",
  },
  navbarWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
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
    padding: 20,
    width: "90%",
    borderWidth: 2.5,
    borderColor: "#15803D",
  },
  modalTitle: {
    fontSize: width * 0.04,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    marginBottom: height * 0.035,
    flexShrink: 1,
  },
  modalSubtitle: {
    fontSize: width * 0.038,
    fontFamily: "Inter_500Medium",
    color: "#fff",
    marginBottom: height * 0.03,
    lineHeight: height * 0.028,
    flexShrink: 1,
  },
  modalButton: {
    backgroundColor: "#15803D",
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: width * 0.04,
    fontFamily: "Inter_600SemiBold",
  },
});
