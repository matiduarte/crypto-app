import React, { useEffect, useRef } from 'react';
import { View, Text, Alert, Animated, Easing } from 'react-native';

import { useAuth } from '@hooks/useAuth';
import { APP_DETAILS } from '@constants/config';
import { colors } from '@constants/colors';

import { styles } from './styles';
import { FixedScreen } from '@components/ScreenWrapper';
import { CustomIcon } from '@components/CustomIcon';
import { Button } from '@components/Button';
import { GoogleSignInButton } from '@components/GoogleSignInButton';

export const LoginScreen: React.FC = () => {
  const { clearError, signInMutation } = useAuth();
  const { error, isPending, reset, mutateAsync: signIn } = signInMutation;

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

      const result = await signIn();

      if (!result.success) {
        const errorMessage =
          result.error || 'Unable to sign in. Please try again.';

        if (
          errorMessage.includes('network') ||
          errorMessage.includes('cancelled')
        ) {
          Alert.alert('Sign-In Failed', errorMessage, [{ text: 'OK' }]);
        }
      }
    } catch (err: any) {
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
                <CustomIcon
                  name={APP_DETAILS.iconName}
                  size={60}
                  color={colors.primary}
                />
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
            <Button
              style={styles.clearErrorButton}
              onPress={() => {
                clearError();
                reset();
              }}
              accessibilityLabel="Dismiss error"
              accessibilityRole="button"
            >
              <Text style={styles.clearErrorText}>Dismiss</Text>
            </Button>
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
          pointerEvents="auto"
        >
          <GoogleSignInButton onPress={handleSignIn} isLoading={isPending} />
        </Animated.View>
      </Animated.View>
    </FixedScreen>
  );
};
