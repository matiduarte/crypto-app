import { colors } from '@constants/colors';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: colors.black,
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
    marginBottom: 40,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 120,
  },
  buttonText: {
    fontSize: 18,
    color: colors.white,
    fontWeight: '600',
    textAlign: 'center',
  },
});
