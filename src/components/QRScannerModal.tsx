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
import { Button } from './Button';
import { CustomIcon } from './CustomIcon';
import { ErrorModal } from './ErrorModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCAN_BOX_SIZE = Math.min(250, SCREEN_WIDTH - 80);

interface QRScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScanSuccess: (data: string) => void;
  title?: string;
}

/**
 * QRScannerModal provides camera-based QR code scanning functionality.
 * Handles camera permissions, device selection, and prevents duplicate scan triggers.
 * Shows appropriate error states for permission denied or unavailable camera.
 *
 * @param visible - Controls modal visibility
 * @param onClose - Callback when modal should be closed
 * @param onScanSuccess - Callback with scanned QR code data
 * @param title - Optional title for the scanner interface
 */
export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  visible,
  onClose,
  onScanSuccess,
  title = 'Scan QR Code',
}) => {
  const insets = useSafeAreaInsets();
  const devices = useCameraDevices();
  const device = devices.find(d => d.position === 'back');

  const [permission, setPermission] =
    useState<CameraPermissionStatus>('not-determined');
  const hasProcessed = useRef(false);

  useEffect(() => {
    async function requestPermission() {
      try {
        const currentPermission = Camera.getCameraPermissionStatus();

        if (currentPermission === 'not-determined') {
          const requestedPermission = await Camera.requestCameraPermission();
          setPermission(requestedPermission);
        } else {
          setPermission(currentPermission);
        }

        if (currentPermission === 'denied') {
          Alert.alert(
            'Camera Permission Required',
            'Please enable camera access to scan QR codes.',
            [{ text: 'OK', onPress: onClose }],
          );
        }
      } catch (error) {
        Alert.alert('Camera Error', 'Unable to access camera.', [
          { text: 'OK', onPress: onClose },
        ]);
      }
    }

    requestPermission();
  }, [onClose]);

  useEffect(() => {
    if (visible) {
      hasProcessed.current = false;
    }
  }, [visible]);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: codes => {
      // Prevent multiple calls
      if (!codes.length || hasProcessed.current) return;

      const code = codes[0];
      if (!code.value) return;

      // Mark as processed immediately to prevent duplicate calls
      hasProcessed.current = true;

      onClose();
      onScanSuccess(code.value);
    },
  });

  if (!visible) return null;

  // Permission denied
  if (permission === 'denied') {
    return (
      <ErrorModal
        onClose={onClose}
        title="Camera Access Required"
        message="Please enable camera access in settings to scan QR codes."
        iconName="camera"
        iconColor={colors.textSecondary}
      />
    );
  }

  // No camera device
  if (!device) {
    return (
      <ErrorModal
        onClose={onClose}
        title="Camera Not Available"
        message="Unable to access camera device."
        iconName="error"
        iconColor={colors.error}
      />
    );
  }

  // Main scanner
  return (
    <Modal visible animationType="slide" statusBarTranslucent>
      <StatusBar barStyle="light-content" backgroundColor="transparent" />
      <View style={styles.container}>
        {permission === 'granted' && (
          <Camera
            style={styles.camera}
            device={device}
            isActive={visible}
            codeScanner={codeScanner}
          />
        )}

        <View style={styles.overlay}>
          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
            <Text style={styles.title}>{title}</Text>
            <Button style={styles.closeButton} onPress={onClose}>
              <CustomIcon name="close" size={20} color={colors.white} />
            </Button>
          </View>

          {/* Scanning area */}
          <View style={styles.scanningArea}>
            <View style={styles.scanBox}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <Text style={styles.instructionText}>
              Position the QR code within the frame
            </Text>
          </View>

          {/* Cancel button */}
          <View
            style={[
              styles.bottomActions,
              { paddingBottom: insets.bottom + 20 },
            ]}
          >
            <Button style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: colors.whiteOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  instructionText: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.9,
    paddingHorizontal: 40,
  },
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
});
