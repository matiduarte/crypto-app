import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import apiService from '../services/api';
import { queryKeys } from '../services/queryClient';
import { ConversionResult } from '../types';



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
  refetchInterval: number = 30000, // 30 seconds
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
    staleTime: 1000 * 5, // Consider data stale after 5 seconds
    refetchIntervalInBackground: true, // Continue updating in background
  });
};

