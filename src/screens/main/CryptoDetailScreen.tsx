import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { CryptoStackParamList } from '../../types';
import { ScrollableScreen } from '../../components/common/ScreenWrapper';

type CryptoDetailScreenRouteProp = RouteProp<CryptoStackParamList, 'CryptoDetail'>;

interface Props {
  route: CryptoDetailScreenRouteProp;
}

export const CryptoDetailScreen: React.FC<Props> = ({ route }) => {
  const { cryptoId, symbol } = route.params;

  return (
    <ScrollableScreen>
      <View style={styles.container}>
        <Text style={styles.title}>
          {symbol.toUpperCase()} Details
        </Text>
        
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            🚧 Coming Soon
          </Text>
          <Text style={styles.placeholderSubtext}>
            Detailed information for {cryptoId} will be displayed here, 
            including price charts, market data, and statistics.
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
    marginBottom: 20,
    textAlign: 'center',
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