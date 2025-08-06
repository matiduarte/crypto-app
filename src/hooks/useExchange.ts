import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import apiService from '../services/api';
import { queryKeys } from '../services/queryClient';
import { APIResponse, ConversionResult } from '../types';

// Hook for getting simple prices for conversion
export const useSimplePrice = (
  params: {
    ids: string;
    vs_currencies: string;
    include_24hr_change?: boolean;
  },
  options?: Omit<UseQueryOptions<APIResponse<any>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.prices.simple(params.ids, params.vs_currencies),
    queryFn: () => apiService.getSimplePrice(params),
    enabled: !!params.ids && !!params.vs_currencies,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time prices
    staleTime: 1000 * 10, // Consider data stale after 10 seconds
    ...options,
  });
};

// Hook for getting exchange rates
export const useExchangeRates = (
  options?: Omit<UseQueryOptions<APIResponse<any>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.prices.rates(),
    queryFn: () => apiService.getExchangeRates(),
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    staleTime: 1000 * 60 * 2, // Consider data stale after 2 minutes
    ...options,
  });
};

// Hook for currency conversion calculations
export const useCurrencyConversion = () => {
  const queryClient = useQueryClient();

  const convertCurrency = useMutation({
    mutationFn: async (params: {
      fromCurrency: string;
      toCurrency: string;
      amount: number;
    }) => {
      const { fromCurrency, toCurrency, amount } = params;
      
      // Get the conversion rate
      const priceData = await apiService.getSimplePrice({
        ids: fromCurrency,
        vs_currencies: toCurrency,
        include_24hr_change: true,
      });

      if (!priceData.success || !priceData.data) {
        throw new Error('Failed to get conversion rate');
      }

      const rate = priceData.data[fromCurrency]?.[toCurrency];
      if (!rate) {
        throw new Error('Conversion rate not available');
      }

      const convertedAmount = amount * rate;

      const result: ConversionResult = {
        fromAmount: amount,
        toAmount: convertedAmount,
        fromCurrency,
        toCurrency,
        rate,
        timestamp: new Date().toISOString(),
      };

      return result;
    },
    onSuccess: () => {
      // Invalidate price queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.prices.all });
    },
  });

  return {
    convert: convertCurrency.mutate,
    convertAsync: convertCurrency.mutateAsync,
    isLoading: convertCurrency.isPending,
    error: convertCurrency.error,
    data: convertCurrency.data,
    reset: convertCurrency.reset,
  };
};

// Hook for real-time price updates
export const useRealTimePrices = (
  cryptoIds: string[],
  vsCurrency: string = 'usd',
  refetchInterval: number = 30000 // 30 seconds
) => {
  const ids = cryptoIds.join(',');
  
  return useQuery({
    queryKey: [...queryKeys.prices.simple(ids, vsCurrency), 'realtime'],
    queryFn: () => apiService.getSimplePrice({
      ids,
      vs_currencies: vsCurrency,
      include_24hr_change: true,
    }),
    enabled: cryptoIds.length > 0,
    refetchInterval,
    staleTime: 1000 * 5, // Consider data stale after 5 seconds
    refetchIntervalInBackground: true, // Continue updating in background
  });
};

// Hook for getting historical price data (if needed for charts)
export const useHistoricalPrices = (
  cryptoId: string,
  days: number = 7,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [...queryKeys.cryptos.detail(cryptoId), 'history', days],
    queryFn: async () => {
      // Note: This would require a different endpoint for historical data
      // For now, we'll use the detail endpoint which includes some price history
      return apiService.getCryptocurrencyDetails(cryptoId);
    },
    enabled: !!cryptoId,
    staleTime: 1000 * 60 * 10, // 10 minutes for historical data
    ...options,
  });
};

// Hook for managing favorite conversion pairs
export const useFavoriteConversionPairs = () => {
  const queryClient = useQueryClient();

  const addFavoritePair = useMutation({
    mutationFn: async (pair: { from: string; to: string }) => {
      // This would typically save to AsyncStorage or a backend
      // For now, we'll just simulate the operation
      return { ...pair, id: Date.now().toString() };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.favorites() });
    },
  });

  const removeFavoritePair = useMutation({
    mutationFn: async (pairId: string) => {
      // This would typically remove from AsyncStorage or a backend
      return pairId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.favorites() });
    },
  });

  return {
    addPair: addFavoritePair.mutate,
    removePair: removeFavoritePair.mutate,
    isAddingPair: addFavoritePair.isPending,
    isRemovingPair: removeFavoritePair.isPending,
  };
};