import React from 'react';
import { View, Text, TextInput } from 'react-native';

import { colors } from '@constants/colors';
import { SelectedCurrency } from '@screens/main/ExchangeScreen';

import { styles } from './styles';
import { Button } from '@components/Button';
import { CustomIcon } from '@components/CustomIcon';

interface CurrencyInputSectionProps {
  label: 'From' | 'To';
  amount: string;
  onAmountChange?: (value: string) => void;
  currency: Pick<SelectedCurrency, 'symbol' | 'name'>;
  onCurrencySelect: () => void;
  isReadOnly?: boolean;
  placeholder?: string;
}

/**
 * Reusable component for currency input sections
 */
export const CurrencyInputSection: React.FC<CurrencyInputSectionProps> = ({
  label,
  amount,
  onAmountChange,
  currency,
  onCurrencySelect,
  isReadOnly = false,
  placeholder = '0.00',
}) => {
  return (
    <View style={styles.currencySection}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.amountInput, isReadOnly && styles.readOnlyInput]}
          value={amount}
          onChangeText={onAmountChange}
          placeholder={placeholder}
          keyboardType="numeric"
          editable={!isReadOnly}
          placeholderTextColor={colors.textTertiary}
        />
        <Button style={styles.currencySelector} onPress={onCurrencySelect}>
          <View style={styles.currencySelectorContent}>
            <Text style={styles.currencySymbol}>{currency.symbol}</Text>
            <Text style={styles.currencyName}>{currency.name}</Text>
          </View>
          <CustomIcon
            name="keyboard-arrow-down"
            size={16}
            color={colors.textSecondary}
          />
        </Button>
      </View>
    </View>
  );
};
