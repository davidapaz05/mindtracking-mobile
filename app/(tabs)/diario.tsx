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
import diarioService from "../../service/diarioService";
import CardDiario from "../components/cards/cardDiario";

const { width, height } = Dimensions.get("window");

const diariosFake = [
  { id: '1', titulo: "Avanço no Projeto", data: "08/10/2025 - 16:31", texto: "Finalizei a integração entre React Native e backend simulando cards dinâmicos." },
  { id: '2', titulo: "Reunião com equipe", data: "07/10/2025 - 14:20", texto: "Discutimos melhorias para o app e definimos próximos passos." },
  { id: '3', titulo: "Estudo de UI/UX", data: "06/10/2025 - 09:10", texto: "Pesquisei tendências de design para melhorar a experiência do usuário." },
  { id: '4', titulo: "Testes automatizados", data: "05/10/2025 - 18:45", texto: "Implementei testes unitários para garantir a qualidade do código." },
];

type DiarioItem = {
  id?: string | number;
  _id?: string | number;
  titulo?: string;
  data?: string;
  texto: string;
};

export default function Diario() {
  const router = useRouter();
  const [diarios, setDiarios] = useState<DiarioItem[]>([]);
  const [headerHeight, setHeaderHeight] = useState<number>(0);

  // Normaliza várias formas de resposta da API para um array de diários consistentes
  const normalizeDiarios = (resp: any): DiarioItem[] => {
    if (!resp) return [];

    // extrai array de várias possíveis propriedades
    let arr: any[] = [];
    if (Array.isArray(resp)) arr = resp;
    else if (Array.isArray(resp.data)) arr = resp.data;
    else if (Array.isArray(resp.entradas)) arr = resp.entradas;
    else if (Array.isArray(resp.entrada)) arr = resp.entrada;
    else if (Array.isArray(resp.results)) arr = resp.results;
    else if (typeof resp === 'object' && Object.keys(resp).length > 0) {
      // às vezes a API retorna um objeto único em vez de array
      // verificar se tem propriedade 'entrada' com objeto único
      if (resp.entrada && !Array.isArray(resp.entrada)) arr = [resp.entrada];
      else if (resp.data && !Array.isArray(resp.data) && typeof resp.data === 'object') arr = [resp.data];
    }

    // mapear cada item para o formato esperado pelo app
    return arr.map((it: any) => {
      const src = it?.entrada ?? it?.diario ?? it;
      const _id = src?._id ?? src?.id ?? src?.ID ?? String(src?.id ?? src?._id ?? "");
      const titulo = src?.titulo ?? src?.title ?? src?.name ?? "";
      const texto = src?.texto ?? src?.text ?? src?.body ?? "";
      const dataRaw = src?.data ?? src?.data_hora ?? src?.createdAt ?? src?.created_at ?? src?.date ?? src?.dataHora ?? "";
      let data = "";
      try {
        if (dataRaw) {
          const d = new Date(dataRaw);
          data = !Number.isNaN(d.getTime()) ? d.toLocaleString() : String(dataRaw);
        }
      } catch (e) {
        data = String(dataRaw ?? "");
      }
      return { _id, titulo, texto, data } as DiarioItem;
    });
  };

  // Remove possíveis duplicatas (por _id quando disponível, caso contrário por hash de conteúdo)
  const dedupeDiarios = (items: DiarioItem[]): DiarioItem[] => {
    // If items have reliable _id fields, dedupe by _id only.
    const haveIds = items.some((it) => !!(it._id ?? it.id));
    if (haveIds) {
      const seen = new Map<string, DiarioItem>();
      for (const it of items) {
        const key = String(it._id ?? it.id ?? "");
        if (!seen.has(key)) seen.set(key, it);
      }
      return Array.from(seen.values());
    }

    // If there are no ids, assume items are unique and return as-is to avoid collapsing
    // legitimately identical content from different days.
    return items.slice();
  };

  // Ordena diários pela data (mais recente primeiro). Items com data inválida ficam por último.
  const sortDiarios = (items: DiarioItem[]): DiarioItem[] => {
    return items.slice().sort((a, b) => {
      const parse = (s?: string) => {
        if (!s) return 0;
        const t = Date.parse(String(s));
        return Number.isNaN(t) ? 0 : t;
      };
      const ta = parse(a.data);
      const tb = parse(b.data);
      return tb - ta;
    });
  };

  // Estados de modais
  const [modalAnaliseVisivel, setModalAnaliseVisivel] = useState(false);   // imagem 1
  const [modalEscritaVisivel, setModalEscritaVisivel] = useState(false);   // imagem 2
  const [modalRegistradoVisivel, setModalRegistradoVisivel] = useState(false); // imagem 3
  const [modalParabensVisivel, setModalParabensVisivel] = useState(false); // imagem 4

  // FAB
  const [fabState, setFabState] = useState<"plus" | "done">("plus");

  // Conteúdo
  const [selectedDiario, setSelectedDiario] = useState<DiarioItem | null>(null);
  const [textoDiario, setTextoDiario] = useState("");
  const [tituloDiario, setTituloDiario] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadDiarios() {
      try {
        const resp = await diarioService.getAllDiarios();
        const list = normalizeDiarios(resp);
        // if server returned nothing, fall back to example diaries so UI can be tested
        if (mounted) setDiarios(list && list.length ? dedupeDiarios(list) : diariosFake);
      } catch (e) {
        // fallback to example diaries on error
        if (mounted) setDiarios(diariosFake);
      }
    }

    loadDiarios();

    return () => {
      mounted = false;
    };
  }, []);

  const keyExtractor = useCallback((item: DiarioItem, index: number) => String(index), []);

  const abrirModalAnalise = useCallback((item: any) => {
    setSelectedDiario(null);
    setModalAnaliseVisivel(true);

    // if item has an id, fetch full diary from server
    (async () => {
      try {
        if (item && (item.id || item._id)) {
          const id = item.id ?? item._id;
          const resp = await diarioService.getDiarioById(id);
          setSelectedDiario(resp ?? item);
        } else {
          setSelectedDiario(item);
        }
      } catch (e) {
        // failed to fetch specific diary — show provided item
        setSelectedDiario(item);
      }
    })();
  }, []);

  const renderItem = useCallback(({ item }: { item: DiarioItem }) => {
    // Ensure CardDiario receives required string fields
    const safe = {
      titulo: item.titulo ?? "",
      data: item.data ?? "",
      texto: item.texto ?? "",
    };
    return (
      <View style={styles.cardWrapper}>
        <CardDiario
          diario={safe}
          onAnalyze={() => abrirModalAnalise(item)}
        />
      </View>
    );
  }, [abrirModalAnalise]);

  // New: robust renderItem and keyExtractor to handle server-returned shapes
  const keyExtractorById = useCallback((item: DiarioItem, index: number) => String(item._id ?? item.id ?? index), []);
  // Ensure keys are unique by appending index if necessary
  const safeKeyExtractor = useCallback((item: DiarioItem, index: number) => {
    const base = String(item._id ?? item.id ?? "");
    return base ? `${base}-${index}` : String(index);
  }, []);

  const renderDiarioItem = useCallback(({ item }: { item: DiarioItem }) => {
    const titulo = item.titulo ?? (item as any).title ?? (item as any).name ?? "";
    const texto = item.texto ?? (item as any).text ?? (item as any).body ?? "";
    const rawDate = item.data ?? (item as any).createdAt ?? (item as any).created_at ?? (item as any).date ?? "";
    let dataStr = "";
    try {
      if (rawDate) {
        const d = new Date(rawDate);
        dataStr = !Number.isNaN(d.getTime()) ? d.toLocaleString() : String(rawDate);
      }
    } catch (e) {
      dataStr = String(rawDate);
    }

    const safe = { titulo, data: dataStr, texto };
    return (
      <View style={styles.cardWrapper}>
        <CardDiario diario={safe} onAnalyze={() => abrirModalAnalise(item)} />
      </View>
    );
  }, [abrirModalAnalise]);

  const ItemSeparator = useCallback(() => <View style={styles.gap} />, []);
  const ListFooter = useCallback(() => <View style={styles.footerSpacer} />, []);

  const onHeaderLayout = useCallback((e: any) => {
    const h = e?.nativeEvent?.layout?.height ?? 0;
    setHeaderHeight((prev: number) => (prev !== h ? h : prev));
  }, []);

  // Ação do FAB
  const onPressFab = useCallback(() => {
    if (fabState === "plus") {
      // Abre o Modal 2 (Escrita no Diário)
      setTextoDiario("");
      setTituloDiario("");
      setModalEscritaVisivel(true);
    } else {
      // fabState === 'done' → abre Modal 3
      setModalRegistradoVisivel(true);
    }
  }, [fabState]);

  // Salvar do Modal 2
  const onSalvarReflexao = useCallback(async () => {
    try {
      // Require title and text (title is now mandatory)
      if (!tituloDiario.trim() || !textoDiario.trim()) {
        // Button should be disabled; guard here as well
        return;
      }

      // Try to send the diary to backend
      const payload = {
        titulo: tituloDiario.trim(),
        texto: textoDiario,
      };
      // debug: show payload in logs
      console.log('Diário - payload enviado:', payload);
      const resp = await diarioService.postDiario(payload);
      console.log('Diário - resposta do servidor:', resp);

      // Try to extract the created diary from the response so we can show it
      // immediately in the list. Backends may return the created object
      // directly or an envelope like { message, data }.
      let created: any = null;
      if (resp) {
        if (Array.isArray(resp)) {
          // ignore
        } else if (resp._id || resp.id || (resp.titulo && resp.texto)) {
          // API returned the created object at top level
          created = resp;
        } else if (resp.data && (resp.data._id || resp.data.id || (resp.data.titulo && resp.data.texto))) {
          // API returned envelope with data
          created = resp.data;
        } else if ((resp as any).diario && ((resp as any).diario._id || (resp as any).diario.id)) {
          // older envelope naming
          created = (resp as any).diario;
        } else if ((resp as any).entrada && ((resp as any).entrada._id || (resp as any).entrada.id || (resp as any).entrada.titulo)) {
          // handle backend that returns { entrada: { ... } }
          created = (resp as any).entrada;
        }
      }

      if (created) {
        const mapped = {
          _id: created._id ?? created.id ?? created._id ?? String((created as any).id ?? (created as any)._id ?? ""),
          titulo: created.titulo ?? created.title ?? "",
          texto: created.texto ?? created.text ?? created.body ?? "",
          data: (() => {
            const raw = created.data ?? created.createdAt ?? created.date ?? created.data_hora ?? created.dataHora ?? "";
            try {
              if (!raw) return "";
              const d = new Date(raw);
              return Number.isNaN(d.getTime()) ? String(raw) : d.toLocaleString();
            } catch (e) {
              return String(raw);
            }
          })(),
        } as DiarioItem;

        setDiarios((prev: DiarioItem[]) => dedupeDiarios([mapped, ...prev]));
      }

      // show success alert with optional server message
      Alert.alert('Sucesso', resp?.message || 'Diário enviado com sucesso');

      // Refresh list (normalizando diferentes formatos de resposta)
      try {
        const all = await diarioService.getAllDiarios();
        const list = normalizeDiarios(all);
        if (list && list.length) setDiarios(dedupeDiarios(list));
      } catch (err) {
        // ignore refresh errors
      }

      // Fecha Modal 2 e abre Modal 4 de parabéns
      setModalEscritaVisivel(false);
      setModalParabensVisivel(true);
      // Troca estado do FAB para 'done'
      setFabState("done");
      // clear inputs
      setTituloDiario("");
      setTextoDiario("");
    } catch (err: any) {
      // Show an alert or the 'already registered' modal depending on server message
      const msg = err?.response?.data?.message || err?.message || 'Erro ao enviar diário';
      console.log('Diário - erro ao enviar:', err?.response ?? err);

      // If backend reports that a diary already exists for today, show the registered modal
      try {
        const lower = String(msg).toLowerCase();
        if (/ja existe|já existe|já foi registrada|já foi registrado|already exists|already registered|registro.*hoje|registrad[ao].*hoje/.test(lower)) {
          // Close writing modal
          setModalEscritaVisivel(false);

          // Try to fetch today's diary from server and show it in the analysis modal.
          try {
            const all = await diarioService.getAllDiarios();
            const allList = normalizeDiarios(all);
            const today = new Date().toISOString().slice(0, 10);
            const found = (allList as any[]).find((d: any) => {
              const raw = d.data ?? "";
              if (!raw) return false;
              try {
                const day = new Date(raw).toISOString().slice(0, 10);
                return day === today;
              } catch (e) {
                return false;
              }
            });

            if (found) {
              setSelectedDiario(found);
              setModalAnaliseVisivel(true);
              return;
            }
          } catch (e) {
            // ignore fetch errors and fall back to the simple registered modal
          }

          // Fallback: open the existing 'already registered' modal
          setModalRegistradoVisivel(true);
          return;
        }
      } catch (e) {
        // ignore regex errors
      }

      Alert.alert('Erro ao enviar diário', msg, [{ text: 'OK' }]);
      // keep the writing modal open so the user can retry
      setModalEscritaVisivel(true);
    }
  }, [tituloDiario, textoDiario]);

  // Fechar Modal 4 e voltar para a tela normal
  const onFecharParabens = useCallback(() => {
    setModalParabensVisivel(false);
  }, []);

  // Fechar Modal 3 (informativo de já registrado)
  const onFecharRegistrado = useCallback(() => {
    setModalRegistradoVisivel(false);
  }, []);

  return (
    <View style={styles.screen}>
      {/* Header fixo */}
      <View style={styles.fixedHeader} onLayout={onHeaderLayout}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/home')}>
            <Image
              source={require("@assets/icons/seta.png")}
              style={styles.seta}
            />
          </TouchableOpacity>

          <View style={styles.textContainer}>
            <Text style={styles.perfilText}>Meus Diários</Text>
          </View>

          <View style={{ width: width * 0.09 }} />
        </View>

        <Text style={styles.titleLarge}>
          Seu refúgio de pensamentos seguros
        </Text>
      </View>

      {/* Lista */}
      <FlatList
        style={styles.list}
        contentContainerStyle={[
          styles.listContentBase,
          { paddingTop: headerHeight },
        ]}
  data={diarios}
  keyExtractor={safeKeyExtractor}
  renderItem={renderDiarioItem}
        ItemSeparatorComponent={ItemSeparator}
        ListFooterComponent={ListFooter}
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
              <Image
                source={require("@assets/icons/x.png")}
                style={styles.modalCloseIcon}
              />
            </TouchableOpacity>

            <View style={styles.modalIconWrap}>
              <Image
                source={require("@assets/icons/logo.png")}
                style={styles.modalIcon}
              />
            </View>

            <Text style={styles.modalHeading}>
              {selectedDiario?.titulo ?? "Análise"}
            </Text>

            <Text style={styles.modalLabel}>
              Mensagem:
              <Text style={styles.modalBody}>
                {" "}{selectedDiario?.texto ?? ""}
              </Text>
            </Text>

            <Text style={styles.modalLabel}>
              Emoção predominante:
              <Text style={styles.modalEmphasis}>
                {" "}
                {(
                  (selectedDiario as any)?.emocao_predominante
                  ?? (selectedDiario as any)?.emocaoPredominante
                  ?? (selectedDiario as any)?.entrada?.emocao_predominante
                  ?? (selectedDiario as any)?.entrada?.emocaoPredominante
                  ?? (selectedDiario as any)?.emocao
                  ?? "-"
                ).toString()}
              </Text>
            </Text>

            <Text style={styles.modalQuoteLabel}>
              Athena diz:
              <Text style={styles.modalQuote}>
                {" "}
                {(
                  (selectedDiario as any)?.comentario_athena
                  ?? (selectedDiario as any)?.comentarioAthena
                  ?? (selectedDiario as any)?.entrada?.comentario_athena
                  ?? (selectedDiario as any)?.entrada?.comentarioAthena
                  ?? (selectedDiario as any)?.comentario
                  ?? "A análise ainda não está disponível."
                ).toString()}
              </Text>
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
              <Image
                source={require("@assets/icons/x.png")}
                style={styles.modalCloseIcon}
              />
            </TouchableOpacity>

            <View style={styles.modalIconWrap}>
              <Image
                source={require("@assets/icons/logo.png")}
                style={styles.modalIcon}
              />
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
            <Text style={styles.modalBodyMuted}>
              Escreva livremente - somente você verá isso.
            </Text>

            {/* Caixa de texto com rolagem quando exceder o tamanho */}
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
              {/* Balão/tooltip com imagem PNG de orientação (substituir o caminho pelo seu arquivo) */}
              <Image
                source={{ uri: "file:///SEU/CAMINHO/tooltip-diario.png" }}
                style={styles.tooltipImg}
              />
            </View>

            {/* Ações */}
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

      {/* Modal 4 — Parabéns (após salvar) */}
      <Modal
        visible={modalParabensVisivel}
        transparent
        animationType="fade"
        onRequestClose={onFecharParabens}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { borderColor: "#15803D", borderWidth: 2.5 }]}>
            <Text style={[styles.modalHeading, { textAlign: "left" }]}>Reflexão Salva!</Text>
            <Text style={styles.modalBody}>
              Parabéns por dedicar um momento para si. Cada registro é um passo importante na sua jornada de autoconhecimento.
            </Text>

            <TouchableOpacity
              style={[styles.singleActionBtn, styles.btnSuccess]}
              onPress={onFecharParabens}
              activeOpacity={0.9}
            >
              <Text style={styles.btnSuccessText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal 3 — Já registrado hoje */}
      <Modal
        visible={modalRegistradoVisivel}
        transparent
        animationType="fade"
        onRequestClose={onFecharRegistrado}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { borderColor: "#15803D", borderWidth: 2.5 }]}>
            <Text style={[styles.modalHeading, { textAlign: "left" }]}>
              Sua reflexão de hoje já foi registrada.
            </Text>
            <Text style={styles.modalBody}>
              Para incentivar um registro focado e significativo, nossa plataforma foi desenhada para um diário emocional por dia. Isso ajuda a consolidar os pensamentos e sentimentos mais importantes do seu dia.
            </Text>

            <TouchableOpacity
              style={[styles.singleActionBtn, styles.btnSuccess]}
              onPress={onFecharRegistrado}
              activeOpacity={0.9}
            >
              <Text style={styles.btnSuccessText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* FAB fixo */}
      <View style={styles.fixedFabs} pointerEvents="box-none">
        <TouchableOpacity onPress={onPressFab} activeOpacity={0.9}>
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
  screen: {
    flex: 1,
    backgroundColor: "#0F172A",
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
    backgroundColor: "#0F172A"
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
  titleInput: {
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: "Inter_600SemiBold",
    fontSize: Math.max(width * 0.065, 16),
    marginBottom: height * 0.018,
    borderBottomWidth: 0,
    paddingVertical: 0,
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
    color: 'rgba(255, 255, 255, 0.50)',
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

  // Modais 3 e 4 — botões únicos
  singleActionBtn: {
    marginTop: height * 0.03,
    paddingVertical: height * 0.008,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSuccess: {
    backgroundColor: "#15803D",
  },
  btnSuccessText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: Math.max(width * 0.042, 15),
  },

  // FAB
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
