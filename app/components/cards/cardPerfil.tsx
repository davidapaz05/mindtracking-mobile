import React from "react";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Pegando as dimensões da tela
const { width, height } = Dimensions.get("window");

// Mapeando tipos para seus respectivos ícones e textos
const CARD_CONFIG = {
  progresso: {
    texto: "Progresso",
    icone: require("@assets/icons/diagnostico.png"), // Altere para caminho correto do ícone
  },
  alterarSenha: {
    texto: "Alterar senha",
    icone: require("@assets/icons/locker.png"),
  },
  editarPerfil: {
    texto: "Editar perfil",
    icone: require("@assets/icons/Edit.png"),
  },
  sairDaConta: {
    texto: "Sair da conta",
    icone: require("@assets/icons/logout.png"),
  },
};

type CardDenominadoProps = {
  tipo: keyof typeof CARD_CONFIG;
  onPress?: () => void;
};

const CardDenominado = ({ tipo, onPress }: CardDenominadoProps) => {
  const config = CARD_CONFIG[tipo];

  if (!config) return null;

  // Usa TouchableOpacity apenas quando onPress for fornecido, senão usa View
  const Container: any = onPress ? TouchableOpacity : View;

  return (
    <Container style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Image source={config.icone} style={styles.icone} />
      <Text style={styles.texto}>{config.texto}</Text>
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#29374F",
    borderRadius: 24,
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.05,
    marginBottom: height * 0.02,
  },
  icone: {
    width: 28,
    height: 28,
    marginRight: width * 0.03,
    resizeMode: "contain",
  },
  texto: {
    color: "#fff",
    fontSize: width * 0.045,
    fontWeight: "bold",
  },
});

export default CardDenominado;
