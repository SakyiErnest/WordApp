import { 
  getApiUrl, 
  parseThesaurusData, 
  handleApiError, 
  getRandomWord as apiGetRandomWord,
  isValidWord 
} from '../config/api';

// Utility function for word validation with better error handling
const validateAndProcessWord = (word) => {
  // Debug logging
  console.log('Validating word:', word, 'Type:', typeof word);

  // Handle undefined or null
  if (word === undefined || word === null) {
    console.error('Word is undefined or null');
    return apiGetRandomWord('intermediate'); // Fallback to random word
  }

  // Convert to string if number
  if (typeof word === 'number') {
    word = word.toString();
  }

  // Ensure string type
  if (typeof word !== 'string') {
    console.error('Word is not a string type:', typeof word);
    return apiGetRandomWord('intermediate'); // Fallback to random word
  }

  const processedWord = word.trim().toLowerCase();
  
  // Handle empty string
  if (processedWord.length === 0) {
    console.error('Word is empty after processing');
    return apiGetRandomWord('intermediate'); // Fallback to random word
  }

  // Validate characters
  if (!/^[a-zA-Z]+$/.test(processedWord)) {
    console.error('Word contains invalid characters:', processedWord);
    return apiGetRandomWord('intermediate'); // Fallback to random word
  }

  return processedWord;
};

export const wordService = {
  // Get complete word data including definition, synonyms, and antonyms
  getWordData: async (word) => {
    try {
      const validWord = validateAndProcessWord(word);
      console.log('Processed word:', validWord); // Debug log

      const response = await fetch(getApiUrl(validWord));
      
      if (!response.ok) {
        throw new Error(handleApiError({ response }));
      }
      
      const data = await response.json();
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('Invalid API response');
      }
      
      return parseThesaurusData(data);
    } catch (error) {
      console.error('Error fetching word data:', error);
      // Try with a random word as fallback
      const randomWord = apiGetRandomWord('intermediate');
      return wordService.getWordData(randomWord);
    }
  },

  // Get word of the day
  getWordOfDay: async () => {
    try {
      const word = apiGetRandomWord('intermediate');
      return await wordService.getWordData(word);
    } catch (error) {
      console.error('Error fetching word of the day:', error);
      // Try with a different random word
      const fallbackWord = apiGetRandomWord('intermediate');
      return wordService.getWordData(fallbackWord);
    }
  },

  // Get random word only
  getRandomWord: (difficulty = 'intermediate') => {
    try {
      const word = apiGetRandomWord(difficulty);
      return validateAndProcessWord(word);
    } catch (error) {
      console.error('Error getting random word:', error);
      return apiGetRandomWord('intermediate'); // Fallback to intermediate
    }
  },

  // Get random word with complete data
  getRandomWordData: async (difficulty = 'intermediate') => {
    try {
      const word = wordService.getRandomWord(difficulty);
      const wordData = await wordService.getWordData(word);
      return {
        ...wordData,
        synonyms: wordData.synonyms || [],
        antonyms: wordData.antonyms || [],
        definitions: wordData.definitions || []
      };
    } catch (error) {
      console.error('Error fetching random word:', error);
      return wordService.getWordOfDay(); // Fallback to word of the day
    }
  },

  // Get related words
  getRelatedWords: async (word) => {
    try {
      const wordData = await wordService.getWordData(word);
      return {
        word: wordData.word,
        partOfSpeech: wordData.partOfSpeech,
        synonyms: wordData.synonyms || [],
        antonyms: wordData.antonyms || [],
        definitions: wordData.definitions || []
      };
    } catch (error) {
      console.error('Error fetching related words:', error);
      return wordService.getRandomWordData(); // Fallback to random word data
    }
  },

  // Get definitions for a word
  getDefinitions: async (word) => {
    try {
      const wordData = await wordService.getWordData(word);
      return {
        word: wordData.word,
        partOfSpeech: wordData.partOfSpeech,
        definitions: wordData.definitions || []
      };
    } catch (error) {
      console.error('Error fetching definitions:', error);
      return wordService.getRandomWordData(); // Fallback to random word data
    }
  }
};

export default wordService;
