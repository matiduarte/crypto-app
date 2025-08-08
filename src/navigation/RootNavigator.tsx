import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../hooks/useAuth';
import { AuthStack } from './AuthStack';
import { MainStack } from './MainStack';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { CustomIcon } from '../components/common/CustomIcon';
import { APP_DETAILS } from '../constants/config';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isLoggedIn, isLoading } = useAuth();

  // Show loading screen while checking authentication status
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <View style={styles.logoContainer}>
            <CustomIcon name={APP_DETAILS.iconName} size={64} color="#4285F4" />
          </View>
          <ActivityIndicator
            size="large"
            color="#4285F4"
            style={styles.spinner}
          />
          <Text style={styles.loadingText}>Initializing...</Text>
        </View>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#f8f9fa' },
        }}
      >
        {isLoggedIn ? (
          // User is logged in - show main app
          <Stack.Screen
            name="Main"
            component={MainStack}
            options={{
              animationTypeForReplace: 'push',
            }}
          />
        ) : (
          // User is not logged in - show auth flow
          <Stack.Screen
            name="Auth"
            component={AuthStack}
            options={{
              animationTypeForReplace: 'pop',
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingContent: {
    alignItems: 'center',
    padding: 40,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    letterSpacing: -0.5,
    marginBottom: 40,
  },
  spinner: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '500',
  },
});
