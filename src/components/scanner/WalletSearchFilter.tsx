import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { CustomIcon } from '../common/CustomIcon';

interface WalletSearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterType: 'all' | 'bitcoin' | 'ethereum' | 'favorites';
  onFilterChange: (filter: 'all' | 'bitcoin' | 'ethereum' | 'favorites') => void;
  walletsCount: number;
}

export const WalletSearchFilter: React.FC<WalletSearchFilterProps> = ({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterChange,
  walletsCount,
}) => {
  const filterOptions = [
    { key: 'all', label: 'All', icon: '💼', color: '#6c757d' },
    { key: 'favorites', label: 'Favorites', icon: '⭐', color: '#ffc107' },
    { key: 'bitcoin', label: 'Bitcoin', icon: '₿', color: '#f7931a' },
    { key: 'ethereum', label: 'Ethereum', icon: 'Ξ', color: '#627eea' },
  ] as const;

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <CustomIcon name="search" size={20} color="#9e9e9e" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search wallets..."
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholderTextColor="#9e9e9e"
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => onSearchChange('')}
            style={styles.clearButton}
          >
            <CustomIcon name="clear" size={20} color="#9e9e9e" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.filterTab,
              filterType === option.key && styles.activeFilterTab,
            ]}
            onPress={() => onFilterChange(option.key)}
            activeOpacity={0.7}
          >
            <Text style={styles.filterIcon}>{option.icon}</Text>
            <Text
              style={[
                styles.filterText,
                filterType === option.key && styles.activeFilterText,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {walletsCount} {walletsCount === 1 ? 'wallet' : 'wallets'} found
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  clearButton: {
    padding: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  activeFilterTab: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
  },
  activeFilterText: {
    color: '#ffffff',
  },
  resultsContainer: {
    alignItems: 'center',
  },
  resultsText: {
    fontSize: 14,
    color: '#9e9e9e',
    fontWeight: '500',
  },
});