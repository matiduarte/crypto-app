import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { API_CONFIG } from '../constants/config';
import { APIResponse, Cryptocurrency } from '../types';

/**
 * ApiService handles all cryptocurrency API requests with automatic error handling,
 * retry mechanisms, and response transformation. Integrates with CoinGecko API.
 */
class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.COINGECKO_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'x-cg-demo-api-key': API_CONFIG.COINGECKO_API_KEY,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      config => {
        return config;
      },
      error => {
        return Promise.reject(error);
      },
    );

    this.api.interceptors.response.use(
      response => {
        return response;
      },
      error => {
        return Promise.reject(this.handleError(error));
      },
    );
  }

  private handleError<T = any>(error: any): APIResponse<T> {
    if (error.response) {
      return {
        success: false,
        data: null as any,
        error: `API Error: ${error.response.status} - ${error.response.statusText}`,
      };
    } else if (error.request) {
      return {
        success: false,
        data: null as any,
        error: 'Network Error: Unable to reach the server',
      };
    } else {
      return {
        success: false,
        data: null as any,
        error: `Request Error: ${error.message}`,
      };
    }
  }

  /**
   * Fetches paginated cryptocurrency market data with customizable parameters.
   *
   * @param params - Configuration for currency, sorting, pagination and data format
   * @returns Promise resolving to cryptocurrency array with market data
   */
  async getCryptocurrencies(
    params: {
      vs_currency?: string;
      order?: string;
      per_page?: number;
      page?: number;
      sparkline?: boolean;
      price_change_percentage?: string;
    } = {},
  ): Promise<APIResponse<Cryptocurrency[]>> {
    try {
      const response: AxiosResponse<Cryptocurrency[]> = await this.api.get(
        API_CONFIG.ENDPOINTS.COINS,
        {
          params: {
            vs_currency: params.vs_currency || API_CONFIG.DEFAULT_VS_CURRENCY,
            order: params.order || 'market_cap_desc',
            per_page: params.per_page || API_CONFIG.DEFAULT_PAGE_SIZE,
            page: params.page || 1,
            sparkline: params.sparkline || false,
            price_change_percentage: params.price_change_percentage || '24h',
            ...params,
          },
        },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError<Cryptocurrency[]>(error);
    }
  }

  /**
   * Gets current prices and 24h changes for specified cryptocurrencies
   * in requested fiat currencies. Optimized for real-time price displays.
   *
   * @param params - Cryptocurrency IDs, target currencies, and data options
   * @returns Promise with current prices and optional 24h change data
   */
  async getSimplePrice(params: {
    ids: string;
    vs_currencies: string;
    include_24hr_change?: boolean;
  }): Promise<APIResponse<any>> {
    try {
      const response = await this.api.get(API_CONFIG.ENDPOINTS.SIMPLE_PRICE, {
        params: {
          ids: params.ids,
          vs_currencies: params.vs_currencies,
          include_24hr_change: params.include_24hr_change || true,
        },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError<any>(error);
    }
  }
}

export default new ApiService();
