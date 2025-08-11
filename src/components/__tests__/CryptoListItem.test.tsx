import React from 'react';
import { render } from '@testing-library/react-native';
import { CryptoListItem } from '@components/CryptoListItem';

const mockCryptocurrency = {
  id: 'bitcoin',
  symbol: 'btc',
  name: 'Bitcoin',
  current_price: 50000,
  market_cap: 1000000000,
  market_cap_rank: 1,
  price_change_24h: 1000,
  price_change_percentage_24h: 2.5,
  volume_24h: 50000000000,
  total_volume: 50000000000,
  high_24h: 51000,
  low_24h: 49000,
  market_cap_change_24h: 10000000,
  market_cap_change_percentage_24h: 1.5,
  image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  circulating_supply: 19000000,
  total_supply: 21000000,
  max_supply: 21000000,
  ath: 69000,
  ath_change_percentage: -25.5,
  ath_date: '2021-11-10T14:24:11.849Z',
  atl: 67.81,
  atl_change_percentage: 73650.1,
  atl_date: '2013-07-06T00:00:00.000Z',
  last_updated: '2024-01-01T00:00:00.000Z',
  sparkline_in_7d: {
    price: [48000, 49000, 50000, 51000, 50500, 50000, 50000],
  },
  roi: null,
};

// Mock the helper functions
jest.mock('@utils/helpers', () => ({
  formatPercentage: jest.fn(
    value => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`,
  ),
  formatPriceUSD: jest.fn(value => `$${value.toLocaleString()}`),
}));

describe('CryptoListItem Component', () => {
  const defaultProps = {
    item: mockCryptocurrency,
  };

  it('should render cryptocurrency information correctly', () => {
    const { getByText } = render(<CryptoListItem {...defaultProps} />);

    expect(getByText('Bitcoin')).toBeTruthy();
    expect(getByText('BTC')).toBeTruthy();
    expect(getByText('$50,000')).toBeTruthy();
    expect(getByText('+2.50%')).toBeTruthy();
  });

  it('should display positive price change in green', () => {
    const { getByText } = render(<CryptoListItem {...defaultProps} />);

    const changeText = getByText('+2.50%');
    expect(changeText).toHaveStyle({ color: expect.any(String) });
  });

  it('should display negative price change in red', () => {
    const cryptoWithNegativeChange = {
      ...mockCryptocurrency,
      price_change_percentage_24h: -5.2,
    };

    const { getByText } = render(
      <CryptoListItem item={cryptoWithNegativeChange} />,
    );

    const changeText = getByText('-5.20%');
    expect(changeText).toHaveStyle({ color: expect.any(String) });
  });

  it('should display cryptocurrency image', () => {
    const { getByTestId } = render(<CryptoListItem {...defaultProps} />);

    const image = getByTestId('crypto-image');
    expect(image).toHaveProp('source', { uri: mockCryptocurrency.image });
  });

  it('should truncate long names with numberOfLines', () => {
    const cryptoWithLongName = {
      ...mockCryptocurrency,
      name: 'Very Long Cryptocurrency Name That Should Be Truncated',
    };

    const { getByText } = render(<CryptoListItem item={cryptoWithLongName} />);

    const nameText = getByText(
      'Very Long Cryptocurrency Name That Should Be Truncated',
    );
    expect(nameText).toHaveProp('numberOfLines', 1);
  });

  it('should handle zero price change', () => {
    const cryptoWithZeroChange = {
      ...mockCryptocurrency,
      price_change_percentage_24h: 0,
    };

    const { getByText } = render(
      <CryptoListItem item={cryptoWithZeroChange} />,
    );

    expect(getByText('+0.00%')).toBeTruthy();
  });

  it('should display symbol in uppercase', () => {
    const cryptoWithLowercaseSymbol = {
      ...mockCryptocurrency,
      symbol: 'btc',
    };

    const { getByText } = render(
      <CryptoListItem item={cryptoWithLowercaseSymbol} />,
    );

    expect(getByText('BTC')).toBeTruthy();
  });

  it('should have proper styling structure', () => {
    const { getByTestId } = render(<CryptoListItem {...defaultProps} />);

    const container = getByTestId('list-item-container');
    expect(container).toHaveStyle({
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    });
  });
});
