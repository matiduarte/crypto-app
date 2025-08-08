import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { FixedScreen } from '../../components/common/ScreenWrapper';
import { useInfiniteCryptocurrencies } from '../../hooks/useCryptocurrencies';
import { debounce, searchCryptos, sortCryptos } from '../../utils/helpers';
import { Cryptocurrency } from '../../types';
import { Button, CryptoListItem, CustomIcon } from '../../components/common';

// Item Separator Component
const ItemSeparator: React.FC = () => <View style={styles.separator} />;

// Skeleton Loader Component
const SkeletonLoader: React.FC = () => (
  <View style={styles.skeletonContainer}>
    {Array.from({ length: 8 }).map((_, index) => (
      <View key={index} style={styles.skeletonItem}>
        <View style={styles.skeletonLeft}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonTextContainer}>
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonSubtitle} />
          </View>
        </View>
        <View style={styles.skeletonRight}>
          <View style={styles.skeletonPrice} />
          <View style={styles.skeletonChange} />
        </View>
      </View>
    ))}
  </View>
);

// Sort options type
type SortOption = {
  key: keyof Cryptocurrency;
  label: string;
  icon: string;
};

const SORT_OPTIONS: SortOption[] = [
  { key: 'market_cap_rank', label: 'Market Cap', icon: '📊' },
  { key: 'current_price', label: 'Price', icon: '💰' },
  { key: 'price_change_percentage_24h', label: '24h Change', icon: '📈' },
  { key: 'name', label: 'Name', icon: '🔤' },
];

export const CryptoListScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<keyof Cryptocurrency>('market_cap_rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showSortModal, setShowSortModal] = useState(false);

  // Use React Query hook for infinite cryptocurrency data
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useInfiniteCryptocurrencies({
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page: 20, // Smaller pages for better infinite scroll
    sparkline: false,
    price_change_percentage: '24h',
  });

  // Get the base crypto data from all pages
  const baseCryptoData = useMemo(() => {
    if (!infiniteData?.pages) return [];

    return infiniteData.pages
      .filter(page => page.success)
      .flatMap(page => page.data)
      .filter(Boolean);
  }, [infiniteData]);

  // Filter and sort crypto data based on search query and sort options (in memory)
  const cryptoData = useMemo(() => {
    let filteredData = baseCryptoData;

    // Apply search filter if query exists
    if (searchQuery.trim().length > 0) {
      filteredData = searchCryptos(baseCryptoData, searchQuery.trim());
    }

    // Apply sorting
    return sortCryptos(filteredData, sortBy, sortOrder);
  }, [baseCryptoData, searchQuery, sortBy, sortOrder]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Prevent user from triggering multiple fetches
  const debouncedRefetch = debounce(() => refetch(), 1000);

  const renderItem = ({ item }: { item: Cryptocurrency }) => (
    <CryptoListItem item={item} />
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

    return <SkeletonLoader />;
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
        <Button
          style={styles.retryButton}
          onPress={handleRefresh}
          activeOpacity={0.7}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </Button>
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

  // Handle sort option selection
  const handleSortChange = useCallback(
    (newSortBy: keyof Cryptocurrency) => {
      if (newSortBy === sortBy) {
        // Toggle sort order if same field
        setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        // Change sort field and default to ascending
        setSortBy(newSortBy);
        setSortOrder('asc');
      }
      setShowSortModal(false);
    },
    [sortBy],
  );

  // Toggle sort modal
  const toggleSortModal = useCallback(() => {
    setShowSortModal(prev => !prev);
  }, []);

  // Handle load more for infinite scroll
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !searchQuery.trim()) {
      // Only load more when not searching (to keep infinite scroll simple)
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, searchQuery, fetchNextPage]);

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
          No cryptocurrencies match "{searchQuery}". Try a different search
          term.
        </Text>
        <Button style={styles.clearSearchButton} onPress={handleClearSearch}>
          <Text style={styles.clearSearchText}>Clear Search</Text>
        </Button>
      </View>
    );
  }, [searchQuery, isLoading, handleClearSearch]);

  // Render footer for pagination loading
  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage || searchQuery.trim().length > 0) {
      return null;
    }

    return (
      <View style={styles.paginationFooter}>
        <ActivityIndicator size="small" color="#FFD700" />
        <Text style={styles.paginationText}>Loading more...</Text>
      </View>
    );
  }, [isFetchingNextPage, searchQuery]);

  return (
    <FixedScreen>
      <View style={styles.container}>
        {/* Search Header */}
        <View style={styles.searchHeader}>
          <Text style={styles.title}>🍋 Cryptocurrency Market</Text>
          <Text style={styles.subtitle}>
            {searchQuery
              ? `Search results for "${searchQuery}"`
              : 'Live USD prices and 24h changes'}
          </Text>

          <View style={styles.controlsRow}>
            <View style={styles.searchContainer}>
              <CustomIcon name="search" size={24} color="#9e9e9e" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search cryptocurrencies..."
                placeholderTextColor="#9e9e9e"
                value={searchQuery}
                onChangeText={handleSearchChange}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <Button
                  style={styles.clearButton}
                  onPress={handleClearSearch}
                  accessibilityLabel="Clear search"
                >
                  <CustomIcon name="close" size={24} color="#9e9e9e" />
                </Button>
              )}
            </View>

            <Button
              style={styles.sortButton}
              onPress={toggleSortModal}
              accessibilityLabel="Sort options"
            >
              <Text style={styles.sortIcon}>
                {SORT_OPTIONS.find(opt => opt.key === sortBy)?.icon || '📊'}
              </Text>
              <CustomIcon
                name={
                  sortOrder === 'asc'
                    ? 'keyboard-arrow-up'
                    : 'keyboard-arrow-down'
                }
                size={18}
                color="#6c757d"
              />
            </Button>
          </View>
        </View>

        {/* Sort Modal */}
        {showSortModal && (
          <View style={styles.sortModal}>
            <View style={styles.sortModalContent}>
              <View style={styles.sortModalHeader}>
                <Text style={styles.sortModalTitle}>Sort by</Text>
                <Button onPress={() => setShowSortModal(false)}>
                  <CustomIcon name="close" size={24} color="#9e9e9e" />
                </Button>
              </View>

              {SORT_OPTIONS.map(option => (
                <Button
                  key={option.key}
                  style={[
                    styles.sortOption,
                    sortBy === option.key && styles.sortOptionActive,
                  ]}
                  onPress={() => handleSortChange(option.key)}
                >
                  <Text style={styles.sortOptionIcon}>{option.icon}</Text>
                  <Text
                    style={[
                      styles.sortOptionText,
                      sortBy === option.key && styles.sortOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {sortBy === option.key && (
                    <CustomIcon
                      name={
                        sortOrder === 'asc'
                          ? 'keyboard-arrow-up'
                          : 'keyboard-arrow-down'
                      }
                      size={18}
                      color="#6c757d"
                    />
                  )}
                </Button>
              ))}
            </View>
          </View>
        )}

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
                onRefresh={debouncedRefetch}
                colors={['#FFD700']} // Android
                tintColor="#FFD700" // iOS
              />
            }
            ListEmptyComponent={EmptyComponent}
            ListFooterComponent={renderFooter}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={ItemSeparator}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
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
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    minWidth: 60,
    justifyContent: 'center',
  },
  sortIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  sortOrder: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: 'bold',
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
  // Sort Modal Styles
  sortModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  sortModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 20,
    marginHorizontal: 20,
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  sortModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  sortModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  sortModalClose: {
    fontSize: 18,
    color: '#6c757d',
    fontWeight: 'bold',
    padding: 4,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  sortOptionActive: {
    backgroundColor: '#fffbf0',
  },
  sortOptionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  sortOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  sortOptionTextActive: {
    color: '#1a1a1a',
    fontWeight: '600',
  },
  sortOptionOrder: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  // Pagination Styles
  paginationFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#ffffff',
  },
  paginationText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6c757d',
  },
  // Skeleton Loader Styles
  skeletonContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  skeletonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  skeletonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  skeletonImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f3f4',
    marginRight: 12,
  },
  skeletonTextContainer: {
    flex: 1,
  },
  skeletonTitle: {
    height: 16,
    backgroundColor: '#f1f3f4',
    borderRadius: 8,
    marginBottom: 6,
    width: '70%',
  },
  skeletonSubtitle: {
    height: 12,
    backgroundColor: '#f1f3f4',
    borderRadius: 6,
    width: '40%',
  },
  skeletonRight: {
    alignItems: 'flex-end',
  },
  skeletonPrice: {
    height: 16,
    width: 80,
    backgroundColor: '#f1f3f4',
    borderRadius: 8,
    marginBottom: 6,
  },
  skeletonChange: {
    height: 12,
    width: 60,
    backgroundColor: '#f1f3f4',
    borderRadius: 6,
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
