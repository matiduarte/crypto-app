import { colors } from '@constants/colors';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  actionButton: {
    borderRadius: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  actionButtonDisabled: {
    backgroundColor: colors.inactive,
    opacity: 0.7,
    shadowOpacity: 0.1,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    minHeight: 80,
  },
  iconContainer: {
    position: 'relative',
    marginRight: 16,
  },
  iconBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.white,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  actionButtonSubtext: {
    fontSize: 14,
    opacity: 0.85,
    fontWeight: '500',
  },
  loadingIndicator: {
    marginRight: 16,
  },
});
