import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, Share } from 'react-native';
import { ScrollableScreen } from '../../components/common/ScreenWrapper';
import { QRScannerModal, WalletItem, WalletSearchFilter } from '../../components/scanner';
import { useScannedWallets, useAddScannedWallet } from '../../hooks';
import { 
  validateWalletAddress, 
  extractAddressFromQRData,
  getWalletTypeDisplayName
} from '../../utils/walletValidation';

export const ScannerScreen: React.FC = () => {
  const [scannerVisible, setScannerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'bitcoin' | 'ethereum' | 'favorites'>('all');
  const { data: scannedWallets = [], isLoading: walletsLoading } = useScannedWallets();
  const addWalletMutation = useAddScannedWallet();

  const handleScanSuccess = async (qrData: string) => {
    try {
      // Extract address from QR data
      const extractedAddress = extractAddressFromQRData(qrData);
      
      // Validate the address
      const validation = validateWalletAddress(extractedAddress);
      
      if (!validation.isValid) {
        Alert.alert(
          'Invalid QR Code',
          validation.error || 'The scanned QR code does not contain a valid wallet address.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Check if wallet already exists
      const existingWallet = scannedWallets.find(
        wallet => wallet.address === validation.address
      );

      if (existingWallet) {
        Alert.alert(
          'Wallet Already Added',
          `This ${getWalletTypeDisplayName(validation.type)} address is already in your list.`,
          [{ text: 'OK' }]
        );
        return;
      }

      // Add the wallet
      const result = await addWalletMutation.mutateAsync({
        address: validation.address,
        qrData: qrData,
        label: `${getWalletTypeDisplayName(validation.type)} wallet`,
      });

      if (result) {
        Alert.alert(
          'Wallet Added Successfully!',
          `${getWalletTypeDisplayName(validation.type)} address has been added to your list.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'An unexpected error occurred.',
        [{ text: 'OK' }]
      );
    }
  };

  // Filter and search wallets
  const filteredWallets = React.useMemo(() => {
    let filtered = scannedWallets;

    // Apply type filter
    if (filterType === 'bitcoin') {
      filtered = filtered.filter(wallet => wallet.type === 'bitcoin');
    } else if (filterType === 'ethereum') {
      filtered = filtered.filter(wallet => wallet.type === 'ethereum');
    } else if (filterType === 'favorites') {
      filtered = filtered.filter(wallet => wallet.isFavorite);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(wallet => 
        wallet.address.toLowerCase().includes(query) ||
        (wallet.label && wallet.label.toLowerCase().includes(query)) ||
        getWalletTypeDisplayName(wallet.type).toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => {
      // Sort favorites first, then by date
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime();
    });
  }, [scannedWallets, searchQuery, filterType]);

  const handleExportWallets = async () => {
    if (filteredWallets.length === 0) {
      Alert.alert('No Wallets', 'No wallets to export');
      return;
    }

    try {
      const exportData = filteredWallets.map((wallet, index) => {
        return `${index + 1}. ${getWalletTypeDisplayName(wallet.type)} - ${wallet.label || 'Unnamed'}
Address: ${wallet.address}
Scanned: ${new Date(wallet.scannedAt).toLocaleDateString()}
Favorite: ${wallet.isFavorite ? 'Yes' : 'No'}
`;
      }).join('\n');

      const shareContent = `My Cryptocurrency Wallets Export
Generated on ${new Date().toLocaleDateString()}

${exportData}

Total Wallets: ${filteredWallets.length}
Exported via Lemon Crypto App`;

      await Share.share({
        title: 'Wallet Export',
        message: shareContent,
      });
    } catch (error) {
      Alert.alert('Export Failed', 'Unable to export wallets');
    }
  };

  const renderWalletItem = ({ item }: { item: any }) => (
    <WalletItem item={item} />
  );

  return (
    <ScrollableScreen>
      <View style={styles.container}>
        <Text style={styles.title}>📱 QR Scanner</Text>
        <Text style={styles.subtitle}>
          Scan cryptocurrency wallet QR codes
        </Text>
        
        {/* Scan Button */}
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => setScannerVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.scanButtonIcon}>📷</Text>
          <Text style={styles.scanButtonText}>Scan QR Code</Text>
          <Text style={styles.scanButtonSubtext}>
            Tap to scan a wallet address
          </Text>
        </TouchableOpacity>

        {/* Scanned Wallets Section */}
        <View style={styles.walletsSection}>
          {walletsLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading wallets...</Text>
            </View>
          ) : scannedWallets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No wallets scanned yet
              </Text>
              <Text style={styles.emptySubtext}>
                Scan a QR code to add your first wallet address
              </Text>
            </View>
          ) : (
            <>
              {/* Search and Filter */}
              <WalletSearchFilter
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filterType={filterType}
                onFilterChange={setFilterType}
                walletsCount={filteredWallets.length}
              />

              {/* Export Button */}
              {filteredWallets.length > 0 && (
                <View style={styles.exportContainer}>
                  <TouchableOpacity
                    style={styles.exportButton}
                    onPress={handleExportWallets}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.exportButtonIcon}>📁</Text>
                    <Text style={styles.exportButtonText}>Export Wallets</Text>
                  </TouchableOpacity>
                </View>
              )}

              {filteredWallets.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    No wallets found
                  </Text>
                  <Text style={styles.emptySubtext}>
                    Try adjusting your search or filter criteria
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={filteredWallets}
                  renderItem={renderWalletItem}
                  keyExtractor={(item) => item.id}
                  style={styles.walletsList}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.walletsListContent}
                />
              )}
            </>
          )}
        </View>

        {/* QR Scanner Modal */}
        <QRScannerModal
          visible={scannerVisible}
          onClose={() => setScannerVisible(false)}
          onScanSuccess={handleScanSuccess}
          title="Scan Wallet QR Code"
        />
      </View>
    </ScrollableScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 30,
  },
  // Scan Button
  scanButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  scanButtonIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  scanButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  scanButtonSubtext: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
  },
  // Wallets Section
  walletsSection: {
    flex: 1,
  },
  walletsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  walletsList: {
    flex: 1,
  },
  // Loading/Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#9e9e9e',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bdbdbd',
    textAlign: 'center',
    lineHeight: 20,
  },
  walletsListContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  // Export Button
  exportContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  exportButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});