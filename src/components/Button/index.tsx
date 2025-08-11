import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  style,
  disabled,
  ...rest
}) => {
  return (
    <TouchableOpacity
      style={style}
      disabled={disabled}
      activeOpacity={0.7}
      {...rest}
    >
      {children}
    </TouchableOpacity>
  );
};
