import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { FixedScreen } from '../../components/common/ScreenWrapper';
import { useCryptocurrencies } from '../../hooks/useCryptocurrencies';
import { useCryptoStackNavigation } from '../../navigation/hooks';
import { formatPriceUSD, formatPercentage, searchCryptos } from '../../utils/helpers';
import { Cryptocurrency } from '../../types';

// CryptoListItem Component Interface
interface CryptoListItemProps {
  item: Cryptocurrency;
  onPress: (crypto: Cryptocurrency) => void;
}

// Item Separator Component
const ItemSeparator: React.FC = () => <View style={styles.separator} />;

// Move CryptoListItem outside of render to avoid re-creation
const CryptoListItem: React.FC<CryptoListItemProps> = React.memo(
  ({ item, onPress }) => {
    const isPositive = item.price_change_percentage_24h >= 0;
    const changeColor = isPositive ? '#4CAF50' : '#f44336';

    return (
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => onPress(item)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${item.name} cryptocurrency details`}
      >
        <View style={styles.itemLeft}>
          <Image source={{ uri: item.image }} style={styles.cryptoImage} />
          <View style={styles.cryptoInfo}>
            <Text style={styles.cryptoName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.cryptoSymbol} numberOfLines={1}>
              {item.symbol.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.itemRight}>
          <Text style={styles.cryptoPrice}>
            {formatPriceUSD(item.current_price)}
          </Text>
          <Text style={[styles.cryptoChange, { color: changeColor }]}>
            {formatPercentage(item.price_change_percentage_24h)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  },
);

export const CryptoListScreen: React.FC = () => {
  const navigation = useCryptoStackNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  // Use React Query hook for cryptocurrency data
  const {
    data: cryptoResponse,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useCryptocurrencies({
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page: 50,
    page: 1,
    sparkline: false,
    price_change_percentage: '24h',
  });

  // Get the base crypto data
  const baseCryptoData = useMemo(() => {
    return cryptoResponse?.success ? cryptoResponse.data : [];
  }, [cryptoResponse]);

  // Filter crypto data based on search query (in memory)
  const cryptoData = useMemo(() => {
    if (searchQuery.trim().length > 0) {
      return searchCryptos(baseCryptoData, searchQuery.trim());
    }
    return baseCryptoData;
  }, [baseCryptoData, searchQuery]);

  const handleItemPress = useCallback(
    (crypto: Cryptocurrency) => {
      navigation.navigate('CryptoDetail', {
        cryptoId: crypto.id,
        symbol: crypto.symbol,
      });
    },
    [navigation],
  );

  const handleRefresh = useCallback(() => {
    // Always refetch the main data, don't clear search
    refetch();
  }, [refetch]);

  const renderItem = useCallback(
    ({ item }: { item: Cryptocurrency }) => (
      <CryptoListItem item={item} onPress={handleItemPress} />
    ),
    [handleItemPress],
  );

  const keyExtractor = useCallback((item: Cryptocurrency) => item.id, []);

  // Memoize empty component to avoid re-creation
  const EmptyComponent = useMemo(() => {
    if (isLoading) {
      return null;
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>📊</Text>
        <Text style={styles.emptyTitle}>No Data Available</Text>
        <Text style={styles.emptySubtext}>
          Unable to load cryptocurrency data. Pull down to refresh.
        </Text>
      </View>
    );
  }, [isLoading]);

  const renderLoadingState = () => {
    if (!isLoading) return null;

    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Loading cryptocurrencies...</Text>
      </View>
    );
  };

  const renderErrorState = () => {
    if (!error || isLoading) return null;

    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorTitle}>Unable to Load Data</Text>
        <Text style={styles.errorSubtext}>
          Please check your internet connection and try again.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={handleRefresh}
          activeOpacity={0.7}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Clear search functionality
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Handle search input change
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  // Empty search results component
  const renderEmptySearch = useCallback(() => {
    if (searchQuery.trim().length === 0 || isLoading) {
      return null;
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>🔍</Text>
        <Text style={styles.emptyTitle}>No Results Found</Text>
        <Text style={styles.emptySubtext}>
          No cryptocurrencies match "{searchQuery}". Try a different search term.
        </Text>
        <TouchableOpacity style={styles.clearSearchButton} onPress={handleClearSearch}>
          <Text style={styles.clearSearchText}>Clear Search</Text>
        </TouchableOpacity>
      </View>
    );
  }, [searchQuery, isLoading, handleClearSearch]);

  return (
    <FixedScreen>
      <View style={styles.container}>
        {/* Search Header */}
        <View style={styles.searchHeader}>
          <Text style={styles.title}>🍋 Cryptocurrency Market</Text>
          <Text style={styles.subtitle}>
            {searchQuery ? `Search results for "${searchQuery}"` : 'Live USD prices and 24h changes'}
          </Text>
          
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search cryptocurrencies..."
              placeholderTextColor="#9e9e9e"
              value={searchQuery}
              onChangeText={handleSearchChange}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              clearButtonMode="while-editing" // iOS only
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearSearch}
                accessibilityLabel="Clear search"
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {renderLoadingState()}
        {renderErrorState()}

        {!isLoading && !error && cryptoData.length === 0 && renderEmptySearch()}

        {!isLoading && !error && cryptoData.length > 0 && (
          <FlatList
            data={cryptoData}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            style={styles.list}
            contentContainerStyle={[
              styles.listContent,
              cryptoData.length === 0 && styles.listContentEmpty,
            ]}
            refreshControl={
              <RefreshControl
                refreshing={isFetching}
                onRefresh={handleRefresh}
                colors={['#FFD700']} // Android
                tintColor="#FFD700" // iOS
              />
            }
            ListEmptyComponent={EmptyComponent}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={ItemSeparator}
            getItemLayout={(_data, index) => ({
              length: 72, // Fixed item height
              offset: 72 * index,
              index,
            })}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            windowSize={10}
          />
        )}
      </View>
    </FixedScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  // Search Header
  searchHeader: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#6c757d',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: 'bold',
  },
  clearSearchButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  clearSearchText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  // List Styles
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  listContentEmpty: {
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#f1f3f4',
    marginHorizontal: 20,
  },
  // List Item Styles
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    minHeight: 72,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cryptoImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  cryptoInfo: {
    flex: 1,
  },
  cryptoName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  cryptoSymbol: {
    fontSize: 13,
    color: '#6c757d',
    textTransform: 'uppercase',
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  cryptoPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  cryptoChange: {
    fontSize: 13,
    fontWeight: '500',
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
});
