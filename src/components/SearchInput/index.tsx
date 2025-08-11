import React from 'react';
import { View, TextInput } from 'react-native';

import { colors } from '@constants/colors';
import { styles } from './styles';
import { CustomIcon } from '@components/CustomIcon';
import { Button } from '@components/Button';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  style?: object;
  inputStyle?: object;
  showClearButton?: boolean;
  testID?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  onClear,
  style,
  inputStyle,
  showClearButton = true,
}) => (
  <View style={[styles.searchContainer, style]} testID="search-input-container">
    <CustomIcon
      name="search"
      size={24}
      color={colors.textTertiary}
      testID="search-icon"
    />
    <TextInput
      style={[styles.searchInput, inputStyle]}
      placeholder={placeholder}
      placeholderTextColor={colors.textTertiary}
      value={value}
      onChangeText={onChangeText}
      autoCapitalize="none"
      autoCorrect={false}
      returnKeyType="search"
    />
    {showClearButton && value.length > 0 && (
      <Button
        style={styles.clearButton}
        onPress={onClear}
        accessibilityLabel="Clear search"
        testID="clear-button"
      >
        <CustomIcon name="close" size={24} color={colors.textTertiary} />
      </Button>
    )}
  </View>
);
