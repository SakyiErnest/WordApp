// src/services/quizService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { wordService } from './wordService';

const QUIZ_STATS_KEY = '@quiz_stats';
const DAILY_STREAK_KEY = '@daily_streak';
const LAST_QUIZ_DATE_KEY = '@last_quiz_date';

// Helper functions
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const isConsecutiveDay = (lastDate) => {
  if (!lastDate) return false;
  const last = new Date(lastDate);
  const today = new Date();
  const diffTime = Math.abs(today - last);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
};

export const quizService = {
  // Get quiz statistics
  getQuizStats: async () => {
    try {
      const stats = await AsyncStorage.getItem(QUIZ_STATS_KEY);
      if (!stats) {
        const initialStats = {
          quizzesTaken: 0,
          totalScore: 0,
          averageScore: 0,
          streak: 0,
          weeklyProgress: new Array(7).fill(0)
        };
        await AsyncStorage.setItem(QUIZ_STATS_KEY, JSON.stringify(initialStats));
        return initialStats;
      }
      return JSON.parse(stats);
    } catch (error) {
      console.error('Error getting quiz stats:', error);
      return {
        quizzesTaken: 0,
        totalScore: 0,
        averageScore: 0,
        streak: 0,
        weeklyProgress: new Array(7).fill(0)
      };
    }
  },

  // Generate quiz questions
  generateQuizQuestions: async (count = 10) => {
    try {
      const questions = [];
      const usedWords = new Set();

      while (questions.length < count) {
        const wordData = await wordService.getRandomWordData();
        
        if (wordData && wordData.word && !usedWords.has(wordData.word)) {
          // Generate incorrect options
          const incorrectOptions = [];
          while (incorrectOptions.length < 3) {
            const wrongWord = await wordService.getRandomWordData();
            if (wrongWord && 
                wrongWord.word !== wordData.word && 
                wrongWord.definitions?.[0] &&
                !incorrectOptions.includes(wrongWord.definitions[0])) {
              incorrectOptions.push(wrongWord.definitions[0]);
            }
          }

          questions.push({
            word: wordData.word,
            correctDefinition: wordData.definitions[0],
            options: shuffleArray([wordData.definitions[0], ...incorrectOptions]),
            partOfSpeech: wordData.partOfSpeech || ''
          });

          usedWords.add(wordData.word);
        }
      }

      return questions;
    } catch (error) {
      console.error('Error generating quiz questions:', error);
      throw error;
    }
  },

  // Update quiz statistics
  updateQuizStats: async (score, totalQuestions) => {
    try {
      const stats = await quizService.getQuizStats();
      const today = new Date().toDateString();
      const lastQuizDate = await AsyncStorage.getItem(LAST_QUIZ_DATE_KEY);
      
      // Update streak
      if (lastQuizDate !== today) {
        if (isConsecutiveDay(lastQuizDate)) {
          stats.streak += 1;
        } else {
          stats.streak = 1;
        }
        await AsyncStorage.setItem(LAST_QUIZ_DATE_KEY, today);
      }

      // Calculate percentage score
      const percentageScore = Math.round((score / totalQuestions) * 100);

      // Update statistics
      stats.quizzesTaken += 1;
      stats.totalScore += percentageScore;
      stats.averageScore = Math.round(stats.totalScore / stats.quizzesTaken);
      
      // Update weekly progress
      const weekDay = new Date().getDay();
      stats.weeklyProgress[weekDay] = percentageScore;

      await AsyncStorage.setItem(QUIZ_STATS_KEY, JSON.stringify(stats));
      return stats;
    } catch (error) {
      console.error('Error updating quiz stats:', error);
      throw error;
    }
  },

  // Reset quiz statistics
  resetQuizStats: async () => {
    try {
      const initialStats = {
        quizzesTaken: 0,
        totalScore: 0,
        averageScore: 0,
        streak: 0,
        weeklyProgress: new Array(7).fill(0)
      };
      await AsyncStorage.setItem(QUIZ_STATS_KEY, JSON.stringify(initialStats));
      await AsyncStorage.removeItem(LAST_QUIZ_DATE_KEY);
      return initialStats;
    } catch (error) {
      console.error('Error resetting quiz stats:', error);
      throw error;
    }
  },

  // Get current streak
  getStreak: async () => {
    try {
      const stats = await quizService.getQuizStats();
      return stats.streak;
    } catch (error) {
      console.error('Error getting streak:', error);
      return 0;
    }
  }
};

export default quizService;
