import React from 'react';
import {View,Text,TouchableOpacity,Image,StyleSheet,Dimensions,} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const pre_login = ({ navigation }) => {
  
  return (
    <View style={styles.container}>
      
      <LinearGradient
        colors={['#070C18', '#213975']}
        style={styles.gradient}
      />

      <Image source={require('../../assets/icons/logo.png')} style={styles.logo} />
      <Text style={styles.title}>MindTracking</Text>
      <Text style={styles.subtitle}>Bem-estar começa com um passo.</Text>
      <Text style={styles.description}>Dê o primeiro hoje!</Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('cadastre')}
      >
        <Text style={styles.primaryText}>Começar agora</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('login')}

      >
        <Text style={styles.secondaryText}>Já tenho uma conta</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: width * 0.1,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1, 

  },
  logo: {
    marginTop: height * 0.1,
    width: width * 0.35,
    height: height * 0.3,
    marginBottom: height * 0,
    resizeMode: 'contain',
  },
  title: {
    fontSize: width * 0.08,
    color: 'white',
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#ccc',
    fontSize: width * 0.045,
    marginTop: 10,
  },
  description: {
    fontSize: width * 0.045,
    color: 'white',
    paddingTop: height * 0.02,
    marginBottom: height * 0.09,
  },
  primaryButton: {
    backgroundColor: '#2E5BFF',
    borderRadius: 25,
    width: width * 0.851,
    height: height * 0.055,
    alignItems: 'center',     
    justifyContent: 'center',   
    marginBottom: height * 0.02,
    
  },
  primaryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: width * 0.04,
  },
  secondaryButton: {
    backgroundColor: '#595959',

    borderRadius: 25,
    width: '100%',
    alignItems: 'center',     
    justifyContent: 'center',
    width: width * 0.851,
    height: height * 0.055,
  },
  secondaryText: {
    color: '#fff',
    fontSize: width * 0.04,
    fontWeight: 'bold',
  },
});

export default pre_login;
