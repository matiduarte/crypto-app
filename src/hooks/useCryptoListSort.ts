import { useState, useCallback, useMemo } from 'react';
import { sortCryptos } from '@utils/helpers';
import { Cryptocurrency } from '@types';

interface UseCryptoListSortProps {
  data: Cryptocurrency[];
  initialSortBy?: keyof Cryptocurrency;
  initialSortOrder?: 'asc' | 'desc';
}

interface UseCryptoListSortReturn {
  sortedData: Cryptocurrency[];
  sortBy: keyof Cryptocurrency;
  sortOrder: 'asc' | 'desc';
  showSortModal: boolean;
  handleSortChange: (newSortBy: keyof Cryptocurrency) => void;
  toggleSortModal: () => void;
  closeSortModal: () => void;
}

/**
 * Custom hook for managing cryptocurrency list sorting functionality.
 * Handles sort state, modal visibility, and data transformation.
 */
export const useCryptoListSort = ({
  data,
  initialSortBy = 'market_cap_rank',
  initialSortOrder = 'asc',
}: UseCryptoListSortProps): UseCryptoListSortReturn => {
  const [sortBy, setSortBy] = useState<keyof Cryptocurrency>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);
  const [showSortModal, setShowSortModal] = useState(false);

  const sortedData = useMemo(() => {
    return sortCryptos(data, sortBy, sortOrder);
  }, [data, sortBy, sortOrder]);

  const handleSortChange = useCallback(
    (newSortBy: keyof Cryptocurrency) => {
      if (newSortBy === sortBy) {
        setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortBy(newSortBy);
        setSortOrder('asc');
      }
      setShowSortModal(false);
    },
    [sortBy],
  );

  const toggleSortModal = useCallback(() => {
    setShowSortModal(prev => !prev);
  }, []);

  const closeSortModal = useCallback(() => {
    setShowSortModal(false);
  }, []);

  return {
    sortedData,
    sortBy,
    sortOrder,
    showSortModal,
    handleSortChange,
    toggleSortModal,
    closeSortModal,
  };
};