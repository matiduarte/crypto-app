import React, { useState } from 'react';
import { View, StyleSheet, Alert, FlatList } from 'react-native';
import { FixedScreen } from '@components/common/ScreenWrapper';
import { ActionButton, ScreenHeader, EmptyState, LoadingIndicator } from '@components/common';
import { QRScannerModal, WalletItem } from '@components/scanner';
import { useScannedWallets, useAddScannedWallet } from '@hooks';
import { 
  validateWalletAddress, 
  extractAddressFromQRData, 
  getWalletTypeDisplayName 
} from '@utils/walletValidation';
import { colors } from '@constants/colors';

/**
 * ScannerScreen allows users to scan QR codes containing cryptocurrency wallet addresses.
 * Validates addresses, prevents duplicates, saves to storage, and displays scanned wallets.
 * Supports Bitcoin and Ethereum address formats.
 */
export const ScannerScreen: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  
  const { data: scannedWallets = [], isLoading } = useScannedWallets();
  const addWalletMutation = useAddScannedWallet();

  /**
   * Processes scanned QR code data, validates wallet address, checks for duplicates,
   * and saves valid wallets to storage with user feedback.
   * 
   * @param qrData - Raw QR code data from the scanner
   */
  const handleScanSuccess = async (qrData: string) => {
    setModalVisible(false);
    
    try {
      const extractedAddress = extractAddressFromQRData(qrData);
      const validation = validateWalletAddress(extractedAddress);
      
      if (!validation.isValid) {
        let errorMessage = 'Invalid wallet address';
        if (validation.error === 'Unsupported wallet address format') {
          errorMessage = 'This wallet type is not supported. We only support Bitcoin and Ethereum addresses.';
        } else if (validation.error === 'Invalid wallet address format') {
          errorMessage = 'This QR code does not contain a valid cryptocurrency wallet address.';
        } else if (validation.error === 'Invalid input') {
          errorMessage = 'The scanned QR code appears to be empty or invalid.';
        } else if (validation.error) {
          errorMessage = validation.error;
        }
        
        Alert.alert('Invalid QR Code', errorMessage, [{ text: 'OK' }]);
        return;
      }
      
      const existingWallet = scannedWallets.find(wallet => wallet.address === validation.address);
      if (existingWallet) {
        Alert.alert(
          'Wallet Already Added', 
          `This ${getWalletTypeDisplayName(validation.type)} address is already in your collection.`,
          [{ text: 'OK' }]
        );
        return;
      }
      
      await addWalletMutation.mutateAsync({
        address: validation.address,
        qrData: qrData,
        label: `${getWalletTypeDisplayName(validation.type)} wallet`,
      });
      
      Alert.alert(
        'Wallet Added Successfully!', 
        `${getWalletTypeDisplayName(validation.type)} address has been added to your collection.`,
        [{ text: 'OK' }]
      );
      
    } catch (error: any) {
      Alert.alert(
        'Error', 
        error.message || 'Failed to save wallet. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const renderWalletItem = ({ item }: { item: any }) => (
    <WalletItem item={item} />
  );

  const headerComponent = (
    <View style={styles.headerSection}>
      <ScreenHeader
        title="QR Scanner"
        subtitle="Scan and save cryptocurrency wallet addresses"
        icon="qr-code-scanner"
        style={styles.header}
      />

      <ActionButton
        title="Scan QR Code"
        subtitle="Tap to open camera scanner"
        icon="qr-code-scanner"
        onPress={() => setModalVisible(true)}
        style={styles.scanButton}
      />
    </View>
  );

  const emptyComponent = (
    <EmptyState
      icon="qr-code-scanner"
      iconSize={64}
      title="No wallets scanned yet"
      subtitle="Scan a QR code to add your first wallet address"
    />
  );

  return (
    <FixedScreen>
      <View style={styles.container}>
        {isLoading ? (
          <>
            {headerComponent}
            <LoadingIndicator
              text="Loading wallets..."
              size="large"
              color={colors.primary}
              style={styles.loadingContainer}
            />
          </>
        ) : (
          <FlatList
            data={scannedWallets}
            renderItem={renderWalletItem}
            keyExtractor={item => item.id}
            ListHeaderComponent={headerComponent}
            ListEmptyComponent={emptyComponent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
            style={styles.flatList}
          />
        )}

        <QRScannerModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onScanSuccess={handleScanSuccess}
          title="Scan Wallet QR Code"
        />
      </View>
    </FixedScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  headerSection: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    paddingHorizontal: 0,
    marginBottom: 40,
  },
  scanButton: {
    marginBottom: 20,
  },
  flatList: {
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
});
