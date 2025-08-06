// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  photo?: string;
  accessToken: string;
  refreshToken?: string;
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

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  per_page: number;
  total: number;
  has_next: boolean;
}

// Filter and Sort Types
export interface CryptoFilter {
  priceRange?: {
    min: number;
    max: number;
  };
  changeType?: 'positive' | 'negative' | 'all';
  marketCapRange?: {
    min: number;
    max: number;
  };
  volumeRange?: {
    min: number;
    max: number;
  };
}

export interface CryptoSort {
  field: 'name' | 'current_price' | 'market_cap' | 'total_volume' | 'price_change_percentage_24h';
  order: 'asc' | 'desc';
}

// Exchange Types
export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  lastUpdated: string;
}

export interface ConversionResult {
  fromAmount: number;
  toAmount: number;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  timestamp: string;
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
  CryptoList: undefined;
  Exchange: undefined;
  Scanner: undefined;
  Profile: undefined;
};

export type CryptoStackParamList = {
  CryptoList: undefined;
  CryptoDetail: {
    cryptoId: string;
    symbol: string;
  };
};

// State Types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface CryptoState {
  cryptos: Cryptocurrency[];
  loading: boolean;
  error: string | null;
  filters: CryptoFilter;
  sort: CryptoSort;
  searchQuery: string;
  page: number;
  hasMore: boolean;
}

export interface ExchangeState {
  fromCurrency: string;
  toCurrency: string;
  fromAmount: string;
  toAmount: string;
  rate: number | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export interface ScannerState {
  scannedWallets: ScannedWallet[];
  loading: boolean;
  error: string | null;
}