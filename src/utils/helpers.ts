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
  currencySymbol: string,
): string => {
  // Format with proper thousands separators while preserving full precision
  const formatWithSeparators = (value: number): string => {
    // Convert to string to preserve all decimal places
    const numStr = value.toString();
    const [integerPart, decimalPart] = numStr.split('.');

    // Add thousands separators to integer part
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Combine with decimal part if it exists
    return decimalPart
      ? `${formattedInteger}.${decimalPart}`
      : formattedInteger;
  };

  // Handle zero or negative amounts
  if (amount <= 0) {
    return `${currencySymbol}0.00`;
  }

  // Format the amount with proper separators, preserving full precision
  const formattedAmount = formatWithSeparators(amount);
  return `${currencySymbol}${formattedAmount}`;
};

// Format crypto amounts with proper precision (max 12 decimals)
export const formatCryptoAmount = (amount: number, symbol: string): string => {
  // Format with proper thousands separators while limiting to max 12 decimals
  const formatWithSeparators = (value: number): string => {
    // Limit to 12 decimal places to prevent excessive precision
    const limitedValue = parseFloat(value.toFixed(4));

    // Convert to string to preserve decimal places
    const numStr = limitedValue.toString();
    const [integerPart, decimalPart] = numStr.split('.');

    // Add thousands separators to integer part
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Combine with decimal part if it exists
    return decimalPart
      ? `${formattedInteger}.${decimalPart}`
      : formattedInteger;
  };

  // Handle zero or negative amounts
  if (amount <= 0) {
    return `0 ${symbol}`;
  }

  // Format the amount with proper separators, limiting to 12 decimals
  const formattedAmount = formatWithSeparators(amount);
  return `${formattedAmount} ${symbol}`;
};

export const formatPercentage = (percentage: number): string => {
  const sign = percentage >= 0 ? '+' : '';
  return `${sign}${percentage.toFixed(2)}%`;
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60),
  );

  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
};

// Validation utilities

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

export const detectWalletType = (
  address: string,
): 'bitcoin' | 'ethereum' | 'unknown' => {
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
  query: string,
): T[] => {
  if (!query.trim()) {
    return cryptos;
  }

  const lowerQuery = query.toLowerCase().trim();
  return cryptos.filter(
    crypto =>
      crypto.name.toLowerCase().includes(lowerQuery) ||
      crypto.symbol.toLowerCase().includes(lowerQuery),
  );
};

export const sortCryptos = <T extends Record<string, any>>(
  cryptos: T[],
  field: keyof T,
  order: 'asc' | 'desc',
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

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Format input values with thousands separators as user types
export const formatInputValue = (value: string): string => {
  // Remove any existing commas and non-numeric characters except decimal point
  const cleanValue = value.replace(/[^\d.]/g, '');

  // Handle multiple decimal points - keep only the first one
  const parts = cleanValue.split('.');
  const integerPart = parts[0];
  const decimalPart = parts.length > 1 ? parts.slice(1).join('') : '';

  // Add thousands separators to integer part
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Combine with decimal part if it exists
  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};

// Extract numeric value from formatted input
export const extractNumericValue = (formattedValue: string): string => {
  // Remove commas, currency symbols, and text, keep only digits and decimal point
  const cleaned = formattedValue
    .replace(/,/g, '') // Remove thousands separators
    .replace(/[^\d.]/g, ''); // Keep only digits and decimal points

  // Handle multiple decimal points - keep only the first one
  const parts = cleaned.split('.');
  const result =
    parts.length > 1 ? `${parts[0]}.${parts.slice(1).join('')}` : parts[0];

  const numValue = parseFloat(result);
  return isNaN(numValue) ? '0' : result || '0';
};

// Safe parsing utilities
export const safeParseFloat = (value: string | number): number => {
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value;
  }
  const parsed = parseFloat(value.replace(/,/g, '')); // Remove commas before parsing
  return isNaN(parsed) ? 0 : parsed;
};

export const safeParseInt = (value: string | number): number => {
  if (typeof value === 'number') {
    return Math.floor(isNaN(value) ? 0 : value);
  }
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
};
