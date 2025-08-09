import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Button } from './Button';
import { CustomIcon } from './CustomIcon';
import { colors } from '../../constants/colors';

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
                  <CustomIcon name={badgeIcon} size={16} color={backgroundColor} />
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

const styles = StyleSheet.create({
  actionButton: {
    borderRadius: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  actionButtonDisabled: {
    backgroundColor: colors.inactive,
    opacity: 0.7,
    shadowOpacity: 0.1,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    minHeight: 80,
  },
  iconContainer: {
    position: 'relative',
    marginRight: 16,
  },
  iconBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.white,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  actionButtonSubtext: {
    fontSize: 14,
    opacity: 0.85,
    fontWeight: '500',
  },
  loadingIndicator: {
    marginRight: 16,
  },
});