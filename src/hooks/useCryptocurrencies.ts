import {
  useQuery,
  useInfiniteQuery,
  UseQueryOptions,
} from '@tanstack/react-query';
import apiService from '@services/api';
import { queryKeys } from '@services/queryClient';
import { Cryptocurrency } from '@types';

/**
 * Fetches paginated cryptocurrency market data with React Query caching.
 * Provides real-time price updates and market statistics.
 */
export const useCryptocurrencies = (
  params: {
    vs_currency?: string;
    order?: string;
    per_page?: number;
    page?: number;
    sparkline?: boolean;
    price_change_percentage?: string;
  } = {},
  options?: Omit<UseQueryOptions<Cryptocurrency[]>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: queryKeys.cryptos.list(params),
    queryFn: () => apiService.getCryptocurrencies(params),
    ...options,
  });
};

/**
 * Provides infinite scrolling for cryptocurrency lists with automatic
 * pagination and memory management. Optimized for large datasets.
 */
export const useInfiniteCryptocurrencies = (
  params: {
    vs_currency?: string;
    order?: string;
    per_page?: number;
    sparkline?: boolean;
    price_change_percentage?: string;
  } = {},
) => {
  return useInfiniteQuery({
    queryKey: [...queryKeys.cryptos.lists(), 'infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      apiService.getCryptocurrencies({ ...params, page: pageParam }),
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (!lastPage || lastPage.length === 0) {
        return undefined;
      }

      const perPage = params.per_page || 50;
      if (lastPage.length < perPage) {
        return undefined;
      }

      return lastPageParam + 1;
    },
    initialPageParam: 1,
    maxPages: 10,
  });
};
