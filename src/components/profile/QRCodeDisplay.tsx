import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import QRCode from 'react-native-qrcode-svg';

interface QRCodeDisplayProps {
  address?: string;
  size?: number;
  backgroundColor?: string;
  color?: string;
  label?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  address = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
  size = 200,
  backgroundColor = '#ffffff',
  color = '#000000',
  label = 'Bitcoin Address',
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await Clipboard.setString(address);
      setCopied(true);
      Alert.alert('Copied!', 'Address copied to clipboard');
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy address');
    }
  };

  const shareQRCode = async () => {
    try {
      const shareOptions = {
        title: `${label}`,
        message: `Here's my ${label.toLowerCase()}:\n\n${address}\n\nScan the QR code or copy the address above.`,
        url: undefined,
      };

      await Share.share(shareOptions);
    } catch (error) {
      Alert.alert('Error', 'Failed to share QR code');
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <View style={[styles.qrContainer, { backgroundColor }]}>
        <QRCode
          value={address}
          size={size}
          color={color}
          backgroundColor={backgroundColor}
          logoBackgroundColor="transparent"
        />
      </View>
      
      <View style={styles.addressContainer}>
        <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
          {address}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={copyToClipboard}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonIcon}>📋</Text>
          <Text style={[styles.actionButtonText, copied && styles.copiedText]}>
            {copied ? 'Copied!' : 'Copy'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={shareQRCode}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonIcon}>📤</Text>
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  qrContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addressContainer: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    minWidth: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  addressText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#495057',
    maxWidth: '100%',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  copiedText: {
    color: '#28a745',
  },
});