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
import { ScrollableScreen } from '../../components/common/ScreenWrapper';

export const LoginScreen: React.FC = () => {
  const { signIn, isLoading, clearError } = useAuth();

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

  // Button press animation
  const buttonPressAnim = useRef(new Animated.Value(1)).current;

  const handleButtonPressIn = () => {
    Animated.spring(buttonPressAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(buttonPressAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleSignIn = async () => {
    try {
      clearError();

      const result = await signIn();

      if (!result.success) {
        Alert.alert(
          'Sign-In Failed',
          result.error || 'Unable to sign in. Please try again.',
          [{ text: 'OK' }],
        );
      }
      // Success is handled automatically by navigation state change
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An unexpected error occurred.', [
        { text: 'OK' },
      ]);
    }
  };

  return (
    <ScrollableScreen>
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
              🍋
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
              CryptoApp
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
          <Animated.View style={{ transform: [{ scale: buttonPressAnim }] }}>
            <TouchableOpacity
              style={[
                styles.signInButton,
                isLoading && styles.signInButtonDisabled,
              ]}
              onPress={handleSignIn}
              onPressIn={handleButtonPressIn}
              onPressOut={handleButtonPressOut}
              disabled={isLoading}
              activeOpacity={0.8}
              accessibilityLabel="Sign in with Google"
              accessibilityHint="Tap to sign in using your Google account"
              accessibilityRole="button"
            >
              <View style={styles.signInButtonContent}>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.signInButtonText}>
                  {isLoading ? 'Signing in...' : 'Continue with Google'}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </ScrollableScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
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
    fontSize: 64,
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
  signInButton: {
    backgroundColor: '#4285F4',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 24,
    width: '100%',
    minHeight: 56, // Ensure minimum touch target size
    shadowColor: '#4285F4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  signInButtonDisabled: {
    backgroundColor: '#9e9e9e',
    shadowOpacity: 0.1,
  },
  signInButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 12,
    backgroundColor: '#db4437',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  signInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
