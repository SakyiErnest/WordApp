import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl,
  Text,
  Alert 
} from 'react-native';
import WordCard from '../components/WordCard';
import { wordService } from '../services/wordService';

const LearnScreen = () => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Transform API data to match WordCard props
  const transformWordData = (apiData) => {
    if (!apiData) return null;

    // Ensure examples are properly formatted as strings
    const formattedExamples = apiData.examples?.map(example => {
      if (Array.isArray(example)) {
        return example.join(' '); // Convert array to string
      }
      return example?.toString() || ''; // Convert to string or empty string if null/undefined
    }).filter(Boolean) || []; // Remove empty strings

    return {
      word: apiData.word || '',
      partOfSpeech: apiData.partOfSpeech || '',
      meaning: apiData.definitions?.[0] || 'No definition available',
      definitions: apiData.definitions?.map(def => def?.toString()).filter(Boolean) || [],
      synonyms: apiData.synonyms?.map(syn => syn?.toString()).filter(Boolean) || [],
      antonyms: apiData.antonyms?.map(ant => ant?.toString()).filter(Boolean) || [],
      examples: formattedExamples
    };
  };

  // Fetch words with error handling
  const fetchWords = async (count = 5) => {
    try {
      setError(null);
      const wordsList = [];
      const difficulties = ['intermediate', 'advanced'];
      
      for (let i = 0; i < count; i++) {
        const difficulty = difficulties[i % difficulties.length];
        const wordData = await wordService.getRandomWordData(difficulty);
        
        if (wordData && wordData.word) {
          const transformedData = transformWordData(wordData);
          if (transformedData) {
            wordsList.push(transformedData);
          }
        }
      }
      
      if (wordsList.length === 0) {
        throw new Error('No words could be fetched');
      }
      
      return wordsList;
    } catch (error) {
      console.error('Error fetching words:', error);
      setError('Failed to load words. Please try again.');
      return [];
    }
  };

  // Initial load
  useEffect(() => {
    const loadInitialWords = async () => {
      try {
        setLoading(true);
        const newWords = await fetchWords();
        if (newWords.length === 0) {
          setError('No words available. Please try again later.');
        } else {
          setWords(newWords);
        }
      } catch (error) {
        setError('Failed to load words. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    loadInitialWords();
  }, []);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const newWords = await fetchWords();
      setWords(newWords);
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh words. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Load more words
  const loadMoreWords = async () => {
    if (!refreshing && !loading) {
      try {
        const newWords = await fetchWords(3);
        if (newWords.length > 0) {
          setWords(prevWords => [...prevWords, ...newWords]);
        }
      } catch (error) {
        console.error('Error loading more words:', error);
      }
    }
  };

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
    <View style={styles.container}>
      <FlatList
        data={words}
        renderItem={({ item }) => <WordCard {...item} />}
        keyExtractor={(item, index) => `${item.word}-${index}`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#7C9D96']}
            tintColor="#7C9D96"
          />
        }
        onEndReached={loadMoreWords}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No words available</Text>
            <Text style={styles.emptySubText}>Pull to refresh and try again</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 10,
    paddingBottom: 20,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
  },
  separator: {
    height: 12,
  }
});

export default LearnScreen;
