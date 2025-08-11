import React from 'react';
import { View, Text, Image, Alert } from 'react-native';
import { useAuth } from '@hooks/useAuth';

import { colors } from '@constants/colors';
import { styles } from './styles';
import { ScrollableScreen } from '@components/ScreenWrapper';
import { Button } from '@components/Button';
import { CustomIcon } from '@components/CustomIcon';

export const ProfileScreen: React.FC = () => {
  const { user, signOut, isLoading } = useAuth();

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          const result = await signOut();
          if (!result.success) {
            Alert.alert('Error', result.error || 'Failed to sign out');
          }
        },
      },
    ]);
  };

  return (
    <ScrollableScreen>
      <View style={styles.container}>
        {user && (
          <View style={styles.userSection}>
            {user.photo && (
              <Image source={{ uri: user.photo }} style={styles.userPhoto} />
            )}

            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name || 'Unknown User'}</Text>
              <Text style={styles.userEmail}>{user.email || 'No email'}</Text>
            </View>
          </View>
        )}

        <View style={styles.actions}>
          <Button
            style={[styles.button, styles.signOutButton]}
            onPress={handleSignOut}
            disabled={isLoading}
          >
            <View style={styles.buttonContent}>
              <CustomIcon name="logout" size={20} color={colors.white} />
              <Text style={styles.buttonText}>
                {isLoading ? 'Signing Out...' : 'Sign Out'}
              </Text>
            </View>
          </Button>
        </View>
      </View>
    </ScrollableScreen>
  );
};
