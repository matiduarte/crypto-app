import Config from 'react-native-config';

const ENV_CONFIG = {
  COINGECKO_API_KEY: Config.COINGECKO_API_KEY,
  WEB_CLIENT_ID: Config.WEB_CLIENT_ID,
  IOS_CLIENT_ID: Config.IOS_CLIENT_ID,
};

// API Configuration
export const API_CONFIG = {
  COINGECKO_BASE_URL: 'https://api.coingecko.com/api/v3',
  COINGECKO_API_KEY: ENV_CONFIG.COINGECKO_API_KEY,
  ENDPOINTS: {
    COINS: '/coins/markets',
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
  },
  GOOGLE_SIGNIN_CONFIG: {
    WEB_CLIENT_ID: ENV_CONFIG.WEB_CLIENT_ID,
    IOS_CLIENT_ID: ENV_CONFIG.IOS_CLIENT_ID,
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

export const APP_DETAILS = {
  name: 'Lime',
  iconName: 'currency-bitcoin',
};
