import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@services/api';
import { queryKeys } from '@services/queryClient';
import { ConversionResult } from '@types';

/**
 * Provides currency conversion functionality with live exchange rates.
 * Handles crypto-to-fiat and fiat-to-crypto conversions with error handling
 * and automatic cache invalidation for fresh price data.
 */
export const useCurrencyConversion = () => {
  const queryClient = useQueryClient();

  const convertCurrency = useMutation({
    mutationFn: async (params: {
      fromCurrency: string;
      toCurrency: string;
      amount: number;
    }) => {
      const { fromCurrency, toCurrency, amount } = params;

      const priceData = await apiService.getSimplePrice({
        ids: fromCurrency,
        vs_currencies: toCurrency,
        include_24hr_change: true,
      });

      if (!priceData) {
        throw new Error('Failed to get conversion rate');
      }

      const rate = priceData[fromCurrency]?.[toCurrency];
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

/**
 * Provides real-time cryptocurrency price updates with configurable refresh intervals.
 * Automatically refetches prices in the background and handles multiple cryptocurrencies.
 * 
 * @param cryptoIds - Array of cryptocurrency IDs to track
 * @param vsCurrency - Target currency for price conversion (default: 'usd')
 * @param refetchInterval - Refresh interval in milliseconds (default: 30000)
 */
export const useRealTimePrices = (
  cryptoIds: string[],
  vsCurrency: string = 'usd',
  refetchInterval: number = 30000,
) => {
  const ids = cryptoIds.join(',');

  return useQuery({
    queryKey: [...queryKeys.prices.simple(ids, vsCurrency), 'realtime'],
    queryFn: () =>
      apiService.getSimplePrice({
        ids,
        vs_currencies: vsCurrency,
        include_24hr_change: true,
      }),
    enabled: cryptoIds.length > 0,
    refetchInterval,
    staleTime: 1000 * 5,
    refetchIntervalInBackground: true,
  });
};
