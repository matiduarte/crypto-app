import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { API_CONFIG } from '../constants/config';
import { APIResponse, Cryptocurrency } from '../types';

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
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('API Response Error:', error);
        
        if (error.response) {
          // Server responded with error status
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
        } else if (error.request) {
          // Request was made but no response received
          console.error('No response received:', error.request);
        } else {
          // Something else happened
          console.error('Request setup error:', error.message);
        }

        return Promise.reject(this.handleError(error));
      }
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

  // Get cryptocurrencies with pagination
  async getCryptocurrencies(params: {
    vs_currency?: string;
    order?: string;
    per_page?: number;
    page?: number;
    sparkline?: boolean;
    price_change_percentage?: string;
  } = {}): Promise<APIResponse<Cryptocurrency[]>> {
    try {
      const response: AxiosResponse<Cryptocurrency[]> = await this.api.get(API_CONFIG.ENDPOINTS.COINS, {
        params: {
          vs_currency: params.vs_currency || API_CONFIG.DEFAULT_VS_CURRENCY,
          order: params.order || 'market_cap_desc',
          per_page: params.per_page || API_CONFIG.DEFAULT_PAGE_SIZE,
          page: params.page || 1,
          sparkline: params.sparkline || false,
          price_change_percentage: params.price_change_percentage || '24h',
          ...params,
        },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError<Cryptocurrency[]>(error);
    }
  }

  // Get cryptocurrency details by ID
  async getCryptocurrencyDetails(id: string): Promise<APIResponse<any>> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.COIN_DETAIL.replace('{id}', id);
      const response = await this.api.get(endpoint, {
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: true,
          developer_data: false,
          sparkline: true,
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

  // Search cryptocurrencies
  async searchCryptocurrencies(query: string): Promise<APIResponse<any>> {
    try {
      const response = await this.api.get(API_CONFIG.ENDPOINTS.SEARCH, {
        params: { query },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError<any>(error);
    }
  }

  // Get simple price for conversion
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

  // Get exchange rates
  async getExchangeRates(): Promise<APIResponse<any>> {
    try {
      const response = await this.api.get(API_CONFIG.ENDPOINTS.EXCHANGE_RATES);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError<any>(error);
    }
  }

  // Retry mechanism for failed requests
  async retryRequest<T>(
    requestFn: () => Promise<APIResponse<T>>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<APIResponse<T>> {
    let lastError: APIResponse<T>;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const result = await requestFn();
        if (result.success) {
          return result;
        }
        lastError = result;
      } catch (error) {
        lastError = this.handleError<T>(error);
      }

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }

    return lastError!;
  }
}

export default new ApiService();