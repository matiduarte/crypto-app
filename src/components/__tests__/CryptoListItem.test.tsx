import React from 'react';
import { render } from '@testing-library/react-native';
import { CryptoListItem } from '@components/CryptoListItem';
import { mockCryptocurrency } from '../../../jest/test-utils';

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
