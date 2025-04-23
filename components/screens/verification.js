import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function Verification({ navigation }) {
  const [code, setCode] = useState(['', '', '', '']);
  const inputs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const handleChange = (text, index) => {
    if (text.length > 1) return;

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 3) {
      inputs[index + 1].current.focus();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient
              colors={['#070C18', '#213975']}
              style={styles.innerContainer}
            >
        <Text style={styles.title}>Enviamos um código para seu e-mail</Text>
        <Text style={styles.subtitle}> Digite o código abaixo para confirmar sua identidade.</Text>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={inputs[index]}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              keyboardType="numeric"
              maxLength={1}
              style={styles.codeInput}
              placeholder="0"
              placeholderTextColor="#ccc"/>
          ))}
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('redefine')} style={styles.primaryButton}>
          <Text style={styles.primaryText}>Verificar</Text>
        </TouchableOpacity>

        
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flexGrow: 1,
    paddingHorizontal: width * 0.08,
    alignItems: 'center',
    paddingTop: height * 0.08,
    paddingBottom: height * 0,
  },
  logo: {
    width: width * 0.18,
    height: width * 0.18,
    resizeMode: 'contain',
    marginBottom: height * 0.03,
    marginTop: height * 0.1,
  },
  title: {
    marginTop: height * 0.18,
    fontSize: width * 0.07,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: width * 0.038,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: height * 0.06,
  },
  bottompassword: {
    marginRight: width * 0.45,
    color: '#ccc',
    marginTop: height * 0.0,
    fontSize: width * 0.035,
    paddingBottom: height * 0.03,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width * 0.7,
    marginBottom: height * 0.04,
  },
  codeInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: width * 0.13,
    height: width * 0.13,
    textAlign: 'center',
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: '#000',
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: '#2E5BFF',
    width: width * 0.85,
    height: height * 0.055,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height * 0.015,
  },
  primaryText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: width * 0.04,
  },
  bottomText: {
    color: '#ccc',
    marginTop: height * 0.03,
    fontSize: width * 0.035,
    textAlign: 'center',
  },
  link: {
    color: 'white',
    fontWeight: 'bold',
  },
});
