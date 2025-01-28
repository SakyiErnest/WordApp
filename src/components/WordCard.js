// WordCard.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LEARNED_WORDS_KEY = '@learned_words';

const WordCard = ({ word, partOfSpeech, meaning, definitions, synonyms, antonyms, examples }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLearned, setIsLearned] = useState(false);

  useEffect(() => {
    checkLearnedStatus();
  }, [word]);

  const checkLearnedStatus = async () => {
    try {
      const learnedWords = await AsyncStorage.getItem(LEARNED_WORDS_KEY);
      const learnedWordsObj = learnedWords ? JSON.parse(learnedWords) : {};
      setIsLearned(!!learnedWordsObj[word]);
    } catch (error) {
      console.error('Error checking learned status:', error);
    }
  };

  const handleMarkLearned = async () => {
    try {
      const learnedWords = await AsyncStorage.getItem(LEARNED_WORDS_KEY);
      const learnedWordsObj = learnedWords ? JSON.parse(learnedWords) : {};
      
      if (!isLearned) {
        learnedWordsObj[word] = { timestamp: Date.now() };
        await AsyncStorage.setItem(LEARNED_WORDS_KEY, JSON.stringify(learnedWordsObj));
      }
      setIsLearned(!isLearned);
    } catch (error) {
      console.error('Error marking word as learned:', error);
    }
  };

  const speakWord = () => {
    Speech.speak(word, { language: 'en' });
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.card}>
      <View style={styles.mainContent}>
        <View style={styles.wordSection}>
          <Text style={styles.word}>{word}</Text>
          <Text style={styles.partOfSpeech}>{partOfSpeech}</Text>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={speakWord} style={styles.speakerButton}>
            <Ionicons name="volume-medium-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.learnedButton}
        onPress={handleMarkLearned}
      >
        <Ionicons 
          name={isLearned ? "checkmark-circle" : "add-circle-outline"} 
          size={20} 
          color="#7C9D96" 
        />
        <Text style={styles.learnedText}>
          Mark as Learned
        </Text>
      </TouchableOpacity>

      <Text style={styles.meaning}>{meaning}</Text>

      {definitions?.length > 1 && (
        <View style={styles.definitionsContainer}>
          {definitions.slice(1).map((def, index) => (
            <Text key={index} style={styles.definition}>
              {index + 2}. {def}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.wordLists}>
        {synonyms?.length > 0 && (
          <View style={styles.wordGroup}>
            <Text style={styles.label}>Synonyms:</Text>
            <Text style={styles.words}>{synonyms.join(', ')}</Text>
          </View>
        )}
        
        {antonyms?.length > 0 && (
          <View style={styles.wordGroup}>
            <Text style={styles.label}>Antonyms:</Text>
            <Text style={styles.words}>{antonyms.join(', ')}</Text>
          </View>
        )}
      </View>

      {!isExpanded && (
        <TouchableOpacity onPress={toggleExpand} style={styles.showMoreButton}>
          <Text style={styles.showMoreText}>Show More</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  wordSection: {
    flex: 1,
  },
  word: {
    fontSize: 24,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  partOfSpeech: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  speakerButton: {
    padding: 8,
    marginLeft: 8,
  },
  learnedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  learnedText: {
    marginLeft: 8,
    color: '#7C9D96',
    fontSize: 14,
  },
  meaning: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 16,
  },
  definitionsContainer: {
    marginBottom: 16,
  },
  definition: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 8,
  },
  wordLists: {
    marginBottom: 16,
  },
  wordGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  words: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  showMoreButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  showMoreText: {
    color: '#7C9D96',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default WordCard;
