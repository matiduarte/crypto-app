import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries for testing
        gcTime: Infinity,
      },
    },
  });

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>{children}</NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });


// Mock data generators
export const mockCryptocurrency = {
  id: 'bitcoin',
  symbol: 'btc',
  name: 'Bitcoin',
  current_price: 50000,
  market_cap: 1000000000,
  market_cap_rank: 1,
  price_change_24h: 1000,
  price_change_percentage_24h: 2.5,
  volume_24h: 50000000000,
  total_volume: 50000000000,
  high_24h: 51000,
  low_24h: 49000,
  market_cap_change_24h: 10000000,
  market_cap_change_percentage_24h: 1.5,
  image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  circulating_supply: 19000000,
  total_supply: 21000000,
  max_supply: 21000000,
  ath: 69000,
  ath_change_percentage: -25.5,
  ath_date: '2021-11-10T14:24:11.849Z',
  atl: 67.81,
  atl_change_percentage: 73650.1,
  atl_date: '2013-07-06T00:00:00.000Z',
  last_updated: '2024-01-01T00:00:00.000Z',
  sparkline_in_7d: {
    price: [48000, 49000, 50000, 51000, 50500, 50000, 50000],
  },
  roi: null,
};

export const mockCryptocurrencies = [
  mockCryptocurrency,
  {
    ...mockCryptocurrency,
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    image: 'ethereum.png',
    current_price: 3000,
    market_cap: 500000000,
    market_cap_rank: 2,
    fully_diluted_valuation: 500000000,
    total_volume: 30000000,
    high_24h: 3100,
    low_24h: 2900,
    price_change_24h: 50,
    price_change_percentage_24h: 1.7,
    market_cap_change_24h: 10000000,
    market_cap_change_percentage_24h: 1.7,
    circulating_supply: 120000000,
    total_supply: 120000000,
    ath: 4878.26,
    ath_change_percentage: -38.5,
    ath_date: '2021-11-10T14:24:19.604Z',
    atl: 0.432979,
    atl_change_percentage: 692829.5,
    atl_date: '2015-10-20T00:00:00.000Z',
    last_updated: '2023-01-01T00:00:00.000Z',
  },
];

export const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  photo: 'https://example.com/photo.jpg',
};

export const mockApiResponse = <T,>(data: T) => ({
  success: true,
  data,
  message: 'Success',
});

export const mockApiError = (message: string = 'API Error') => ({
  success: false,
  data: null,
  message,
});

// Custom matchers for common assertions
export const expectToBeVisible = (element: any) => {
  expect(element).toBeTruthy();
  expect(element).not.toHaveStyle({ opacity: 0 });
};

export const expectToBeHidden = (element: any) => {
  if (element) {
    expect(element).toHaveStyle({ opacity: 0 });
  }
};

// Animation testing helpers
export const flushMicrotasksQueue = () => {
  return new Promise(resolve => setImmediate(resolve));
};

export const advanceTimersByTime = (time: number) => {
  jest.advanceTimersByTime(time);
  return flushMicrotasksQueue();
};

// Re-export everything from React Native Testing Library
export * from '@testing-library/react-native';

// Override render methods
export { 
  customRender as render
};