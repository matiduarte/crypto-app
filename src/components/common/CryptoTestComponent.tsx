import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ScrollableScreen, FixedScreen } from './ScreenWrapper';
import { useCryptocurrencies } from '../../hooks';
import { formatPrice, formatPercentage } from '../../utils/helpers';

export const CryptoTestComponent: React.FC = () => {
  const { data, isLoading, error } = useCryptocurrencies({
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page: 5,
    page: 1,
  });

  if (isLoading) {
    return (
      <FixedScreen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading cryptocurrencies...</Text>
        </View>
      </FixedScreen>
    );
  }

  if (error) {
    return (
      <FixedScreen>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading data</Text>
          <Text style={styles.errorDetail}>{error.message}</Text>
        </View>
      </FixedScreen>
    );
  }

  if (!data?.success || !data.data) {
    return (
      <FixedScreen>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No data available</Text>
        </View>
      </FixedScreen>
    );
  }

  const changeColor = (change: number) => ({
    color: change >= 0 ? '#4CAF50' : '#f44336'
  });

  return (
    <ScrollableScreen contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Top 5 Cryptocurrencies</Text>
        <Text style={styles.subtitle}>Powered by React Query 🚀</Text>
      </View>
      
      {data.data.map((crypto) => (
        <View key={crypto.id} style={styles.cryptoItem}>
          <View style={styles.cryptoHeader}>
            <Text style={styles.cryptoName}>{crypto.name}</Text>
            <Text style={styles.cryptoSymbol}>{crypto.symbol.toUpperCase()}</Text>
          </View>
          
          <View style={styles.cryptoDetails}>
            <Text style={styles.price}>
              ${formatPrice(crypto.current_price)}
            </Text>
            <Text style={[styles.change, changeColor(crypto.price_change_percentage_24h)]}>
              {formatPercentage(crypto.price_change_percentage_24h)}
            </Text>
          </View>
        </View>
      ))}
      
      <Text style={styles.footer}>
        Data updates automatically every 2 minutes
      </Text>
    </ScrollableScreen>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 32, // Extra padding at bottom for better scrolling
  },
  header: {
    marginBottom: 24,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  cryptoItem: {
    backgroundColor: '#fff',
    padding: 18,
    marginVertical: 6,
    borderRadius: 16,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    // Android shadow
    elevation: 4,
  },
  cryptoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cryptoName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  cryptoSymbol: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cryptoDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  change: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 24,
    fontStyle: 'italic',
    paddingBottom: 8,
  },
});