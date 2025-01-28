// src/screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProgressChart from '../components/ProgressChart';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LEARNED_WORDS_KEY = '@learned_words';
const QUIZ_STATS_KEY = '@quiz_stats';

const ProfileScreen = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    wordsLearned: 0,
    quizzesTaken: 0,
    averageScore: 0,
    streak: 0,
    weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
    recentlyLearned: 0,
    needsReview: 0
  });

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      setLoading(true);
      
      // Load learned words
      const learnedWordsData = await AsyncStorage.getItem(LEARNED_WORDS_KEY);
      const learnedWords = learnedWordsData ? JSON.parse(learnedWordsData) : {};
      
      // Load quiz stats
      const quizStatsData = await AsyncStorage.getItem(QUIZ_STATS_KEY);
      const quizStats = quizStatsData ? JSON.parse(quizStatsData) : {
        quizzesTaken: 0,
        averageScore: 0,
        streak: 0,
        weeklyProgress: [0, 0, 0, 0, 0, 0, 0]
      };

      // Calculate recently learned words (last 7 days)
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const recentlyLearned = Object.values(learnedWords).filter(
        word => word.timestamp > sevenDaysAgo
      ).length;

      // Calculate words that need review (not reviewed in last 3 days)
      const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
      const needsReview = Object.values(learnedWords).filter(
        word => word.lastReviewed < threeDaysAgo
      ).length;

      setStats({
        wordsLearned: Object.keys(learnedWords).length,
        quizzesTaken: quizStats.quizzesTaken,
        averageScore: quizStats.averageScore,
        streak: quizStats.streak,
        weeklyProgress: quizStats.weeklyProgress,
        recentlyLearned,
        needsReview
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#7C9D96" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={80} color="#7C9D96" />
        </View>
        <Text style={styles.username}>Word Learner</Text>
        <View style={styles.streakContainer}>
          <Ionicons name="flame" size={24} color="#FF9500" />
          <Text style={styles.streakText}>{stats.streak} Day Streak!</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="book" size={24} color="#7C9D96" />
          <Text style={styles.statNumber}>{stats.wordsLearned}</Text>
          <Text style={styles.statLabel}>Words Learned</Text>
          <Text style={styles.subStat}>+{stats.recentlyLearned} this week</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="school" size={24} color="#7C9D96" />
          <Text style={styles.statNumber}>{stats.quizzesTaken}</Text>
          <Text style={styles.statLabel}>Quizzes Taken</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="trophy" size={24} color="#7C9D96" />
          <Text style={styles.statNumber}>{stats.averageScore}%</Text>
          <Text style={styles.statLabel}>Average Score</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="refresh" size={24} color="#7C9D96" />
          <Text style={styles.statNumber}>{stats.needsReview}</Text>
          <Text style={styles.statLabel}>Need Review</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>Weekly Learning Progress</Text>
        <ProgressChart stats={stats.weeklyProgress} />
        <View style={styles.legendContainer}>
          <Text style={styles.legendText}>Last 7 Days Performance</Text>
        </View>
      </View>

      <View style={styles.achievementsSection}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementsGrid}>
          {/* Add achievement badges here */}
          {stats.wordsLearned >= 50 && (
            <View style={styles.achievementBadge}>
              <Ionicons name="ribbon" size={32} color="#FFD700" />
              <Text style={styles.achievementText}>50 Words Mastered!</Text>
            </View>
          )}
          {stats.streak >= 7 && (
            <View style={styles.achievementBadge}>
              <Ionicons name="flame" size={32} color="#FF9500" />
              <Text style={styles.achievementText}>Week Warrior!</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
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
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  avatarContainer: {
    marginBottom: 10,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#FFF3E0',
    padding: 8,
    borderRadius: 20,
  },
  streakText: {
    marginLeft: 8,
    color: '#FF9500',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
  },
  subStat: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
  },
  progressSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  legendContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  legendText: {
    fontSize: 12,
    color: '#666666',
  },
  achievementsSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  achievementBadge: {
    alignItems: 'center',
    padding: 16,
    width: '45%',
  },
  achievementText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 8,
    textAlign: 'center',
  }
});

export default ProfileScreen;
