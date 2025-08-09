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

import { useAuth, useGoogleSignIn } from '../../hooks/useAuth';
import { FixedScreen } from '../../components/common/ScreenWrapper';
import { GoogleSignInButton } from '../../components/auth';
import { CustomIcon } from '../../components/common/CustomIcon';
import { APP_DETAILS } from '../../constants/config';
import { colors } from '../../constants/colors';

export const LoginScreen: React.FC = () => {
  // Use both the context (for backward compatibility) and direct React Query hook
  const { clearError } = useAuth();
  const { mutateAsync, error, reset, isPending } = useGoogleSignIn();

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
      const result = await mutateAsync();

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
    <FixedScreen style={styles.screen}>
      {/* Background Elements */}
      <View style={styles.backgroundElements}>
        <View style={styles.circleTop} />
        <View style={styles.circleBottom} />
      </View>

      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* Header Section */}
        <Animated.View
          style={[
            styles.header,
            {
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.appBrand}>
            <View style={styles.iconContainer}>
              <Animated.View
                style={[
                  styles.appIconContainer,
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
                <CustomIcon name={APP_DETAILS.iconName} size={60} color={colors.primary} />
              </Animated.View>
            </View>
          </View>

          <Animated.View
            style={[
              styles.welcomeSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.welcomeTitle}>Welcome Back</Text>
            <Text style={styles.welcomeSubtitle}>
              Sign in to continue to your crypto portfolio
            </Text>
          </Animated.View>
        </Animated.View>

        {/* Error Display */}
        {error && (
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
              {error?.message || 'An error occurred'}
            </Text>
            <TouchableOpacity
              style={styles.clearErrorButton}
              onPress={() => {
                clearError();
                reset();
              }}
              accessibilityLabel="Dismiss error"
              accessibilityRole="button"
            >
              <Text style={styles.clearErrorText}>Dismiss</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Sign In Section */}
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
          <GoogleSignInButton onPress={handleSignIn} isLoading={isPending} />
        </Animated.View>
      </Animated.View>
    </FixedScreen>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.backgroundLight, // Clean, modern background
  },
  backgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  circleTop: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primary,
    opacity: 0.1,
  },
  circleBottom: {
    position: 'absolute',
    bottom: -120,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.successLight,
    opacity: 0.08,
  },
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingVertical: 40,
    justifyContent: 'center',
    zIndex: 2,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  appBrand: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    backgroundColor: colors.primaryLight,
    borderRadius: 30,
    padding: 20,
    marginBottom: 16,
  },
  appIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textGoogle,
    letterSpacing: -0.5,
  },
  welcomeSection: {
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textGoogle,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: colors.textGoogleSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  errorContainer: {
    backgroundColor: colors.errorBackground,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    marginBottom: 24,
    marginHorizontal: 4,
  },
  errorText: {
    color: colors.textError,
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  clearErrorButton: {
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  clearErrorText: {
    color: colors.textError,
    fontSize: 13,
    fontWeight: '600',
  },
  signInSection: {
    alignItems: 'center',
  },
  signInFooter: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
});
