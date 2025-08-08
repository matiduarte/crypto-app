import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';
import {
  RootStackParamList,
  AuthStackParamList,
  MainTabParamList,
  CryptoStackParamList,
} from '../types';

// Root Stack Navigation Types
export type RootStackNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

// Auth Stack Navigation Types
export type AuthStackNavigationProp =
  NativeStackNavigationProp<AuthStackParamList>;

// Main Tab Navigation Types
export type MainTabNavigationProp = BottomTabNavigationProp<MainTabParamList>;

// Crypto Stack Navigation Types
export type CryptoStackNavigationProp =
  NativeStackNavigationProp<CryptoStackParamList>;

// Route Types
export type LoginScreenRouteProp = RouteProp<AuthStackParamList, 'Login'>;
export type CryptoListScreenRouteProp = RouteProp<
  MainTabParamList,
  'Crypto'
>;
export type ExchangeScreenRouteProp = RouteProp<MainTabParamList, 'Exchange'>;
export type ScannerScreenRouteProp = RouteProp<MainTabParamList, 'Scanner'>;
export type ProfileScreenRouteProp = RouteProp<MainTabParamList, 'Profile'>;

// Typed Navigation Hooks
export const useRootNavigation = () => {
  return useNavigation<RootStackNavigationProp>();
};

export const useAuthNavigation = () => {
  return useNavigation<AuthStackNavigationProp>();
};

export const useMainTabNavigation = () => {
  return useNavigation<MainTabNavigationProp>();
};

export const useCryptoStackNavigation = () => {
  return useNavigation<CryptoStackNavigationProp>();
};

// Typed Route Hooks
export const useLoginRoute = () => {
  return useRoute<LoginScreenRouteProp>();
};

export const useCryptoListRoute = () => {
  return useRoute<CryptoListScreenRouteProp>();
};

export const useExchangeRoute = () => {
  return useRoute<ExchangeScreenRouteProp>();
};

export const useScannerRoute = () => {
  return useRoute<ScannerScreenRouteProp>();
};

export const useProfileRoute = () => {
  return useRoute<ProfileScreenRouteProp>();
};

// Navigation Actions Helper
export const navigationActions = {
  // Navigate to main app after login
  navigateToMain: (navigation: RootStackNavigationProp) => {
    navigation.navigate('Main');
  },

  // Navigate to auth flow after logout
  navigateToAuth: (navigation: RootStackNavigationProp) => {
    navigation.navigate('Auth');
  },

  // Navigate to crypto detail from list
  navigateToCryptoDetail: (
    navigation: CryptoStackNavigationProp,
    _cryptoId: string,
    _symbol: string,
  ) => {
    navigation.navigate('CryptoList');
  },

  // Navigate between tabs
  navigateToTab: (
    navigation: MainTabNavigationProp,
    tabName: keyof MainTabParamList,
  ) => {
    navigation.navigate(tabName);
  },

  // Go back
  goBack: (navigation: any) => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  },
};
