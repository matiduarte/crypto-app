import React from 'react';
import { View } from 'react-native';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { styles } from './styles';

interface GoogleSignInButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onPress,
  isLoading = false,
}) => {
  return (
    <View style={styles.container}>
      <GoogleSigninButton
        style={styles.button}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={onPress}
        disabled={isLoading}
      />
    </View>
  );
};
