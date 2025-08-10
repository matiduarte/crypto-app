import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CustomIcon } from './CustomIcon';
import { colors } from '@constants/colors';

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
}) => (
  <View style={[styles.header, style]}>
    <View style={styles.titleContainer}>
      {icon && (
        <CustomIcon name={icon} size={24} color={iconColor} />
      )}
      <Text style={[styles.title, titleStyle]}>{title}</Text>
    </View>
    {subtitle && (
      <Text style={[styles.subtitle, subtitleStyle]}>
        {subtitle}
      </Text>
    )}
    {children}
  </View>
);

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
});