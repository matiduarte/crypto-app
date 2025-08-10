import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useCodeScanner,
  CameraPermissionStatus,
} from 'react-native-vision-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@constants/colors';
import { Button, CustomIcon } from '@components/common';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCAN_BOX_SIZE = Math.min(250, SCREEN_WIDTH - 80);

interface QRScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScanSuccess: (data: string) => void;
  title?: string;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  visible,
  onClose,
  onScanSuccess,
  title = 'Scan QR Code',
}) => {
  const insets = useSafeAreaInsets();
  const devices = useCameraDevices();
  const device = devices.find(d => d.position === 'back');

  // States
  const [permission, setPermission] =
    useState<CameraPermissionStatus>('not-determined');
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  // Refs
  const hasProcessedScan = useRef(false);
  const processingTimeout = useRef<NodeJS.Timeout | null>(null);

  // Initialize camera permission when modal opens
  useEffect(() => {
    if (!visible) return;

    let isMounted = true;

    const initializeCamera = async () => {
      try {
        // Reset states when modal opens
        setHasScanned(false);
        setIsScanning(true);
        hasProcessedScan.current = false;

        // Clear any existing timeout
        if (processingTimeout.current) {
          clearTimeout(processingTimeout.current);
          processingTimeout.current = null;
        }

        // Check current permission
        const currentPermission = Camera.getCameraPermissionStatus();

        if (currentPermission === 'not-determined') {
          const requestedPermission = await Camera.requestCameraPermission();
          if (isMounted) {
            setPermission(requestedPermission);
          }
        } else {
          if (isMounted) {
            setPermission(currentPermission);
          }
        }

        if (currentPermission === 'denied') {
          Alert.alert(
            'Camera Permission Required',
            'Please enable camera access in your device settings to scan QR codes.',
            [
              { text: 'Cancel', onPress: onClose },
              {
                text: 'Settings',
                onPress: () => {
                  // In a real app, you'd open settings here
                  onClose();
                },
              },
            ],
          );
        }
      } catch (error) {
        if (isMounted) {
          Alert.alert(
            'Camera Error',
            'Unable to initialize camera. Please try again.',
            [{ text: 'OK', onPress: onClose }],
          );
        }
      }
    };

    initializeCamera();

    return () => {
      isMounted = false;
    };
  }, [visible, onClose]);

  // Cleanup when modal closes
  useEffect(() => {
    if (!visible) {
      setIsScanning(false);
      setHasScanned(false);
      hasProcessedScan.current = false;

      if (processingTimeout.current) {
        clearTimeout(processingTimeout.current);
        processingTimeout.current = null;
      }
    }
  }, [visible]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (processingTimeout.current) {
        clearTimeout(processingTimeout.current);
      }
    };
  }, []);

  // Code scanner configuration
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: codes => {
      // Prevent multiple scans
      if (
        !isScanning ||
        hasScanned ||
        hasProcessedScan.current ||
        codes.length === 0
      ) {
        return;
      }

      const code = codes[0];
      if (!code.value) return;

      // Mark as processed immediately to prevent duplicates
      hasProcessedScan.current = true;
      setHasScanned(true);
      setIsScanning(false);

      // Process the scan result
      processingTimeout.current = setTimeout(() => {
        onScanSuccess(code.value!);
      }, 100);
    },
  });

  // Handle manual close
  const handleClose = () => {
    setIsScanning(false);
    setHasScanned(false);
    onClose();
  };

  // Don't render if not visible
  if (!visible) {
    return null;
  }

  // Permission denied state
  if (permission === 'denied') {
    return (
      <Modal visible={true} animationType="slide" statusBarTranslucent>
        <StatusBar barStyle="light-content" backgroundColor="transparent" />
        <View style={styles.errorContainer}>
          <View style={[styles.errorContent, { paddingTop: insets.top + 40 }]}>
            <View style={styles.errorIcon}>
              <CustomIcon
                name="camera"
                size={48}
                color={colors.textSecondary}
              />
            </View>
            <Text style={styles.errorTitle}>Camera Access Required</Text>
            <Text style={styles.errorText}>
              We need camera permission to scan QR codes. Please enable camera
              access in your device settings.
            </Text>
            <Button style={styles.errorButton} onPress={handleClose}>
              <Text style={styles.errorButtonText}>Close</Text>
            </Button>
          </View>
        </View>
      </Modal>
    );
  }

  // No camera device available
  if (!device) {
    return (
      <Modal visible={true} animationType="slide" statusBarTranslucent>
        <StatusBar barStyle="light-content" backgroundColor="transparent" />
        <View style={styles.errorContainer}>
          <View style={[styles.errorContent, { paddingTop: insets.top + 40 }]}>
            <View style={styles.errorIcon}>
              <CustomIcon name="error" size={48} color={colors.error} />
            </View>
            <Text style={styles.errorTitle}>Camera Not Available</Text>
            <Text style={styles.errorText}>
              Unable to access the camera. Please check your device settings.
            </Text>
            <Button style={styles.errorButton} onPress={handleClose}>
              <Text style={styles.errorButtonText}>Close</Text>
            </Button>
          </View>
        </View>
      </Modal>
    );
  }

  // Main scanner interface
  return (
    <Modal visible={true} animationType="slide" statusBarTranslucent>
      <StatusBar barStyle="light-content" backgroundColor="transparent" />
      <View style={styles.container}>
        {/* Camera */}
        {permission === 'granted' && (
          <Camera
            style={styles.camera}
            device={device}
            isActive={isScanning && !hasScanned}
            codeScanner={codeScanner}
          />
        )}

        {/* Overlay */}
        <View style={styles.overlay}>
          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
            <Text style={styles.title}>{title}</Text>
            <Button style={styles.closeButton} onPress={handleClose}>
              <CustomIcon name="close" size={20} color={colors.white} />
            </Button>
          </View>

          {/* Scanning Area */}
          <View style={styles.scanningArea}>
            <View style={styles.scanBox}>
              {/* Corner indicators */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />

              {/* Success indicator */}
              {hasScanned && (
                <View style={styles.successOverlay}>
                  <Text style={styles.successIcon}>✓</Text>
                  <Text style={styles.successText}>Scanned!</Text>
                </View>
              )}
            </View>

            <Text style={styles.instructionText}>
              {hasScanned
                ? 'Processing scan...'
                : 'Position the QR code within the frame'}
            </Text>
          </View>

          {/* Bottom Actions */}
          <View
            style={[
              styles.bottomActions,
              { paddingBottom: insets.bottom + 20 },
            ]}
          >
            <Button
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={hasScanned}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlayTransparent,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.white,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Scanning area
  scanningArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanBox: {
    width: SCAN_BOX_SIZE,
    height: SCAN_BOX_SIZE,
    position: 'relative',
    marginBottom: 40,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: colors.white,
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.successOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  successIcon: {
    fontSize: 40,
    color: colors.white,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
  },
  instructionText: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.9,
    paddingHorizontal: 40,
  },

  // Bottom actions
  bottomActions: {
    paddingHorizontal: 20,
  },
  cancelButton: {
    backgroundColor: colors.whiteOverlay,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 18,
    color: colors.white,
    fontWeight: '600',
  },

  // Error states
  errorContainer: {
    flex: 1,
    backgroundColor: colors.black,
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorIcon: {
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
    marginBottom: 40,
  },
  errorButton: {
    backgroundColor: colors.error,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 120,
  },
  errorButtonText: {
    fontSize: 18,
    color: colors.white,
    fontWeight: '600',
    textAlign: 'center',
  },
});
