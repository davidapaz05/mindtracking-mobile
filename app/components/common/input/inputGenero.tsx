import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Easing,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const GENDERS = ["Masculino", "Feminino", "Outro"];

type Props = {
  value?: string;
  onChange?: (v: string) => void;
};

export default function InputGender({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(value ?? "");

  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggleDropdown = () => {
    setOpen(!open);
  };

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: open ? 1 : 0,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [open]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["-180deg", "0deg"],
  });

  const handleSelect = (gender: string) => {
    if (onChange) onChange(gender);
    else setSelected(gender);
    setOpen(false);
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho do input */}
      <TouchableOpacity
        style={styles.header}
        onPress={toggleDropdown}
        activeOpacity={0.8}
      >
        <Image
          source={require("@assets/icons/genero.png")}
          style={styles.icon}
          resizeMode="contain"
        />

        <Text style={[styles.inputText, !selected && { color: "#fff" }]}> 
          {selected || value || "Selecione o gênero"}
        </Text>

        <Animated.View
          style={[styles.arrowContainer, { transform: [{ rotate: rotateInterpolate }] }]}
        >
          <Image
            source={require("@assets/icons/seta.png")}
            style={{ width: 18, height: 18, tintColor: "#fff" }}
            resizeMode="contain"
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Opções dentro do mesmo container */}
      {open && (
        <FlatList
          data={GENDERS}
          keyExtractor={(item) => item}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => handleSelect(item)}
              style={[
                styles.item,
                index === GENDERS.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <Text style={styles.itemText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 342,
    borderWidth: 2,
    borderColor: "#2563EA",
    backgroundColor: "#1F2937",
    borderRadius: 24, // 🔑 sempre 24, aberto ou fechado
    marginVertical: 8,
    overflow: "hidden", // mantém arredondado
    
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    paddingHorizontal: 12,
    
    
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: "#fff",
    marginRight: 8,
  },
  inputText: {
    
    flex: 1,
    color: "#ffffffff",
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  arrowContainer: {
    marginLeft: 8,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  itemText: {
    color: "#fff",
    fontSize: 14,
  },
});
