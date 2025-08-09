import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

interface ListSeparatorProps {
  height?: number;
  color?: string;
  marginHorizontal?: number;
  style?: object;
}

export const ListSeparator: React.FC<ListSeparatorProps> = ({
  height = 1,
  color = colors.borderLight,
  marginHorizontal = 20,
  style,
}) => (
  <View
    style={[
      styles.separator,
      {
        height,
        backgroundColor: color,
        marginHorizontal,
      },
      style,
    ]}
  />
);

// Pre-made separator variants for common use cases
export const ItemSeparator: React.FC = () => <ListSeparator />;

export const ThickSeparator: React.FC = () => (
  <ListSeparator height={2} color={colors.border} />
);

export const FullWidthSeparator: React.FC = () => (
  <ListSeparator marginHorizontal={0} />
);

const styles = StyleSheet.create({
  separator: {
    backgroundColor: colors.borderLight,
  },
});