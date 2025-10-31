import CustomButton from "../components/cards/cardIA";
import InputIA from "../components/common/input/inputIA";

import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";

const { width, height } = Dimensions.get("window");

// ... imports inalterados

export default function PreLogin() {
  const router = useRouter();

  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [chatStarted, setChatStarted] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Aceita texto opcional para envio programático (cards)
  const handleSend = (text?: string) => {
    const toSend = (text ?? inputValue).trim();
    if (!toSend) return;
    setMessages(prev => [...prev, toSend]);
    setInputValue("");      // não polui o teclado
    setChatStarted(true);   // força header fixo quando começar
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const isChat = chatStarted && messages.length > 0;

  return (
    <View style={styles.container}>
      {/* Header dinâmico igual ao seu */}
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

      {/* Cards + Input */}
      {!isChat ? (
        <View style={styles.inferior}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            style={styles.cardsScroll}
          >
            <CustomButton
              title="O que posso fazer para me sentir melhor hoje?"
              onPress={() => handleSend("O que posso fazer para me sentir melhor hoje?")}
            />
            <CustomButton
              title="Registrar meu humor"
              onPress={() => handleSend("Registrar meu humor")}
            />
            <CustomButton
              title="Meditação guiada"
              onPress={() => handleSend("Meditação guiada")}
            />
            <CustomButton
              title="Exercícios rápidos"
              onPress={() => handleSend("Exercícios rápidos")}
            />
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
        <View style={{flex: 1, paddingBottom: height * 0.12, marginTop: height * 0.06}}>
          <FlatList
            data={messages}
            keyExtractor={(_, idx) => String(idx)}
            contentContainerStyle={styles.chatContainer}
            style={styles.chatScroll}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.messageBubble}>
                <Text style={styles.messageText}>{item}</Text>
              </View>
            )}
            ListHeaderComponent={<View style={{height: height * 0.06}} />} // Espaço do tamanho do header
            maintainVisibleContentPosition={{
              minIndexForVisible: 1,
            }}
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
    backgroundColor: "#29374F",
    borderRadius: 12,
    padding: 10,
    marginVertical: 4,
    alignSelf: "flex-end",
    maxWidth: "80%",
  },
  messageText: {
    color: "#fff",
    fontSize: width * 0.04,
  },
  input: {
    marginBottom: height * 0.1,
  },
});