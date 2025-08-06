import React from 'react';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import apiService from '../services/api';
import { queryKeys } from '../services/queryClient';
import { APIResponse } from '../types';

// Hook for searching cryptocurrencies
export const useSearchCryptocurrencies = (
  query: string,
  options?: Omit<UseQueryOptions<APIResponse<any>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.search.cryptos(query),
    queryFn: () => apiService.searchCryptocurrencies(query),
    enabled: !!query && query.trim().length > 0, // Only search if query is not empty
    staleTime: 1000 * 60 * 5, // 5 minutes (search results don't change as frequently)
    ...options,
  });
};

// Hook for debounced search (prevents too many API calls while typing)
export const useDebouncedSearch = (query: string, delay: number = 500) => {
  const [debouncedQuery, setDebouncedQuery] = React.useState(query);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => clearTimeout(timer);
  }, [query, delay]);

  return useSearchCryptocurrencies(debouncedQuery);
};

