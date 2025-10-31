import { useRouter } from "expo-router";
import React, { useRef } from "react";
import { Animated, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";

const { width, height } = Dimensions.get("window");

const slides = [
  { title: "Bem-vindo ao MindTracking", text: "Seu aplicativo de Monitoramento Mental", image: require("../../assets/images/img_carrosel1.png") },
  { title: "Análise de progresso", text: "Acompanhe seu progresso mental com gráficos detalhados", image: require("../../assets/images/img_carrosel2.png") },
  { title: "Metas de Bem-Estar", text: "Defina e acompanhe suas metas para evolução constante", image: require("../../assets/images/img_carrosel3.png") },
];

const Carousel = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const swiperRef = useRef<any>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const goNext = () => swiperRef.current.scrollBy(1);
  const goBack = () => swiperRef.current.scrollBy(-1);
  const skipToNextPage = () => swiperRef.current.scrollBy(2);
  const startApp = () => router.push("/auth/pre-login");

  return (
    <View style={styles.container}>
      <Image source={require("@assets/icons/logo.png")} style={styles.logo} />

      <Swiper
        ref={swiperRef}
        loop={false}
        dotStyle={styles.dot}
        style={{ backgroundColor: "#0F172A" }}
        activeDotStyle={styles.activeDot}
        paginationStyle={styles.pagination}
        onIndexChanged={(index) => {
          Animated.timing(animatedValue, { toValue: index, duration: 350, useNativeDriver: true }).start();
        }}
      >
        {slides.map((slide, index) => {
          const opacity = animatedValue.interpolate({
            inputRange: [index - 1, index, index + 1],
            outputRange: [0, 1, 0],
            extrapolate: "clamp",
          });

          return (
            <View key={index} style={styles.slide}>
              <View style={styles.slideContainer}>
                <Animated.Image source={slide.image} style={[styles.image, { opacity }]} resizeMode="contain" />
                <Animated.Text style={[styles.title, { opacity }]}>{slide.title}</Animated.Text>
                <Animated.Text style={[styles.text, { opacity }]}>{slide.text}</Animated.Text>

                <View style={[styles.buttonContainer, { bottom: height * 0.04 + insets.bottom }] }>
                  {index !== 0 ? (
                    <TouchableOpacity style={styles.button} onPress={goBack}>
                      <Text style={styles.buttonText}>Voltar</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.button} onPress={skipToNextPage}>
                      <Text style={styles.buttonText}>Pular</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity style={[styles.button, index === slides.length - 1 && styles.buttonLast]} onPress={index === slides.length - 1 ? startApp : goNext}>
                    <Text style={[styles.buttonText, index === slides.length - 1 && styles.buttonLastText]}>
                      {index === slides.length - 1 ? "Entrar e Começar" : "Próximo"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </Swiper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
  },

  logo: {
    width: width * 0.15,
    height: height * 0.07,
    position: "absolute",
    top: height * 0.08,
    left: width * 0.08,
    zIndex: 1,
    resizeMode: "contain",
  },

  dot: {
    backgroundColor: "#D2D4D6",
    width: width * 0.035,
    height: width * 0.035,
    borderRadius: 10,
    marginHorizontal: 5,
  },

  activeDot: {
    backgroundColor: "#2E5BFF",
    width: width * 0.07,
    height: width * 0.035,
    borderRadius: 5,
    marginHorizontal: 5,
  },

  pagination: {
    position: "absolute",
    top: height * 0.35,
  },

  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  slideContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: width * 0.05,
  },

  image: {
    width: width * 0.9,
    height: height * 0.45,
    marginBottom: height * 0.04,
  },

  title: {
    fontSize: width * 0.06,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: height * 0.015,
  },

  text: {
    fontSize: width * 0.045,
    color: "#B3B3B3",
    textAlign: "center",
    paddingHorizontal: width * 0.05,
  },

  buttonContainer: {
    position: "absolute",
    bottom: height * 0.05,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: width * 0.04,
  },

  button: {
    paddingVertical: height * 0.015,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: width * 0.04,
    fontWeight: "bold",
  },

  buttonLast: {
    backgroundColor: "#2E5BFF",
    borderRadius: 50,
    paddingHorizontal: width * 0.04,
  },

  buttonLastText: {
    color: "#FFFFFF",
  },
});

export default Carousel;
