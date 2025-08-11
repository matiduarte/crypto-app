/**
 * Default filter configurations for cryptocurrency data fetching.
 * Centralized configuration for API parameters and display options.
 */

export const DEFAULT_CRYPTO_FILTER = {
  vs_currency: 'usd',
  order: 'market_cap_desc',
  per_page: 20,
  sparkline: false,
  price_change_percentage: '24h',
} as const;
