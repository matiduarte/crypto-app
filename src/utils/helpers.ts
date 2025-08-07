import { format } from 'date-fns';

// Number formatting utilities
export const formatPrice = (price: number, decimals: number = 2): string => {
  if (price < 0.01) {
    return price.toFixed(6);
  } else if (price < 1) {
    return price.toFixed(4);
  }
  return price.toFixed(decimals);
};

export const formatPriceUSD = (price: number): string => {
  if (price < 0.01) {
    return `${price.toFixed(6)} USD`;
  } else if (price < 1) {
    return `${price.toFixed(4)} USD`;
  } else if (price >= 1000000) {
    return `${(price / 1000000).toFixed(2)}M USD`;
  } else if (price >= 1000) {
    return `${(price / 1000).toFixed(2)}K USD`;
  }
  return `${price.toFixed(2)} USD`;
};

// Enhanced fiat currency formatting with proper symbols and locale formatting
export const formatFiatCurrency = (
  amount: number, 
  _currencyCode: string, 
  currencySymbol: string
): string => {
  // Handle very small amounts
  if (amount < 0.01 && amount > 0) {
    return `${currencySymbol}${amount.toFixed(6)}`;
  }
  
  // Handle normal amounts with proper thousands separators
  const formatAmount = (value: number, decimals: number = 2): string => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  // Format based on amount size
  if (amount >= 1000000) {
    return `${currencySymbol}${formatAmount(amount / 1000000, 2)}M`;
  } else if (amount >= 1000) {
    return `${currencySymbol}${formatAmount(amount / 1000, 2)}K`;
  } else if (amount >= 1) {
    return `${currencySymbol}${formatAmount(amount, 2)}`;
  } else if (amount >= 0.01) {
    return `${currencySymbol}${formatAmount(amount, 2)}`;
  } else {
    return `${currencySymbol}${amount.toFixed(6)}`;
  }
};

// Format crypto amounts with proper precision
export const formatCryptoAmount = (amount: number, symbol: string): string => {
  if (amount < 0.00000001 && amount > 0) {
    return `${amount.toFixed(8)} ${symbol}`;
  } else if (amount < 0.01 && amount > 0) {
    return `${amount.toFixed(6)} ${symbol}`;
  } else if (amount < 1) {
    return `${amount.toFixed(4)} ${symbol}`;
  } else if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(2)}M ${symbol}`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(2)}K ${symbol}`;
  } else {
    return `${amount.toFixed(2)} ${symbol}`;
  }
};

export const formatPercentage = (percentage: number): string => {
  const sign = percentage >= 0 ? '+' : '';
  return `${sign}${percentage.toFixed(2)}%`;
};

export const formatMarketCap = (marketCap: number): string => {
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(2)}T`;
  } else if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`;
  } else if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`;
  } else if (marketCap >= 1e3) {
    return `$${(marketCap / 1e3).toFixed(2)}K`;
  }
  return `$${marketCap.toFixed(2)}`;
};

export const formatVolume = (volume: number): string => {
  return formatMarketCap(volume); // Same format as market cap
};

// Date formatting utilities
export const formatDate = (date: string | Date, formatString: string = 'PPp'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatString);
};

export const getTimeAgo = (date: string | Date): string => {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const diffInMs = now.getTime() - targetDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMs / 3600000);
  const diffInDays = Math.floor(diffInMs / 86400000);

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else {
    return `${diffInDays}d ago`;
  }
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidBitcoinAddress = (address: string): boolean => {
  // Basic Bitcoin address validation (P2PKH, P2SH, Bech32)
  const btcRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/;
  return btcRegex.test(address);
};

export const isValidEthereumAddress = (address: string): boolean => {
  // Basic Ethereum address validation
  const ethRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethRegex.test(address);
};

export const detectWalletType = (address: string): 'bitcoin' | 'ethereum' | 'unknown' => {
  if (isValidBitcoinAddress(address)) {
    return 'bitcoin';
  } else if (isValidEthereumAddress(address)) {
    return 'ethereum';
  }
  return 'unknown';
};

// Search and filter utilities
export const searchCryptos = <T extends { name: string; symbol: string }>(
  cryptos: T[],
  query: string
): T[] => {
  if (!query.trim()) {
    return cryptos;
  }

  const lowerQuery = query.toLowerCase().trim();
  return cryptos.filter(
    crypto =>
      crypto.name.toLowerCase().includes(lowerQuery) ||
      crypto.symbol.toLowerCase().includes(lowerQuery)
  );
};

export const sortCryptos = <T extends Record<string, any>>(
  cryptos: T[],
  field: keyof T,
  order: 'asc' | 'desc'
): T[] => {
  return [...cryptos].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return order === 'asc' ? comparison : -comparison;
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      const comparison = aValue - bValue;
      return order === 'asc' ? comparison : -comparison;
    }

    return 0;
  });
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T => {
  let timeout: NodeJS.Timeout;

  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
};

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Color utilities for price changes
export const getPriceChangeColor = (change: number): string => {
  if (change > 0) {
    return '#4CAF50'; // Green for positive
  } else if (change < 0) {
    return '#f44336'; // Red for negative
  }
  return '#757575'; // Gray for zero
};

// Conversion utilities
export const convertCurrency = (
  amount: number,
  rate: number,
  decimals: number = 6
): number => {
  return parseFloat((amount * rate).toFixed(decimals));
};

// Safe parsing utilities
export const safeParseFloat = (value: string | number): number => {
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

export const safeParseInt = (value: string | number): number => {
  if (typeof value === 'number') {
    return Math.floor(isNaN(value) ? 0 : value);
  }
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
};