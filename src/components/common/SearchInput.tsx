import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { CustomIcon } from './CustomIcon';
import { Button } from './Button';
import { colors } from '../../constants/colors';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  style?: object;
  inputStyle?: object;
  showClearButton?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeText,
  placeholder = "Search...",
  onClear,
  style,
  inputStyle,
  showClearButton = true,
}) => (
  <View style={[styles.searchContainer, style]}>
    <CustomIcon name="search" size={24} color={colors.textTertiary} />
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
      >
        <CustomIcon name="close" size={24} color={colors.textTertiary} />
      </Button>
    )}
  </View>
);

const styles = StyleSheet.create({
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
});