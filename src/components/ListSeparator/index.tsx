import React from 'react';
import { View } from 'react-native';
import { colors } from '@constants/colors';
import { styles } from './styles';

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

export const ItemSeparator: React.FC = () => <ListSeparator />;
