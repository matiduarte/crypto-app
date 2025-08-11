import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '@constants/colors';
import { styles } from './styles';
import { CustomIcon } from '@components/CustomIcon';
import { Button } from '@components/Button';

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
