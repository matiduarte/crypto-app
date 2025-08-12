// Mock react-native-config first
jest.mock('react-native-config', () => ({
  default: {
    COINGECKO_API_KEY: 'test-api-key',
    WEB_CLIENT_ID: 'test-web-client-id',
    IOS_CLIENT_ID: 'test-ios-client-id',
  },
}));

import { AxiosError } from 'axios';
import apiService from '../api';

// Mock the actual API instance
const mockApiInstance = {
  get: jest.fn(),
};

// Replace the api instance with our mock
(apiService as any).api = mockApiInstance;

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCryptocurrencies', () => {
    it('returns successful response with valid data', async () => {
      const mockResponse = {
        data: [
          {
            id: 'bitcoin',
            symbol: 'btc',
            name: 'Bitcoin',
            current_price: 50000,
            market_cap_rank: 1,
          },
        ],
      };

      mockApiInstance.get.mockResolvedValue(mockResponse);

      const result = await apiService.getCryptocurrencies();

      expect(result).toEqual(mockResponse.data);

      expect(mockApiInstance.get).toHaveBeenCalledWith('/coins/markets', {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 50,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h',
        },
      });
    });

    it('uses custom parameters correctly', async () => {
      const mockResponse = { data: [] };
      mockApiInstance.get.mockResolvedValue(mockResponse);

      await apiService.getCryptocurrencies({
        vs_currency: 'eur',
        order: 'volume_desc',
        per_page: 100,
        page: 2,
        sparkline: true,
        price_change_percentage: '7d',
      });

      expect(mockApiInstance.get).toHaveBeenCalledWith('/coins/markets', {
        params: {
          vs_currency: 'eur',
          order: 'volume_desc',
          per_page: 100,
          page: 2,
          sparkline: true,
          price_change_percentage: '7d',
        },
      });
    });

    it('should throw an error when the API call fails', async () => {
      const error = new Error('Network error');
      mockApiInstance.get.mockRejectedValue(error);
      await expect(apiService.getCryptocurrencies()).rejects.toThrow(
        'Network error',
      );
    });

    it('should throw an Axios error with response', async () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 500, data: 'Internal Server Error' },
        message: 'Request failed with status code 500',
      } as AxiosError;

      mockApiInstance.get.mockRejectedValue(axiosError);

      await expect(apiService.getCryptocurrencies({})).rejects.toMatchObject({
        isAxiosError: true,
        message: 'Request failed with status code 500',
      });
    });
  });

  describe('getSimplePrice', () => {
    it('returns price data successfully', async () => {
      const mockResponse = {
        data: {
          bitcoin: { usd: 50000, usd_24h_change: 2.5 },
          ethereum: { usd: 3000, usd_24h_change: -1.2 },
        },
      };

      mockApiInstance.get.mockResolvedValue(mockResponse);

      const result = await apiService.getSimplePrice({
        ids: 'bitcoin,ethereum',
        vs_currencies: 'usd',
        include_24hr_change: true,
      });

      expect(result).toEqual(mockResponse.data);

      expect(mockApiInstance.get).toHaveBeenCalledWith('/simple/price', {
        params: {
          ids: 'bitcoin,ethereum',
          vs_currencies: 'usd',
          include_24hr_change: true,
        },
      });
    });

    it('uses default include_24hr_change parameter', async () => {
      const mockResponse = { data: {} };
      mockApiInstance.get.mockResolvedValue(mockResponse);

      await apiService.getSimplePrice({
        ids: 'bitcoin',
        vs_currencies: 'usd',
      });

      expect(mockApiInstance.get).toHaveBeenCalledWith('/simple/price', {
        params: {
          ids: 'bitcoin',
          vs_currencies: 'usd',
          include_24hr_change: true,
        },
      });
    });

    it('handles errors in price fetching', async () => {
      const internalServerError = {
        isAxiosError: true,
        response: { status: 500, data: 'Internal Server Error' },
        message: 'Request failed with status code 500',
      } as AxiosError;

      mockApiInstance.get.mockRejectedValue(internalServerError);

      await expect(
        apiService.getSimplePrice({
          ids: 'bitcoin',
          vs_currencies: 'usd',
        }),
      ).rejects.toMatchObject({
        isAxiosError: true,
        response: { status: 500 },
        message: 'Request failed with status code 500',
      });
    });

    it('handles empty response gracefully', async () => {
      const mockResponse = { data: {} };
      mockApiInstance.get.mockResolvedValue(mockResponse);

      const result = await apiService.getSimplePrice({
        ids: 'nonexistent-coin',
        vs_currencies: 'usd',
      });

      expect(result).toEqual({});
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should throw an error for rate limiting (status 429)', async () => {
      const rateLimitError = {
        isAxiosError: true,
        response: { status: 429, data: 'Too Many Requests' },
        message: 'Request failed with status code 429',
      } as AxiosError;

      mockApiInstance.get.mockRejectedValue(rateLimitError);

      await expect(apiService.getCryptocurrencies({})).rejects.toMatchObject({
        isAxiosError: true,
        response: { status: 429 },
        message: 'Request failed with status code 429',
      });
    });
    it('handles authentication errors', async () => {
      const unauthorizedError = {
        isAxiosError: true,
        response: { status: 401, data: 'Unauthorized' },
        message: 'Request failed with status code 401',
      } as AxiosError;

      mockApiInstance.get.mockRejectedValue(unauthorizedError);

      await expect(apiService.getCryptocurrencies({})).rejects.toMatchObject({
        isAxiosError: true,
        response: { status: 401 },
        message: 'Request failed with status code 401',
      });
    });

    it('handles timeout errors', async () => {
      const timeoutError = {
        isAxiosError: true,
        code: 'ECONNABORTED',
        message: 'timeout of 10000ms exceeded',
      } as AxiosError;

      mockApiInstance.get.mockRejectedValue(timeoutError);

      await expect(apiService.getCryptocurrencies({})).rejects.toMatchObject({
        isAxiosError: true,
        code: 'ECONNABORTED',
        message: 'timeout of 10000ms exceeded',
      });
    });
  });
});
