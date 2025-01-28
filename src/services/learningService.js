// src/services/learningService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const LEARNED_WORDS_KEY = '@learned_words';
const LEARNING_PROGRESS_KEY = '@learning_progress';

export const learningService = {
  // Mark word as learned
  markWordAsLearned: async (word) => {
    try {
      const learnedWords = await getLearningProgress();
      learnedWords[word] = {
        timestamp: Date.now(),
        timesCorrect: (learnedWords[word]?.timesCorrect || 0) + 1,
        lastReviewed: Date.now()
      };
      await AsyncStorage.setItem(LEARNED_WORDS_KEY, JSON.stringify(learnedWords));
    } catch (error) {
      console.error('Error marking word as learned:', error);
    }
  },

  // Get learning progress
  getLearningProgress: async () => {
    try {
      const progress = await AsyncStorage.getItem(LEARNED_WORDS_KEY);
      return progress ? JSON.parse(progress) : {};
    } catch (error) {
      console.error('Error getting learning progress:', error);
      return {};
    }
  },

  // Check if word is learned
  isWordLearned: async (word) => {
    const progress = await getLearningProgress();
    return !!progress[word];
  },

  // Get learning statistics
  getLearningStats: async () => {
    const progress = await getLearningProgress();
    return {
      totalLearned: Object.keys(progress).length,
      recentlyLearned: Object.entries(progress)
        .filter(([_, data]) => Date.now() - data.timestamp < 7 * 24 * 60 * 60 * 1000)
        .length,
      needsReview: Object.entries(progress)
        .filter(([_, data]) => Date.now() - data.lastReviewed > 3 * 24 * 60 * 60 * 1000)
        .length
    };
  }
};
