import {
  formatPriceUSD,
  formatFiatCurrency,
  formatCryptoAmount,
  formatPercentage,
  searchCryptos,
  sortCryptos,
  formatInputValue,
  extractNumericValue,
  safeParseFloat,
  safeParseInt,
  isValidBitcoinAddress,
  isValidEthereumAddress,
  detectWalletType,
} from '../helpers';

describe('Helper Utils', () => {
  describe('Price Formatting', () => {
    describe('formatPriceUSD', () => {
      it('formats small prices with 6 decimals', () => {
        expect(formatPriceUSD(0.005)).toBe('0.005000 USD');
        expect(formatPriceUSD(0.0001)).toBe('0.000100 USD');
      });

      it('formats prices under $1 with 4 decimals', () => {
        expect(formatPriceUSD(0.5)).toBe('0.5000 USD');
        expect(formatPriceUSD(0.1234)).toBe('0.1234 USD');
      });

      it('formats regular prices with 2 decimals', () => {
        expect(formatPriceUSD(1.5)).toBe('1.50 USD');
        expect(formatPriceUSD(100.25)).toBe('100.25 USD');
      });

      it('formats thousands with K suffix', () => {
        expect(formatPriceUSD(1500)).toBe('1.50K USD');
        expect(formatPriceUSD(12345)).toBe('12.35K USD');
      });

      it('formats millions with M suffix', () => {
        expect(formatPriceUSD(1500000)).toBe('1.50M USD');
        expect(formatPriceUSD(12345000)).toBe('12.35M USD');
      });
    });

    describe('formatFiatCurrency', () => {
      it('formats with currency symbols', () => {
        expect(formatFiatCurrency(100.50, 'USD', '$')).toBe('$100.5');
        expect(formatFiatCurrency(1000.75, 'EUR', '€')).toBe('€1,000.75');
      });

      it('handles zero amounts', () => {
        expect(formatFiatCurrency(0, 'USD', '$')).toBe('$0.00');
        expect(formatFiatCurrency(-10, 'USD', '$')).toBe('$0.00');
      });

      it('adds thousands separators', () => {
        expect(formatFiatCurrency(12345.67, 'USD', '$')).toBe('$12,345.67');
        expect(formatFiatCurrency(1234567.89, 'USD', '$')).toBe('$1,234,567.89');
      });
    });

    describe('formatCryptoAmount', () => {
      it('formats crypto amounts with symbol', () => {
        expect(formatCryptoAmount(1.5, 'BTC')).toBe('1.5 BTC');
        expect(formatCryptoAmount(0.1234, 'ETH')).toBe('0.1234 ETH');
      });

      it('handles zero amounts', () => {
        expect(formatCryptoAmount(0, 'BTC')).toBe('0 BTC');
        expect(formatCryptoAmount(-1, 'BTC')).toBe('0 BTC');
      });

      it('adds thousands separators', () => {
        expect(formatCryptoAmount(1234.5678, 'BTC')).toBe('1,234.5678 BTC');
      });

      it('limits decimal precision', () => {
        expect(formatCryptoAmount(1.123456789, 'BTC')).toBe('1.1235 BTC');
      });
    });

    describe('formatPercentage', () => {
      it('formats positive percentages with plus sign', () => {
        expect(formatPercentage(5.25)).toBe('+5.25%');
        expect(formatPercentage(0.1)).toBe('+0.10%');
      });

      it('formats negative percentages', () => {
        expect(formatPercentage(-3.75)).toBe('-3.75%');
        expect(formatPercentage(-10.5)).toBe('-10.50%');
      });

      it('formats zero percentage', () => {
        expect(formatPercentage(0)).toBe('+0.00%');
      });
    });
  });

  describe('Search and Sort', () => {
    const cryptos = [
      { id: '1', name: 'Bitcoin', symbol: 'BTC', market_cap_rank: 1, current_price: 50000 },
      { id: '2', name: 'Ethereum', symbol: 'ETH', market_cap_rank: 2, current_price: 3000 },
      { id: '3', name: 'Litecoin', symbol: 'LTC', market_cap_rank: 3, current_price: 150 },
    ];

    describe('searchCryptos', () => {
      it('searches by name', () => {
        const result = searchCryptos(cryptos, 'bitcoin');
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Bitcoin');
      });

      it('searches by symbol', () => {
        const result = searchCryptos(cryptos, 'eth');
        expect(result).toHaveLength(1);
        expect(result[0].symbol).toBe('ETH');
      });

      it('is case insensitive', () => {
        const result = searchCryptos(cryptos, 'BITCOIN');
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Bitcoin');
      });

      it('returns all items for empty query', () => {
        expect(searchCryptos(cryptos, '')).toEqual(cryptos);
        expect(searchCryptos(cryptos, '   ')).toEqual(cryptos);
      });

      it('returns empty array for no matches', () => {
        expect(searchCryptos(cryptos, 'nonexistent')).toEqual([]);
      });

      it('handles partial matches', () => {
        const result = searchCryptos(cryptos, 'lite');
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Litecoin');
      });
    });

    describe('sortCryptos', () => {
      it('sorts by string fields ascending', () => {
        const result = sortCryptos(cryptos, 'name', 'asc');
        expect(result.map(c => c.name)).toEqual(['Bitcoin', 'Ethereum', 'Litecoin']);
      });

      it('sorts by string fields descending', () => {
        const result = sortCryptos(cryptos, 'name', 'desc');
        expect(result.map(c => c.name)).toEqual(['Litecoin', 'Ethereum', 'Bitcoin']);
      });

      it('sorts by number fields ascending', () => {
        const result = sortCryptos(cryptos, 'current_price', 'asc');
        expect(result.map(c => c.current_price)).toEqual([150, 3000, 50000]);
      });

      it('sorts by number fields descending', () => {
        const result = sortCryptos(cryptos, 'current_price', 'desc');
        expect(result.map(c => c.current_price)).toEqual([50000, 3000, 150]);
      });

      it('does not mutate original array', () => {
        const original = [...cryptos];
        sortCryptos(cryptos, 'name', 'desc');
        expect(cryptos).toEqual(original);
      });
    });
  });

  describe('Input Processing', () => {
    describe('formatInputValue', () => {
      it('adds thousands separators', () => {
        expect(formatInputValue('1234')).toBe('1,234');
        expect(formatInputValue('1234567')).toBe('1,234,567');
      });

      it('preserves decimal points', () => {
        expect(formatInputValue('1234.56')).toBe('1,234.56');
        expect(formatInputValue('1234567.89')).toBe('1,234,567.89');
      });

      it('removes non-numeric characters except decimal', () => {
        expect(formatInputValue('12a34b.56c')).toBe('1,234.56');
        expect(formatInputValue('$1,234.56')).toBe('1,234.56');
      });

      it('handles multiple decimal points', () => {
        expect(formatInputValue('12.34.56')).toBe('12.3456');
      });

      it('handles empty input', () => {
        expect(formatInputValue('')).toBe('');
      });
    });

    describe('extractNumericValue', () => {
      it('extracts numbers from formatted strings', () => {
        expect(extractNumericValue('$1,234.56')).toBe('1234.56');
        expect(extractNumericValue('€1,000.00 EUR')).toBe('1000.00');
      });

      it('handles multiple decimal points', () => {
        expect(extractNumericValue('12.34.56')).toBe('12.3456');
      });

      it('returns "0" for invalid input', () => {
        expect(extractNumericValue('abc')).toBe('0');
        expect(extractNumericValue('')).toBe('0');
      });

      it('preserves valid decimal numbers', () => {
        expect(extractNumericValue('123.456')).toBe('123.456');
        expect(extractNumericValue('0.005')).toBe('0.005');
      });
    });
  });

  describe('Safe Parsing', () => {
    describe('safeParseFloat', () => {
      it('parses valid numbers', () => {
        expect(safeParseFloat('123.45')).toBe(123.45);
        expect(safeParseFloat(123.45)).toBe(123.45);
      });

      it('removes commas before parsing', () => {
        expect(safeParseFloat('1,234.56')).toBe(1234.56);
      });

      it('returns 0 for invalid input', () => {
        expect(safeParseFloat('abc')).toBe(0);
        expect(safeParseFloat('')).toBe(0);
        expect(safeParseFloat(NaN)).toBe(0);
      });
    });

    describe('safeParseInt', () => {
      it('parses valid integers', () => {
        expect(safeParseInt('123')).toBe(123);
        expect(safeParseInt(123.45)).toBe(123);
      });

      it('returns 0 for invalid input', () => {
        expect(safeParseInt('abc')).toBe(0);
        expect(safeParseInt('')).toBe(0);
        expect(safeParseInt(NaN)).toBe(0);
      });

      it('floors decimal numbers', () => {
        expect(safeParseInt(123.99)).toBe(123);
        expect(safeParseInt('123.99')).toBe(123);
      });
    });
  });

  describe('Address Validation', () => {
    describe('isValidBitcoinAddress', () => {
      it('validates Bitcoin P2PKH addresses', () => {
        expect(isValidBitcoinAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')).toBe(true);
      });

      it('validates Bitcoin P2SH addresses', () => {
        expect(isValidBitcoinAddress('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy')).toBe(true);
      });

      it('validates Bitcoin Bech32 addresses', () => {
        expect(isValidBitcoinAddress('bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq')).toBe(true);
      });

      it('rejects invalid addresses', () => {
        expect(isValidBitcoinAddress('invalid')).toBe(false);
        expect(isValidBitcoinAddress('')).toBe(false);
      });
    });

    describe('isValidEthereumAddress', () => {
      it('validates Ethereum addresses', () => {
        expect(isValidEthereumAddress('0x742d35Cc6634C0532925a3b8D4b5bF1f4e3a8b8f')).toBe(true);
        expect(isValidEthereumAddress('0x742d35cc6634c0532925a3b8d4b5bf1f4e3a8b8f')).toBe(true);
      });

      it('rejects invalid addresses', () => {
        expect(isValidEthereumAddress('0xinvalid')).toBe(false);
        expect(isValidEthereumAddress('invalid')).toBe(false);
        expect(isValidEthereumAddress('')).toBe(false);
      });
    });

    describe('detectWalletType', () => {
      it('detects Bitcoin addresses', () => {
        expect(detectWalletType('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')).toBe('bitcoin');
        expect(detectWalletType('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy')).toBe('bitcoin');
        expect(detectWalletType('bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq')).toBe('bitcoin');
      });

      it('detects Ethereum addresses', () => {
        expect(detectWalletType('0x742d35Cc6634C0532925a3b8D4b5bF1f4e3a8b8f')).toBe('ethereum');
      });

      it('returns unknown for invalid addresses', () => {
        expect(detectWalletType('invalid')).toBe('unknown');
        expect(detectWalletType('')).toBe('unknown');
      });
    });
  });
});