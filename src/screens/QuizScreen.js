// src/screens/QuizScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Animated,
  LayoutAnimation,
  Easing
} from 'react-native';
import { quizService } from '../services/quizService';
import { Ionicons } from '@expo/vector-icons';

const QuizScreen = ({ navigation }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  
  // Animation values
  const progressAnim = useRef(new Animated.Value(0)).current;
  const questionOpacity = useRef(new Animated.Value(0)).current;
  const optionScale = useRef(new Animated.Value(1)).current;
  const trophyScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadQuiz();
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentQuestionIndex + 1) / questions.length,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [currentQuestionIndex]);

  const animateQuestionIn = () => {
    questionOpacity.setValue(0);
    Animated.timing(questionOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const animateOptionPress = () => {
    Animated.sequence([
      Animated.timing(optionScale, {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(optionScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const quizQuestions = await quizService.generateQuizQuestions(10);
      setQuestions(quizQuestions);
      animateQuestionIn();
    } catch (error) {
      Alert.alert('Error', 'Failed to load quiz questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (answer) => {
    if (selectedAnswer !== null) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctDefinition;
    setSelectedAnswer(answer);
    animateOptionPress();

    if (isCorrect) {
      setScore(score + 1);
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        animateQuestionIn();
      } else {
        completeQuiz();
      }
    }, 1500);
  };

  const completeQuiz = async () => {
    try {
      await quizService.updateQuizStats(score, questions.length);
      setQuizCompleted(true);
      Animated.spring(trophyScale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error completing quiz:', error);
    }
  };

  const restartQuiz = () => {
    trophyScale.setValue(0);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setQuizCompleted(false);
    loadQuiz();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (quizCompleted) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Animated.View style={{ transform: [{ scale: trophyScale }] }}>
          <Ionicons
            name={score > (questions.length / 2) ? "trophy" : "school"}
            size={80}
            color="#7C3AED"
          />
        </Animated.View>
        <Text style={styles.scoreText}>
          Score: {score}/{questions.length}
        </Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={restartQuiz}
        >
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.buttonText}>View Progress</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressInterpolated = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <Animated.View 
          style={[
            styles.progressBar,
            { width: progressInterpolated }
          ]}
        />
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Question {currentQuestionIndex + 1}/{questions.length}
        </Text>
        <Text style={styles.progressText}>Score: {score}</Text>
      </View>

      <Animated.View style={[styles.questionContainer, { opacity: questionOpacity }]}>
        <Text style={styles.word}>{currentQuestion.word}</Text>
        <Text style={styles.partOfSpeech}>{currentQuestion.partOfSpeech}</Text>
        <Text style={styles.questionText}>What is the meaning?</Text>
      </Animated.View>

      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => {
          const isCorrectOption = option === currentQuestion.correctDefinition;
          const isSelected = option === selectedAnswer;
          const userWasWrong = selectedAnswer && selectedAnswer !== currentQuestion.correctDefinition;

          let iconName = null;
          if (isSelected) {
            iconName = isCorrectOption ? 'checkmark-circle' : 'close-circle';
          }

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                isSelected && !isCorrectOption && styles.wrongOption,
                isCorrectOption && (isSelected || userWasWrong) && styles.correctOption,
              ]}
              onPress={() => handleAnswer(option)}
              disabled={selectedAnswer !== null}
            >
              <Animated.View style={{ transform: [{ scale: optionScale }] }}>
                <View style={styles.optionContent}>
                  <Text style={styles.optionText}>{option}</Text>
                  {iconName && (
                    <Ionicons
                      name={iconName}
                      size={24}
                      color={isCorrectOption ? '#10B981' : '#EF4444'}
                      style={styles.optionIcon}
                    />
                  )}
                </View>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  progressText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginVertical: 20,
  },
  questionContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  word: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  partOfSpeech: {
    fontSize: 16,
    color: '#64748B',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  questionText: {
    fontSize: 18,
    color: '#475569',
    fontWeight: '500',
  },
  optionsContainer: {
    marginTop: 16,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  correctOption: {
    backgroundColor: '#D1FAE5',
  },
  wrongOption: {
    backgroundColor: '#FEE2E2',
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#1E293B',
    flex: 1,
  },
  optionIcon: {
    marginLeft: 12,
  },
  button: {
    backgroundColor: '#7C3AED',
    padding: 18,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  secondaryButton: {
    backgroundColor: '#64748B',
    shadowColor: '#64748B',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QuizScreen;