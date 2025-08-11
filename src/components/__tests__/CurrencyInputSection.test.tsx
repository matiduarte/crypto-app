import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CurrencyInputSection } from '@components/CurrencyInputSection';

const defaultProps = {
  label: 'From' as const,
  amount: '123.45',
  onAmountChange: jest.fn(),
  currency: { symbol: '$', name: 'USD' },
  onCurrencySelect: jest.fn(),
  isReadOnly: false,
  placeholder: 'Enter amount',
};

describe('CurrencyInputSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders label, amount input, and currency selector', () => {
    const { getByText, getByPlaceholderText } = render(
      <CurrencyInputSection {...defaultProps} />,
    );

    expect(getByText(defaultProps.label)).toBeTruthy();

    const input = getByPlaceholderText(defaultProps.placeholder);
    expect(input.props.value).toBe(defaultProps.amount);
    expect(input.props.editable).toBe(true);

    expect(getByText(defaultProps.currency.symbol)).toBeTruthy();
    expect(getByText(defaultProps.currency.name)).toBeTruthy();
  });

  it('calls onAmountChange when text input changes', () => {
    const { getByPlaceholderText } = render(
      <CurrencyInputSection {...defaultProps} />,
    );
    const input = getByPlaceholderText(defaultProps.placeholder);

    fireEvent.changeText(input, '999');
    expect(defaultProps.onAmountChange).toHaveBeenCalledWith('999');
  });

  it('calls onCurrencySelect when currency selector button is pressed', () => {
    const { getByText } = render(<CurrencyInputSection {...defaultProps} />);
    const button = getByText(defaultProps.currency.symbol).parent;

    // the Button wraps currencySymbol + currencyName + icon,
    // so we access its parent to simulate press on the whole button
    fireEvent.press(button!);
    expect(defaultProps.onCurrencySelect).toHaveBeenCalled();
  });
});
