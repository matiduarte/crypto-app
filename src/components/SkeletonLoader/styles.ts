import { colors } from '@constants/colors';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  skeletonContainer: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  skeletonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  skeletonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  skeletonImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.borderLight,
    marginRight: 12,
  },
  skeletonTextContainer: {
    flex: 1,
  },
  skeletonTitle: {
    height: 16,
    backgroundColor: colors.borderLight,
    borderRadius: 8,
    marginBottom: 6,
    width: '70%',
  },
  skeletonSubtitle: {
    height: 12,
    backgroundColor: colors.borderLight,
    borderRadius: 6,
    width: '40%',
  },
  skeletonRight: {
    alignItems: 'flex-end',
  },
  skeletonPrice: {
    height: 16,
    width: 80,
    backgroundColor: colors.borderLight,
    borderRadius: 8,
    marginBottom: 6,
  },
  skeletonChange: {
    height: 12,
    width: 60,
    backgroundColor: colors.borderLight,
    borderRadius: 6,
  },
});
