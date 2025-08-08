// API Configuration
export const API_CONFIG = {
  COINGECKO_BASE_URL: 'https://api.coingecko.com/api/v3',
  COINGECKO_API_KEY: 'CG-BuUVyNARYwdryyHA1bm1DLyH', // Should be moved to environment variable in production
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
    WEB_CLIENT_ID:
      '26541062723-0p5vcfdcbmuco5q4d71d1t91ucka42u4.apps.googleusercontent.com', // Web client ID (required for both platforms)
    IOS_CLIENT_ID:
      '26541062723-7lnu0qcfvo29iugs911osr7iuphcva86.apps.googleusercontent.com', // iOS client ID
    OFFLINE_ACCESS: true,
    FORCE_CODE_FOR_REFRESH_TOKEN: true,
  },
} as const;

// Supported Fiat Currencies
export const FIAT_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'ARS', name: 'Arg Peso', symbol: '$' },
  { code: 'PEN', name: 'Peru Sol', symbol: 'S/' },
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

export const APP_DETAILS = {
  emoji: '🍋',
};
