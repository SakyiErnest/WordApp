// HomeScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Text, RefreshControl } from 'react-native';
import WordCard from '../components/WordCard';
import { wordService } from '../services/wordService';

function transformWordData(apiData) {
  if (!apiData) return null;

  const parseAndCleanExample = (rawExample) => {
    // If it's a nested JSON string, parse it first
    let exampleValue = rawExample;
    if (typeof rawExample === 'string') {
      try {
        const parsed = JSON.parse(rawExample);
        if (Array.isArray(parsed)) {
          // If parsing led to an array, join them (or handle each element separately as needed)
          exampleValue = parsed.map(String).join(' ');
        } else if (typeof parsed === 'object') {
          exampleValue = parsed.t || parsed.text || parsed.example || JSON.stringify(parsed);
        }
      } catch {
        // If not valid JSON, leave it as is
        exampleValue = rawExample;
      }
    } else if (typeof rawExample === 'object' && rawExample !== null) {
      // Direct object handling
      exampleValue = rawExample.t || rawExample.text || rawExample.example || JSON.stringify(rawExample);
    }

    // Convert final content to string for further cleaning
    return exampleValue
        .toString()
        // Remove '{t:' parts and enclosing braces
        .replace(/\{t:/g, '')
        .replace(/\}/g, '')
        // Remove specific formatting tags
        .replace(/{(\/)?it}/g, '')
        // Remove extra brackets and quotes
        .replace(/[\[\]"]+/g, '')
        // Clean up any escaped quotes
        .replace(/\\"/g, '"')
        // Trim
        .trim();
  };

  const formattedExamples = (apiData.examples || [])
      .map(parseAndCleanExample)
      .filter((example) => example.length > 0);

  return {
    word: apiData.word || 'Unknown Word',
    partOfSpeech: apiData.partOfSpeech || 'noun',
    meaning: apiData.definitions?.[0] || 'No definition available',
    definitions: (apiData.definitions || []).map(String).filter(Boolean),
    synonyms: (apiData.synonyms || []).map(String).filter(Boolean),
    antonyms: (apiData.antonyms || []).map(String).filter(Boolean),
    examples: formattedExamples,
  };
}

const HomeScreen = () => {
  const [wordData, setWordData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWordData = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Get complete word data using wordService
      const apiData = await wordService.getWordOfDay();
      const transformedData = transformWordData(apiData);
      
      if (!transformedData?.word) {
        throw new Error('Failed to load word data');
      }
      
      setWordData(transformedData);
    } catch (err) {
      setError(err.message || 'Failed to fetch word data');
      // Attempt fallback to random word
      try {
        const fallbackData = await wordService.getRandomWordData();
        setWordData(transformWordData(fallbackData));
      } catch (fallbackError) {
        setError('Failed to load any word data');
      }
    } finally {
      setLoading(false);
    }
  };

  const generateQuizQuestions = useCallback((currentData, count = 15) => {
    if (!currentData) return [];
    
    const baseQuestions = [
      {
        type: 'definition',
        question: `What is the meaning of "${currentData.word}"?`,
        options: shuffleArray([...currentData.definitions]),
        correct: currentData.definitions[0]
      },
      {
        type: 'synonym',
        question: `Which word is a synonym of "${currentData.word}"?`,
        options: shuffleArray([...currentData.synonyms]),
        correct: currentData.synonyms[0]
      },
      {
        type: 'antonym',
        question: `Which word is an antonym of "${currentData.word}"?`,
        options: shuffleArray([...currentData.antonyms]),
        correct: currentData.antonyms[0]
      }
    ];

    return shuffleArray(baseQuestions).slice(0, count);
  }, []);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    fetchWordData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWordData();
    setRefreshing(false);
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#7C9D96" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {wordData && (
        <>
          <WordCard {...wordData} />
          {wordData.examples.length > 0 && (
            <View style={styles.examplesContainer}>
              <Text style={styles.examplesTitle}>Example Usage:</Text>
              {wordData.examples.map((example, index) => (
                <Text key={index} style={styles.exampleText}>
                  • "{example}"
                </Text>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

// Keep the same styles as before
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  examplesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  examplesTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 12,
  },
  exampleText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 24,
  }
});

export default HomeScreen;