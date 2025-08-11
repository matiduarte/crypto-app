import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '@constants/colors';

interface LoadingIndicatorProps {
  text?: string;
  size?: 'small' | 'large';
  color?: string;
  horizontal?: boolean;
  style?: object;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  text,
  size = 'small',
  color = colors.crypto,
  horizontal = true,
  style,
}) => (
  <View
    style={[
      horizontal ? styles.horizontalContainer : styles.verticalContainer,
      style,
    ]}
  >
    <ActivityIndicator size={size} color={color} />
    {text && (
      <Text style={[styles.loadingText, horizontal && styles.horizontalText]}>
        {text}
      </Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  verticalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  horizontalText: {
    marginTop: 0,
    marginLeft: 8,
  },
});
