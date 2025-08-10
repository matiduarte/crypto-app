import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { FixedScreen } from '@components/common/ScreenWrapper';
import { useInfiniteCryptocurrencies } from '@hooks/useCryptocurrencies';
import { searchCryptos, sortCryptos } from '@utils/helpers';
import { Cryptocurrency } from '@types';
import {
  Button,
  CryptoListItem,
  CustomIcon,
  SkeletonLoader,
  EmptyState,
  ErrorState,
  SearchInput,
  ItemSeparator,
  PaginationFooter,
} from '@components/common';
import { colors } from '../../constants/colors';

// Sort options type
type SortOption = {
  key: keyof Cryptocurrency;
  label: string;
  iconName: string;
};

const SORT_OPTIONS: SortOption[] = [
  { key: 'market_cap_rank', label: 'Market Cap', iconName: 'show-chart' },
  { key: 'current_price', label: 'Price', iconName: 'attach-money' },
  {
    key: 'price_change_percentage_24h',
    label: '24h Change',
    iconName: 'trending-up',
  },
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

  const renderItem = ({ item }: { item: Cryptocurrency }) => (
    <CryptoListItem item={item} />
  );

  const keyExtractor = useCallback((item: Cryptocurrency) => item.id, []);

  // Empty component
  const EmptyComponent = useMemo(() => {
    if (isLoading) {
      return null;
    }

    return (
      <EmptyState
        icon="bar-chart"
        title="No Data Available"
        subtitle="Unable to load cryptocurrency data. Pull down to refresh."
      />
    );
  }, [isLoading]);

  const renderLoadingState = () => {
    if (!isLoading) return null;

    return <SkeletonLoader />;
  };

  const renderErrorState = () => {
    if (!error || isLoading) return null;

    return <ErrorState onRetry={handleRefresh} />;
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
      <EmptyState
        icon="search"
        title="No Results Found"
        subtitle={`No cryptocurrencies match "${searchQuery}". Try a different search term.`}
        actionText="Clear Search"
        onActionPress={handleClearSearch}
      />
    );
  }, [searchQuery, isLoading, handleClearSearch]);

  // Render footer for pagination loading
  const renderFooter = useCallback(() => {
    if (searchQuery.trim().length > 0) {
      return null;
    }

    return <PaginationFooter isLoading={isFetchingNextPage} />;
  }, [isFetchingNextPage, searchQuery]);

  return (
    <FixedScreen>
      <View style={styles.container}>
        {/* Search Header */}
        <View style={styles.searchHeader}>
          <View style={styles.titleContainer}>
            <CustomIcon
              name="currency-bitcoin"
              size={24}
              color={colors.crypto}
            />
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
              onChangeText={handleSearchChange}
              onClear={handleClearSearch}
              placeholder="Search cryptocurrencies..."
            />

            <Button
              style={styles.sortButton}
              onPress={toggleSortModal}
              accessibilityLabel="Sort options"
            >
              <CustomIcon
                name={
                  SORT_OPTIONS.find(opt => opt.key === sortBy)?.iconName ||
                  'show-chart'
                }
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
                  <CustomIcon
                    name="close"
                    size={24}
                    color={colors.textTertiary}
                  />
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
                    <CustomIcon
                      name={option.iconName}
                      size={20}
                      color={colors.textSecondary}
                    />
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
                onRefresh={() => {
                  if (!isFetching) {
                    handleRefresh();
                  }
                }}
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
});
