import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { QRScannerModal } from '@components/QRScannerModal';

// Mock react-native-vision-camera
jest.mock('react-native-vision-camera', () => {
  const CameraComponent = ({ children, style, ...props }: any) => {
    const { View } = require('react-native');
    return (
      <View testID="camera" style={style} {...props}>
        {children}
      </View>
    );
  };

  Object.assign(CameraComponent, {
    getCameraPermissionStatus: jest.fn().mockReturnValue('granted'),
    requestCameraPermission: jest.fn().mockResolvedValue('granted'),
  });

  return {
    Camera: CameraComponent,
    useCameraDevices: jest.fn(() => [
      { position: 'back', id: 'back-camera' },
      { position: 'front', id: 'front-camera' },
    ]),
    useCodeScanner: jest.fn(() => ({
      codeTypes: ['qr', 'ean-13'],
      onCodeScanned: jest.fn(),
    })),
  };
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

describe('QRScannerModal', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    onScanSuccess: jest.fn(),
    title: 'Scan QR Code',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render scanner interface when visible and permission granted', () => {
    const { getByText, getByTestId } = render(
      <QRScannerModal {...defaultProps} />,
    );

    // Check title is displayed
    expect(getByText('Scan QR Code')).toBeTruthy();

    // Check camera component is rendered
    expect(getByTestId('camera')).toBeTruthy();

    // Check instruction text
    expect(getByText('Position the QR code within the frame')).toBeTruthy();

    // Check cancel button
    expect(getByText('Cancel')).toBeTruthy();

    // Check close icon
    expect(getByTestId('icon-close')).toBeTruthy();
  });

  it('should handle modal close actions correctly', () => {
    const mockOnClose = jest.fn();

    const { getByTestId, getByText } = render(
      <QRScannerModal {...defaultProps} onClose={mockOnClose} />,
    );

    // Test close button press
    const closeButton = getByTestId('icon-close').parent;
    if (closeButton) {
      fireEvent.press(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }

    // Test cancel button press
    const cancelButton = getByText('Cancel').parent;
    if (cancelButton) {
      fireEvent.press(cancelButton);
      expect(mockOnClose).toHaveBeenCalledTimes(2);
    }
  });

  it('should not render when modal is not visible', () => {
    const { queryByText } = render(
      <QRScannerModal {...defaultProps} visible={false} />,
    );

    // Modal should not render when visible is false
    expect(queryByText('Scan QR Code')).toBeFalsy();
    expect(queryByText('Position the QR code within the frame')).toBeFalsy();
    expect(queryByText('Cancel')).toBeFalsy();
  });
});
