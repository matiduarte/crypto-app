import { colors } from '@constants/colors';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.backgroundLight, // Clean, modern background
  },
  backgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  circleTop: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primary,
    opacity: 0.1,
  },
  circleBottom: {
    position: 'absolute',
    bottom: -120,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.successLight,
    opacity: 0.08,
  },
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingVertical: 40,
    justifyContent: 'center',
    zIndex: 2,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  appBrand: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    backgroundColor: colors.primaryLight,
    borderRadius: 30,
    padding: 20,
    marginBottom: 16,
  },
  appIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textGoogle,
    letterSpacing: -0.5,
  },
  welcomeSection: {
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textGoogle,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: colors.textGoogleSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  errorContainer: {
    backgroundColor: colors.errorBackground,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    marginBottom: 24,
    marginHorizontal: 4,
  },
  errorText: {
    color: colors.textError,
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  clearErrorButton: {
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  clearErrorText: {
    color: colors.textError,
    fontSize: 13,
    fontWeight: '600',
  },
  signInSection: {
    alignItems: 'center',
    width: '100%',
    zIndex: 10,
  },
  signInFooter: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
});
