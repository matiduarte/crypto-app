import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 5, // 5 minutes
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: 'always',
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

export const queryKeys = {
  cryptos: {
    all: ['cryptos'] as const,
    lists: () => [...queryKeys.cryptos.all, 'list'] as const,
    list: (params: Record<string, any>) =>
      [...queryKeys.cryptos.lists(), params] as const,
    details: () => [...queryKeys.cryptos.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.cryptos.details(), id] as const,
  },

  search: {
    all: ['search'] as const,
    cryptos: (query: string) =>
      [...queryKeys.search.all, 'cryptos', query] as const,
  },

  prices: {
    all: ['prices'] as const,
    simple: (ids: string, vs_currencies: string) =>
      [...queryKeys.prices.all, 'simple', ids, vs_currencies] as const,
    rates: () => [...queryKeys.prices.all, 'rates'] as const,
  },

  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    favorites: () => [...queryKeys.user.all, 'favorites'] as const,
    wallets: () => [...queryKeys.user.all, 'wallets'] as const,
  },
} as const;
