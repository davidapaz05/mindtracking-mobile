import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

interface InputBaseProps extends TextInputProps {
  iconLeft?: "email" | "senha" | "user" | "genero" | "telefone" | "data";
  eyeOpenIcon?: any; 
  eyeClosedIcon?: any; 
}

export default function InputBase({
  iconLeft,
  placeholder,
  eyeOpenIcon,
  eyeClosedIcon,
  secureTextEntry: parentSecure,
  ...rest
}: InputBaseProps) {
  const [showPassword, setShowPassword] = useState(false);

  const renderIconLeft = () => {
    switch (iconLeft) {
      case "email":
        return require("@assets/icons/email.png");
      case "telefone":
        return require("@assets/icons/telefone.png");
      case "user":
        return require("@assets/icons/usuario.png");
      case "data":
        return require("@assets/icons/data.png");
      case "genero":
        return require("@assets/icons/genero.png");
      case "senha":
        return require("@assets/icons/senha.png");
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderIconLeft() && (
        <Image source={renderIconLeft()} style={styles.icon} resizeMode="contain" />
      )}

      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#fff"
        style={styles.input}
        {...rest}
        // Respect showPassword toggle for password fields; otherwise fall back to parent's prop
        secureTextEntry={iconLeft === "senha" ? !showPassword : parentSecure}
      />

      {iconLeft === "senha" && (
  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
    <Image
  source={showPassword ? eyeOpenIcon : eyeClosedIcon}
  style={[
    {
      width: 24,
      height: 20,
      marginRight: 7,
      tintColor: "#fff",
    },
    showPassword && { width: 28, height: 28,marginRight:5 }, 
  ]}
  resizeMode="contain"
/>

  </TouchableOpacity>
)}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    
    width: "100%",
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2563EA",
    backgroundColor: "#1F2937",
    borderRadius: 24,
    paddingHorizontal: 12,
    marginVertical: 8,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: "#fff",
  },
  input: {
    flex: 1,
    marginLeft: 8,
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
});
