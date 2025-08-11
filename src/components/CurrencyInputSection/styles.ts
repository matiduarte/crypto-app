import { colors } from '@constants/colors';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
