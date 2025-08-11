import { StyleSheet } from 'react-native';
import { colors } from '@constants/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  headerSection: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    paddingHorizontal: 0,
    marginBottom: 40,
  },
  scanButton: {
    marginBottom: 20,
  },
  flatList: {
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
});
