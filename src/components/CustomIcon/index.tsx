import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface CustomIconProps {
  name: string;
  size: number;
  color: string;
  testID?: string;
}

/**
 * Wrapper component for Material Icons.
 * @param param0
 * @returns
 */
export const CustomIcon: React.FC<CustomIconProps> = ({
  name,
  size,
  color,
  testID = 'icon-close',
}) => {
  return <Icon name={name} size={size} color={color} testID={testID} />;
};
