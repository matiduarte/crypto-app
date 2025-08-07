import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface CustomIconProps {
  name: string;
  size: number;
  color: string;
}

export const CustomIcon: React.FC<CustomIconProps> = ({ 
  name, 
  size, 
  color 
}) => {
  return <Icon name={name} size={size} color={color} />;
};