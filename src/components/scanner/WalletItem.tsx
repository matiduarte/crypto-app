import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { CustomIcon } from '../common/CustomIcon';
import { ScannedWallet } from '../../types';
import {
  formatWalletAddress,
  getWalletTypeDisplayName,
} from '../../utils/walletValidation';
import { useRemoveScannedWallet, useToggleWalletFavorite } from '../../hooks';
import { colors } from '../../constants/colors';
import { Button } from '../common';

interface WalletItemProps {
  item: ScannedWallet;
  onPress?: (item: ScannedWallet) => void;
}

export const WalletItem: React.FC<WalletItemProps> = ({ item, onPress }) => {
  const removeWalletMutation = useRemoveScannedWallet();
  const toggleFavoriteMutation = useToggleWalletFavorite();

  const handleDelete = () => {
    Alert.alert(
      'Delete Wallet',
      `Are you sure you want to remove this ${getWalletTypeDisplayName(
        item.type,
      ).toLowerCase()} wallet from your list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeWalletMutation.mutateAsync(item.id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete wallet');
            }
          },
        },
      ],
    );
  };

  const handleToggleFavorite = async () => {
    try {
      await toggleFavoriteMutation.mutateAsync({
        walletId: item.id,
        isFavorite: !item.isFavorite,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorite status');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  return (
    <Button
      style={[styles.container, item.isFavorite && styles.favoriteContainer]}
      onPress={() => onPress?.(item)}
      activeOpacity={0.7}
    >
      {/* Main content */}
      <View style={styles.content}>
        {/* Left side - Wallet info */}
        <View style={styles.leftContent}>
          <View style={styles.walletInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.walletType} numberOfLines={1}>
                {getWalletTypeDisplayName(item.type)} Wallet
              </Text>
            </View>
            <Text
              style={styles.address}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {formatWalletAddress(item.address, 36)}
            </Text>
            <Text style={styles.date}>{formatDate(item.scannedAt)}</Text>
          </View>
        </View>

        {/* Right side - Actions */}
        <View style={styles.actions}>
          <Button
            style={[styles.actionButton, styles.favoriteButton]}
            onPress={handleToggleFavorite}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <CustomIcon
              name={item.isFavorite ? 'favorite' : 'favorite-border'}
              size={20}
              color={item.isFavorite ? colors.favorite : colors.textTertiary}
            />
          </Button>

          <Button
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <CustomIcon name="delete" size={20} color={colors.primary} />
          </Button>
        </View>
      </View>
    </Button>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 80,
  },
  favoriteContainer: {
    backgroundColor: colors.favoriteBackground,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContent: {
    flex: 1,
    marginRight: 16,
  },
  walletInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  walletType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  favoriteIndicator: {
    marginLeft: 8,
  },
  address: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: colors.textMuted,
    marginBottom: 4,
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  date: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  favoriteButton: {
    // Additional styling for favorite button if needed
  },
  deleteButton: {
    // Additional styling for delete button if needed
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginTop: 16,
  },
});
