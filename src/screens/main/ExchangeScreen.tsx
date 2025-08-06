import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScrollableScreen } from '../../components/common/ScreenWrapper';

export const ExchangeScreen: React.FC = () => {
  return (
    <ScrollableScreen>
      <View style={styles.container}>
        <Text style={styles.title}>💱 Exchange</Text>
        <Text style={styles.subtitle}>
          Convert cryptocurrencies to fiat currencies
        </Text>
        
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            🚧 Coming Soon
          </Text>
          <Text style={styles.placeholderSubtext}>
            This screen will allow you to convert between 
            cryptocurrencies and fiat currencies with real-time rates.
          </Text>
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
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 40,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  placeholderText: {
    fontSize: 48,
    marginBottom: 20,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
  },
});