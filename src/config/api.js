import { MERRIAM_WEBSTER_API_KEY } from '@env';

// API Configuration Constants
export const API_CONFIG = {
  BASE_URL: 'https://www.dictionaryapi.com/api/v3/references/thesaurus/json',
  API_KEY: MERRIAM_WEBSTER_API_KEY,
  DIFFICULTY_LEVELS: {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced'
  },
  REQUEST_TIMEOUT: 10000, // 10 seconds timeout
  RETRY_ATTEMPTS: 3
};

// Error Types
export const API_ERRORS = {
  TIMEOUT: 'Request timeout',
  NETWORK: 'Network error',
  INVALID_API_KEY: 'Invalid API key',
  WORD_NOT_FOUND: 'Word not found',
  RATE_LIMIT: 'Rate limit exceeded',
  INVALID_RESPONSE: 'Invalid API response',
  UNKNOWN: 'Unknown error occurred'
};

// Main API URL generator with validation
export const getApiUrl = (word) => {
  if (!word || typeof word !== 'string') {
    throw new Error('Invalid word parameter');
  }
  if (!API_CONFIG.API_KEY) {
    throw new Error('API key is not configured');
  }
  return `${API_CONFIG.BASE_URL}/${encodeURIComponent(word.trim())}?key=${API_CONFIG.API_KEY}`;
};

// Enhanced API response parser with validation
export const parseThesaurusData = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(API_ERRORS.INVALID_RESPONSE);
  }

  const entry = data[0];
  
  if (typeof entry === 'string') {
    throw new Error(API_ERRORS.WORD_NOT_FOUND);
  }

  // Validate required fields
  if (!entry.meta?.id) {
    throw new Error('Missing word identifier in response');
  }

  return {
    word: entry.meta.id,
    partOfSpeech: entry.fl || '',
    synonyms: entry.meta?.syns?.flat() || [],
    antonyms: entry.meta?.ants?.flat() || [],
    definitions: entry.shortdef || [],
    examples: entry.def?.[0]?.sseq?.flat()
      .filter(item => item[0] === 'sense')
      .map(item => item[1]?.dt?.find(d => d[0] === 'vis')?.[1])
      .filter(Boolean) || [],
    // Additional metadata
    date: entry.date || '',
    offensive: entry.meta?.offensive || false
  };
};

// Enhanced error handler with specific error types
export const handleApiError = (error) => {
  if (error.name === 'AbortError') {
    return API_ERRORS.TIMEOUT;
  }

  if (!error.response) {
    return API_ERRORS.NETWORK;
  }

  switch (error.response.status) {
    case 404:
      return API_ERRORS.WORD_NOT_FOUND;
    case 429:
      return API_ERRORS.RATE_LIMIT;
    case 403:
      return API_ERRORS.INVALID_API_KEY;
    default:
      return `${API_ERRORS.UNKNOWN}: ${error.message}`;
  }
};

// Curated word lists with difficulty ratings
export const WORD_LISTS = {
  beginner: [
    'happy', 'sad', 'big', 'small', 'fast', 'slow',
    'good', 'bad', 'hot', 'cold', 'easy', 'hard',
    'new', 'old', 'young', 'tall', 'short', 'loud',
    'quiet', 'clean', 'dirty', 'light', 'dark', 'strong'
  ],
  intermediate: [
    'accomplish', 'benevolent', 'candid', 'diligent',
    'eloquent', 'facilitate', 'gratitude', 'humble',
    'innovative', 'judicious', 'keen', 'luminous',
    'meticulous', 'nurture', 'optimize', 'profound'
  ],
  advanced: [
    'aberration', 'byzantine', 'cacophony', 'deleterious',
    'ephemeral', 'fastidious', 'garrulous', 'hegemony',
    'ineffable', 'juxtapose', 'kaleidoscopic', 'labyrinthine',
    'mellifluous', 'nefarious', 'obfuscate', 'paradigm'
  ]
};

// Enhanced random word generator with validation
export const getRandomWord = (level = 'intermediate') => {
  let normalizedLevel = level.toLowerCase();
  
  if (!WORD_LISTS[normalizedLevel]) {
    console.warn(`Invalid difficulty level: ${level}. Defaulting to intermediate.`);
    normalizedLevel = 'intermediate';
  }

  const wordList = WORD_LISTS[normalizedLevel];
  const randomIndex = Math.floor(Math.random() * wordList.length);
  return wordList[randomIndex];
};

// Utility functions
export const isValidWord = (word) => {
  return typeof word === 'string' && /^[a-zA-Z]+$/.test(word);
};

export const getDifficultyLevel = (word) => {
  for (const [level, words] of Object.entries(WORD_LISTS)) {
    if (words.includes(word.toLowerCase())) {
      return level;
    }
  }
  return 'unknown';
};

// Retry mechanism for API calls
export const retryOperation = async (operation, maxAttempts = API_CONFIG.RETRY_ATTEMPTS) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts) break;
      
      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt), 10000))
      );
    }
  }
  
  throw lastError;
};
