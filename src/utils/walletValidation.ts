export interface WalletValidationResult {
  isValid: boolean;
  type: 'bitcoin' | 'ethereum' | 'unknown';
  address: string;
  error?: string;
}

/**
 * Determines wallet type and validates address
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

  // Check for empty string after trim
  if (!address) {
    return {
      isValid: false,
      type: 'unknown',
      address: '',
      error: 'Invalid input',
    };
  }

  // Check for Bitcoin address patterns first
  // Legacy address (starts with 1)
  if (address.match(/^[1][a-km-zA-HJ-NP-Z1-9]{25,34}$/)) {
    return {
      isValid: true,
      type: 'bitcoin',
      address,
    };
  }

  // Script hash address (starts with 3)
  if (address.match(/^[3][a-km-zA-HJ-NP-Z1-9]{25,34}$/)) {
    return {
      isValid: true,
      type: 'bitcoin',
      address,
    };
  }

  // Bech32 address (starts with bc1)
  if (address.match(/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,87}$/)) {
    return {
      isValid: true,
      type: 'bitcoin',
      address,
    };
  }

  // Check for Ethereum address pattern (0x followed by 40 hex characters)
  if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return {
      isValid: true,
      type: 'ethereum',
      address,
    };
  }

  // Handle common non-crypto QR codes that people might scan by mistake
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

  // Check for phone numbers
  if (/^[+]?[0-9\s\-()]{10,}$/.test(address)) {
    return {
      isValid: false,
      type: 'unknown',
      address,
      error:
        'This appears to be a phone number, not a cryptocurrency wallet address.',
    };
  }

  // Check for social media handles or usernames
  if (address.startsWith('@') || address.startsWith('#')) {
    return {
      isValid: false,
      type: 'unknown',
      address,
      error:
        'This appears to be a social media handle, not a cryptocurrency wallet address.',
    };
  }

  // Check for WiFi QR codes
  if (address.startsWith('WIFI:')) {
    return {
      isValid: false,
      type: 'unknown',
      address,
      error: 'This is a WiFi QR code, not a cryptocurrency wallet address.',
    };
  }

  // Check for other common QR code types
  if (address.startsWith('BEGIN:VCARD') || address.includes('VERSION:')) {
    return {
      isValid: false,
      type: 'unknown',
      address,
      error:
        'This is a contact card (vCard), not a cryptocurrency wallet address.',
    };
  }

  // If it looks like it could be a crypto address but doesn't match known patterns
  if (address.length > 20 && /^[a-zA-Z0-9]+$/.test(address)) {
    return {
      isValid: false,
      type: 'unknown',
      address,
      error:
        'Unsupported wallet address format. We only support Bitcoin and Ethereum addresses.',
    };
  }

  // For very short strings or strings with special characters that don't match any pattern
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
 * Extracts wallet address from QR code data
 * Handles various QR code formats like bitcoin:address or just plain address
 */
export const extractAddressFromQRData = (qrData: string): string => {
  if (!qrData) return '';

  const data = qrData.trim();

  // Handle bitcoin: URI format
  if (data.startsWith('bitcoin:')) {
    // Extract address from bitcoin:address?amount=0.1&label=example
    const match = data.match(/^bitcoin:([13bc1][a-zA-HJ-NP-Z0-9]{25,87})/);
    if (match && match[1]) {
      return match[1];
    }
    // Fallback: try to extract any alphanumeric sequence after bitcoin:
    const fallbackMatch = data.match(/^bitcoin:([a-zA-Z0-9]+)/);
    if (fallbackMatch && fallbackMatch[1]) {
      return fallbackMatch[1];
    }
  }

  // Handle ethereum: URI format
  if (data.startsWith('ethereum:')) {
    // Extract address from ethereum:0x...
    const match = data.match(/^ethereum:(0x[a-fA-F0-9]{40})/);
    if (match && match[1]) {
      return match[1];
    }
    // Fallback: try to extract any 0x address after ethereum:
    const fallbackMatch = data.match(/^ethereum:(0x[a-fA-F0-9]+)/);
    if (fallbackMatch && fallbackMatch[1]) {
      return fallbackMatch[1];
    }
  }

  // Handle other cryptocurrency URI schemes
  if (
    data.includes(':') &&
    !data.startsWith('http') &&
    !data.startsWith('WIFI:') &&
    !data.startsWith('BEGIN:')
  ) {
    const parts = data.split(':');
    if (parts.length >= 2 && parts[1]) {
      // Extract the part after the first colon, but before any query parameters
      const addressPart = parts[1].split('?')[0].split('&')[0];
      if (addressPart) {
        return addressPart.trim();
      }
    }
  }

  // Return as-is if it's likely a plain address
  return data;
};

/**
 * Formats wallet address for display (shortens long addresses)
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
 * Gets wallet type display name
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
