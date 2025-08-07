import React, {
  createContext,
  useContext,
  ReactNode,
} from 'react';
import { AuthContextType, AuthState } from '../types';
import {
  useAuth as useReactQueryAuth,
} from '../hooks/useAuth';

// Create context - now just wraps React Query hooks
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider that uses React Query for state management
 * This provides the same API as before but with React Query under the hood
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Use the React Query auth hook for all state and logic
  const auth = useReactQueryAuth();

  // Create the context value with the same interface as before
  const contextValue: AuthContextType = {
    // State - map React Query state to legacy AuthState interface
    user: auth.user,
    token: auth.tokens?.idToken || null,
    refreshToken: auth.tokens?.accessToken || null,
    isLoggedIn: auth.isLoggedIn,
    isLoading: auth.isLoading,
    error: auth.error,

    // Actions - wrap React Query mutations to return legacy format
    signIn: async () => {
      try {
        const result = await auth.signIn();
        return { success: result.success, error: result.error };
      } catch (error: any) {
        return { success: false, error: error.message || 'Sign-in failed' };
      }
    },

    signOut: async () => {
      try {
        const result = await auth.signOut();
        return { success: result.success, error: result.error };
      } catch (error: any) {
        return { success: false, error: error.message || 'Sign-out failed' };
      }
    },

    refreshTokens: async () => {
      try {
        const result = await auth.refreshTokens();
        return { success: result.success, error: result.error };
      } catch (error: any) {
        return { success: false, error: error.message || 'Token refresh failed' };
      }
    },

    clearError: auth.clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

// Auth utilities
export const authUtils = {
  isLoggedIn: (authState: AuthState): boolean => {
    return authState.isLoggedIn && !!authState.user && !!authState.token;
  },

  getUserData: (authState: AuthState) => {
    if (!authState.user) return null;

    return {
      id: authState.user.id,
      name: authState.user.name || 'Unknown User',
      email: authState.user.email || '',
      photo: authState.user.photo || null,
      givenName: authState.user.givenName || '',
      familyName: authState.user.familyName || '',
    };
  },

  getToken: (authState: AuthState): string | null => {
    return authState.token;
  },

  hasValidSession: (authState: AuthState): boolean => {
    return authState.isLoggedIn && !!authState.token && !authState.error;
  },
};
