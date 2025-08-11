import { colors } from '@constants/colors';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingVertical: 20,
    borderRadius: 8,
  },
  rateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  rateText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginRight: 8,
  },
  rateIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.error,
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.error,
  },
  conversionCard: {
    backgroundColor: colors.surface,
    marginVertical: 20,
    borderRadius: 8,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  swapButton: {
    alignSelf: 'center',
    backgroundColor: colors.crypto,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingContainer: {
    paddingVertical: 16,
  },
  currencyOptionPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  fiatSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
});
