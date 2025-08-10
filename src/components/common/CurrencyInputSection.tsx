import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { CustomIcon } from '@components/common/CustomIcon';
import { Button } from '@components/common/Button';
import { colors } from '@constants/colors';
import { SelectedCurrency } from '@screens/main/ExchangeScreen';

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

const styles = StyleSheet.create({
  currencySection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  amountInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  readOnlyInput: {
    color: colors.textSecondary,
    backgroundColor: 'transparent',
  },
  currencySelector: {
    paddingHorizontal: 6,
    paddingVertical: 8,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    minWidth: 110,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  currencySelectorContent: {
    alignItems: 'center',
    marginRight: 8,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  currencyName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
});
