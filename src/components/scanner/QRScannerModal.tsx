import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useCodeScanner,
  CameraPermissionStatus,
} from 'react-native-vision-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Screen dimensions removed as they're not used in this component

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
  const [cameraPermission, setCameraPermission] = useState<CameraPermissionStatus>('not-determined');
  const [scanned, setScanned] = useState(false);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Request camera permission
  useEffect(() => {
    const requestCameraPermission = async () => {
      const permission = await Camera.requestCameraPermission();
      setCameraPermission(permission);
      
      if (permission === 'denied') {
        Alert.alert(
          'Camera Permission',
          'Camera access is required to scan QR codes.',
          [{ text: 'OK', onPress: onClose }]
        );
      }
    };

    if (visible) {
      requestCameraPermission();
      setScanned(false);
    }
  }, [visible, onClose]);

  // Reset scanned state when modal closes
  useEffect(() => {
    if (!visible) {
      setScanned(false);
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    }
  }, [visible]);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: (codes) => {
      if (scanned || codes.length === 0) return;

      const code = codes[0];
      if (code.value) {
        setScanned(true);
        
        // Add a small delay to show the scan feedback
        scanTimeoutRef.current = setTimeout(() => {
          onScanSuccess(code.value!);
          onClose();
        }, 500);
      }
    },
  });

  if (!visible) {
    return null;
  }

  if (cameraPermission !== 'granted') {
    return (
      <Modal visible={visible} animationType="slide" statusBarTranslucent>
        <View style={styles.permissionContainer}>
          <StatusBar barStyle="light-content" backgroundColor="transparent" />
          <View style={[styles.permissionContent, { paddingTop: insets.top + 20 }]}>
            <Text style={styles.permissionTitle}>Camera Permission Required</Text>
            <Text style={styles.permissionText}>
              We need camera access to scan QR codes for cryptocurrency wallet addresses.
            </Text>
            <TouchableOpacity style={styles.permissionButton} onPress={onClose}>
              <Text style={styles.permissionButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  if (!device) {
    return (
      <Modal visible={visible} animationType="slide" statusBarTranslucent>
        <View style={styles.errorContainer}>
          <StatusBar barStyle="light-content" backgroundColor="transparent" />
          <View style={[styles.errorContent, { paddingTop: insets.top + 20 }]}>
            <Text style={styles.errorTitle}>Camera Not Available</Text>
            <Text style={styles.errorText}>
              Unable to access the camera. Please check your device settings.
            </Text>
            <TouchableOpacity style={styles.errorButton} onPress={onClose}>
              <Text style={styles.errorButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <StatusBar barStyle="light-content" backgroundColor="transparent" />
      <View style={styles.container}>
        {/* Camera View */}
        <Camera
          style={styles.camera}
          device={device}
          isActive={visible && !scanned}
          codeScanner={codeScanner}
        />

        {/* Overlay */}
        <View style={styles.overlay}>
          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top }]}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Scan Area */}
          <View style={styles.scanArea}>
            <View style={styles.scanBox}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              {scanned && (
                <View style={styles.scanSuccessOverlay}>
                  <Text style={styles.scanSuccessText}>✓</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.instructionText}>
              Position the QR code within the frame
            </Text>
          </View>

          {/* Bottom Section */}
          <View style={styles.bottom}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const SCAN_BOX_SIZE = 250;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    color: '#ffffff',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '300',
  },
  scanArea: {
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
    borderColor: '#ffffff',
    borderWidth: 3,
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
  scanSuccessOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(40, 167, 69, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  scanSuccessText: {
    fontSize: 48,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  instructionText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.8,
  },
  bottom: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
  // Permission/Error states
  permissionContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  permissionText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 24,
    marginBottom: 40,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 24,
    marginBottom: 40,
  },
  errorButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  errorButtonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
});