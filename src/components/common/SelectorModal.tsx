import React from 'react';
import { Modal, View, Text, StyleSheet, FlatList } from 'react-native';
import { colors } from '@constants/colors';
import { CustomIcon } from './CustomIcon';
import { Button } from './Button';

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
  backgroundColor: colors.borderLight,
  marginHorizontal: 20,
};

// Separator component
const ItemSeparator: React.FC = () => <View style={separatorStyle} />;

interface SelectorModalProps {
  visible: boolean;
  title: string;
  data: SelectorOption[];
  onClose: () => void;
  onSelect: (option: SelectorOption) => void;
  keyExtractor?: (item: SelectorOption) => string;
  renderRightContent?: (item: SelectorOption) => React.ReactNode;
}

export const SelectorModal: React.FC<SelectorModalProps> = ({
  visible,
  title,
  data,
  onClose,
  onSelect,
  keyExtractor = item => item.id,
  renderRightContent,
}) => {
  const renderItem = ({ item }: { item: SelectorOption }) => (
    <Button
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
    </Button>
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
          <Button onPress={onClose} accessibilityLabel="Close modal">
            <CustomIcon name="close" size={20} color={colors.textTertiary} />
          </Button>
        </View>

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
    backgroundColor: colors.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  closeButton: {
    fontSize: 20,
    color: colors.textSecondary,
    fontWeight: 'bold',
    padding: 4,
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
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
    color: colors.textPrimary,
    marginBottom: 2,
  },
  currencyOptionName: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  currencyOptionSubtitle: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
  },
});
