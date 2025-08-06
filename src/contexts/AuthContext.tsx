import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import storageService from '../utils/storage';
import { authService, authHelpers, User } from '../services/authService';
import { AuthState, AuthContextType } from '../types';

// Storage keys
const STORAGE_KEYS = {
  USER: 'auth_user',
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  IS_LOGGED_IN: 'auth_is_logged_in',
} as const;

// Initial auth state
const initialAuthState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isLoggedIn: false,
  isLoading: true,
  error: null,
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);

  // Initialize auth state on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      // Initialize the auth service
      const initialized = await authHelpers.initialize();
      if (!initialized) {
        throw new Error('Authentication service initialization failed');
      }

      // Try silent sign-in (check existing session)
      const silentResult = await authHelpers.silentSignIn();

      if (silentResult.success && silentResult.user && silentResult.tokens) {
        // Load additional stored auth data if any
        const [storedUser, storedToken, storedRefreshToken] = await Promise.all(
          [
            storageService.getItem<User>(STORAGE_KEYS.USER),
            storageService.getItem<string>(STORAGE_KEYS.TOKEN),
            storageService.getItem<string>(STORAGE_KEYS.REFRESH_TOKEN),
          ],
        );

        setAuthState({
          user: storedUser || silentResult.user,
          token: storedToken || silentResult.tokens.idToken,
          refreshToken: storedRefreshToken || silentResult.tokens.accessToken,
          isLoggedIn: true,
          isLoading: false,
          error: null,
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Authentication initialization failed',
      }));
    }
  };

  const signIn = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      // Use the auth service for sign-in
      const result = await authService.signIn();

      if (result.success && result.user && result.tokens) {
        const newAuthState: AuthState = {
          user: result.user,
          token: result.tokens.idToken,
          refreshToken: result.tokens.accessToken,
          isLoggedIn: true,
          isLoading: false,
          error: null,
        };
        // Store auth data
        await Promise.all([
          storageService.setItem(STORAGE_KEYS.USER, result.user),
          storageService.setItem(STORAGE_KEYS.TOKEN, result.tokens.idToken),
          storageService.setItem(
            STORAGE_KEYS.REFRESH_TOKEN,
            result.tokens.accessToken,
          ),
          storageService.setItem(STORAGE_KEYS.IS_LOGGED_IN, true),
        ]);

        setAuthState(newAuthState);
        return { success: true };
      } else {
        const errorMessage = result.error || 'Sign-in failed';
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        return { success: false, error: errorMessage };
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Sign-in failed';
      console.error('Sign-in error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return { success: false, error: errorMessage };
    }
  };

  const signOut = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      // Use the auth service for sign-out
      const result = await authHelpers.completeSignOut();

      // Clear stored auth data
      await Promise.all([
        storageService.removeItem(STORAGE_KEYS.USER),
        storageService.removeItem(STORAGE_KEYS.TOKEN),
        storageService.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
        storageService.removeItem(STORAGE_KEYS.IS_LOGGED_IN),
      ]);

      setAuthState({
        user: null,
        token: null,
        refreshToken: null,
        isLoggedIn: false,
        isLoading: false,
        error: null,
      });

      return { success: result.success, error: result.error };
    } catch (error: any) {
      const errorMessage = error?.message || 'Sign-out failed';
      console.error('Sign-out error:', error);

      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return { success: false, error: errorMessage };
    }
  };

  const refreshTokens = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      const result = await authService.refreshTokens();

      if (result.success && result.tokens) {
        // Update stored tokens
        await Promise.all([
          storageService.setItem(STORAGE_KEYS.TOKEN, result.tokens.idToken),
          storageService.setItem(
            STORAGE_KEYS.REFRESH_TOKEN,
            result.tokens.accessToken,
          ),
        ]);

        setAuthState(prev => ({
          ...prev,
          token: result.tokens!.idToken,
          refreshToken: result.tokens!.accessToken,
          error: null,
        }));

        return { success: true };
      } else {
        const errorMessage = result.error || 'Token refresh failed';
        setAuthState(prev => ({
          ...prev,
          error: errorMessage,
        }));

        return { success: false, error: errorMessage };
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Token refresh failed';
      console.error('Token refresh error:', error);

      setAuthState(prev => ({
        ...prev,
        error: errorMessage,
      }));

      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  // Auth context value
  const contextValue: AuthContextType = {
    ...authState,
    signIn,
    signOut,
    refreshTokens,
    clearError,
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
