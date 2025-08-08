import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
  TextInput,
  Modal,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { ScannedWallet } from '../../types';
import {
  formatWalletAddress,
  getWalletTypeDisplayName,
  getWalletTypeEmoji
} from '../../utils/walletValidation';
import {
  useRemoveScannedWallet,
  useToggleWalletFavorite,
  useUpdateWalletLabel
} from '../../hooks';

interface WalletItemProps {
  item: ScannedWallet;
  onPress?: (item: ScannedWallet) => void;
}

export const WalletItem: React.FC<WalletItemProps> = ({ item, onPress }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLabel, setEditLabel] = useState(item.label || '');
  const [copied, setCopied] = useState(false);

  const removeWalletMutation = useRemoveScannedWallet();
  const toggleFavoriteMutation = useToggleWalletFavorite();
  const updateLabelMutation = useUpdateWalletLabel();

  const handleCopy = async () => {
    try {
      await Clipboard.setString(item.address);
      setCopied(true);
      Alert.alert('Copied!', 'Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy address');
    }
  };

  const handleShare = async () => {
    try {
      const shareOptions = {
        title: `${getWalletTypeDisplayName(item.type)} Wallet Address`,
        message: `Here's a ${getWalletTypeDisplayName(item.type).toLowerCase()} wallet address:\n\n${item.address}`,
      };
      await Share.share(shareOptions);
    } catch (error) {
      Alert.alert('Error', 'Failed to share address');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Wallet',
      'Are you sure you want to delete this wallet address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeWalletMutation.mutateAsync(item.id);
              Alert.alert('Success', 'Wallet deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete wallet');
            }
          },
        },
      ]
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

  const handleSaveLabel = async () => {
    if (editLabel.trim() === item.label) {
      setShowEditModal(false);
      return;
    }

    try {
      await updateLabelMutation.mutateAsync({
        walletId: item.id,
        label: editLabel.trim() || `${getWalletTypeDisplayName(item.type)} wallet`,
      });
      setShowEditModal(false);
      Alert.alert('Success', 'Label updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update label');
    }
  };

  const showActionSheet = () => {
    Alert.alert(
      'Wallet Actions',
      `Choose an action for this ${getWalletTypeDisplayName(item.type).toLowerCase()} wallet`,
      [
        {
          text: 'Copy Address',
          onPress: handleCopy,
        },
        {
          text: 'Share Address',
          onPress: handleShare,
        },
        {
          text: item.isFavorite ? 'Remove from Favorites' : 'Add to Favorites',
          onPress: handleToggleFavorite,
        },
        {
          text: 'Edit Label',
          onPress: () => setShowEditModal(true),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: handleDelete,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={() => onPress?.(item)}
        onLongPress={showActionSheet}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <View style={styles.typeContainer}>
            <Text style={styles.emoji}>
              {getWalletTypeEmoji(item.type)}
            </Text>
            <View style={styles.info}>
              <View style={styles.titleRow}>
                <Text style={styles.label} numberOfLines={1}>
                  {item.label || `${getWalletTypeDisplayName(item.type)} wallet`}
                </Text>
                {item.isFavorite && (
                  <Text style={styles.favoriteIcon}>⭐</Text>
                )}
              </View>
              <Text style={styles.type}>
                {getWalletTypeDisplayName(item.type)}
              </Text>
            </View>
          </View>
          <View style={styles.dateContainer}>
            <Text style={styles.date}>
              {new Date(item.scannedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        
        <View style={styles.addressContainer}>
          <Text style={styles.address} numberOfLines={1} ellipsizeMode="middle">
            {formatWalletAddress(item.address, 32)}
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={handleCopy}
          >
            <Text style={styles.quickActionIcon}>📋</Text>
            <Text style={styles.quickActionText}>
              {copied ? 'Copied!' : 'Copy'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={handleShare}
          >
            <Text style={styles.quickActionIcon}>📤</Text>
            <Text style={styles.quickActionText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={showActionSheet}
          >
            <Text style={styles.quickActionIcon}>⚙️</Text>
            <Text style={styles.quickActionText}>More</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Edit Label Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Wallet Label</Text>
            
            <TextInput
              style={styles.labelInput}
              value={editLabel}
              onChangeText={setEditLabel}
              placeholder="Enter wallet label"
              autoFocus
              maxLength={50}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveLabel}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  favoriteIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  type: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  date: {
    fontSize: 12,
    color: '#9e9e9e',
  },
  addressContainer: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  address: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: '#495057',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  quickActionIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#495057',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 20,
  },
  labelInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});