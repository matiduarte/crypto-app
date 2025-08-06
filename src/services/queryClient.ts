import { QueryClient } from '@tanstack/react-query';

// Create and configure the QueryClient
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache time: how long data stays in cache when component unmounts
      gcTime: 1000 * 60 * 5, // 5 minutes
      // Stale time: how long data is considered fresh
      staleTime: 1000 * 60 * 2, // 2 minutes
      // Retry failed requests
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus (mobile: app foreground)
      refetchOnWindowFocus: true,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Don't refetch on mount if data is not stale
      refetchOnMount: 'always',
    },
    mutations: {
      // Retry failed mutations
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Query Keys - Centralized key management
export const queryKeys = {
  // Cryptocurrency queries
  cryptos: {
    all: ['cryptos'] as const,
    lists: () => [...queryKeys.cryptos.all, 'list'] as const,
    list: (params: Record<string, any>) => 
      [...queryKeys.cryptos.lists(), params] as const,
    details: () => [...queryKeys.cryptos.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.cryptos.details(), id] as const,
  },
  
  // Search queries
  search: {
    all: ['search'] as const,
    cryptos: (query: string) => [...queryKeys.search.all, 'cryptos', query] as const,
  },
  
  // Exchange/Price queries
  prices: {
    all: ['prices'] as const,
    simple: (ids: string, vs_currencies: string) => 
      [...queryKeys.prices.all, 'simple', ids, vs_currencies] as const,
    rates: () => [...queryKeys.prices.all, 'rates'] as const,
  },
  
  // User-specific queries
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    favorites: () => [...queryKeys.user.all, 'favorites'] as const,
    wallets: () => [...queryKeys.user.all, 'wallets'] as const,
  },
} as const;

// Prefetch utilities
export const prefetchCryptocurrencies = async (params: {
  vs_currency?: string;
  order?: string;
  per_page?: number;
  page?: number;
}) => {
  const apiService = await import('./api');
  
  await queryClient.prefetchQuery({
    queryKey: queryKeys.cryptos.list(params),
    queryFn: () => apiService.default.getCryptocurrencies(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Invalidation helpers
export const invalidateCryptoQueries = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.cryptos.all });
};

export const invalidatePriceQueries = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.prices.all });
};

export const invalidateUserQueries = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
};