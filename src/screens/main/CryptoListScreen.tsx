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
import { colors } from '../../constants/colors';

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
  iconName: string;
};

const SORT_OPTIONS: SortOption[] = [
  { key: 'market_cap_rank', label: 'Market Cap', iconName: 'show-chart' },
  { key: 'current_price', label: 'Price', iconName: 'attach-money' },
  { key: 'price_change_percentage_24h', label: '24h Change', iconName: 'trending-up' },
  { key: 'name', label: 'Name', iconName: 'sort-by-alpha' },
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
        <View style={styles.emptyIcon}>
          <CustomIcon name="bar-chart" size={48} color={colors.textTertiary} />
        </View>
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
        <View style={styles.errorIcon}>
          <CustomIcon name="error-outline" size={48} color={colors.errorLight} />
        </View>
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
        <View style={styles.emptyIcon}>
          <CustomIcon name="search" size={48} color={colors.textTertiary} />
        </View>
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
        <ActivityIndicator size="small" color={colors.crypto} />
        <Text style={styles.paginationText}>Loading more...</Text>
      </View>
    );
  }, [isFetchingNextPage, searchQuery]);

  return (
    <FixedScreen>
      <View style={styles.container}>
        {/* Search Header */}
        <View style={styles.searchHeader}>
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
            <View style={styles.searchContainer}>
              <CustomIcon name="search" size={24} color={colors.textTertiary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search cryptocurrencies..."
                placeholderTextColor={colors.textTertiary}
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
                  <CustomIcon name="close" size={24} color={colors.textTertiary} />
                </Button>
              )}
            </View>

            <Button
              style={styles.sortButton}
              onPress={toggleSortModal}
              accessibilityLabel="Sort options"
            >
              <CustomIcon 
                name={SORT_OPTIONS.find(opt => opt.key === sortBy)?.iconName || 'show-chart'}
                size={18}
                color={colors.textSecondary}
              />
              <CustomIcon
                name={
                  sortOrder === 'asc'
                    ? 'keyboard-arrow-up'
                    : 'keyboard-arrow-down'
                }
                size={18}
                color={colors.textSecondary}
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
                  <CustomIcon name="close" size={24} color={colors.textTertiary} />
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
                  <View style={styles.sortOptionIcon}>
                    <CustomIcon name={option.iconName} size={20} color={colors.textSecondary} />
                  </View>
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
                      color={colors.textSecondary}
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
                colors={[colors.crypto]} // Android
                tintColor={colors.crypto} // iOS
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
    backgroundColor: colors.background,
  },
  // Search Header
  searchHeader: {
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
  sortOrder: {
    fontSize: 16,
    color: colors.crypto,
    fontWeight: 'bold',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: colors.textSecondary,
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
  clearButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  clearSearchButton: {
    backgroundColor: colors.crypto,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  clearSearchText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  // Sort Modal Styles
  sortModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlayTransparent,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  sortModalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 20,
    marginHorizontal: 20,
    minWidth: 280,
    shadowColor: colors.shadow,
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
    borderBottomColor: colors.borderLight,
  },
  sortModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  sortModalClose: {
    fontSize: 18,
    color: colors.textSecondary,
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
    backgroundColor: colors.favoriteBackground,
  },
  sortOptionIcon: {
    marginRight: 12,
  },
  sortOptionText: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  sortOptionTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  sortOptionOrder: {
    fontSize: 18,
    color: colors.crypto,
    fontWeight: 'bold',
  },
  // Pagination Styles
  paginationFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: colors.surface,
  },
  paginationText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.textSecondary,
  },
  // Skeleton Loader Styles
  skeletonContainer: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  skeletonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
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
    backgroundColor: colors.borderLight,
    marginRight: 12,
  },
  skeletonTextContainer: {
    flex: 1,
  },
  skeletonTitle: {
    height: 16,
    backgroundColor: colors.borderLight,
    borderRadius: 8,
    marginBottom: 6,
    width: '70%',
  },
  skeletonSubtitle: {
    height: 12,
    backgroundColor: colors.borderLight,
    borderRadius: 6,
    width: '40%',
  },
  skeletonRight: {
    alignItems: 'flex-end',
  },
  skeletonPrice: {
    height: 16,
    width: 80,
    backgroundColor: colors.borderLight,
    borderRadius: 8,
    marginBottom: 6,
  },
  skeletonChange: {
    height: 12,
    width: 60,
    backgroundColor: colors.borderLight,
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
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIcon: {
    marginBottom: 16,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.crypto,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
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
    backgroundColor: colors.borderLight,
    marginHorizontal: 20,
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
