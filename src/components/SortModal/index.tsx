import React from 'react';
import { View, Text, Modal, TouchableWithoutFeedback } from 'react-native';
import { colors } from '@constants/colors';
import { Cryptocurrency } from '@types';
import { CustomIcon } from '@components/CustomIcon';
import { Button } from '@components/Button';
import { styles } from './styles';

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
