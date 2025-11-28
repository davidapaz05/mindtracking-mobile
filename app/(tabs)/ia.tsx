import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import CustomButton from "../components/cards/cardIA";
import InputIA from "../components/common/input/inputIA";

const { width, height } = Dimensions.get("window");

// Função para enviar mensagem para o endpoint da API
const sendMessage = async (msg: string) => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await fetch("http://52.5.7.244/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message: msg }),
    });

    const data = await response.json();
    console.log("Resposta da API:", data); // Para debugar

    if (data.success) {
      return data.response;
    } else {
      return data.message || "Desculpa, não consegui entender.";
    }
  } catch (e) {
    return "Erro na conexão.";
  }
};

type Message = { text: string; from: "user" | "bot" };

// Componente para os três pontinhos animados
const LoadingDots = () => {
  const [dotCount, setDotCount] = useState(1);
  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev === 3 ? 1 : prev + 1));
    }, 500);
    return () => clearInterval(interval);
  }, []);
  return (
    <Text style={{ color: '#E2E8F0', fontSize: width * 0.04 }}>
      {' '.repeat(1)}{'.'.repeat(dotCount)}
    </Text>
  );
};

// Função para renderizar texto formatado com negrito e tópicos
function renderFormattedText(text: string) {
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    if (line.startsWith('- ')) {
      return (
        <View key={idx} style={{ flexDirection: 'row', marginBottom: 2 }}>
          <Text style={{ color: '#E2E8F0', fontSize: width * 0.04, marginRight: 6 }}>{'\u2022'}</Text>
          <Text style={{ color: '#E2E8F0', fontSize: width * 0.04, flexShrink: 1 }}>{line.slice(2)}</Text>
        </View>
      );
    }
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <Text key={idx} style={{ color: '#E2E8F0', fontSize: width * 0.04 }}>
        {parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            const content = part.slice(2, -2);
            return (
              <Text key={i} style={{ fontWeight: 'bold', color: '#E2E8F0' }}>
                {content}
              </Text>
            );
          }
          return part;
        })}
      </Text>
    );
  });
}

export default function PreLogin() {
  const router = useRouter();

  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatStarted, setChatStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const loadingMsgId = useRef<number | null>(null);

  const handleSend = async (text?: string) => {
    const toSend = (text ?? inputValue).trim();
    if (!toSend) return;

    setMessages(prev => [...prev, { text: toSend, from: "user" }]);
    setInputValue("");
    setChatStarted(true);

    setLoading(true);
    setMessages(prev => {
      loadingMsgId.current = prev.length;
      return [...prev, { text: "", from: "bot" }];
    });

    const reply = await sendMessage(toSend);

    setLoading(false);
    setMessages(prev => {
      if (loadingMsgId.current !== null) {
        const newMessages = [...prev];
        newMessages[loadingMsgId.current] = { text: reply, from: "bot" };
        loadingMsgId.current = null;
        return newMessages;
      }
      return [...prev, { text: reply, from: "bot" }];
    });
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const isChat = chatStarted && messages.length > 0;

  return (
    <View style={styles.container}>
      {!isChat ? (
        <View style={styles.topo}>
          <Image source={require("../../assets/icons/logo.png")} style={styles.logo} resizeMode="contain" />
          <View style={styles.titulos}>
            <Text style={styles.title}>Athena</Text>
            <Text style={styles.subtitle}>Sua aliada emocional</Text>
          </View>
        </View>
      ) : (
        <View style={styles.headerFixed}>
          <View style={[styles.headerRow, styles.headerRowChat]}>
            <Image
              source={require("../../assets/icons/logo.png")}
              style={[styles.logo, styles.logoChat, styles.logoChatActive]}
              resizeMode="contain"
            />
            <Text style={[styles.title, styles.titleChat, styles.titleChatActive]}>Assistente Emocional</Text>
          </View>
        </View>
      )}

      {!isChat ? (
        <View style={styles.inferior}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            style={styles.cardsScroll}
          >
            <CustomButton title="O que posso fazer para me sentir melhor hoje?" onPress={() => handleSend("O que posso fazer para me sentir melhor hoje?")} />
            <CustomButton title="Registrar meu humor" onPress={() => handleSend("Registrar meu humor")} />
            <CustomButton title="Meditação guiada" onPress={() => handleSend("Meditação guiada")} />
            <CustomButton title="Exercícios rápidos" onPress={() => handleSend("Exercícios rápidos")} />
          </ScrollView>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
          >
            <InputIA
              value={inputValue}
              onChangeText={setInputValue}
              onIconPress={() => handleSend()}
              placeholder="Digite sua mensagem..."
            />
          </KeyboardAvoidingView>
        </View>
      ) : (
        <View style={{ flex: 1, paddingBottom: height * 0.12, marginTop: height * 0.06 }}>
          <FlatList
            data={messages}
            keyExtractor={(_, idx) => String(idx)}
            contentContainerStyle={styles.chatContainer}
            style={styles.chatScroll}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              if (item.from === "user") {
                return (
                  <View style={[styles.messageBubble, styles.messageBubbleUser, { alignSelf: "flex-end" }]}>
                    <Text style={[styles.messageText, styles.messageTextUser]}>{item.text}</Text>
                  </View>
                );
              }
              if (loading && item.text === "") {
                return (
                  <View style={[styles.messageBubble, styles.messageBubbleBot, { alignSelf: "flex-start" }]}>
                    <LoadingDots />
                  </View>
                );
              }
              return (
                <View style={[styles.messageBubble, styles.messageBubbleBot, { alignSelf: "flex-start" }]}>
                  {renderFormattedText(item.text)}
                </View>
              );
            }}
            ListHeaderComponent={<View style={{ height: height * 0.06 }} />}
            maintainVisibleContentPosition={{ minIndexForVisible: 1 }}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
          >
            <InputIA
              value={inputValue}
              onChangeText={setInputValue}
              onIconPress={() => handleSend()}
              placeholder="Digite sua mensagem..."
            />
          </KeyboardAvoidingView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardsScroll: {},
  inputFixedWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: height * 0.14 + height * 0.02,
    paddingHorizontal: width * 0.08,
    backgroundColor: "#0F172A",
  },
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    paddingHorizontal: width * 0.08,
    paddingVertical: height * 0.06,
    justifyContent: "center",
  },
  logo: {
    width: width * 0.42,
    height: height * 0.1,
    marginBottom: height * -0.03,
  },
  logoChat: {
    width: width * 0.13,
    height: height * 0.06,
    marginBottom: 0,
    marginRight: width * 0.02,
    alignSelf: "flex-end",
  },
  logoChatActive: {
    width: width * 0.18,
    height: height * 0.11,
  },
  topo: {
    gap: height * 0.05,
    marginBottom: height * 0.02,
    alignItems: "center",
  },
  topoChat: {
    marginBottom: height * 0.01,
    alignItems: "flex-start",
    paddingTop: height * 0.01,
  },
  headerFixed: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: "#0F172A",
    paddingHorizontal: width * 0.08,
    paddingTop: height * 0.06,
    paddingBottom: height * 0.02,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerRowChat: {
    justifyContent: "flex-end",
    alignItems: "flex-start",
    width: "100%",
    marginBottom: 0,
  },
  titulos: {
    gap: height * 0.001,
    marginBottom: height * 0.05,
  },
  title: {
    fontSize: width * 0.09,
    color: "#fff",
    textAlign: "center",
    fontFamily: "Inter_600SemiBold",
  },
  titleChat: {
    fontSize: width * 0.06,
    color: "#fff",
    textAlign: "left",
    fontFamily: "Inter_600SemiBold",
    marginLeft: width * 0.01,
    alignSelf: "center",
  },
  titleChatActive: {
    fontSize: width * 0.055,
    fontFamily: "Inter_700Bold",
    marginRight: width * 0.07,
  },
  subtitle: {
    fontSize: width * 0.04,
    color: "#ffffffff",
    textAlign: "center",
    marginBottom: height * 0.03,
    fontFamily: "Inter_600SemiBold",
  },
  scrollContent: {
    flexDirection: "row",
    gap: width * 0.05,
    paddingHorizontal: width * 0.02,
    marginBottom: 0,
    paddingVertical: height * 0.015,
  },
  inferior: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: height * 0.14 + height * 0.02,
    paddingHorizontal: width * 0.08,
  },
  chatScroll: {
    flex: 1,
    marginBottom: height * 0.02,
    maxHeight: "100%",
  },
  chatContainer: {
    paddingBottom: height * 0.02,
    justifyContent: "flex-end",
  },
  messageBubble: {
    borderRadius: 12,
    padding: 10,
    marginVertical: 4,
    maxWidth: "80%",
  },
  messageBubbleUser: {
    backgroundColor: "#29374F",
  },
  messageBubbleBot: {
    backgroundColor: "#4A5568",
  },
  messageText: {
    fontSize: width * 0.04,
  },
  messageTextUser: {
    color: "#fff",
  },
});
