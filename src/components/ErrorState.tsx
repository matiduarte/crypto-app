import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CustomIcon } from './CustomIcon';
import { Button } from './Button';
import { colors } from '@constants/colors';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  icon?: string;
  iconSize?: number;
  style?: object;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to Load Data',
  message = 'Please check your internet connection and try again.',
  onRetry,
  retryText = 'Retry',
  icon = 'error-outline',
  iconSize = 48,
  style,
}) => (
  <View style={[styles.errorContainer, style]}>
    <View style={styles.errorIcon}>
      <CustomIcon name={icon} size={iconSize} color={colors.errorLight} />
    </View>
    <Text style={styles.errorTitle}>{title}</Text>
    <Text style={styles.errorSubtext}>{message}</Text>
    {onRetry && (
      <Button style={styles.retryButton} onPress={onRetry} activeOpacity={0.7}>
        <Text style={styles.retryButtonText}>{retryText}</Text>
      </Button>
    )}
  </View>
);

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.crypto,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
