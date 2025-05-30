import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions,Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function Questionnaire({ navigation }) {
  const [questions, setQuestions] = useState([
    { id: 1, text: 'Qual o seu objetivo com o uso do nosso app?' },
    { id: 2, text: 'Com que frequência você se sente estressado?' },
    { id: 3, text: 'Você pratica atividades físicas regularmente?' },
    { id: 4, text: 'Você se sente ansioso durante o dia?' },
    { id: 5, text: 'Como você descreveria sua qualidade de sono?' },
    { id: 6, text: 'Você se sente ansioso durante o dia?' },
    { id: 7, text: 'Como você descreveria sua qualidade de sono?' },
    { id:8, text: 'Qual o seu objetivo com o uso do nosso app?' },
    { id: 9, text: 'Com que frequência você se sente estressado?' },
    { id: 10, text: 'Você pratica atividades físicas regularmente?' },
    { id: 11, text: 'Você se sente ansioso durante o dia?' },
    { id: 12, text: 'Como você descreveria sua qualidade de sono?' },
    { id: 13, text: 'Você se sente ansioso durante o dia?' },
    { id: 14, text: 'Como você descreveria sua qualidade de sono?' },
  ]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      navigation.navigate('final');
    }
  };

  const renderProgressBar = () => {
    const total = questions.length;
    const barSpacing = width * 0.015;
    const maxWidth = width * 0.8;
    const barWidth = (maxWidth - (barSpacing * (total - 1))) / total;

    return (
      <View style={styles.progressContainer}>
        {questions.map((_, index) => (
          <View
            key={index}
            style={[
              styles.bar,
              {
                width: barWidth,
                backgroundColor: index <= currentQuestionIndex ? '#2E5BFF' : '#ccc',
                marginRight: index !== total - 1 ? barSpacing : 0,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#070C18', '#213975']}
      style={styles.innerContainer}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
      <Image
  source={require('../../assets/icons/seta.png')}
  style={styles.seta}
/> 
      </TouchableOpacity>

      {renderProgressBar()}

      <View style={styles.questionWrapper}>
        <View style={styles.verticalLine} />
        <Text style={styles.questionText}>{questions[currentQuestionIndex].text}</Text>
      </View>

      <View style={styles.optionContainer}>
        {['Nunca', 'Raramente', 'Às vezes', 'Sempre'].map((option, index) => (
          <TouchableOpacity key={index} style={styles.option}>
            <View style={styles.radio} />
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
    paddingHorizontal: width * 0.07,
    paddingTop: height * 0.06,
  },
  backButton: {
    marginBottom: height * 0.025,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: height * 0.04,
  },
  bar: {
    height: height * 0.005,
    borderRadius: width * 0.02,
  },
  questionWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.04,
    paddingLeft: width * 0.06, 
  },
  
  verticalLine: {
    position: 'absolute',
    left: 0,
    top: height * 0.08, 
    bottom: height * 0.10, 
    width: width * 0.012,
    backgroundColor: '#fFF',
    borderRadius: width * 0.01,
  },
  
  questionText: {
    fontSize: width * 0.07,
    fontWeight: 'bold',
    color: 'white',
    paddingRight: width * 0.30,
    marginTop: height * 0.1,
  },
  optionContainer: {
    marginTop: 'auto', 
    marginBottom: height * 0.05, 
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#29374F',
    borderRadius: width * 0.04,
    paddingVertical: height * 0.0200,
    paddingHorizontal: width * 0.04,
    marginBottom: height * 0.020, 
  },
  
  radio: {
    width: width * 0.05,
    height: width * 0.05,
    borderRadius: width * 0.025,
    borderWidth: 2,
    borderColor: 'white',
    marginRight: width * 0.04,
  },
  optionText: {
    color: 'white',
    fontSize: width * 0.045,
  },
});
