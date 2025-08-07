import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
} from 'react-native';

import { useAuth } from '../../contexts/AuthContext';
import { useGoogleSignIn } from '../../hooks/useAuth';
import { FixedScreen } from '../../components/common/ScreenWrapper';
import { GoogleSignInButton } from '../../components/auth';

export const APP_DETAILS = {
  name: 'Lemon',
  emoji: '🍋',
};

export const LoginScreen: React.FC = () => {
  // Use both the context (for backward compatibility) and direct React Query hook
  const { error, clearError } = useAuth();
  const signInMutation = useGoogleSignIn();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;

  // Initialize animations on mount
  useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // Start logo rotation animation
    const rotateAnimation = Animated.loop(
      Animated.timing(logoRotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    rotateAnimation.start();

    return () => {
      rotateAnimation.stop();
    };
  }, [fadeAnim, scaleAnim, slideAnim, logoRotateAnim]);

  const handleSignIn = async () => {
    try {
      clearError();

      // Use React Query mutation directly for better error handling
      const result = await signInMutation.mutateAsync();

      if (!result.success) {
        // Error is now displayed in the UI via React Query error state
        // Show alert for specific error types that need immediate attention
        const errorMessage =
          result.error || 'Unable to sign in. Please try again.';

        if (
          errorMessage.includes('network') ||
          errorMessage.includes('cancelled')
        ) {
          Alert.alert('Sign-In Failed', errorMessage, [{ text: 'OK' }]);
        }
      }
      // Success is handled automatically by React Query and navigation state change
    } catch (err: any) {
      // React Query will handle the error, but show alert for critical issues
      const errorMessage = err.message || 'An unexpected error occurred.';
      Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
    }
  };

  return (
    <FixedScreen style={styles.scree}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* Logo/Header Section */}
        <Animated.View
          style={[
            styles.header,
            {
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.logoContainer}>
            <Animated.Text
              style={[
                styles.logoEmoji,
                {
                  transform: [
                    {
                      rotate: logoRotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                },
              ]}
            >
              {APP_DETAILS.emoji}
            </Animated.Text>
            <Animated.Text
              style={[
                styles.logoText,
                {
                  transform: [
                    {
                      scale: scaleAnim.interpolate({
                        inputRange: [0.8, 1],
                        outputRange: [0.8, 1],
                        extrapolate: 'clamp',
                      }),
                    },
                  ],
                },
              ]}
            >
              {APP_DETAILS.name}
            </Animated.Text>
          </View>
          <Animated.Text
            style={[
              styles.tagline,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            Your gateway to cryptocurrency tracking and exchange
          </Animated.Text>
        </Animated.View>
        {/* Error Display - Shows errors from React Query mutation */}
        {(error || signInMutation.error) && (
          <Animated.View
            style={[
              styles.errorContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.errorText}>
              {error || signInMutation.error?.message || 'An error occurred'}
            </Text>
            <TouchableOpacity
              style={styles.clearErrorButton}
              onPress={() => {
                clearError();
                signInMutation.reset();
              }}
              accessibilityLabel="Dismiss error"
              accessibilityRole="button"
            >
              <Text style={styles.clearErrorText}>Dismiss</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <Animated.View
          style={[
            styles.signInSection,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 50],
                    outputRange: [0, 20],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}
        >
          <GoogleSignInButton
            onPress={handleSignIn}
            isLoading={signInMutation.isPending}
          />
        </Animated.View>
      </Animated.View>
    </FixedScreen>
  );
};

const styles = StyleSheet.create({
  scree: {
    flex: 1,
    marginVertical: 15,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'space-evenly',
    backgroundColor: '#fffef7', // Subtle lemon-tinted background
    minHeight: 600, // Ensure minimum height for proper layout
  },
  header: {
    alignItems: 'center',
    marginTop: '10%',
    marginBottom: '8%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoEmoji: {
    fontSize: 82,
    marginBottom: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  errorContainer: {
    backgroundColor: '#fff2f2',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffcccb',
    marginBottom: 20,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  clearErrorButton: {
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  clearErrorText: {
    color: '#d32f2f',
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  signInSection: {
    alignItems: 'center',
  },
});
