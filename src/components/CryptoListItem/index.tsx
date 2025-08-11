import React from 'react';
import { Image, Text, View } from 'react-native';
import { formatPercentage, formatPriceUSD } from '@utils/helpers';
import { Cryptocurrency } from '@types';
import { colors } from '@constants/colors';
import { styles } from './styles';

interface CryptoListItemProps {
  item: Cryptocurrency;
}

export const CryptoListItem: React.FC<CryptoListItemProps> = React.memo(
  ({ item }) => {
    const isPositive = item.price_change_percentage_24h >= 0;
    const changeColor = isPositive ? colors.success : colors.errorLight;

    return (
      <View style={styles.listItem} testID="list-item-container">
        <View style={styles.itemLeft}>
          <Image
            source={{ uri: item.image }}
            style={styles.cryptoImage}
            testID="crypto-image"
          />
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
