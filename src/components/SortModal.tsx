import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Button, CustomIcon } from '@components';
import { colors } from '@constants/colors';
import { Cryptocurrency } from '@types';

export type SortOption = {
  key: keyof Cryptocurrency;
  label: string;
  iconName: string;
};

interface SortModalProps {
  visible: boolean;
  options: SortOption[];
  currentSort: keyof Cryptocurrency;
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: keyof Cryptocurrency) => void;
  onClose: () => void;
}

/**
 * SortModal provides a modal interface for selecting sort criteria.
 */
export const SortModal: React.FC<SortModalProps> = ({
  visible,
  options,
  currentSort,
  sortOrder,
  onSortChange,
  onClose,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <Text style={styles.title}>Sort by</Text>
                <Button onPress={onClose}>
                  <CustomIcon
                    name="close"
                    size={24}
                    color={colors.textTertiary}
                  />
                </Button>
              </View>

              {options.map(option => (
                <Button
                  key={option.key}
                  style={[
                    styles.option,
                    currentSort === option.key && styles.optionActive,
                  ]}
                  onPress={() => onSortChange(option.key)}
                >
                  <View style={styles.optionIcon}>
                    <CustomIcon
                      name={option.iconName}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.optionText,
                      currentSort === option.key && styles.optionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {currentSort === option.key && (
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
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlayTransparent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  optionActive: {
    backgroundColor: colors.favoriteBackground,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  optionTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
