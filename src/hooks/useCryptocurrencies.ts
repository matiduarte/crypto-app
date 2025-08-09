import {
  useQuery,
  useInfiniteQuery,
  UseQueryOptions,
} from '@tanstack/react-query';
import apiService from '../services/api';
import { queryKeys } from '../services/queryClient';
import { Cryptocurrency, APIResponse } from '../types';

/**
 * Hook for fetching cryptocurrencies
 * @param params
 * @param options
 * @returns
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
  options?: Omit<
    UseQueryOptions<APIResponse<Cryptocurrency[]>>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: queryKeys.cryptos.list(params),
    queryFn: () => apiService.getCryptocurrencies(params),
    ...options,
  });
};

/**
 * Hook for infinite loading of cryptocurrencies
 * @param params
 * @param options
 * @returns
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
      if (!lastPage.success || !lastPage.data || lastPage.data.length === 0) {
        return undefined;
      }

      const perPage = params.per_page || 50;
      if (lastPage.data.length < perPage) {
        return undefined;
      }

      return lastPageParam + 1;
    },
    initialPageParam: 1,
    maxPages: 10, // Prevent excessive memory usage
  });
};



