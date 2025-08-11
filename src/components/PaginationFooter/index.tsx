import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { colors } from '@constants/colors';
import { styles } from './styles';

interface PaginationFooterProps {
  isLoading?: boolean;
  text?: string;
  color?: string;
  style?: object;
}

export const PaginationFooter: React.FC<PaginationFooterProps> = ({
  isLoading = false,
  text = 'Loading more...',
  color = colors.crypto,
  style,
}) => {
  if (!isLoading) return null;

  return (
    <View style={[styles.paginationFooter, style]}>
      <ActivityIndicator size="small" color={color} />
      <Text style={styles.paginationText}>{text}</Text>
    </View>
  );
};
