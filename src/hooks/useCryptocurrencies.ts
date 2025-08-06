import { useQuery, useInfiniteQuery, UseQueryOptions } from '@tanstack/react-query';
import apiService from '../services/api';
import { queryKeys } from '../services/queryClient';
import { Cryptocurrency, APIResponse } from '../types';

// Hook for fetching paginated cryptocurrencies list
export const useCryptocurrencies = (
  params: {
    vs_currency?: string;
    order?: string;
    per_page?: number;
    page?: number;
    sparkline?: boolean;
    price_change_percentage?: string;
  } = {},
  options?: Omit<UseQueryOptions<APIResponse<Cryptocurrency[]>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.cryptos.list(params),
    queryFn: () => apiService.getCryptocurrencies(params),
    ...options,
  });
};

// Hook for infinite scrolling cryptocurrencies
export const useInfiniteCryptocurrencies = (
  params: {
    vs_currency?: string;
    order?: string;
    per_page?: number;
    sparkline?: boolean;
    price_change_percentage?: string;
  } = {}
) => {
  return useInfiniteQuery({
    queryKey: [...queryKeys.cryptos.lists(), 'infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      apiService.getCryptocurrencies({ ...params, page: pageParam }),
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
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

// Hook for fetching cryptocurrency details by ID
export const useCryptocurrencyDetails = (
  id: string,
  options?: Omit<UseQueryOptions<APIResponse<any>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.cryptos.detail(id),
    queryFn: () => apiService.getCryptocurrencyDetails(id),
    enabled: !!id, // Only run if id is provided
    ...options,
  });
};

// Hook for fetching multiple cryptocurrency details
export const useMultipleCryptocurrencyDetails = (
  ids: string[],
  options?: Omit<UseQueryOptions<APIResponse<any>[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [...queryKeys.cryptos.details(), 'multiple', ids.sort()],
    queryFn: async () => {
      const promises = ids.map(id => apiService.getCryptocurrencyDetails(id));
      return Promise.all(promises);
    },
    enabled: ids.length > 0,
    ...options,
  });
};

// Hook for refreshing cryptocurrencies data
export const useRefreshCryptocurrencies = () => {
  const { queryClient } = require('@tanstack/react-query');
  
  return {
    refresh: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cryptos.all });
    },
    refreshList: (params: Record<string, any>) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cryptos.list(params) });
    },
    refreshDetail: (id: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cryptos.detail(id) });
    },
  };
};