import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { SearchInput } from '../SearchInput';

describe('SearchInput Component', () => {
  const defaultProps = {
    value: '',
    onChangeText: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly with default props', () => {
    const { getByPlaceholderText, getByTestId } = render(
      <SearchInput {...defaultProps} />
    );

    expect(getByPlaceholderText('Search...')).toBeTruthy();
    // Should show search icon
    expect(getByTestId('search-icon')).toBeTruthy();
  });

  it('should render with custom placeholder', () => {
    const { getByPlaceholderText } = render(
      <SearchInput {...defaultProps} placeholder="Search cryptocurrencies..." />
    );

    expect(getByPlaceholderText('Search cryptocurrencies...')).toBeTruthy();
  });

  it('should call onChangeText when text changes', () => {
    const mockOnChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchInput value="" onChangeText={mockOnChangeText} />
    );

    const input = getByPlaceholderText('Search...');
    fireEvent.changeText(input, 'bitcoin');

    expect(mockOnChangeText).toHaveBeenCalledWith('bitcoin');
  });

  it('should show clear button when value exists', () => {
    const { getByTestId } = render(
      <SearchInput {...defaultProps} value="bitcoin" />
    );

    expect(getByTestId('clear-button')).toBeTruthy();
  });

  it('should hide clear button when value is empty', () => {
    const { queryByTestId } = render(
      <SearchInput {...defaultProps} value="" />
    );

    expect(queryByTestId('clear-button')).toBeNull();
  });

  it('should call onClear when clear button is pressed', () => {
    const mockOnClear = jest.fn();
    const { getByTestId } = render(
      <SearchInput {...defaultProps} value="bitcoin" onClear={mockOnClear} />
    );

    const clearButton = getByTestId('clear-button');
    fireEvent.press(clearButton);

    expect(mockOnClear).toHaveBeenCalledTimes(1);
  });

  it('should not show clear button when showClearButton is false', () => {
    const { queryByTestId } = render(
      <SearchInput 
        {...defaultProps} 
        value="bitcoin" 
        showClearButton={false} 
      />
    );

    expect(queryByTestId('clear-button')).toBeNull();
  });

  it('should apply custom styles', () => {
    const customStyle = { backgroundColor: 'blue' };
    const { getByTestId } = render(
      <SearchInput 
        {...defaultProps} 
        style={customStyle}
        testID="search-input-container" 
      />
    );

    const container = getByTestId('search-input-container');
    expect(container).toHaveStyle(customStyle);
  });

  it('should have correct text input properties', () => {
    const { getByPlaceholderText } = render(
      <SearchInput {...defaultProps} />
    );

    const input = getByPlaceholderText('Search...');
    expect(input).toHaveProp('autoCapitalize', 'none');
    expect(input).toHaveProp('autoCorrect', false);
    expect(input).toHaveProp('returnKeyType', 'search');
  });
});