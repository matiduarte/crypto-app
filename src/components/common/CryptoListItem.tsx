import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { formatPercentage, formatPriceUSD } from '../../utils/helpers';
import { Cryptocurrency } from '../../types';

interface CryptoListItemProps {
  item: Cryptocurrency;
}

export const CryptoListItem: React.FC<CryptoListItemProps> = React.memo(
  ({ item }) => {
    const isPositive = item.price_change_percentage_24h >= 0;
    const changeColor = isPositive ? '#4CAF50' : '#f44336';

    return (
      <View style={styles.listItem}>
        <View style={styles.itemLeft}>
          <Image source={{ uri: item.image }} style={styles.cryptoImage} />
          <View style={styles.cryptoInfo}>
            <Text style={styles.cryptoName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.cryptoSymbol} numberOfLines={1}>
              {item.symbol.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.itemRight}>
          <Text style={styles.cryptoPrice}>
            {formatPriceUSD(item.current_price)}
          </Text>
          <Text style={[styles.cryptoChange, { color: changeColor }]}>
            {formatPercentage(item.price_change_percentage_24h)}
          </Text>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    minHeight: 72,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cryptoImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  cryptoInfo: {
    flex: 1,
  },
  cryptoName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  cryptoSymbol: {
    fontSize: 13,
    color: '#6c757d',
    textTransform: 'uppercase',
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  cryptoPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  cryptoChange: {
    fontSize: 13,
    fontWeight: '500',
  },
});
