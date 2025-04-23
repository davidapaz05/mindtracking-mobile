import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function Cadastre({ navigation }) {
  const [data, setData] = useState('');

  const handleChange = (text) => {
    let value = text.replace(/\D/g, '');

    if (value.length > 4) {
      value = value.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
    } else if (value.length > 2) {
      value = value.replace(/(\d{2})(\d{2})/, '$1/$2');
    }
    setData(value);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient
                  colors={['#070C18', '#213975']}
                  style={styles.innerContainer}
                >
        <Image
          source={require('../../assets/icons/logo.png')}
          style={styles.logo}
        />

        <Text style={styles.title}>Vamos começar!</Text>
        <Text style={styles.subtitle}>Sua jornada rumo ao equilíbrio emocional começa aqui</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={25} color="#ccc" style={styles.icon} />
          <TextInput placeholder="Digite seu nome" placeholderTextColor="#ccc" style={styles.input} />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={25} color="#ccc" style={styles.icon} />
          <TextInput placeholder="Digite seu email" placeholderTextColor="#ccc" style={styles.input} keyboardType="email-address" />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="calendar-outline" size={25} color="#ccc" style={styles.icon} />
          <TextInput
            style={styles.input}
            value={data}
            onChangeText={handleChange}
            keyboardType="numeric"
            maxLength={10}
            placeholder="Data de Nascimento"
            placeholderTextColor="#ccc"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={25} color="#ccc" style={styles.icon} />
          <TextInput placeholder="Senha" placeholderTextColor="#ccc" style={styles.input} secureTextEntry />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={25} color="#ccc" style={styles.icon} />
          <TextInput placeholder="Confirme sua senha" placeholderTextColor="#ccc" style={styles.input} secureTextEntry />
        </View>

        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryText}>Criar conta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonLogin}
          onPress={() => navigation.navigate('login')}
        >
          <Text style={styles.bottomText}>
            Já tem uma conta? <Text style={styles.link}>Entrar</Text>
          </Text>
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
    paddingTop: height * 0.05,
    paddingBottom: height * 0,
    
  },
  logo: {
    width: width * 0.18,
    height: width * 0.18,
    resizeMode: 'contain',
    marginBottom: height * 0.03,
    marginTop: height * 0.1
  },
  title: {
    fontSize: width * 0.07,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: height * 0.01,
  },
  subtitle: {
    fontSize: width * 0.038,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: height * 0.05,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#29374F',
    borderWidth: 1,
    borderColor: '#2544F4',
    borderRadius: 25,
    paddingHorizontal: width * 0.04,
    width: width * 0.851,
    height: height * 0.069,
    marginBottom: height * 0.015,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: 'white',
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
    
  },
  buttomLogin:{
    marginBottom: height * 0.3,

  },
  link: {
    color: 'white',
    fontWeight: 'bold',
  },
});
