import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';

export interface SelectorOption {
  id: string;
  symbol: string;
  name: string;
  subtitle?: string;
  image?: string;
}

// Separator styles constant
const separatorStyle = {
  height: 1,
  backgroundColor: '#f1f3f4',
  marginHorizontal: 20,
};

// Separator component
const ItemSeparator: React.FC = () => <View style={separatorStyle} />;

interface SelectorModalProps {
  visible: boolean;
  title: string;
  data: SelectorOption[];
  searchValue?: string;
  searchPlaceholder?: string;
  showSearch?: boolean;
  onClose: () => void;
  onSelect: (option: SelectorOption) => void;
  onSearchChange?: (text: string) => void;
  keyExtractor?: (item: SelectorOption) => string;
  renderRightContent?: (item: SelectorOption) => React.ReactNode;
}

export const SelectorModal: React.FC<SelectorModalProps> = ({
  visible,
  title,
  data,
  searchValue = '',
  searchPlaceholder = 'Search...',
  showSearch = false,
  onClose,
  onSelect,
  onSearchChange,
  keyExtractor = item => item.id,
  renderRightContent,
}) => {
  const renderItem = ({ item }: { item: SelectorOption }) => (
    <TouchableOpacity
      style={styles.currencyOption}
      onPress={() => onSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.currencyOptionLeft}>
        <Text style={styles.currencyOptionSymbol}>{item.symbol}</Text>
        <Text style={styles.currencyOptionName}>{item.name}</Text>
        {item.subtitle && (
          <Text style={styles.currencyOptionSubtitle}>{item.subtitle}</Text>
        )}
      </View>
      {renderRightContent && (
        <View style={styles.currencyOptionRight}>
          {renderRightContent(item)}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} accessibilityLabel="Close modal">
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        {showSearch && (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder={searchPlaceholder}
              placeholderTextColor="#9e9e9e"
              value={searchValue}
              onChangeText={onSearchChange}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          </View>
        )}

        <FlatList
          data={data}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ItemSeparatorComponent={ItemSeparator}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#ffffff',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  closeButton: {
    fontSize: 20,
    color: '#6c757d',
    fontWeight: 'bold',
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
    backgroundColor: '#ffffff',
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  currencyOptionLeft: {
    flex: 1,
  },
  currencyOptionRight: {
    alignItems: 'flex-end',
  },
  currencyOptionSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  currencyOptionName: {
    fontSize: 14,
    color: '#6c757d',
  },
  currencyOptionSubtitle: {
    fontSize: 12,
    color: '#9e9e9e',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#f1f3f4',
    marginHorizontal: 20,
  },
});
