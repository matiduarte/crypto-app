export interface AuthTokens {
  idToken: string;
  accessToken: string;
}

export type User = {
  id: string;
  name: string | null;
  email: string;
  photo: string | null;
  familyName: string | null;
  givenName: string | null;
};

export interface SignInResult {
  success: boolean;
  user?: User;
  tokens?: AuthTokens;
  error?: string;
  warning?: string;
}

export interface AuthServiceConfig {
  webClientId: string;
  offlineAccess?: boolean;
  hostedDomain?: string;
  forceCodeForRefreshToken?: boolean;
}

// Cryptocurrency Types
export interface Cryptocurrency {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation?: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply?: number;
  max_supply?: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
}

export interface SimplePrice {
  [coinId: string]: {
    [currency: string]: number;
  };
}

// Wallet Scanner Types
export interface ScannedWallet {
  id: string;
  address: string;
  type: 'bitcoin' | 'ethereum' | 'unknown';
  label?: string;
  isFavorite: boolean;
  scannedAt: string;
  qrData: string;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabParamList = {
  Crypto: undefined;
  Exchange: undefined;
  Scanner: undefined;
  Profile: undefined;
};

export type CryptoStackParamList = {
  CryptoList: undefined;
};
