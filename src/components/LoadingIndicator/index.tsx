import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { colors } from '@constants/colors';
import { styles } from './styles';

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
