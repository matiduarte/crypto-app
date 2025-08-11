import React from 'react';
import { View, Text } from 'react-native';

import { colors } from '@constants/colors';
import { styles } from './styles';
import { CustomIcon } from '@components/CustomIcon';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  style?: object;
  titleStyle?: object;
  subtitleStyle?: object;
  children?: React.ReactNode;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  icon,
  iconColor = colors.primary,
  style,
  titleStyle,
  subtitleStyle,
  children,
}) => {
  return (
    <View style={[styles.header, style]}>
      <View style={styles.titleContainer}>
        {icon && <CustomIcon name={icon} size={24} color={iconColor} />}
        <Text style={[styles.title, titleStyle]}>{title}</Text>
      </View>
      {subtitle && (
        <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
      )}
      {children}
    </View>
  );
};
