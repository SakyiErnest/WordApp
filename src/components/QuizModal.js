import React, { useRef, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const QuizModal = ({
  visible,
  currentQuestion,
  totalQuestions,
  question,
  options,
  onAnswer,
  onClose,
  score,
  selectedAnswer,
  correctAnswer
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progress = (currentQuestion + 1) / totalQuestions;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
    } else {
      slideAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const getOptionStyle = (option) => {
    if (!selectedAnswer) return styles.optionButton;
    
    const isCorrect = option === correctAnswer;
    const isSelected = option === selectedAnswer;
    
    if (isCorrect) return [styles.optionButton, styles.correctOption];
    if (isSelected && !isCorrect) return [styles.optionButton, styles.wrongOption];
    
    return styles.optionButton;
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
        <Animated.View 
          style={[
            styles.quizContainer, 
            { 
              transform: [
                { 
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0]
                  }) 
                }
              ] 
            }
          ]}
        >
          <View style={styles.header}>
            <View style={styles.progressBarContainer}>
              <Animated.View 
                style={[
                  styles.progressBar, 
                  { width: `${progress * 100}%` }
                ]}
              />
            </View>
            
            <View style={styles.scoreContainer}>
              <Ionicons name="trophy" size={20} color="#7C3AED" />
              <Text style={styles.score}>{score}</Text>
            </View>
          </View>

          <View style={styles.questionContainer}>
            <Text style={styles.question}>{question}</Text>
          </View>

          <View style={styles.optionsContainer}>
            {options?.map((option, index) => {
              const isSelected = option === selectedAnswer;
              const isCorrect = option === correctAnswer;
              
              return (
                <TouchableOpacity
                  key={index}
                  style={getOptionStyle(option)}
                  activeOpacity={0.8}
                  onPress={() => onAnswer(option)}
                  disabled={!!selectedAnswer}
                >
                  <Text style={styles.optionText}>{option}</Text>
                  {isSelected && (
                    <Ionicons 
                      name={isCorrect ? "checkmark-circle" : "close-circle"} 
                      size={24} 
                      color={isCorrect ? "#10B981" : "#EF4444"} 
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color="#64748B" />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 20,
  },
  quizContainer: {
    width: width - 40,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    elevation: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  header: {
    marginBottom: 24,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: 4,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  score: {
    fontSize: 18,
    color: '#1E293B',
    fontWeight: '700',
    marginLeft: 8,
  },
  questionContainer: {
    marginBottom: 32,
  },
  question: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 28,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },
  correctOption: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  wrongOption: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
    marginRight: 12,
  },
  closeButton: {
    position: 'absolute',
    top: -16,
    right: -16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

export default QuizModal;