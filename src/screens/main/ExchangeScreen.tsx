import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { CustomIcon } from '../../components/common/CustomIcon';
import { ScrollableScreen } from '../../components/common/ScreenWrapper';
import {
  SelectorModal,
  SelectorOption,
} from '../../components/common/SelectorModal';
import {
  useCurrencyConversion,
  useRealTimePrices,
} from '../../hooks/useExchange';
import { useCryptocurrencies } from '../../hooks/useCryptocurrencies';
import { FIAT_CURRENCIES } from '../../constants/config';
import {
  formatPriceUSD,
  formatFiatCurrency,
  formatCryptoAmount,
  safeParseFloat,
  formatInputValue,
  extractNumericValue,
} from '../../utils/helpers';
import { Cryptocurrency } from '../../types';
import { Button } from '../../components/common';

type ConversionDirection = 'crypto-to-fiat' | 'fiat-to-crypto';

interface SelectedCurrency {
  id: string;
  name: string;
  symbol: string;
  image?: string;
}

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
  const [showCryptoSelector, setShowCryptoSelector] = useState(false);
  const [showFiatSelector, setShowFiatSelector] = useState(false);

  // Get cryptocurrency data for selection
  const { data: cryptoData } = useCryptocurrencies({
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page: 8,
    sparkline: false,
  });

  // Get real-time price for selected crypto
  const { data: priceData, isLoading: isPriceLoading } = useRealTimePrices(
    [selectedCrypto.id],
    selectedFiat.code.toLowerCase(),
    60000, // Update every minute
  );

  // Get conversion hook
  const { isLoading: isConverting } = useCurrencyConversion();

  // Calculate current rate and converted amount
  const currentRate = useMemo(() => {
    if (!priceData?.success || !priceData.data) return null;
    return priceData.data[selectedCrypto.id]?.[selectedFiat.code.toLowerCase()];
  }, [priceData, selectedCrypto.id, selectedFiat.code]);

  // Auto-calculate conversion when inputs change
  const calculateConversion = useCallback(() => {
    const inputAmount = safeParseFloat(fromAmount);
    if (!inputAmount || !currentRate) {
      setToAmount('');
      return;
    }

    let result: number;
    if (direction === 'crypto-to-fiat') {
      result = inputAmount * currentRate;
      // Format as fiat currency with proper symbol
      const formattedResult = formatFiatCurrency(
        result,
        selectedFiat.code,
        selectedFiat.symbol,
      );
      setToAmount(formattedResult);
    } else {
      result = inputAmount / currentRate;
      // Format as crypto amount with proper precision
      const formattedResult = formatCryptoAmount(result, selectedCrypto.symbol);
      setToAmount(formattedResult);
    }
  }, [fromAmount, currentRate, direction, selectedFiat, selectedCrypto]);

  // Recalculate when dependencies change
  useEffect(() => {
    calculateConversion();
  }, [calculateConversion]);

  // Handle conversion direction toggle
  const toggleDirection = useCallback(() => {
    setDirection(prev =>
      prev === 'crypto-to-fiat' ? 'fiat-to-crypto' : 'crypto-to-fiat',
    );

    // Swap amounts with proper extraction and formatting
    const temp = fromAmount;
    const extractedValue = extractNumericValue(toAmount || '0');
    const formattedValue = formatInputValue(extractedValue);
    setFromAmount(formattedValue);
    setToAmount(temp);
  }, [fromAmount, toAmount]);

  // Handle crypto selection
  const handleCryptoSelect = useCallback((crypto: Cryptocurrency) => {
    setSelectedCrypto({
      id: crypto.id,
      name: crypto.name,
      symbol: crypto.symbol.toUpperCase(),
      image: crypto.image,
    });
    setShowCryptoSelector(false);
  }, []);

  // Handle fiat selection
  const handleFiatSelect = useCallback((option: SelectorOption) => {
    const fiat = FIAT_CURRENCIES.find(f => f.code === option.symbol);
    if (fiat) {
      setSelectedFiat(fiat);
    }
    setShowFiatSelector(false);
  }, []);

  // Filter cryptos based on search
  const cryptos = useMemo(() => {
    if (!cryptoData?.success || !cryptoData.data) return [];

    return cryptoData.data;
  }, [cryptoData]);

  // Handle crypto selection from modal
  const handleCryptoSelectFromModal = useCallback(
    (option: SelectorOption) => {
      const crypto = cryptos.find(c => c.id === option.id);
      if (crypto) {
        handleCryptoSelect(crypto);
      }
    },
    [cryptos, handleCryptoSelect],
  );

  return (
    <ScrollableScreen>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <CustomIcon name="swap-horiz" size={24} color="#4285F4" />
            <Text style={styles.title}>Currency Exchange</Text>
          </View>
          <Text style={styles.subtitle}>
            Convert between cryptocurrencies and fiat currencies
          </Text>
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
                <Text style={styles.liveText}>🔴 LIVE</Text>
              </View>
            </View>
          )}
        </View>

        {/* Conversion Card */}
        <View style={styles.conversionCard}>
          {/* From Section */}
          <View style={styles.currencySection}>
            <Text style={styles.sectionLabel}>From</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.amountInput}
                value={fromAmount}
                onChangeText={text => {
                  const formatted = formatInputValue(text);
                  setFromAmount(formatted);
                }}
                placeholder="0.00"
                keyboardType="numeric"
                placeholderTextColor="#9e9e9e"
              />
              <Button
                style={styles.currencySelector}
                onPress={() => {
                  if (direction === 'crypto-to-fiat') {
                    setShowCryptoSelector(true);
                  } else {
                    setShowFiatSelector(true);
                  }
                }}
              >
                <View style={styles.currencySelectorContent}>
                  <Text style={styles.currencySymbol}>
                    {direction === 'crypto-to-fiat'
                      ? selectedCrypto.symbol
                      : selectedFiat.code}
                  </Text>
                  <Text style={styles.currencyName}>
                    {direction === 'crypto-to-fiat'
                      ? selectedCrypto.name
                      : selectedFiat.name}
                  </Text>
                </View>
                <CustomIcon
                  name="keyboard-arrow-down"
                  size={16}
                  color="#6c757d"
                />
              </Button>
            </View>
          </View>

          {/* Swap Button */}
          <Button style={styles.swapButton} onPress={toggleDirection}>
            <CustomIcon name="swap-vert" size={24} color="#1a1a1a" />
          </Button>

          {/* To Section */}
          <View style={styles.currencySection}>
            <Text style={styles.sectionLabel}>To</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.amountInput, styles.readOnlyInput]}
                value={toAmount}
                placeholder="0.00"
                editable={false}
                placeholderTextColor="#9e9e9e"
              />
              <Button
                style={styles.currencySelector}
                onPress={() => {
                  if (direction === 'crypto-to-fiat') {
                    setShowFiatSelector(true);
                  } else {
                    setShowCryptoSelector(true);
                  }
                }}
              >
                <View style={styles.currencySelectorContent}>
                  <Text style={styles.currencySymbol}>
                    {direction === 'crypto-to-fiat'
                      ? selectedFiat.code
                      : selectedCrypto.symbol}
                  </Text>
                  <Text style={styles.currencyName}>
                    {direction === 'crypto-to-fiat'
                      ? selectedFiat.name
                      : selectedCrypto.name}
                  </Text>
                </View>
                <CustomIcon
                  name="keyboard-arrow-down"
                  size={16}
                  color="#6c757d"
                />
              </Button>
            </View>
          </View>

          {/* Loading Indicator */}
          {(isPriceLoading || isConverting) && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#FFD700" />
              <Text style={styles.loadingText}>Updating rates...</Text>
            </View>
          )}
        </View>

        {/* Crypto Selector Modal */}
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

        {/* Fiat Selector Modal */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  // Header Styles
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 16,
  },
  rateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  rateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginRight: 8,
  },
  rateIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ff4444',
  },
  // Conversion Card Styles
  conversionCard: {
    backgroundColor: '#ffffff',
    marginVertical: 20,
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  currencySection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  amountInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  readOnlyInput: {
    color: '#6c757d',
    backgroundColor: 'transparent',
  },
  currencySelector: {
    paddingHorizontal: 6,
    paddingVertical: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#e9ecef',
    minWidth: 110,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  currencySelectorContent: {
    alignItems: 'center',
    marginRight: 8,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  currencyName: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
    textAlign: 'center',
  },
  // Swap Button
  swapButton: {
    alignSelf: 'center',
    backgroundColor: '#FFD700',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  // Loading Styles
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6c757d',
  },
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  copyButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  shareButton: {
    backgroundColor: '#4285F4',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  // Custom styles for modal content
  currencyOptionPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  fiatSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6c757d',
  },
});
