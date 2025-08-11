import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useInfiniteCryptocurrencies } from '@hooks/useCryptocurrencies';
import { useCryptoListSort } from '@hooks';
import { searchCryptos } from '@utils/helpers';
import { Cryptocurrency } from '@types';
import {
  CryptoListItem,
  SkeletonLoader,
  EmptyState,
  ErrorState,
  FixedScreen,
  ItemSeparator,
  PaginationFooter,
  SortModal,
  SortOption,
  CryptoListHeader,
} from '@components';
import { colors } from '@constants/colors';
import { DEFAULT_CRYPTO_FILTER } from '@constants/cryptoFilters';

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

/**
 * CryptoListScreen displays a searchable, sortable list of cryptocurrencies
 * with infinite scrolling, real-time price updates, and multiple sort options.
 * Optimized for performance with proper virtualization and data management.
 */
export const CryptoListScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useInfiniteCryptocurrencies(DEFAULT_CRYPTO_FILTER);

  const baseCryptoData = useMemo(() => {
    if (!infiniteData?.pages) return [];

    return infiniteData.pages
      .filter(page => page.success)
      .flatMap(page => page.data)
      .filter(Boolean);
  }, [infiniteData]);

  const filteredData = useMemo(() => {
    if (searchQuery.trim().length > 0) {
      return searchCryptos(baseCryptoData, searchQuery.trim());
    }
    return baseCryptoData;
  }, [baseCryptoData, searchQuery]);

  const {
    sortedData: cryptoData,
    sortBy,
    sortOrder,
    showSortModal,
    handleSortChange,
    toggleSortModal,
    closeSortModal,
  } = useCryptoListSort({ data: filteredData });

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const renderItem = ({ item }: { item: Cryptocurrency }) => (
    <CryptoListItem item={item} />
  );

  const keyExtractor = useCallback((item: Cryptocurrency) => item.id, []);

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

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (
      !hasNextPage ||
      isFetchingNextPage ||
      searchQuery.trim().length > 0 ||
      cryptoData.length === 0 ||
      baseCryptoData.length === 0 ||
      isLoading
    ) {
      return;
    }

    fetchNextPage();
  }, [
    hasNextPage,
    isFetchingNextPage,
    searchQuery,
    cryptoData.length,
    baseCryptoData.length,
    isLoading,
    fetchNextPage,
  ]);

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

  const renderFooter = useCallback(() => {
    if (searchQuery.trim().length > 0) {
      return null;
    }

    return <PaginationFooter isLoading={isFetchingNextPage} />;
  }, [isFetchingNextPage, searchQuery]);

  return (
    <FixedScreen>
      <View style={styles.container}>
        <CryptoListHeader
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onClearSearch={handleClearSearch}
          onSortPress={toggleSortModal}
          sortBy={sortBy}
          sortOrder={sortOrder}
          sortOptions={SORT_OPTIONS}
        />

        <SortModal
          visible={showSortModal}
          options={SORT_OPTIONS}
          currentSort={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          onClose={closeSortModal}
        />

        {renderLoadingState()}
        {renderErrorState()}

        {!isLoading && !error && cryptoData.length === 0 && renderEmptySearch()}

        {!isLoading && !error && cryptoData.length > 0 && (
          <FlatList
            data={cryptoData}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
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
                colors={[colors.crypto]}
                tintColor={colors.crypto}
              />
            }
            ListEmptyComponent={EmptyComponent}
            ListFooterComponent={renderFooter}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={ItemSeparator}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            getItemLayout={(_data, index) => ({
              length: 72,
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
  listContent: {
    paddingVertical: 8,
  },
  listContentEmpty: {
    flex: 1,
  },
});
