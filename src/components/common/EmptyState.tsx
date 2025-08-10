import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CustomIcon } from './CustomIcon';
import { Button } from './Button';
import { colors } from '@constants/colors';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle: string;
  actionText?: string;
  onActionPress?: () => void;
  iconSize?: number;
  style?: object;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  actionText,
  onActionPress,
  iconSize = 48,
  style,
}) => (
  <View style={[styles.emptyContainer, style]}>
    <View style={styles.emptyIcon}>
      <CustomIcon name={icon} size={iconSize} color={colors.textTertiary} />
    </View>
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptySubtext}>{subtitle}</Text>
    {actionText && onActionPress && (
      <Button style={styles.actionButton} onPress={onActionPress}>
        <Text style={styles.actionButtonText}>{actionText}</Text>
      </Button>
    )}
  </View>
);

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: colors.crypto,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
