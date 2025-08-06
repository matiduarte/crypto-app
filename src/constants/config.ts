// API Configuration
export const API_CONFIG = {
  COINGECKO_BASE_URL: 'https://api.coingecko.com/api/v3',
  ENDPOINTS: {
    COINS: '/coins/markets',
    COIN_DETAIL: '/coins/{id}',
    SEARCH: '/search',
    EXCHANGE_RATES: '/exchange_rates',
    SIMPLE_PRICE: '/simple/price',
  },
  DEFAULT_VS_CURRENCY: 'usd',
  DEFAULT_PAGE_SIZE: 50,
} as const;

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'CryptoApp',
  VERSION: '1.0.0',
  STORAGE_KEYS: {
    USER_TOKEN: '@user_token',
    USER_DATA: '@user_data',
    SCANNED_WALLETS: '@scanned_wallets',
    FAVORITE_CRYPTOS: '@favorite_cryptos',
    APP_SETTINGS: '@app_settings',
  },
  GOOGLE_SIGNIN_CONFIG: {
    // These will be configured during Google Sign-In setup
    WEB_CLIENT_ID: '', // To be filled during configuration
    IOS_CLIENT_ID: '', // To be filled during configuration
  },
} as const;

// Supported Fiat Currencies
export const FIAT_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$' },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/' },
] as const;

// Default Cryptocurrencies
export const DEFAULT_CRYPTOS = [
  'bitcoin',
  'ethereum',
  'tether',
  'binancecoin',
  'cardano',
  'solana',
] as const;