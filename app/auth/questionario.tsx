import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  fetchQuestions as fetchQuestionsService,
  submitAnswers as submitAnswersService,
} from "../../service/questionarioService";

const { width, height } = Dimensions.get("window");

// --- Função auxiliar: decodifica JWT ---
function decodeJwt(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");

    let json: string | null = null;
    const atobFn = (global as any).atob || (globalThis as any).atob;

    if (typeof atobFn === "function") {
      const decoded = atobFn(base64);
      json = decodeURIComponent(
        Array.prototype
          .map.call(decoded, (c: string) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
    } else if (typeof (global as any).Buffer !== "undefined") {
      json = (global as any).Buffer.from(base64, "base64").toString("utf8");
    } else {
      return null;
    }

    if (!json) return null;
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function Questionnaire() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mode = String(params?.mode ?? "");

  const [questions, setQuestions] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const AnimatedView: any = Animated.View;

  // --- Recupera o ID do usuário autenticado ---
  useEffect(() => {
    const idFromParams = String(params?.usuario_id || "");
    if (idFromParams) {
      setUsuarioId(idFromParams);
      AsyncStorage.setItem("usuario_id", idFromParams); // garante persistência
    } else {
      // Fallback para AsyncStorage e token JWT já implementado abaixo
      async function getUserId() {
        try {
          let storedId = await AsyncStorage.getItem("usuario_id");
          if (storedId) {
            setUsuarioId(storedId);
            return;
          }
          const token = await AsyncStorage.getItem("token");
          if (token) {
            const payload = decodeJwt(token);
            const id = payload?.id || payload?.user?.id || null;
            if (id) {
              storedId = String(id);
              await AsyncStorage.setItem("usuario_id", storedId);
              setUsuarioId(storedId);
            }
          }
        } catch (e) {
          console.log("Erro ao recuperar usuario_id:", e);
        }
      }
      getUserId();
    }
  }, [params?.usuario_id]);

  // --- Atualiza barra de progresso ---
  useEffect(() => {
    const total = questions.length;
    const newProgress = total === 0 ? 0 : (currentQuestionIndex / total) * 100;

    Animated.timing(progressAnim, {
      toValue: newProgress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentQuestionIndex, questions.length, progressAnim]);

  // --- Busca perguntas do backend ---
  useEffect(() => {
    let mounted = true;
    async function loadQuestions() {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token && mode === "diario") {
          console.log("Token não encontrado - redirecionando para login");
          if (mounted) setLoading(false);
          router.replace("/auth/login");
          return;
        }

        const resp = await fetchQuestionsService(mode === "diario" ? "diario" : undefined);
        if (mounted && resp) {
          const raw = Array.isArray(resp) ? resp : resp.perguntas ?? [];
          if (Array.isArray(raw) && raw.length > 0) {
            setQuestions(
              raw.map((q: any, idx: number) => ({
                id: Number(q.id ?? idx + 1),
                text: String(q.text ?? q.texto ?? q.pergunta ?? ""),
                alternativas: Array.isArray(q.alternativas)
                  ? q.alternativas.map((a: any) => ({
                      id: Number(a.id),
                      texto: a.texto ?? a.text ?? String(a),
                      pontuacao: a.pontuacao ?? null,
                    }))
                  : [],
              }))
            );
          }
        }
      } catch (e) {
        console.log("Erro ao carregar perguntas:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadQuestions();
    return () => {
      mounted = false;
    };
  }, [mode]);

  // --- Avançar questão ---
  const handleNext = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((c) => c + 1);
    } else {
      await submitAnswers();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex((c) => c - 1);
  };

  // --- Selecionar alternativa ---
  const handleSelect = async (alternativaId: number) => {
    const perguntaId = questions[currentQuestionIndex]?.id;
    if (!perguntaId) return;
    setSelected((s) => ({ ...s, [perguntaId]: alternativaId }));

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((c) => c + 1);
    } else {
      await submitAnswers();
    }
  };

  // --- Envia respostas para o backend ---
  const submitAnswers = async () => {
    setSubmitting(true);
    try {
      const respostas = questions
        .map((q: any) => ({
          pergunta_id: q.id,
          alternativa_id: selected[q.id],
        }))
        .filter((r) => r.alternativa_id !== undefined && r.alternativa_id !== null);

      const body: any = { respostas };

      // adiciona usuario_id no corpo da requisição
      if (usuarioId) body.usuario_id = Number(usuarioId);

      await submitAnswersService(body, mode);

      await AsyncStorage.removeItem("questionario_pending");
      const today = new Date().toISOString().slice(0, 10);
      await AsyncStorage.setItem("diario_last_done", today);
      await AsyncStorage.setItem("diario_show_modal", "true");

      router.replace("/(tabs)/home");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err?.message ??
        "Não foi possível enviar suas respostas.";
      Alert.alert("Erro", String(message));
    } finally {
      setSubmitting(false);
    }
  };

  // --- Renderiza barra de progresso ---
  const renderProgressBar = () => {
    const total = questions.length;
    const progress = total === 0 ? 0 : (currentQuestionIndex / total) * 100;

    return (
      <>
        <View style={styles.progressWrapper}>
          <Text style={styles.progressText}>Progresso</Text>
          <Text style={styles.progressText}>{`${Math.round(progress)}%`}</Text>
        </View>

        <View style={styles.progressContainer}>
          <AnimatedView
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>
      </>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando perguntas...</Text>
      </View>
    );
  }

  if (!loading && (!questions || questions.length === 0)) {
    return (
      <View style={styles.container}>
        <Text style={[styles.questionText, { textAlign: "center" }]}>
          Nenhuma pergunta disponível no momento.
        </Text>
        <TouchableOpacity
          style={styles.option}
          onPress={() => router.replace("/(tabs)/home")}
        >
          <Text style={styles.optionText}>Concluir</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <View style={styles.container}>
      <View style={styles.backButtonWrapper}>
        {currentQuestionIndex > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Image
              source={require("../../assets/icons/seta.png")}
              style={styles.seta}
            />
          </TouchableOpacity>
        )}
      </View>

      {renderProgressBar()}

      <View style={styles.middleWrapper}>
        <View style={styles.questionWrapper}>
          <View style={styles.verticalLine} />
          <Text style={styles.questionText}>{currentQuestion?.text ?? ""}</Text>
        </View>
      </View>

      <View style={styles.optionContainer}>
        {currentQuestion?.alternativas?.map((alt: any) => {
          const isSelected = selected[currentQuestion.id] === alt.id;
          return (
            <TouchableOpacity
              key={String(alt.id)}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => handleSelect(alt.id)}
            >
              <View style={[styles.radio, isSelected && styles.radioSelected]} />
              <Text style={styles.optionText}>{alt.texto}</Text>
            </TouchableOpacity>
          );
        })}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F172A",
  },
  loadingText: {
    fontSize: width * 0.05,
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
  },
  backButtonWrapper: {
    height: height * 0.06,
    marginBottom: height * 0.02,
    justifyContent: "center",
  },
  backButton: {
    marginBottom: height * 0.01,
    marginTop: height * 0.05,
  },
  seta: {
    width: width * 0.09,
    height: width * 0.08,
    tintColor: "#fff",
    resizeMode: "contain",
    marginBottom: height * 0.025,
    transform: [{ rotate: "90deg" }],
  },
  progressWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: height * 0.02,
  },
  progressText: {
    color: "#fff",
    fontSize: width * 0.04,
    fontFamily: "Inter_500Medium",
  },
  progressContainer: {
    height: height * 0.015,
    backgroundColor: "#1E293B",
    borderRadius: width * 0.02,
    overflow: "hidden",
    marginBottom: height * 0.04,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#2E5BFF",
    borderRadius: width * 0.02,
  },
  middleWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  questionWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: width * 0.02,
  },
  verticalLine: {
    width: width * 0.009,
    backgroundColor: "#fff",
    marginRight: width * 0.03,
    borderRadius: 2,
  },
  questionText: {
    flex: 1,
    fontSize: width * 0.055,
    fontWeight: "600",
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
  },
  optionContainer: {
    marginTop: "auto",
    marginBottom: height * 0.08,
    gap: height * 0.02,
  },
  option: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#29374F",
    borderRadius: 24,
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.05,
  },
  optionSelected: {
    backgroundColor: "#3357D6",
  },
  radio: {
    width: width * 0.05,
    height: width * 0.05,
    borderRadius: width * 0.025,
    borderWidth: 2,
    borderColor: "white",
    marginRight: width * 0.04,
  },
  radioSelected: {
    backgroundColor: "#2E5BFF",
    borderColor: "#2E5BFF",
  },
  optionText: {
    color: "white",
    fontSize: width * 0.045,
    fontFamily: "Inter_500Medium",
    flex: 1,
    flexWrap: "wrap",
  },
});
