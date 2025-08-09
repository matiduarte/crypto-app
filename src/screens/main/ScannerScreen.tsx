import React, { useReducer, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { FixedScreen } from '../../components/common/ScreenWrapper';
import { Button } from '../../components/common';
import { QRScannerModal, WalletItem } from '../../components/scanner';
import { CustomIcon } from '../../components/common/CustomIcon';
import { useScannedWallets, useAddScannedWallet } from '../../hooks';
import {
  validateWalletAddress,
  extractAddressFromQRData,
  getWalletTypeDisplayName,
} from '../../utils/walletValidation';
import { colors } from '../../constants/colors';

// Types for better state management
interface ScannerState {
  scannerVisible: boolean;
  isProcessing: boolean;
  processingMessage: string;
}

type ScannerAction =
  | { type: 'SHOW_SCANNER' }
  | { type: 'HIDE_SCANNER' }
  | { type: 'START_PROCESSING'; message: string }
  | { type: 'STOP_PROCESSING' }
  | { type: 'RESET' };

// State reducer for predictable state management
const scannerReducer = (
  state: ScannerState,
  action: ScannerAction,
): ScannerState => {
  switch (action.type) {
    case 'SHOW_SCANNER':
      return { ...state, scannerVisible: true, isProcessing: false };
    case 'HIDE_SCANNER':
      return { ...state, scannerVisible: false };
    case 'START_PROCESSING':
      return {
        ...state,
        scannerVisible: false,
        isProcessing: true,
        processingMessage: action.message,
      };
    case 'STOP_PROCESSING':
      return { ...state, isProcessing: false, processingMessage: '' };
    case 'RESET':
      return {
        scannerVisible: false,
        isProcessing: false,
        processingMessage: '',
      };
    default:
      return state;
  }
};

// Alert queue for preventing alert stacking
interface AlertItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export const ScannerScreen: React.FC = () => {
  // State management with reducer
  const [state, dispatch] = useReducer(scannerReducer, {
    scannerVisible: false,
    isProcessing: false,
    processingMessage: '',
  });

  // Data hooks
  const { data: scannedWallets = [], isLoading: walletsLoading } =
    useScannedWallets();
  const addWalletMutation = useAddScannedWallet();

  // Refs for cleanup and preventing stale closures
  const alertQueue = useRef<AlertItem[]>([]);
  const isShowingAlert = useRef(false);
  const abortController = useRef<AbortController | null>(null);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Alert queue processing to prevent stacking
  const processAlertQueue = useCallback(() => {
    if (isShowingAlert.current || alertQueue.current.length === 0) {
      return;
    }

    const nextAlert = alertQueue.current.shift();
    if (!nextAlert) return;

    isShowingAlert.current = true;

    Alert.alert(
      nextAlert.title,
      nextAlert.message,
      [
        {
          text: 'OK',
          onPress: () => {
            isShowingAlert.current = false;
            // Process next alert after a brief delay
            setTimeout(() => processAlertQueue(), 100);
          },
        },
      ],
      {
        cancelable: false, // Ensure alerts can't be dismissed accidentally
        onDismiss: () => {
          isShowingAlert.current = false;
          setTimeout(() => processAlertQueue(), 100);
        },
      },
    );
  }, []);

  // Queue an alert for processing
  const queueAlert = useCallback(
    (
      title: string,
      message: string,
      type: 'success' | 'error' | 'info' = 'info',
    ) => {
      const alertId = `${Date.now()}-${Math.random()}`;
      alertQueue.current.push({ id: alertId, title, message, type });
      processAlertQueue();
    },
    [processAlertQueue],
  );

  // Cleanup function
  const cleanup = useCallback(() => {
    // Cancel any ongoing operations
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
    }

    // Clear processing timeout
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }

    // Clear alert queue
    alertQueue.current = [];
    isShowingAlert.current = false;

    // Reset state
    dispatch({ type: 'RESET' });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Handle scan success with proper error handling and state management
  const handleScanSuccess = useCallback(
    async (qrData: string) => {
      try {
        // Start processing and close scanner immediately
        dispatch({
          type: 'START_PROCESSING',
          message: 'Processing QR code...',
        });

        // Create new abort controller for this operation
        abortController.current = new AbortController();
        const { signal } = abortController.current;

        // Add a timeout for the entire operation
        processingTimeoutRef.current = setTimeout(() => {
          if (abortController.current) {
            abortController.current.abort();
          }
          dispatch({ type: 'STOP_PROCESSING' });
          queueAlert(
            'Timeout',
            'The operation took too long and was cancelled.',
            'error',
          );
        }, 10000); // 10 second timeout

        // Extract address from QR data
        if (signal.aborted) return;
        const extractedAddress = extractAddressFromQRData(qrData);

        console.log('QR Data:', qrData);
        console.log('Extracted Address:', extractedAddress);

        // Validate the address
        if (signal.aborted) return;
        const validation = validateWalletAddress(extractedAddress);

        console.log('Validation Result:', validation);

        if (!validation.isValid) {
          dispatch({ type: 'STOP_PROCESSING' });

          // Provide more specific error messages
          let errorTitle = 'QR Code Not Supported';
          let errorMessage = 'This QR code format is not supported.';

          if (validation.error === 'Unsupported wallet address format') {
            errorTitle = 'Unsupported Wallet';
            errorMessage =
              'This wallet address format is not currently supported. We only support Bitcoin and Ethereum addresses.';
          } else if (validation.error === 'Invalid wallet address format') {
            errorTitle = 'Invalid QR Code';
            errorMessage =
              'This QR code does not contain a valid cryptocurrency wallet address.';
          } else if (validation.error === 'Invalid input') {
            errorTitle = 'Invalid QR Code';
            errorMessage =
              'The scanned QR code appears to be empty or invalid.';
          } else if (validation.error) {
            errorMessage = validation.error;
          }

          queueAlert(errorTitle, errorMessage, 'error');
          return;
        }

        // Check if wallet already exists
        if (signal.aborted) return;
        const existingWallet = scannedWallets.find(
          wallet => wallet.address === validation.address,
        );

        if (existingWallet) {
          dispatch({ type: 'STOP_PROCESSING' });
          queueAlert(
            'Wallet Already Added',
            `This ${getWalletTypeDisplayName(
              validation.type,
            )} address is already in your list.`,
            'info',
          );
          return;
        }

        // Add the wallet
        if (signal.aborted) return;
        dispatch({ type: 'START_PROCESSING', message: 'Adding wallet...' });

        const result = await addWalletMutation.mutateAsync({
          address: validation.address,
          qrData: qrData,
          label: `${getWalletTypeDisplayName(validation.type)} wallet`,
        });

        if (signal.aborted) return;

        dispatch({ type: 'STOP_PROCESSING' });

        if (result) {
          queueAlert(
            'Wallet Added Successfully!',
            `${getWalletTypeDisplayName(
              validation.type,
            )} address has been added to your list.`,
            'success',
          );
        } else {
          queueAlert(
            'Failed to Add Wallet',
            'Unable to add the wallet. Please try again.',
            'error',
          );
        }
      } catch (error: any) {
        dispatch({ type: 'STOP_PROCESSING' });

        // Don't show error if operation was aborted
        if (
          error.name === 'AbortError' ||
          abortController.current?.signal.aborted
        ) {
          return;
        }

        queueAlert(
          'Error',
          error.message ||
            'An unexpected error occurred while processing the QR code.',
          'error',
        );
      } finally {
        // Clean up timeout and abort controller
        if (processingTimeoutRef.current) {
          clearTimeout(processingTimeoutRef.current);
          processingTimeoutRef.current = null;
        }
        if (abortController.current) {
          abortController.current = null;
        }
      }
    },
    [scannedWallets, addWalletMutation, queueAlert],
  );

  // Handle scanner open
  const handleOpenScanner = useCallback(() => {
    if (state.isProcessing) {
      queueAlert(
        'Please Wait',
        'Please wait for the current operation to complete.',
        'info',
      );
      return;
    }
    dispatch({ type: 'SHOW_SCANNER' });
  }, [state.isProcessing, queueAlert]);

  // Handle scanner close
  const handleCloseScanner = useCallback(() => {
    dispatch({ type: 'HIDE_SCANNER' });
  }, []);

  // Render wallet item
  const renderWalletItem = useCallback(
    ({ item }: { item: any }) => <WalletItem item={item} />,
    [],
  );

  // Header content for FlatList
  const headerContent = (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <CustomIcon name="qr-code-scanner" size={24} color={colors.primary} />
        <Text style={styles.title}>QR Scanner</Text>
      </View>
      <Text style={styles.subtitle}>Scan cryptocurrency wallet QR codes</Text>

      {/* Scan Button */}
      <Button
        style={[
          styles.scanButton,
          state.isProcessing && styles.scanButtonDisabled,
        ]}
        onPress={handleOpenScanner}
        disabled={state.isProcessing}
      >
        <View style={styles.scanButtonContent}>
          {state.isProcessing ? (
            <>
              <ActivityIndicator
                size="large"
                color={colors.white}
                style={styles.processingIndicator}
              />
              <View style={styles.buttonTextContainer}>
                <Text style={styles.scanButtonText}>Processing...</Text>
                <Text style={styles.scanButtonSubtext}>
                  {state.processingMessage}
                </Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.iconContainer}>
                <CustomIcon name="qr-code-scanner" size={32} color={colors.white} />
                <View style={styles.iconBadge}>
                  <CustomIcon name="add" size={16} color={colors.primary} />
                </View>
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.scanButtonText}>Scan QR Code</Text>
                <Text style={styles.scanButtonSubtext}>
                  Tap to scan a wallet address
                </Text>
              </View>
            </>
          )}
        </View>
      </Button>
    </View>
  );

  // Empty state content for FlatList
  const emptyContent = (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <CustomIcon name="search" size={64} color={colors.textTertiary} />
      </View>
      <Text style={styles.emptyText}>No wallets scanned yet</Text>
      <Text style={styles.emptySubtext}>
        Scan a QR code to add your first wallet address
      </Text>
    </View>
  );

  // Loading overlay when wallets are loading
  if (walletsLoading) {
    return (
      <FixedScreen>
        <View style={styles.container}>
          {headerContent}
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading wallets...</Text>
          </View>
          <QRScannerModal
            visible={state.scannerVisible}
            onClose={handleCloseScanner}
            onScanSuccess={handleScanSuccess}
            title="Scan Wallet QR Code"
          />
        </View>
      </FixedScreen>
    );
  }

  return (
    <FixedScreen>
      <View style={styles.container}>
        <FlatList
          data={scannedWallets}
          renderItem={renderWalletItem}
          keyExtractor={item => item.id}
          ListHeaderComponent={headerContent}
          ListEmptyComponent={emptyContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
          style={styles.flatList}
        />

        {/* QR Scanner Modal */}
        <QRScannerModal
          visible={state.scannerVisible}
          onClose={handleCloseScanner}
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
  },
  // Header section styles
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  // Scan Button
  scanButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 0, // Remove default padding since we'll use content padding
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  scanButtonDisabled: {
    backgroundColor: colors.inactive,
    opacity: 0.7,
    shadowOpacity: 0.1,
  },
  scanButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    minHeight: 80,
  },
  iconContainer: {
    position: 'relative',
    marginRight: 16,
  },
  iconBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.white,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  scanButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  scanButtonSubtext: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.85,
    fontWeight: '500',
  },
  processingIndicator: {
    marginRight: 16,
  },
  // FlatList styles
  flatList: {
    flex: 1,
  },
  flatListContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  // Loading/Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    marginBottom: 24,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.textTertiary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
  },
});
