import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import { View, Text, Animated } from 'react-native';

import { useRealTimePrices } from '@hooks/useExchange';
import { useCryptocurrencies } from '@hooks/useCryptocurrencies';
import { FIAT_CURRENCIES } from '@constants/config';
import {
  formatPriceUSD,
  formatFiatCurrency,
  formatCryptoAmount,
  safeParseFloat,
  formatInputValue,
  extractNumericValue,
} from '@utils/helpers';
import { Cryptocurrency } from '@types';

import { colors } from '@constants/colors';
import { styles } from './styles';
import { SelectorModal, SelectorOption } from '@components/SelectorModal';
import { ScrollableScreen } from '@components/ScreenWrapper';
import { ScreenHeader } from '@components/ScreenHeader';
import { CurrencyInputSection } from '@components/CurrencyInputSection';
import { Button } from '@components/Button';
import { CustomIcon } from '@components/CustomIcon';
import { LoadingIndicator } from '@components/LoadingIndicator';

type ConversionDirection = 'crypto-to-fiat' | 'fiat-to-crypto';

export interface SelectedCurrency {
  id: string;
  name: string;
  symbol: string;
  image?: string;
}

/**
 * ExchangeScreen provides real-time cryptocurrency to fiat currency conversion.
 * Features live rates, bidirectional conversion, animated swap transitions,
 * and supports major cryptocurrencies with popular fiat currencies.
 */
export const ExchangeScreen: React.FC = () => {
  const [fromAmount, setFromAmount] = useState('1');
  const [toAmount, setToAmount] = useState('');
  const [direction, setDirection] =
    useState<ConversionDirection>('crypto-to-fiat');
  const [selectedCrypto, setSelectedCrypto] = useState<SelectedCurrency>({
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
  });
  const [selectedFiat, setSelectedFiat] = useState<
    (typeof FIAT_CURRENCIES)[number]
  >(FIAT_CURRENCIES[0]); // USD

  const rotationValue = useRef(new Animated.Value(0)).current;
  const [rotationCount, setRotationCount] = useState(0);
  const [showCryptoSelector, setShowCryptoSelector] = useState(false);
  const [showFiatSelector, setShowFiatSelector] = useState(false);

  const { data: cryptoData } = useCryptocurrencies({
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page: 8,
    sparkline: false,
  });

  const { data: priceData, isLoading: isPriceLoading } = useRealTimePrices(
    [selectedCrypto.id],
    selectedFiat.code.toLowerCase(),
    60000, // Update every minute
  );

  const currentRate = useMemo(() => {
    if (!priceData) return null;
    return priceData[selectedCrypto.id]?.[selectedFiat.code.toLowerCase()];
  }, [priceData, selectedCrypto.id, selectedFiat.code]);

  const calculateConversion = useCallback(() => {
    const inputAmount = safeParseFloat(fromAmount);
    if (!inputAmount || !currentRate) {
      setToAmount('');
      return;
    }

    let result: number;
    if (direction === 'crypto-to-fiat') {
      result = inputAmount * currentRate;
      const formattedResult = formatFiatCurrency(
        result,
        selectedFiat.code,
        selectedFiat.symbol,
      );
      setToAmount(formattedResult);
    } else {
      result = inputAmount / currentRate;
      const formattedResult = formatCryptoAmount(result, selectedCrypto.symbol);
      setToAmount(formattedResult);
    }
  }, [fromAmount, currentRate, direction, selectedFiat, selectedCrypto]);

  useEffect(() => {
    calculateConversion();
  }, [calculateConversion]);

  const toggleDirection = useCallback(() => {
    const nextRotationCount = rotationCount + 1;
    setRotationCount(nextRotationCount);

    Animated.timing(rotationValue, {
      toValue: nextRotationCount,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setDirection(prev =>
      prev === 'crypto-to-fiat' ? 'fiat-to-crypto' : 'crypto-to-fiat',
    );

    const temp = fromAmount;
    const extractedValue = extractNumericValue(toAmount || '0');
    const formattedValue = formatInputValue(extractedValue);
    setFromAmount(formattedValue);
    setToAmount(temp);
  }, [fromAmount, toAmount, rotationValue, rotationCount]);

  const handleCryptoSelect = useCallback((crypto: Cryptocurrency) => {
    setSelectedCrypto({
      id: crypto.id,
      name: crypto.name,
      symbol: crypto.symbol.toUpperCase(),
      image: crypto.image,
    });
    setShowCryptoSelector(false);
  }, []);

  const handleFiatSelect = useCallback((option: SelectorOption) => {
    const fiat = FIAT_CURRENCIES.find(f => f.code === option.symbol);
    if (fiat) {
      setSelectedFiat(fiat);
    }
    setShowFiatSelector(false);
  }, []);

  const cryptos = useMemo(() => {
    if (!cryptoData) return [];

    return cryptoData;
  }, [cryptoData]);

  const handleCryptoSelectFromModal = useCallback(
    (option: SelectorOption) => {
      const crypto = cryptos.find(c => c.id === option.id);
      if (crypto) {
        handleCryptoSelect(crypto);
      }
    },
    [cryptos, handleCryptoSelect],
  );

  const rotationInterpolate = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const animatedStyle = {
    transform: [{ rotate: rotationInterpolate }],
  };

  return (
    <ScrollableScreen>
      <View style={styles.container}>
        <ScreenHeader
          title="Currency Exchange"
          subtitle="Convert between cryptocurrencies and fiat currencies"
          icon="swap-horiz"
          style={styles.header}
        >
          {currentRate && (
            <View style={styles.rateContainer}>
              <Text style={styles.rateText}>
                1 {selectedCrypto.symbol} ={' '}
                {formatFiatCurrency(
                  currentRate,
                  selectedFiat.code,
                  selectedFiat.symbol,
                )}
              </Text>
              <View style={styles.rateIndicator}>
                <View style={styles.liveIndicator} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>
          )}
        </ScreenHeader>

        <View style={styles.conversionCard}>
          <CurrencyInputSection
            label="From"
            amount={fromAmount}
            onAmountChange={text => {
              const formatted = formatInputValue(text);
              setFromAmount(formatted);
            }}
            currency={
              direction === 'crypto-to-fiat' ? selectedCrypto : selectedFiat
            }
            onCurrencySelect={() => {
              if (direction === 'crypto-to-fiat') {
                setShowCryptoSelector(true);
              } else {
                setShowFiatSelector(true);
              }
            }}
          />

          <Animated.View style={animatedStyle}>
            <Button style={styles.swapButton} onPress={toggleDirection}>
              <CustomIcon
                name="swap-vert"
                size={24}
                color={colors.textPrimary}
              />
            </Button>
          </Animated.View>

          <CurrencyInputSection
            label="To"
            amount={toAmount}
            isReadOnly
            currency={
              direction === 'crypto-to-fiat' ? selectedFiat : selectedCrypto
            }
            onCurrencySelect={() => {
              if (direction === 'crypto-to-fiat') {
                setShowFiatSelector(true);
              } else {
                setShowCryptoSelector(true);
              }
            }}
          />

          {isPriceLoading && (
            <LoadingIndicator
              text="Updating rates..."
              style={styles.loadingContainer}
            />
          )}
        </View>

        <SelectorModal
          visible={showCryptoSelector}
          title="Select Cryptocurrency"
          data={cryptos.map(crypto => ({
            id: crypto.id,
            symbol: crypto.symbol.toUpperCase(),
            name: crypto.name,
          }))}
          onClose={() => setShowCryptoSelector(false)}
          onSelect={handleCryptoSelectFromModal}
          renderRightContent={option => {
            const crypto = cryptos.find(c => c.id === option.id);
            return crypto ? (
              <Text style={styles.currencyOptionPrice}>
                {formatPriceUSD(crypto.current_price)}
              </Text>
            ) : null;
          }}
        />

        <SelectorModal
          visible={showFiatSelector}
          title="Select Fiat Currency"
          data={FIAT_CURRENCIES.map(fiat => ({
            id: fiat.code,
            symbol: fiat.code,
            name: fiat.name,
          }))}
          onClose={() => setShowFiatSelector(false)}
          onSelect={handleFiatSelect}
          renderRightContent={option => {
            const fiat = FIAT_CURRENCIES.find(f => f.code === option.symbol);
            return fiat ? (
              <Text style={styles.fiatSymbol}>{fiat.symbol}</Text>
            ) : null;
          }}
        />
      </View>
    </ScrollableScreen>
  );
};
