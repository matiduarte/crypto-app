import React from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { ScrollableScreen } from '../../components/common/ScreenWrapper';
import { Button } from '../../components/common';
import { CustomIcon } from '../../components/common/CustomIcon';
import { colors } from '../../constants/colors';

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 30,
    textAlign: 'center',
  },
  userSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  qrSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actions: {
    marginBottom: 20,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  refreshButton: {
    backgroundColor: colors.success,
  },
  signOutButton: {
    backgroundColor: colors.error,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
