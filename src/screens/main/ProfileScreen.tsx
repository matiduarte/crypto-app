import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { ScrollableScreen } from '../../components/common/ScreenWrapper';
import { QRCodeDisplay } from '../../components/profile';

export const ProfileScreen: React.FC = () => {
  const { user, signOut, isLoading, refreshTokens } = useAuth();

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

  const handleRefreshTokens = async () => {
    const result = await refreshTokens();
    Alert.alert(
      result.success ? 'Success' : 'Error',
      result.success
        ? 'Tokens refreshed successfully!'
        : result.error || 'Failed to refresh tokens',
    );
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

        {/* QR Code Section */}
        <View style={styles.qrSection}>
          <QRCodeDisplay
            address="bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4"
            size={180}
            label="Your Bitcoin Address"
          />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.refreshButton]}
            onPress={handleRefreshTokens}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? '🔄 Refreshing...' : '🔄 Refresh Tokens'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.signOutButton]}
            onPress={handleSignOut}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? '🚪 Signing Out...' : '🚪 Sign Out'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollableScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 30,
    textAlign: 'center',
  },
  userSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
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
    color: '#1a1a1a',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6c757d',
  },
  qrSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  refreshButton: {
    backgroundColor: '#28a745',
  },
  signOutButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
