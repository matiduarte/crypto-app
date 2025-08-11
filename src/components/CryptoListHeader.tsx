import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button, CustomIcon, SearchInput } from '@components';
import { colors } from '@constants/colors';
import { Cryptocurrency } from '@types';

interface CryptoListHeaderProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onClearSearch: () => void;
  onSortPress: () => void;
  sortBy: keyof Cryptocurrency;
  sortOrder: 'asc' | 'desc';
  sortOptions: Array<{ key: keyof Cryptocurrency; iconName: string }>;
}

/**
 * CryptoListHeader provides the header section for cryptocurrency list screens.
 */
export const CryptoListHeader: React.FC<CryptoListHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onClearSearch,
  onSortPress,
  sortBy,
  sortOrder,
  sortOptions,
}) => {
  const getCurrentSortIcon = () => {
    const sortOption = sortOptions.find(opt => opt.key === sortBy);
    return sortOption?.iconName || 'show-chart';
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <CustomIcon name="currency-bitcoin" size={24} color={colors.crypto} />
        <Text style={styles.title}>Cryptocurrency Market</Text>
      </View>

      <Text style={styles.subtitle}>
        {searchQuery
          ? `Search results for "${searchQuery}"`
          : 'Live USD prices and 24h changes'}
      </Text>

      <View style={styles.controlsRow}>
        <SearchInput
          value={searchQuery}
          onChangeText={onSearchChange}
          onClear={onClearSearch}
          placeholder="Search cryptocurrencies..."
        />

        <Button
          style={styles.sortButton}
          onPress={onSortPress}
          accessibilityLabel="Sort options"
        >
          <CustomIcon
            name={getCurrentSortIcon()}
            size={18}
            color={colors.textSecondary}
          />
          <CustomIcon
            name={
              sortOrder === 'asc' ? 'keyboard-arrow-up' : 'keyboard-arrow-down'
            }
            size={18}
            color={colors.textSecondary}
          />
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 60,
    justifyContent: 'center',
  },
});
