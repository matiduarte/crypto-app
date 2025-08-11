import React from 'react';
import { View, Text } from 'react-native';

import { colors } from '@constants/colors';
import { styles } from './styles';
import { CustomIcon } from '@components/CustomIcon';
import { Button } from '@components/Button';

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
