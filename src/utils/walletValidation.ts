export interface WalletValidationResult {
  isValid: boolean;
  type: 'bitcoin' | 'ethereum' | 'unknown';
  address: string;
  error?: string;
}

/**
 * Validates cryptocurrency wallet addresses and identifies their type.
 * Supports Bitcoin (legacy, script hash, bech32) and Ethereum addresses.
 * Provides helpful error messages for common non-crypto QR code types.
 * 
 * @param input - Address string to validate
 * @returns Validation result with type, validity, and error details
 */
export const validateWalletAddress = (
  input: string,
): WalletValidationResult => {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      type: 'unknown',
      address: '',
      error: 'Invalid input',
    };
  }

  const address = input.trim();

  if (!address) {
    return {
      isValid: false,
      type: 'unknown',
      address: '',
      error: 'Invalid input',
    };
  }

  if (address.match(/^[1][a-km-zA-HJ-NP-Z1-9]{25,34}$/)) {
    return {
      isValid: true,
      type: 'bitcoin',
      address,
    };
  }

  if (address.match(/^[3][a-km-zA-HJ-NP-Z1-9]{25,34}$/)) {
    return {
      isValid: true,
      type: 'bitcoin',
      address,
    };
  }

  if (address.match(/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,87}$/)) {
    return {
      isValid: true,
      type: 'bitcoin',
      address,
    };
  }

  if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return {
      isValid: true,
      type: 'ethereum',
      address,
    };
  }

  if (address.startsWith('http://') || address.startsWith('https://')) {
    return {
      isValid: false,
      type: 'unknown',
      address,
      error:
        'This appears to be a website URL, not a cryptocurrency wallet address.',
    };
  }

  if (address.includes('@') && address.includes('.')) {
    return {
      isValid: false,
      type: 'unknown',
      address,
      error:
        'This appears to be an email address, not a cryptocurrency wallet address.',
    };
  }

  if (/^[+]?[0-9\s\-()]{10,}$/.test(address)) {
    return {
      isValid: false,
      type: 'unknown',
      address,
      error:
        'This appears to be a phone number, not a cryptocurrency wallet address.',
    };
  }

  if (address.startsWith('@') || address.startsWith('#')) {
    return {
      isValid: false,
      type: 'unknown',
      address,
      error:
        'This appears to be a social media handle, not a cryptocurrency wallet address.',
    };
  }

  if (address.startsWith('WIFI:')) {
    return {
      isValid: false,
      type: 'unknown',
      address,
      error: 'This is a WiFi QR code, not a cryptocurrency wallet address.',
    };
  }

  if (address.startsWith('BEGIN:VCARD') || address.includes('VERSION:')) {
    return {
      isValid: false,
      type: 'unknown',
      address,
      error:
        'This is a contact card (vCard), not a cryptocurrency wallet address.',
    };
  }

  if (address.length > 20 && /^[a-zA-Z0-9]+$/.test(address)) {
    return {
      isValid: false,
      type: 'unknown',
      address,
      error:
        'Unsupported wallet address format. We only support Bitcoin and Ethereum addresses.',
    };
  }

  if (address.length < 20) {
    return {
      isValid: false,
      type: 'unknown',
      address,
      error:
        'This QR code does not contain a valid cryptocurrency wallet address.',
    };
  }

  return {
    isValid: false,
    type: 'unknown',
    address,
    error:
      'This QR code format is not supported. We only support Bitcoin and Ethereum wallet addresses.',
  };
};

/**
 * Extracts cryptocurrency addresses from various QR code URI formats.
 * Handles bitcoin:, ethereum: URI schemes and plain addresses with parameter parsing.
 * 
 * @param qrData - Raw QR code string data
 * @returns Extracted wallet address or original data if no URI format detected
 */
export const extractAddressFromQRData = (qrData: string): string => {
  if (!qrData) return '';

  const data = qrData.trim();

  if (data.startsWith('bitcoin:')) {
    const match = data.match(/^bitcoin:([13bc1][a-zA-HJ-NP-Z0-9]{25,87})/);
    if (match && match[1]) {
      return match[1];
    }
    const fallbackMatch = data.match(/^bitcoin:([a-zA-Z0-9]+)/);
    if (fallbackMatch && fallbackMatch[1]) {
      return fallbackMatch[1];
    }
  }

  if (data.startsWith('ethereum:')) {
    const match = data.match(/^ethereum:(0x[a-fA-F0-9]{40})/);
    if (match && match[1]) {
      return match[1];
    }
    const fallbackMatch = data.match(/^ethereum:(0x[a-fA-F0-9]+)/);
    if (fallbackMatch && fallbackMatch[1]) {
      return fallbackMatch[1];
    }
  }

  if (
    data.includes(':') &&
    !data.startsWith('http') &&
    !data.startsWith('WIFI:') &&
    !data.startsWith('BEGIN:')
  ) {
    const parts = data.split(':');
    if (parts.length >= 2 && parts[1]) {
      const addressPart = parts[1].split('?')[0].split('&')[0];
      if (addressPart) {
        return addressPart.trim();
      }
    }
  }

  return data;
};

/**
 * Formats long wallet addresses for display by truncating the middle.
 * 
 * @param address - Wallet address to format
 * @param maxLength - Maximum display length before truncation (default: 20)
 * @returns Formatted address with ellipsis in the middle if truncated
 */
export const formatWalletAddress = (
  address: string,
  maxLength: number = 20,
): string => {
  if (!address || address.length <= maxLength) {
    return address;
  }

  const start = address.slice(0, maxLength / 2);
  const end = address.slice(-maxLength / 2);
  return `${start}...${end}`;
};

/**
 * Converts wallet type enum to user-friendly display name.
 * 
 * @param type - Wallet type identifier
 * @returns Capitalized display name for the wallet type
 */
export const getWalletTypeDisplayName = (
  type: 'bitcoin' | 'ethereum' | 'unknown',
): string => {
  switch (type) {
    case 'bitcoin':
      return 'Bitcoin';
    case 'ethereum':
      return 'Ethereum';
    default:
      return 'Unknown';
  }
};
