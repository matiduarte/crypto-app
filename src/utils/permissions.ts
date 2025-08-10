import { Platform, PermissionsAndroid, Alert } from 'react-native';

// Camera permission utilities
export const requestCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs access to camera to scan QR codes for cryptocurrency wallet addresses.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      return false;
    }
  } else {
    // iOS permissions are handled automatically by the system
    // when camera is first accessed, using NSCameraUsageDescription
    return true;
  }
};

export const showCameraPermissionAlert = () => {
  Alert.alert(
    'Camera Permission Required',
    'This app needs camera access to scan QR codes for cryptocurrency wallet addresses. Please enable camera permission in your device settings.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: () => {
        if (Platform.OS === 'ios') {
          // On iOS, we can't directly open settings, but we can show instructions
          Alert.alert(
            'Enable Camera Access',
            'Go to Settings > CryptoApp > Camera and enable access.',
            [{ text: 'OK' }]
          );
        } else {
          // On Android, we could use a library like react-native-android-open-settings
          // For now, just show instructions
          Alert.alert(
            'Enable Camera Access',
            'Go to Settings > Apps > CryptoApp > Permissions > Camera and enable access.',
            [{ text: 'OK' }]
          );
        }
      }},
    ]
  );
};