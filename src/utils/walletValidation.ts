// Wallet address validation utilities

export interface WalletValidationResult {
  isValid: boolean;
  type: 'bitcoin' | 'ethereum' | 'unknown';
  address: string;
  error?: string;
}

/**
 * Validates a Bitcoin address (Legacy, SegWit, Native SegWit)
 */
export const validateBitcoinAddress = (address: string): boolean => {
  // Remove whitespace
  address = address.trim();

  // Legacy address (starts with 1)
  if (address.match(/^[1][a-km-zA-HJ-NP-Z1-9]{25,34}$/)) {
    return true;
  }

  // Script hash address (starts with 3)
  if (address.match(/^[3][a-km-zA-HJ-NP-Z1-9]{25,34}$/)) {
    return true;
  }

  // Bech32 address (starts with bc1)
  if (address.match(/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,87}$/)) {
    return true;
  }

  return false;
};

/**
 * Validates an Ethereum address
 */
export const validateEthereumAddress = (address: string): boolean => {
  // Remove whitespace
  address = address.trim();

  // Ethereum address pattern (0x followed by 40 hex characters)
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Determines wallet type and validates address
 */
export const validateWalletAddress = (input: string): WalletValidationResult => {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      type: 'unknown',
      address: '',
      error: 'Invalid input',
    };
  }

  const address = input.trim();

  // Check for Bitcoin address patterns
  if (validateBitcoinAddress(address)) {
    return {
      isValid: true,
      type: 'bitcoin',
      address,
    };
  }

  // Check for Ethereum address pattern
  if (validateEthereumAddress(address)) {
    return {
      isValid: true,
      type: 'ethereum',
      address,
    };
  }

  // If it looks like it could be an address but doesn't match known patterns
  if (address.length > 20 && /^[a-zA-Z0-9]+$/.test(address)) {
    return {
      isValid: false,
      type: 'unknown',
      address,
      error: 'Unsupported wallet address format',
    };
  }

  return {
    isValid: false,
    type: 'unknown',
    address,
    error: 'Invalid wallet address format',
  };
};

/**
 * Extracts wallet address from QR code data
 * Handles various QR code formats like bitcoin:address or just plain address
 */
export const extractAddressFromQRData = (qrData: string): string => {
  if (!qrData) return '';

  // Handle bitcoin: URI format
  if (qrData.startsWith('bitcoin:')) {
    // Extract address from bitcoin:address?amount=0.1&label=example
    const match = qrData.match(/^bitcoin:([a-zA-Z0-9]+)/);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Handle ethereum: URI format
  if (qrData.startsWith('ethereum:')) {
    // Extract address from ethereum:0x...
    const match = qrData.match(/^ethereum:(0x[a-fA-F0-9]{40})/);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Return as-is if it's likely a plain address
  return qrData.trim();
};

/**
 * Formats wallet address for display (shortens long addresses)
 */
export const formatWalletAddress = (address: string, maxLength: number = 20): string => {
  if (!address || address.length <= maxLength) {
    return address;
  }

  const start = address.slice(0, maxLength / 2);
  const end = address.slice(-maxLength / 2);
  return `${start}...${end}`;
};

/**
 * Gets wallet type display name
 */
export const getWalletTypeDisplayName = (type: 'bitcoin' | 'ethereum' | 'unknown'): string => {
  switch (type) {
    case 'bitcoin':
      return 'Bitcoin';
    case 'ethereum':
      return 'Ethereum';
    default:
      return 'Unknown';
  }
};

/**
 * Gets wallet type emoji
 */
export const getWalletTypeEmoji = (type: 'bitcoin' | 'ethereum' | 'unknown'): string => {
  switch (type) {
    case 'bitcoin':
      return '₿';
    case 'ethereum':
      return 'Ξ';
    default:
      return '❓';
  }
};