import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { colors } from '@constants/colors';
import { styles } from './styles';
import { Button } from '@components/Button';
import { CustomIcon } from '@components/CustomIcon';

interface ActionButtonProps {
  title: string;
  subtitle?: string;
  icon?: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  style?: object;
  backgroundColor?: string;
  textColor?: string;
  iconSize?: number;
  showBadge?: boolean;
  badgeIcon?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  disabled = false,
  loading = false,
  loadingText,
  style,
  backgroundColor = colors.primary,
  textColor = colors.white,
  iconSize = 32,
  showBadge = false,
  badgeIcon = 'add',
}) => (
  <Button
    style={[
      styles.actionButton,
      { backgroundColor },
      disabled && styles.actionButtonDisabled,
      style,
    ]}
    onPress={onPress}
    disabled={disabled || loading}
  >
    <View style={styles.actionButtonContent}>
      {loading ? (
        <>
          <ActivityIndicator
            size="large"
            color={textColor}
            style={styles.loadingIndicator}
          />
          <View style={styles.buttonTextContainer}>
            <Text style={[styles.actionButtonText, { color: textColor }]}>
              {loadingText || 'Loading...'}
            </Text>
            {subtitle && (
              <Text style={[styles.actionButtonSubtext, { color: textColor }]}>
                {subtitle}
              </Text>
            )}
          </View>
        </>
      ) : (
        <>
          {icon && (
            <View style={styles.iconContainer}>
              <CustomIcon name={icon} size={iconSize} color={textColor} />
              {showBadge && (
                <View style={styles.iconBadge}>
                  <CustomIcon
                    name={badgeIcon}
                    size={16}
                    color={backgroundColor}
                  />
                </View>
              )}
            </View>
          )}
          <View style={styles.buttonTextContainer}>
            <Text style={[styles.actionButtonText, { color: textColor }]}>
              {title}
            </Text>
            {subtitle && (
              <Text style={[styles.actionButtonSubtext, { color: textColor }]}>
                {subtitle}
              </Text>
            )}
          </View>
        </>
      )}
    </View>
  </Button>
);
