import { useQuery } from '@tanstack/react-query';
import apiService from '@services/api';
import { queryKeys } from '@services/queryClient';

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
