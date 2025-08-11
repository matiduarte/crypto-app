import { colors } from '@constants/colors';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  paginationFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: colors.surface,
  },
  paginationText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
