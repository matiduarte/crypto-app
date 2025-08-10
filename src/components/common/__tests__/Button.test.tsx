import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button Component', () => {
  it('should render correctly with text', () => {
    const { getByText } = render(
      <Button>
        <Text>Test Button</Text>
      </Button>
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should handle press events', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button onPress={mockOnPress}>
        <Text>Press Me</Text>
      </Button>
    );

    fireEvent.press(getByText('Press Me'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <Button onPress={mockOnPress} disabled testID="disabled-button">
        <Text>Disabled Button</Text>
      </Button>
    );

    const button = getByTestId('disabled-button');
    fireEvent.press(button);
    
    // Press event should not trigger onPress when disabled
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should apply custom styles', () => {
    const customStyle = { backgroundColor: 'red', padding: 20 };
    const { getByTestId } = render(
      <Button style={customStyle} testID="styled-button">
        <Text>Styled Button</Text>
      </Button>
    );

    const button = getByTestId('styled-button');
    expect(button).toHaveStyle(customStyle);
  });

  it('should have correct accessibility props', () => {
    const { getByTestId } = render(
      <Button accessibilityLabel="Custom button" testID="accessible-button">
        <Text>Accessible Button</Text>
      </Button>
    );

    const button = getByTestId('accessible-button');
    expect(button).toHaveProp('accessibilityLabel', 'Custom button');
  });

  it('should be touchable component', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <Button onPress={mockOnPress} testID="touchable-button">
        <Text>Touchable Button</Text>
      </Button>
    );

    const button = getByTestId('touchable-button');
    expect(button).toBeTruthy();
    
    // Test that it's actually pressable
    fireEvent.press(button);
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});