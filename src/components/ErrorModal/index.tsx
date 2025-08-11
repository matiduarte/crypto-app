import React from 'react';
import { View, Text, Modal, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@constants/colors';

import { styles } from './styles';
import { CustomIcon } from '@components/CustomIcon';
import { Button } from '@components/Button';

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
