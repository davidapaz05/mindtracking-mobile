import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getAllDiarios, getDiarioById, postDiario } from "../../service/diarioService";
import CardDiario from "../components/cards/cardDiario";

const { width, height } = Dimensions.get("window");

type DiarioItem = {
  id: string | number;
  titulo: string;
  texto: string;
  data: string;
  emocao_predominante?: string;
  intensidade_emocional?: string;
  comentario_athena?: string;
};

export default function Diario() {
  const router = useRouter();
  const [diarios, setDiarios] = useState<DiarioItem[]>([]);
  const [headerHeight, setHeaderHeight] = useState<number>(0);

  const [modalAnaliseVisivel, setModalAnaliseVisivel] = useState(false);
  const [modalEscritaVisivel, setModalEscritaVisivel] = useState(false);
  const [fabState, setFabState] = useState<"plus" | "done">("plus");

  const [selectedDiario, setSelectedDiario] = useState<DiarioItem | null>(null);
  const [tituloDiario, setTituloDiario] = useState("");
  const [textoDiario, setTextoDiario] = useState("");

  // Normaliza os dados da API para o formato esperado
  const normalizeDiarios = (resp: any): DiarioItem[] => {
    if (!resp) return [];

    let entradas: any[] = [];
    if (Array.isArray(resp)) {
      entradas = resp;
    } else if (Array.isArray(resp.entradas)) {
      entradas = resp.entradas;
    } else if (Array.isArray(resp.data)) {
      entradas = resp.data;
    }

    return entradas.map((e: any, index: number) => {
      const id = e.id ?? e._id ?? index + "-" + Math.random().toString(36).substr(2, 9);
      const titulo = e.titulo ?? e.title ?? "Sem título";
      const texto = e.texto ?? e.text ?? "";
      const dataRaw = e.data_hora ?? e.createdAt ?? e.date ?? "";
      const emocao_predominante = e.emocao_predominante ?? e.emocao ?? "";
      const intensidade_emocional = e.intensidade_emocional ?? e.intensidade ?? "";
      const comentario_athena = e.comentario_athena ?? e.comentario ?? e.athena ?? "";

      let data = "";
      try {
        if (dataRaw) {
          const d = new Date(dataRaw);
          data = !Number.isNaN(d.getTime()) ? d.toISOString() : String(dataRaw); // ISO para comparação
        }
      } catch {
        data = String(dataRaw);
      }

      return {
        id,
        titulo,
        texto,
        data,
        emocao_predominante,
        intensidade_emocional,
        comentario_athena,
      };
    });
  };

  // Função para checar se já existe diario nas últimas 24 horas
  const checkDiarioRecent = (diarios: DiarioItem[]): boolean => {
    const now = new Date();
    for (const diario of diarios) {
      if (!diario.data) continue;
      const diarioDate = new Date(diario.data);
      const diffMs = now.getTime() - diarioDate.getTime();
      if (diffMs >= 0 && diffMs < 24 * 60 * 60 * 1000) {
        return true; // achou diário recente
      }
    }
    return false;
  };

  useEffect(() => {
    let mounted = true;

    async function loadDiarios() {
      try {
        const resp = await getAllDiarios();
        const list = normalizeDiarios(resp);
        if (mounted) {
          setDiarios(list);
          // Atualiza o estado do FAB dependendo se existe diário registrado nas últimas 24h
          if (checkDiarioRecent(list)) {
            setFabState("done");
          } else {
            setFabState("plus");
          }
        }
      } catch {
        if (mounted) {
          setDiarios([]);
          setFabState("plus");
        }
      }
    }

    loadDiarios();

    return () => {
      mounted = false;
    };
  }, []);

  const abrirModalAnalise = useCallback(
    async (item: DiarioItem) => {
      setSelectedDiario(null);
      setModalAnaliseVisivel(true);
      try {
        if (item && item.id) {
          const resp = await getDiarioById(String(item.id));
          const itens = normalizeDiarios(resp);
          setSelectedDiario(itens.length ? itens[0] : item);
        } else {
          setSelectedDiario(item);
        }
      } catch {
        setSelectedDiario(item);
      }
    },
    []
  );

  const renderDiarioItem = useCallback(
    ({ item }: { item: DiarioItem }) => {
      return (
        <View style={styles.cardWrapper}>
          <CardDiario diario={{ titulo: item.titulo, texto: item.texto, data: item.data }} onAnalyze={() => abrirModalAnalise(item)} />
        </View>
      );
    },
    [abrirModalAnalise]
  );

  const keyExtractor = useCallback((item: DiarioItem) => String(item.id), []);

  const onHeaderLayout = useCallback((e: any) => {
    const h = e?.nativeEvent?.layout?.height ?? 0;
    setHeaderHeight((prev) => (prev !== h ? h : prev));
  }, []);

  // Função clicando no FAB: só abre modal se estado "plus"
  const onPressFab = useCallback(() => {
    if (fabState === "plus") {
      setTituloDiario("");
      setTextoDiario("");
      setModalEscritaVisivel(true);
    }
  }, [fabState]);

  // Salvar novo diário e atualizar FAB se necessário
  const onSalvarReflexao = useCallback(async () => {
    try {
      if (!tituloDiario.trim() || !textoDiario.trim()) {
        Alert.alert("Erro", "Título e texto são obrigatórios");
        return;
      }
      const payload = { titulo: tituloDiario.trim(), texto: textoDiario };
      const resp = await postDiario(payload);
      const createdItens = normalizeDiarios(resp);
      if (createdItens.length > 0) {
        // Atualiza lista
        setDiarios((prev) => [createdItens[0], ...prev]);
        // Atualiza estado do FAB para "done" pois diário foi criado agora
        setFabState("done");
      }
      Alert.alert("Sucesso", resp?.message || "Diário enviado com sucesso");
      setModalEscritaVisivel(false);
      setTituloDiario("");
      setTextoDiario("");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Erro ao enviar diário";
      Alert.alert("Erro ao enviar diário", msg);
    }
  }, [tituloDiario, textoDiario]);

  return (
    <View style={styles.screen}>
      {/* Header fixo */}
      <View style={styles.fixedHeader} onLayout={onHeaderLayout}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.push("/(tabs)/home")}>
            <Image source={require("@assets/icons/seta.png")} style={styles.seta} />
          </TouchableOpacity>
          <View style={styles.textContainer}>
            <Text style={styles.perfilText}>Meus Diários</Text>
          </View>
          <View style={{ width: width * 0.09 }} />
        </View>
        <Text style={styles.titleLarge}>Seu refúgio de pensamentos seguros</Text>
      </View>

      {/* Lista */}
      <FlatList
        style={styles.list}
        contentContainerStyle={[styles.listContentBase, { paddingTop: headerHeight }]}
        data={diarios}
        keyExtractor={keyExtractor}
        renderItem={renderDiarioItem}
        ItemSeparatorComponent={() => <View style={styles.gap} />}
        ListFooterComponent={() => <View style={styles.footerSpacer} />}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={7}
      />

      {/* Modal 1 — Análise da Athena */}
      <Modal
        visible={modalAnaliseVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setModalAnaliseVisivel(false);
          setSelectedDiario(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setModalAnaliseVisivel(false);
                setSelectedDiario(null);
              }}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.8}
            >
              <Image source={require("@assets/icons/x.png")} style={styles.modalCloseIcon} />
            </TouchableOpacity>

            <View style={styles.modalIconWrap}>
              <Image source={require("@assets/icons/logo.png")} style={styles.modalIcon} />
            </View>

            <Text style={styles.modalHeading}>{selectedDiario?.titulo ?? "Análise"}</Text>

            <Text style={styles.modalLabel}>
              Mensagem:
              <Text style={styles.modalBody}> {selectedDiario?.texto ?? ""}</Text>
            </Text>

            <Text style={styles.modalLabel}>
              Emoção predominante:
              <Text style={styles.modalEmphasis}> {selectedDiario?.emocao_predominante ?? "-"}</Text>
            </Text>

            <Text style={styles.modalLabel}>
              Intensidade emocional:
              <Text style={styles.modalEmphasis}> {selectedDiario?.intensidade_emocional ?? "-"}</Text>
            </Text>

            <Text style={styles.modalQuoteLabel}>
              Athena diz:
              <Text style={styles.modalQuote}> {selectedDiario?.comentario_athena ?? "A análise ainda não está disponível."}</Text>
            </Text>
          </View>
        </View>
      </Modal>

      {/* Modal 2 — Escrita no Diário */}
      <Modal
        visible={modalEscritaVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => setModalEscritaVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalEscritaVisivel(false)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.8}
            >
              <Image source={require("@assets/icons/x.png")} style={styles.modalCloseIcon} />
            </TouchableOpacity>

            <View style={styles.modalIconWrap}>
              <Image source={require("@assets/icons/logo.png")} style={styles.modalIcon} />
            </View>

            <TextInput
              value={tituloDiario}
              onChangeText={setTituloDiario}
              placeholder="Título do diário"
              placeholderTextColor="rgba(255,255,255,0.6)"
              style={styles.titleInput}
              maxLength={20}
              numberOfLines={1}
            />
            <Text style={styles.modalBodyMuted}>Escreva livremente - somente você verá isso.</Text>

            <View style={styles.textAreaWrapper}>
              <ScrollView
                style={styles.textAreaScroll}
                contentContainerStyle={{ paddingRight: 6 }}
                keyboardShouldPersistTaps="handled"
              >
                <TextInput
                  value={textoDiario}
                  onChangeText={setTextoDiario}
                  placeholder="Registre aqui seus pensamentos, sentimentos e aprendizados do dia..."
                  placeholderTextColor="#9AA6B2"
                  multiline
                  style={styles.textArea}
                />
              </ScrollView>
              <Image
                source={{ uri: "file:///SEU/CAMINHO/tooltip-diario.png" }}
                style={styles.tooltipImg}
              />
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.btnNeutral]}
                onPress={() => setModalEscritaVisivel(false)}
                activeOpacity={0.9}
              >
                <Text style={styles.btnNeutralText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.btnPrimary]}
                onPress={onSalvarReflexao}
                activeOpacity={0.9}
                disabled={textoDiario.trim().length === 0 || tituloDiario.trim().length === 0}
              >
                <Text style={styles.btnPrimaryText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* FAB fixo */}
      <View style={styles.fixedFabs} pointerEvents="box-none">
        <TouchableOpacity onPress={onPressFab} activeOpacity={fabState === "plus" ? 0.9 : 0.4} disabled={fabState !== "plus"}>
          <Image
            source={
              fabState === "plus"
                ? require("@assets/icons/Property 1=Diário não escrito.png")
                : require("@assets/icons/Property 1=Diário já escrito.png")
            }
            style={styles.fabIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // (Seu estilo original, mantido integralmente conforme entregues anteriormente)
  screen: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  titleInput: {
  color: "#FFFFFF",
  textAlign: "center",
  fontFamily: "Inter_600SemiBold",
  fontSize: Math.max(width * 0.065, 16),
  marginBottom: height * 0.018,
  borderBottomWidth: 0,
  paddingVertical: 0,
},

  fixedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: width * 0.07,
    paddingTop: height * 0.06,
    paddingBottom: height * 0.025,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 6,
    backgroundColor: "#0F172A",
  },
  headerRow: {
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
  textContainer: {
    flex: 1,
    alignItems: "center",
  },
  perfilText: {
    color: "#fff",
    fontSize: Math.max(width * 0.05, 14),
    fontFamily: "Inter_600SemiBold",
  },
  titleLarge: {
    color: "#fff",
    fontSize: Math.max(width * 0.055, 18),
    fontFamily: "Inter_600SemiBold",
  },
  list: { flex: 1 },
  listContentBase: {
    paddingHorizontal: width * 0.07,
    paddingBottom: height * 0.12,
  },
  cardWrapper: { width: "100%" },
  gap: { height: height * 0.01 },
  footerSpacer: { height: height * 0.025 },
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
    paddingTop: height * 0.03,
    paddingBottom: height * 0.028,
    paddingHorizontal: width * 0.06,
    width: "90%",
    borderWidth: 0,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 10,
  },
  modalCloseButton: {
    position: "absolute",
    top: height * 0.03,
    right: height * 0.03,
    width: Math.max(width * 0.03, 28),
    height: Math.max(width * 0.03, 28),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
  },
  modalCloseIcon: {
    width: Math.max(width * 0.09, 20),
    height: Math.max(width * 0.09, 20),
    resizeMode: "contain",
    tintColor: "#FFFFFF",
  },
  modalIconWrap: {
    width: "100%",
    alignItems: "center",
    marginBottom: height * 0.018,
  },
  modalIcon: {
    width: Math.max(width * 0.13, 44),
    height: Math.max(width * 0.13, 44),
    resizeMode: "contain",
    tintColor: "#fff",
  },
  modalHeading: {
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: "Inter_600SemiBold",
    fontSize: Math.max(width * 0.065, 16),
    marginBottom: height * 0.018,
  },
  modalLabel: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: Math.max(width * 0.038, 14),
    marginBottom: height * 0.008,
  },
  modalBody: {
    color: "#fff",
    fontFamily: "Inter_500Medium",
    fontSize: Math.max(width * 0.038, 14),
    lineHeight: Math.max(height * 0.028, 20),
    marginTop: height * 0.01,
  },
  modalEmphasis: {
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    fontSize: Math.max(width * 0.038, 14),
  },
  modalQuoteLabel: {
    color: "#3B81F5",
    fontFamily: "Inter_700Bold",
    fontSize: Math.max(width * 0.038, 14),
    marginTop: height * 0.016,
    marginBottom: height * 0.006,
  },
  modalQuote: {
    color: "#3B81F5",
    fontFamily: "Inter_600SemiBold",
    fontSize: Math.max(width * 0.04, 15),
    lineHeight: Math.max(height * 0.03, 22),
  },

  // Modal 2 específicos
  modalBodyMuted: {
    color: "rgba(255, 255, 255, 0.50)",
    fontFamily: "Inter_400Regular",
    fontSize: Math.max(width * 0.0342, 13),
    marginBottom: height * 0.02,
    textAlign: "left",
  },
  textAreaWrapper: {
    borderWidth: 2.5,
    borderColor: "#2563EA",
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 10,
    minHeight: height * 0.2,
    maxHeight: height * 0.32,
    marginBottom: height * 0.016,
    position: "relative",
  },
  textAreaScroll: {
    maxHeight: height * 0.28,
  },
  textArea: {
    color: "#FFFFFF",
    fontFamily: "Inter_400Regular",
    fontSize: Math.max(width * 0.038, 14),
    lineHeight: Math.max(height * 0.028, 20),
    minHeight: height * 0.18,
    textAlignVertical: "top",
  },
  tooltipImg: {
    position: "absolute",
    right: -width * 0.02,
    top: height * 0.02,
    width: width * 0.38,
    height: width * 0.22,
    resizeMode: "contain",
    opacity: 0.9,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: width * 0.04,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: height * 0.008,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: height * 0.01,
  },
  btnNeutral: {
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "#405A7B",
  },
  btnNeutralText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: Math.max(width * 0.042, 15),
  },
  btnPrimary: {
    backgroundColor: "#2563EB",
  },
  btnPrimaryText: {
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    fontSize: Math.max(width * 0.042, 15),
  },
  fixedFabs: {
    position: "absolute",
    right: width * 0.06,
    bottom: height * 0.15,
    alignItems: "center",
    justifyContent: "center",
  },
  fabIcon: {
    width: width * 0.14,
    height: width * 0.14,
    resizeMode: "contain",
  },
});


