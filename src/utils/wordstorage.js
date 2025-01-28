// src/utils/wordstorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const LEARNED_WORDS_KEY = '@WordWhiz:learnedWords';

export const saveLearnedWord = async (wordData) => {
  try {
    const existingWords = await getLearnedWords();
    const updatedWords = [...existingWords, wordData];
    await AsyncStorage.setItem(LEARNED_WORDS_KEY, JSON.stringify(updatedWords));
    return true;
  } catch (error) {
    console.error('Error saving word:', error);
    return false;
  }
};

export const getLearnedWords = async () => {
  try {
    const words = await AsyncStorage.getItem(LEARNED_WORDS_KEY);
    return words ? JSON.parse(words) : [];
  } catch (error) {
    console.error('Error getting learned words:', error);
    return [];
  }
};

export const clearLearnedWords = async () => {
  try {
    await AsyncStorage.removeItem(LEARNED_WORDS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing learned words:', error);
    return false;
  }
};