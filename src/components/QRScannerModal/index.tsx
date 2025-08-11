import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Modal, Alert, StatusBar } from 'react-native';
import {
  Camera,
  useCameraDevices,
  useCodeScanner,
  CameraPermissionStatus,
} from 'react-native-vision-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@constants/colors';

import { styles } from './styles';
import { ErrorModal } from '@components/ErrorModal';
import { Button } from '@components/Button';
import { CustomIcon } from '@components/CustomIcon';

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
          <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
            <Text style={styles.title}>{title}</Text>
            <Button style={styles.closeButton} onPress={onClose}>
              <CustomIcon name="close" size={20} color={colors.white} />
            </Button>
          </View>

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
