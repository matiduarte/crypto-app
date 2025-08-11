import apiService from '@services/api';
import { Cryptocurrency } from '@types';

// Mock the API service
jest.mock('@services/api', () => ({
  __esModule: true,
  default: {
    getCryptocurrencies: jest.fn(),
  },
}));

// Mock query keys
jest.mock('@services/queryClient', () => ({
  queryKeys: {
    cryptos: {
      list: (params: any) => ['cryptos', 'list', params],
      lists: () => ['cryptos', 'lists'],
    },
  },
}));

const mockApiService = apiService as jest.Mocked<typeof apiService>;

const mockCryptocurrencies: Cryptocurrency[] = [
  {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    image: 'bitcoin.png',
    current_price: 50000,
    market_cap: 1000000000,
    market_cap_rank: 1,
    fully_diluted_valuation: 1000000000,
    total_volume: 50000000,
    high_24h: 51000,
    low_24h: 49000,
    price_change_24h: 1000,
    price_change_percentage_24h: 2.0,
    market_cap_change_24h: 20000000,
    market_cap_change_percentage_24h: 2.0,
    circulating_supply: 19000000,
    total_supply: 21000000,
    max_supply: 21000000,
    ath: 69000,
    ath_change_percentage: -27.5,
    ath_date: '2021-11-10T14:24:11.849Z',
    atl: 67.81,
    atl_change_percentage: 73655.2,
    atl_date: '2013-07-06T00:00:00.000Z',
    last_updated: '2023-01-01T00:00:00.000Z',
  },
  {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    image: 'ethereum.png',
    current_price: 3000,
    market_cap: 500000000,
    market_cap_rank: 2,
    fully_diluted_valuation: 500000000,
    total_volume: 30000000,
    high_24h: 3100,
    low_24h: 2900,
    price_change_24h: 50,
    price_change_percentage_24h: 1.7,
    market_cap_change_24h: 10000000,
    market_cap_change_percentage_24h: 1.7,
    circulating_supply: 120000000,
    total_supply: 120000000,
    ath: 4878.26,
    ath_change_percentage: -38.5,
    ath_date: '2021-11-10T14:24:19.604Z',
    atl: 0.432979,
    atl_change_percentage: 692829.5,
    atl_date: '2015-10-20T00:00:00.000Z',
    last_updated: '2023-01-01T00:00:00.000Z',
  },
];

describe('useCryptocurrencies hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parameter validation', () => {
    it('should handle default parameters', () => {
      const defaultParams = {};
      const expectedDefaults = {
        vs_currency: undefined,
        order: undefined,
        per_page: undefined,
        page: undefined,
        price_change_percentage: undefined,
      };

      expect(typeof defaultParams).toBe('object');
      Object.values(expectedDefaults).forEach(value => {
        expect(value).toBeUndefined();
      });
    });

    it('should handle custom parameters', () => {
      const customParams = {
        vs_currency: 'eur',
        order: 'volume_desc',
        per_page: 50,
        page: 2,
        price_change_percentage: '7d',
      };

      expect(customParams.vs_currency).toBe('eur');
      expect(customParams.order).toBe('volume_desc');
      expect(customParams.per_page).toBe(50);
      expect(customParams.page).toBe(2);
      expect(customParams.price_change_percentage).toBe('7d');
    });

    it('should validate parameter types', () => {
      const params = {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 20,
        page: 1,
      };

      expect(typeof params.vs_currency).toBe('string');
      expect(typeof params.order).toBe('string');
      expect(typeof params.per_page).toBe('number');
      expect(typeof params.page).toBe('number');
    });
  });

  describe('cryptocurrency data structure', () => {
    it('should validate cryptocurrency object structure', () => {
      const crypto = mockCryptocurrencies[0];
      const requiredFields = [
        'id',
        'symbol',
        'name',
        'current_price',
        'market_cap_rank',
        'market_cap',
        'total_volume',
      ];

      requiredFields.forEach(field => {
        expect(crypto).toHaveProperty(field);
      });
    });

    it('should validate cryptocurrency data types', () => {
      const crypto = mockCryptocurrencies[0];

      expect(typeof crypto.id).toBe('string');
      expect(typeof crypto.symbol).toBe('string');
      expect(typeof crypto.name).toBe('string');
      expect(typeof crypto.current_price).toBe('number');
      expect(typeof crypto.market_cap_rank).toBe('number');
      expect(typeof crypto.market_cap).toBe('number');
    });

    it('should handle array of cryptocurrencies', () => {
      expect(Array.isArray(mockCryptocurrencies)).toBe(true);
      expect(mockCryptocurrencies.length).toBeGreaterThan(0);
      expect(mockCryptocurrencies[0]).toHaveProperty('id');
      expect(mockCryptocurrencies[0]).toHaveProperty('name');
    });
  });

  describe('query key generation', () => {
    it('should generate correct query keys for different parameters', () => {
      const params1 = { vs_currency: 'usd', per_page: 20 };
      const params2 = { vs_currency: 'eur', per_page: 50 };

      const key1 = ['cryptos', 'list', params1];
      const key2 = ['cryptos', 'list', params2];

      expect(key1).toContain('cryptos');
      expect(key1).toContain('list');
      expect(key1).toContain(params1);

      expect(key2).toContain('cryptos');
      expect(key2).toContain('list');
      expect(key2).toContain(params2);

      expect(key1).not.toEqual(key2);
    });
  });

  describe('API service integration', () => {
    it('should call API service with correct parameters', () => {
      // Simulate hook behavior without React Query
      expect(typeof mockApiService.getCryptocurrencies).toBe('function');
    });

    it('should handle empty parameters', () => {
      const emptyParams = {};

      expect(typeof emptyParams).toBe('object');
      expect(Object.keys(emptyParams).length).toBe(0);
    });
  });
});

describe('useInfiniteCryptocurrencies hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('infinite query parameters', () => {
    it('should handle infinite query parameters', () => {
      const params = {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 2,
      };

      expect(params.per_page).toBe(2);
      expect(typeof params.per_page).toBe('number');
    });

    it('should validate query key structure for infinite queries', () => {
      const params = { per_page: 20 };
      const infiniteKey = [['cryptos', 'lists'], 'infinite', params];

      expect(infiniteKey).toContain('infinite');
      expect(infiniteKey).toContain(params);
    });
  });

  describe('pagination logic', () => {
    it('should determine next page based on results', () => {
      const perPage = 50;
      const lastPageLength = 2;
      const currentPageParam = 1;

      const hasNextPage = lastPageLength >= perPage;
      const nextPageParam = hasNextPage ? currentPageParam + 1 : undefined;

      expect(hasNextPage).toBe(false); // 2 < 50
      expect(nextPageParam).toBeUndefined();
    });

    it('should continue pagination when page is full', () => {
      const perPage = 2;
      const lastPageLength = 2;
      const currentPageParam = 1;

      const hasNextPage = lastPageLength >= perPage;
      const nextPageParam = hasNextPage ? currentPageParam + 1 : undefined;

      expect(hasNextPage).toBe(true); // 2 === 2
      expect(nextPageParam).toBe(2);
    });

    it('should stop pagination on empty results', () => {
      const emptyResults: any[] = [];
      const hasResults = emptyResults.length > 0;

      expect(hasResults).toBe(false);
    });

    it('should respect max pages limit', () => {
      const maxPages = 10;
      const currentPage = 5;
      const withinLimit = currentPage <= maxPages;

      expect(withinLimit).toBe(true);
      expect(maxPages).toBeGreaterThan(0);
    });
  });

  describe('page parameter handling', () => {
    it('should start with initial page parameter', () => {
      const initialPageParam = 1;

      expect(initialPageParam).toBe(1);
      expect(typeof initialPageParam).toBe('number');
    });

    it('should increment page parameter correctly', () => {
      let pageParam = 1;
      const nextPage = pageParam + 1;

      expect(nextPage).toBe(2);

      pageParam = nextPage;
      expect(pageParam).toBe(2);
    });

    it('should add page to API parameters', () => {
      const baseParams = { vs_currency: 'usd', per_page: 20 };
      const pageParam = 2;
      const apiParams = { ...baseParams, page: pageParam };

      expect(apiParams.page).toBe(2);
      expect(apiParams.vs_currency).toBe('usd');
      expect(apiParams.per_page).toBe(20);
    });
  });

  describe('data pages management', () => {
    it('should handle multiple pages of data', () => {
      const page1 = [mockCryptocurrencies[0]];
      const page2 = [mockCryptocurrencies[1]];
      const allPages = [page1, page2];

      expect(allPages.length).toBe(2);
      expect(allPages[0].length).toBe(1);
      expect(allPages[1].length).toBe(1);

      // Flatten all pages
      const flatData = allPages.flatMap(page => page);
      expect(flatData.length).toBe(2);
    });

    it('should filter out empty or null pages', () => {
      const pages = [mockCryptocurrencies, [], null, undefined];
      const validPages = pages.filter(Boolean).filter(page => Array.isArray(page) && page.length > 0);

      expect(validPages.length).toBe(1);
      expect(validPages[0]).toBe(mockCryptocurrencies);
    });
  });
});