import {
  validateWalletAddress,
  extractAddressFromQRData,
  formatWalletAddress,
  getWalletTypeDisplayName,
} from '../walletValidation';

describe('Wallet Validation Utils', () => {
  describe('validateWalletAddress', () => {
    describe('Bitcoin addresses', () => {
      it('validates legacy Bitcoin P2PKH addresses (starts with 1)', () => {
        const result = validateWalletAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
        expect(result).toEqual({
          isValid: true,
          type: 'bitcoin',
          address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        });
      });

      it('validates Bitcoin P2SH addresses (starts with 3)', () => {
        const result = validateWalletAddress('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy');
        expect(result).toEqual({
          isValid: true,
          type: 'bitcoin',
          address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
        });
      });

      it('validates Bitcoin Bech32 addresses (starts with bc1)', () => {
        const result = validateWalletAddress('bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq');
        expect(result).toEqual({
          isValid: true,
          type: 'bitcoin',
          address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
        });
      });

      it('rejects invalid Bitcoin addresses', () => {
        const result = validateWalletAddress('1InvalidBitcoinAddress123');
        expect(result.isValid).toBe(false);
        expect(result.type).toBe('unknown');
      });
    });

    describe('Ethereum addresses', () => {
      it('validates Ethereum addresses', () => {
        const result = validateWalletAddress('0x742d35Cc6634C0532925a3b8D4b5bF1f4e3a8b8f');
        expect(result).toEqual({
          isValid: true,
          type: 'ethereum',
          address: '0x742d35Cc6634C0532925a3b8D4b5bF1f4e3a8b8f',
        });
      });

      it('validates lowercase Ethereum addresses', () => {
        const result = validateWalletAddress('0x742d35cc6634c0532925a3b8d4b5bf1f4e3a8b8f');
        expect(result).toEqual({
          isValid: true,
          type: 'ethereum',
          address: '0x742d35cc6634c0532925a3b8d4b5bf1f4e3a8b8f',
        });
      });

      it('rejects invalid Ethereum addresses', () => {
        const result = validateWalletAddress('0xinvalid');
        expect(result.isValid).toBe(false);
        expect(result.type).toBe('unknown');
      });
    });

    describe('Invalid inputs', () => {
      it('handles null/undefined input', () => {
        const result = validateWalletAddress(null as any);
        expect(result).toEqual({
          isValid: false,
          type: 'unknown',
          address: '',
          error: 'Invalid input',
        });
      });

      it('handles empty string', () => {
        const result = validateWalletAddress('');
        expect(result).toEqual({
          isValid: false,
          type: 'unknown',
          address: '',
          error: 'Invalid input',
        });
      });

      it('handles whitespace-only string', () => {
        const result = validateWalletAddress('   ');
        expect(result).toEqual({
          isValid: false,
          type: 'unknown',
          address: '',
          error: 'Invalid input',
        });
      });
    });

    describe('Common non-crypto QR code types', () => {
      it('detects URLs', () => {
        const result = validateWalletAddress('https://example.com');
        expect(result).toEqual({
          isValid: false,
          type: 'unknown',
          address: 'https://example.com',
          error: 'This appears to be a website URL, not a cryptocurrency wallet address.',
        });
      });

      it('detects email addresses', () => {
        const result = validateWalletAddress('user@example.com');
        expect(result).toEqual({
          isValid: false,
          type: 'unknown',
          address: 'user@example.com',
          error: 'This appears to be an email address, not a cryptocurrency wallet address.',
        });
      });

      it('detects phone numbers', () => {
        const result = validateWalletAddress('+1234567890');
        expect(result).toEqual({
          isValid: false,
          type: 'unknown',
          address: '+1234567890',
          error: 'This appears to be a phone number, not a cryptocurrency wallet address.',
        });
      });

      it('detects social media handles', () => {
        const result = validateWalletAddress('@username');
        expect(result).toEqual({
          isValid: false,
          type: 'unknown',
          address: '@username',
          error: 'This appears to be a social media handle, not a cryptocurrency wallet address.',
        });
      });

      it('detects WiFi QR codes', () => {
        const result = validateWalletAddress('WIFI:T:WPA;S:NetworkName;P:password;;');
        expect(result).toEqual({
          isValid: false,
          type: 'unknown',
          address: 'WIFI:T:WPA;S:NetworkName;P:password;;',
          error: 'This is a WiFi QR code, not a cryptocurrency wallet address.',
        });
      });

      it('detects vCard format', () => {
        const result = validateWalletAddress('BEGIN:VCARD\\nVERSION:3.0\\nFN:John Doe\\nEND:VCARD');
        expect(result).toEqual({
          isValid: false,
          type: 'unknown',
          address: 'BEGIN:VCARD\\nVERSION:3.0\\nFN:John Doe\\nEND:VCARD',
          error: 'This is a contact card (vCard), not a cryptocurrency wallet address.',
        });
      });
    });

    describe('Edge cases', () => {
      it('rejects short strings', () => {
        const result = validateWalletAddress('tooshort');
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('This QR code does not contain a valid cryptocurrency wallet address.');
      });

      it('handles unsupported long alphanumeric strings', () => {
        const result = validateWalletAddress('thisIsAVeryLongAlphanumericStringThatCouldBeSomeOtherCrypto');
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Unsupported wallet address format. We only support Bitcoin and Ethereum addresses.');
      });
    });
  });

  describe('extractAddressFromQRData', () => {
    it('extracts Bitcoin address from bitcoin: URI', () => {
      const result = extractAddressFromQRData('bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?amount=0.01');
      expect(result).toBe('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
    });

    it('extracts Ethereum address from ethereum: URI', () => {
      const result = extractAddressFromQRData('ethereum:0x742d35Cc6634C0532925a3b8D4b5bF1f4e3a8b8f?value=1000000000000000000');
      expect(result).toBe('0x742d35Cc6634C0532925a3b8D4b5bF1f4e3a8b8f');
    });

    it('extracts address from generic URI format', () => {
      const result = extractAddressFromQRData('someprotocol:addresshere?param=value');
      expect(result).toBe('addresshere');
    });

    it('ignores non-crypto URI schemes', () => {
      const result = extractAddressFromQRData('https://example.com');
      expect(result).toBe('https://example.com');
    });

    it('ignores WiFi QR codes', () => {
      const wifi = 'WIFI:T:WPA;S:NetworkName;P:password;;';
      const result = extractAddressFromQRData(wifi);
      expect(result).toBe(wifi);
    });

    it('returns plain addresses unchanged', () => {
      const address = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
      const result = extractAddressFromQRData(address);
      expect(result).toBe(address);
    });

    it('handles empty input', () => {
      expect(extractAddressFromQRData('')).toBe('');
      expect(extractAddressFromQRData(null as any)).toBe('');
    });

    it('trims whitespace', () => {
      const result = extractAddressFromQRData('  1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa  ');
      expect(result).toBe('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
    });
  });

  describe('formatWalletAddress', () => {
    it('truncates long addresses', () => {
      const longAddress = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
      const result = formatWalletAddress(longAddress, 20);
      expect(result).toBe('1A1zP1eP5Q...Lmv7DivfNa');
    });

    it('returns short addresses unchanged', () => {
      const shortAddress = '1A1zP1eP';
      const result = formatWalletAddress(shortAddress, 20);
      expect(result).toBe('1A1zP1eP');
    });

    it('handles empty address', () => {
      expect(formatWalletAddress('')).toBe('');
      expect(formatWalletAddress(null as any)).toBe(null);
    });

    it('uses default max length when not specified', () => {
      const longAddress = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
      const result = formatWalletAddress(longAddress);
      expect(result).toBe('1A1zP1eP5Q...Lmv7DivfNa');
    });
  });

  describe('getWalletTypeDisplayName', () => {
    it('returns correct display names', () => {
      expect(getWalletTypeDisplayName('bitcoin')).toBe('Bitcoin');
      expect(getWalletTypeDisplayName('ethereum')).toBe('Ethereum');
      expect(getWalletTypeDisplayName('unknown')).toBe('Unknown');
    });

    it('handles invalid types', () => {
      expect(getWalletTypeDisplayName('invalid' as any)).toBe('Unknown');
    });
  });
});