// src/navigation/AppNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import LearnScreen from '../screens/LearnScreen';
import QuizScreen from '../screens/QuizScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            const iconSize = focused ? 28 : 24;

            switch (route.name) {
              case 'Home':
                iconName = focused ? 'home' : 'home-outline';
                break;
              case 'Learn':
                iconName = focused ? 'library' : 'library-outline';
                break;
              case 'Quiz':
                iconName = focused ? 'rocket' : 'rocket-outline';
                break;
              case 'Profile':
                iconName = focused ? 'person' : 'person-outline';
                break;
            }

            return (
              <View style={focused ? styles.activeTabIcon : styles.tabIcon}>
                <Ionicons 
                  name={iconName} 
                  size={iconSize} 
                  color={color} 
                />
              </View>
            );
          },
          tabBarActiveTintColor: '#7C3AED',
          tabBarInactiveTintColor: '#94A3B8',
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          tabBarItemStyle: styles.tabItem,
          headerStyle: styles.header,
          headerTitleStyle: styles.headerTitle,
          headerTitleAlign: 'center',
          headerShadowVisible: true,
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Word of the Day' }}
        />
        <Tab.Screen 
          name="Learn" 
          component={LearnScreen} 
          options={{ title: 'Vocabulary Builder' }}
        />
        <Tab.Screen 
          name="Quiz" 
          component={QuizScreen} 
          options={{ title: 'Word Quiz' }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{ title: 'My Progress' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: 80,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 0,
    backgroundColor: '#FFFFFF',
    elevation: 16,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: 'absolute',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  tabItem: {
    height: 56,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  activeTabIcon: {
    backgroundColor: '#F5F3FF',
    padding: 8,
    borderRadius: 16,
  },
  header: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    color: '#1E293B',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default AppNavigator;