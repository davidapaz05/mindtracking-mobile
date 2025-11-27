import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Dimensions,
    Image,
    LayoutChangeEvent,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    AthenaCard,
    ExportarJornadaCard,
    InfoCard,
    StatCard,
} from "../components/cards/cardDashboard1";
import { GraficoCard } from "../components/cards/grafico";

const { width, height } = Dimensions.get("window");

type HistoricoItem = {
  questionario_id: string;
  data: string;
  tipo: string;
  pontuacao: string;
  nota_convertida: string;
};

type CorrelacaoItem = {
  total_ocorrencias: string;
  texto_alternativa: string;
  texto_pergunta: string;
  pontuacao: number;
};

export default function Dashboard() {
  const router = useRouter();
  const [headerHeight, setHeaderHeight] = useState(0);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [jaRespondido, setJaRespondido] = useState<boolean | null>(null);
  const [pontuacaoMedia, setPontuacaoMedia] = useState<string | null>(null);
  const [dicaAPI, setDicaAPI] = useState<string | null>(null);
  const [conversasTotal, setConversasTotal] = useState<number | null>(null);
  const [correlacoes, setCorrelacoes] = useState<CorrelacaoItem[]>([]);
  const [correlacaoIndex, setCorrelacaoIndex] = useState(0);

  const textoPadraoRecomendacao =
    "Bem-vindo à MindTracking! Que tal começar conhecendo mais sobre como está se sentindo hoje?";

  // Carregar ID e token
  useEffect(() => {
    async function loadUserData() {
      const storedId = await AsyncStorage.getItem("usuario_id");
      const storedToken = await AsyncStorage.getItem("token");
      setUsuarioId(storedId);
      setToken(storedToken);
    }
    loadUserData();
  }, []);

  // Buscar histórico do usuário
  useEffect(() => {
    async function fetchHistorico() {
      if (!usuarioId || !token) return;
      try {
        const response = await fetch(
          `https://mindtracking-api-1.onrender.com/questionario/historico/${usuarioId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        if (data.success) {
          setHistorico(data.historico);
        } else {
          console.warn("Falha ao carregar histórico:", data.message);
        }
      } catch (error) {
        console.error("Erro ao buscar histórico:", error);
      }
    }
    fetchHistorico();
  }, [usuarioId, token]);

  // Verificar se já respondeu o questionário diário hoje
  useEffect(() => {
    async function verificarQuestionarioDiario() {
      if (!usuarioId || !token) return;
      try {
        const response = await fetch(
          `https://mindtracking-api-1.onrender.com/questionario/diario/verificar/${usuarioId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        if (data.success) {
          setJaRespondido(data.ja_respondido);
        } else {
          console.warn("Falha ao verificar questionário diário:", data.message);
        }
      } catch (error) {
        console.error("Erro na verificação do questionário diário:", error);
      }
    }
    verificarQuestionarioDiario();
  }, [usuarioId, token]);

  // Buscar pontuação média do usuário
  useEffect(() => {
    async function fetchPontuacaoMedia() {
      if (!usuarioId || !token) return;
      try {
        const response = await fetch(
          `https://mindtracking-api-1.onrender.com/questionario/pontuacao/${usuarioId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        if (data.success && data.nota !== undefined) {
          setPontuacaoMedia(String(data.nota));
        } else {
          console.warn("Falha ao carregar pontuação média.");
        }
      } catch (error) {
        console.error("Erro ao buscar pontuação média:", error);
      }
    }
    fetchPontuacaoMedia();
  }, [usuarioId, token]);

  // Buscar dica personalizada
  useEffect(() => {
    async function fetchDica() {
      if (!token) return;
      try {
        const response = await fetch("https://mindtracking-api-1.onrender.com/api/dica", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        if (data.success) {
          setDicaAPI(data.dica || textoPadraoRecomendacao);
        } else {
          if ("dica" in data && data.dica) {
            setDicaAPI(data.dica);
          } else {
            setDicaAPI(textoPadraoRecomendacao);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dica:", error);
        setDicaAPI(textoPadraoRecomendacao);
      }
    }
    fetchDica();
  }, [token]);

  // Buscar conversas Athena
  useEffect(() => {
    async function fetchConversas() {
      if (!token) {
        setConversasTotal(null);
        return;
      }
      try {
        const response = await fetch("https://mindtracking-api-1.onrender.com/api/diagnosticos", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && typeof data.total === "number" && data.total > 0) {
            setConversasTotal(data.total);
          } else {
            setConversasTotal(0);
          }
        } else {
          const text = await response.text();
          console.warn(`Resposta não OK: ${response.status} - ${text}`);
          setConversasTotal(0);
        }
      } catch (error) {
        console.error("Erro ao buscar total conversas Athena:", error);
        setConversasTotal(0);
      }
    }
    fetchConversas();
  }, [token]);

  // Buscar correlações a cada alteração de usuario/token
  useEffect(() => {
    async function fetchCorrelacoes() {
      if (!usuarioId || !token) return;
      try {
        const response = await fetch(
          `https://mindtracking-api-1.onrender.com/questionario/correlacoes/${usuarioId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.correlacoes)) {
            setCorrelacoes(data.correlacoes.slice(0, 4)); // até 4
            setCorrelacaoIndex(0);
          } else {
            setCorrelacoes([]);
          }
        } else {
          console.warn(
            `Falha ao buscar correlações - status: ${response.status}`
          );
          setCorrelacoes([]);
        }
      } catch (error) {
        console.error("Erro ao buscar correlações:", error);
        setCorrelacoes([]);
      }
    }
    fetchCorrelacoes();
  }, [usuarioId, token]);

  // Troca automática do índice da correlação a cada 5 segundos
  useEffect(() => {
    if (correlacoes.length <= 1) return;
    const intervalId = setInterval(() => {
      setCorrelacaoIndex((oldIndex) => (oldIndex + 1) % correlacoes.length);
    }, 5000);
    return () => clearInterval(intervalId);
  }, [correlacoes]);

  const onHeaderLayout = (event: LayoutChangeEvent) => {
    const h = event.nativeEvent?.layout?.height ?? 0;
    setHeaderHeight(h);
  };

  // Preparando dados para gráfico
  const data = historico.slice().reverse().map((item) => Number(item.nota_convertida));
  const xLabels = historico
    .slice()
    .reverse()
    .map((item) => {
      const datePart = item.data.substring(0, 10);
      const [year, month, day] = datePart.split("-");
      return `${day}/${month}`;
    });

  // Correlação atualmente exibida
  const currentCorrelacao = correlacoes[correlacaoIndex];
  const correlationItems = currentCorrelacao
    ? [
        {
          icon:
            currentCorrelacao.pontuacao >= 3
              ? require("@assets/icons/joiaverde.png")
              : require("@assets/icons/joiavermelho.png"),
          color: currentCorrelacao.pontuacao >= 3 ? "#16A34A" : "#E11D48",
          text: currentCorrelacao.texto_alternativa,
          questionText: currentCorrelacao.texto_pergunta,
        },
      ]
    : [];

  return (
    <View style={styles.container}>
      <View style={styles.fixedHeader} onLayout={onHeaderLayout}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.push("/(tabs)/home")}>
            <Image
              source={require("@assets/icons/seta.png")}
              style={styles.seta}
            />
          </TouchableOpacity>
          <View style={styles.textContainer}>
            <Text style={styles.perfilText}>Dashboard</Text>
          </View>
          <View style={{ width: width * 0.09 }} />
        </View>
        <Text style={styles.titleLarge}>Seu dashboard de clareza</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.cardsWrapper,
          { paddingTop: headerHeight + height * 0.02 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <StatCard
          title="Questionários respondidos"
          value={historico.length}
          deltaSign="up"
          deltaText="Parabéns continue assim!"
          icon={require("@assets/icons/clipboard.png")}
        />

        <InfoCard
          title="Estado Emocional Médio"
          subtitle={
            pontuacaoMedia
              ? `Pontuação média: ${pontuacaoMedia}`
              : "Carregando pontuação..."
          }
          icon={require("@assets/icons/grafico.png")}
        />

        <InfoCard
          title="Recomendação"
          subtitle={dicaAPI ?? textoPadraoRecomendacao}
          icon={require("@assets/icons/recomendacao.png")}
        />

        {/* Exibe apenas uma correlação por vez */}
        {currentCorrelacao && (
  <View
    style={{
      width: "100%",
      backgroundColor: "#1E293B",
      borderRadius: 10,
      padding: 16,
      marginBottom: height * 0.025,
      alignItems: "center",
    }}
  >
    <Text
      style={{
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 12,
      }}
    >
      Respostas frequentes
    </Text>

    <Text
      style={{
        color: "#94A3B8",
        fontSize: 16,
        marginBottom: 8,
        fontWeight: "600",
        textAlign: "center",
      }}
    >
      {correlationItems[0].questionText}
    </Text>
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Image
        source={correlationItems[0].icon}
        style={{ width: 24, height: 24 }}
      />
      <Text
        style={{
          color: correlationItems[0].color,
          fontSize: 18,
          fontWeight: "700",
        }}
      >
        {correlationItems[0].text}
      </Text>
    </View>
  </View>
)}


        <GraficoCard
          data={data}
          color="#38BDF8"
          title="Seu Bem-Estar Esta Semana"
          title2="Progresso dos últimos questionários:"
          xLabels={xLabels}
        />

        <AthenaCard
          title="Converse com a Athena"
          description={
            conversasTotal && conversasTotal > 0
              ? `${conversasTotal} conversas até agora.`
              : "Que tal conversar com athena¹"
          }
          onPress={() => router.push("/(tabs)/ia")}
          testID="athena-card"
        />

        <ExportarJornadaCard
          title="Exportar Jornada"
          description="Leve suas reflexões com você. Gere um arquivo PDF seguro para compartilhar com seu terapeuta ou guardar como um arquivo pessoal."
          onPress={() => {
            /* ação ao clicar, se desejar */
          }}
          testID="exportar-jornada-card"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    paddingHorizontal: width * 0.08,
    paddingBottom: height * 0.06,
  },
  cardsWrapper: {
    width: "100%",
    rowGap: height * 0.025,
    alignItems: "center",
    paddingTop: height * 0.02,
    paddingBottom: height * 0.1,
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
});
