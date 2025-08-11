import React from 'react';
import { View, Text, StyleSheet, Modal, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@constants/colors';
import { CustomIcon } from './CustomIcon';
import { Button } from './Button';

interface ErrorModalProps {
  onClose: () => void;
  title: string;
  message: string;
  iconName: string;
  iconColor?: string;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  onClose,
  title,
  message,
  iconName,
  iconColor = colors.error,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible animationType="slide" statusBarTranslucent>
      <StatusBar barStyle="light-content" backgroundColor="transparent" />
      <View style={styles.errorContainer}>
        <View style={[styles.errorContent, { paddingTop: insets.top + 40 }]}>
          <CustomIcon name={iconName} size={48} color={iconColor} />
          <Text style={styles.errorTitle}>{title}</Text>
          <Text style={styles.errorText}>{message}</Text>
          <Button style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginTop: 24,
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
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 120,
  },
  buttonText: {
    fontSize: 18,
    color: colors.white,
    fontWeight: '600',
    textAlign: 'center',
  },
});
