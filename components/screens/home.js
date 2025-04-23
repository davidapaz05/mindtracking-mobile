import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function Home() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.day}>Segunda-Feira</Text>
          <Text style={styles.date}>14 de março</Text>
        </View>
        <Image
                  source={require('../../assets/images/')}
                  style={styles.logo}
                />
      </View>

      <Text style={styles.subtitle}>Quer nos contar sobre seu dia?</Text>


      <View style={styles.cardsRow}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Responda</Text>
          <Text style={styles.cardText}>Responda seu questionário diário</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mind IA</Text>
          <Text style={styles.cardText}>Converse e receba dicas para sua saúde mental!</Text>
        </View>
      </View>

      
      <Text style={styles.sectionTitle}>O que você deseja?</Text>
      <Text style={styles.sectionSubtitle}>Opções para melhorar seu dia</Text>

      <View style={styles.actionCard}>
        <Text style={styles.actionTitle}> Lembretes</Text>
        <Text style={styles.actionText}>Se mantenha organizado</Text>
      </View>
      <View style={styles.actionCard}>
        <Text style={styles.actionTitle}> Fale com alguém</Text>
        <Text style={styles.actionText}>Converse com um especialista no 180</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070C18',
    padding: width * 0.06,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.03,
  },
  day: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: 'white',
  },
  date: {
    fontSize: width * 0.035,
    color: '#ccc',
  },
  avatar: {
    width: width * 0.13,
    height: width * 0.13,
    borderRadius: width * 0.065,
  },
  subtitle: {
    fontSize: width * 0.045,
    color: 'white',
    marginBottom: height * 0.02,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.04,
  },
  card: {
    backgroundColor: '#1E2A47',
    width: width * 0.42,
    borderRadius: 15,
    padding: width * 0.04,
  },
  cardTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: width * 0.045,
    marginBottom: height * 0.01,
  },
  cardText: {
    color: '#ccc',
    fontSize: width * 0.035,
  },
  sectionTitle: {
    color: 'white',
    fontSize: width * 0.05,
    fontWeight: 'bold',
    marginBottom: height * 0.005,
  },
  sectionSubtitle: {
    color: '#ccc',
    fontSize: width * 0.035,
    marginBottom: height * 0.025,
  },
  actionCard: {
    backgroundColor: '#1E2A47',
    padding: width * 0.05,
    borderRadius: 15,
    marginBottom: height * 0.02,
  },
  actionTitle: {
    fontSize: width * 0.045,
    color: '#4B82FF',
    fontWeight: 'bold',
  },
  actionText: {
    fontSize: width * 0.035,
    color: '#ccc',
  },
});
