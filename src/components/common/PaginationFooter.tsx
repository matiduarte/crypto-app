import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../../constants/colors';

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

const styles = StyleSheet.create({
  paginationFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: colors.surface,
  },
  paginationText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.textSecondary,
  },
});