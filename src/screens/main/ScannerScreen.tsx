import React, { useReducer, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import { FixedScreen } from '../../components/common/ScreenWrapper';
import { ActionButton, EmptyState, ScreenHeader, LoadingIndicator } from '../../components/common';
import { QRScannerModal, WalletItem } from '../../components/scanner';
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
      <ScreenHeader 
        title="QR Scanner"
        subtitle="Scan cryptocurrency wallet QR codes"
        icon="qr-code-scanner"
        style={styles.screenHeader}
      />

      {/* Scan Button */}
      <ActionButton
        title={state.isProcessing ? "Processing..." : "Scan QR Code"}
        subtitle={state.isProcessing ? state.processingMessage : "Tap to scan a wallet address"}
        icon="qr-code-scanner"
        onPress={handleOpenScanner}
        disabled={state.isProcessing}
        loading={state.isProcessing}
        loadingText="Processing..."
        showBadge={!state.isProcessing}
        style={styles.actionButton}
      />
    </View>
  );

  // Empty state content for FlatList
  const emptyContent = (
    <EmptyState
      icon="search"
      iconSize={64}
      title="No wallets scanned yet"
      subtitle="Scan a QR code to add your first wallet address"
    />
  );

  // Loading overlay when wallets are loading
  if (walletsLoading) {
    return (
      <FixedScreen>
        <View style={styles.container}>
          {headerContent}
          <LoadingIndicator 
            text="Loading wallets..."
            size="large"
            color={colors.primary}
            horizontal={false}
            style={styles.loadingContainer}
          />
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
  screenHeader: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    paddingHorizontal: 0,
    marginBottom: 30,
  },
  // Action Button
  actionButton: {
    marginBottom: 20,
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
});
