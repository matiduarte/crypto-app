/**
 * Centralized color definitions for the CryptoApp
 * All colors used throughout the app should be defined here
 */

export const colors = {
  // Primary Brand Colors
  primary: '#4285F4', // Google Blue - primary brand color
  primaryLight: 'rgba(66, 133, 244, 0.1)', // Light blue background
  primaryAccent: '#007AFF', // iOS Blue accent

  // Cryptocurrency Colors  
  bitcoin: '#f7931a', // Bitcoin orange
  ethereum: '#627eea', // Ethereum blue
  crypto: '#FFD700', // Gold for general crypto

  // Success & Status Colors
  success: '#28a745', // Green for success states
  successLight: '#34a853', // Lighter green
  warning: '#ffc107', // Yellow/amber for warnings
  error: '#dc3545', // Red for errors
  errorLight: '#f44336', // Lighter red for error icons
  errorBackground: '#fef7f7', // Very light red background
  errorBorder: '#fecaca', // Light red border

  // Text Colors
  textPrimary: '#1a1a1a', // Primary text (dark)
  textSecondary: '#6c757d', // Secondary text (gray)
  textTertiary: '#9e9e9e', // Tertiary text (light gray)
  textLight: '#9aa0a6', // Very light text
  textGoogle: '#202124', // Google-style dark text
  textGoogleSecondary: '#5f6368', // Google-style secondary text
  textMuted: '#495057', // Muted text
  textError: '#dc2626', // Error text
  textDanger: '#ff4444', // Danger text

  // Background Colors
  background: '#f8f9fa', // Main app background
  backgroundLight: '#fafbfc', // Lighter background
  backgroundDark: '#f5f5f5', // Slightly darker background
  surface: '#ffffff', // Surface/card background
  surfaceElevated: '#fff', // Elevated surface background
  overlay: '#000000', // Overlay/modal background
  overlayTransparent: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay

  // Border Colors
  border: '#e9ecef', // Default border color
  borderLight: '#f1f3f4', // Light border
  borderPrimary: '#4285F4', // Primary border
  borderWhite: '#ffffff', // White border

  // Interactive Colors
  active: '#007AFF', // Active/selected state
  inactive: '#9e9e9e', // Inactive/unselected state
  disabled: 'rgba(158, 158, 158, 0.5)', // Disabled state
  favorite: '#ff6b6b', // Favorite/like color

  // Special Backgrounds
  favoriteBackground: '#fffbf0', // Light golden background for favorites
  selectedBackground: '#fffbf0', // Selected item background

  // Shadows
  shadow: '#000', // Shadow color (always black with opacity)

  // Transparent Colors
  transparent: 'transparent',
  white: '#ffffff',
  black: '#000000',
} as const;

// Type for color keys to ensure type safety
export type ColorKey = keyof typeof colors;

// Utility function to get color with type safety
export const getColor = (colorKey: ColorKey): string => {
  return colors[colorKey];
};

// Color categories for better organization
export const colorCategories = {
  brand: ['primary', 'primaryLight', 'primaryAccent'],
  crypto: ['bitcoin', 'ethereum', 'crypto'],
  status: ['success', 'successLight', 'warning', 'error', 'errorLight'],
  text: ['textPrimary', 'textSecondary', 'textTertiary', 'textLight'],
  background: ['background', 'backgroundLight', 'backgroundDark', 'surface'],
  interactive: ['active', 'inactive', 'disabled', 'favorite'],
} as const;

// Export individual color groups for convenience
export const brandColors = {
  primary: colors.primary,
  primaryLight: colors.primaryLight,
  primaryAccent: colors.primaryAccent,
} as const;

export const cryptoColors = {
  bitcoin: colors.bitcoin,
  ethereum: colors.ethereum,
  crypto: colors.crypto,
} as const;

export const statusColors = {
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
} as const;

export const textColors = {
  primary: colors.textPrimary,
  secondary: colors.textSecondary,
  tertiary: colors.textTertiary,
  light: colors.textLight,
} as const;

export const backgroundColors = {
  main: colors.background,
  light: colors.backgroundLight,
  dark: colors.backgroundDark,
  surface: colors.surface,
} as const;