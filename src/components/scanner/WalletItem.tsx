import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { CustomIcon } from '@components/common/CustomIcon';
import { ScannedWallet } from '@types';
import {
  formatWalletAddress,
  getWalletTypeDisplayName,
} from '@utils/walletValidation';
import { useRemoveScannedWallet, useToggleWalletFavorite } from '@hooks';
import { colors } from '@constants/colors';
import { Button } from '@components/common';
import { formatDate } from '@utils/helpers';

interface WalletItemProps {
  item: ScannedWallet;
  onPress?: (item: ScannedWallet) => void;
}

/**
 * WalletItem component displays a scanned cryptocurrency wallet with actions.
 * Shows wallet type, address (truncated), scan date, and favorite/delete actions.
 *
 * @param item - The scanned wallet data to display
 * @param onPress - Optional callback when the wallet item is pressed
 */
export const WalletItem: React.FC<WalletItemProps> = ({ item, onPress }) => {
  const removeWalletMutation = useRemoveScannedWallet();
  const toggleFavoriteMutation = useToggleWalletFavorite();

  /**
   * Shows confirmation dialog and deletes wallet if confirmed.
   * Uses React Query mutation to remove wallet from storage.
   */
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

  /**
   * Toggles the favorite status of the wallet.
   * Uses React Query mutation to persist the change.
   */
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

  return (
    <Button
      style={[styles.container, item.isFavorite && styles.favoriteContainer]}
      onPress={() => onPress?.(item)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.walletType} numberOfLines={1}>
          {getWalletTypeDisplayName(item.type)} Wallet
        </Text>
        <View style={styles.actions}>
          <Button
            style={[styles.actionButton, styles.favoriteButton]}
            onPress={handleToggleFavorite}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <CustomIcon
              name={item.isFavorite ? 'favorite' : 'favorite-border'}
              size={18}
              color={item.isFavorite ? colors.favorite : colors.textTertiary}
            />
          </Button>

          <Button
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <CustomIcon name="delete" size={18} color={colors.primary} />
          </Button>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.address} numberOfLines={1} ellipsizeMode="middle">
          {formatWalletAddress(item.address, 36)}
        </Text>
        <Text style={styles.date}>{formatDate(item.scannedAt)}</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  content: {
    flex: 1,
  },
  walletType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
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
  },
  date: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  favoriteButton: {},
  deleteButton: {},
});
