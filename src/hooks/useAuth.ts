import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  authService,
  authHelpers,
  User,
  AuthTokens,
} from '../services/authService';
import storageService from '../utils/storage';

// Storage keys
const STORAGE_KEYS = {
  USER: 'auth_user',
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  IS_LOGGED_IN: 'auth_is_logged_in',
} as const;

// Query keys
const AUTH_QUERY_KEYS = {
  user: ['auth', 'user'] as const,
  session: ['auth', 'session'] as const,
  tokens: ['auth', 'tokens'] as const,
};

// Types
interface SignInResult {
  success: boolean;
  user?: User;
  tokens?: AuthTokens;
  error?: string;
}

interface SignOutResult {
  success: boolean;
  error?: string;
  warning?: string;
}

interface AuthSession {
  user: User | null;
  tokens: AuthTokens | null;
  isLoggedIn: boolean;
}

/**
 * Query to get current user session
 * Automatically runs silent sign-in to check if user is already logged in
 */
export const useAuthSession = () => {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.session,
    queryFn: async (): Promise<AuthSession> => {
      try {
        // Initialize auth service
        const initialized = await authHelpers.initialize();
        if (!initialized) {
          console.warn('Auth service initialization failed');
          return { user: null, tokens: null, isLoggedIn: false };
        }

        // Check if we have stored session data first (fallback for iOS)
        const [storedUser, storedToken, storedRefreshToken, storedIsLoggedIn] =
          await Promise.all([
            storageService.getItem<User>(STORAGE_KEYS.USER),
            storageService.getItem<string>(STORAGE_KEYS.TOKEN),
            storageService.getItem<string>(STORAGE_KEYS.REFRESH_TOKEN),
            storageService.getItem<boolean>(STORAGE_KEYS.IS_LOGGED_IN),
          ]);

        // If we have stored login state, try to restore from Google Sign-in
        if (storedIsLoggedIn && storedUser) {
          console.log('Found stored auth data, attempting silent sign-in...');
          
          try {
            // Try silent sign-in
            const silentResult = await authHelpers.silentSignIn();

            if (silentResult.success && silentResult.user && silentResult.tokens) {
              console.log('Silent sign-in successful');
              const tokens: AuthTokens = {
                idToken: storedToken || silentResult.tokens.idToken,
                accessToken: silentResult.tokens.accessToken, // Use fresh token from silent sign-in
              };

              return { 
                user: silentResult.user, // Use fresh user data
                tokens, 
                isLoggedIn: true 
              };
            } else {
              console.warn('Silent sign-in failed, but we have stored data');
              // If silent sign-in fails but we have stored data, try to use stored data as fallback
              if (storedUser && storedToken) {
                return {
                  user: storedUser,
                  tokens: {
                    idToken: storedToken,
                    accessToken: storedRefreshToken || '',
                  },
                  isLoggedIn: true,
                };
              }
            }
          } catch (silentError) {
            console.warn('Silent sign-in error:', silentError);
            // Fallback to stored data if available
            if (storedUser && storedToken) {
              console.log('Using stored auth data as fallback');
              return {
                user: storedUser,
                tokens: {
                  idToken: storedToken,
                  accessToken: storedRefreshToken || '',
                },
                isLoggedIn: true,
              };
            }
          }
        } else {
          // No stored login state, try fresh silent sign-in
          console.log('No stored auth data, trying fresh silent sign-in...');
          const silentResult = await authHelpers.silentSignIn();

          if (silentResult.success && silentResult.user && silentResult.tokens) {
            console.log('Fresh silent sign-in successful');
            return { 
              user: silentResult.user,
              tokens: silentResult.tokens,
              isLoggedIn: true 
            };
          }
        }

        console.log('No valid session found');
        return { user: null, tokens: null, isLoggedIn: false };
      } catch (error) {
        console.error('Auth session query error:', error);
        return { user: null, tokens: null, isLoggedIn: false };
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: failureCount => {
      return failureCount < 2;
    },
  });
};

/**
 * Query to get current user data only
 */
export const useCurrentUser = () => {
  const { data: session } = useAuthSession();

  return useQuery({
    queryKey: AUTH_QUERY_KEYS.user,
    queryFn: async (): Promise<User | null> => {
      return session?.user || null;
    },
    enabled: !!session,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Mutation for Google Sign-In
 */
export const useGoogleSignIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<SignInResult> => {
      try {
        const result = await authService.signIn();

        if (result.success && result.user && result.tokens) {
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

          return {
            success: true,
            user: result.user,
            tokens: result.tokens,
          };
        }

        return {
          success: false,
          error: result.error || 'Sign-in failed',
        };
      } catch (error: any) {
        console.error('Sign-in mutation error:', error);
        return {
          success: false,
          error:
            error?.message || 'An unexpected error occurred during sign-in',
        };
      }
    },
    onSuccess: result => {
      if (result.success && result.user && result.tokens) {
        // Update session cache
        queryClient.setQueryData(AUTH_QUERY_KEYS.session, {
          user: result.user,
          tokens: result.tokens,
          isLoggedIn: true,
        });

        // Update user cache
        queryClient.setQueryData(AUTH_QUERY_KEYS.user, result.user);

        // Invalidate and refetch auth queries to ensure consistency
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      }
    },
    onError: _error => {
      console.error('Sign-in mutation error:', _error);
    },
  });
};

/**
 * Mutation for Sign-Out with improved error handling
 */
export const useSignOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<SignOutResult> => {
      try {
        // First try the complete sign-out (which includes fallbacks)
        const result = await authHelpers.completeSignOut();

        // Always clear stored auth data, regardless of Google sign-out success
        // This ensures the user is logged out locally even if Google services fail
        try {
          await Promise.all([
            storageService.removeItem(STORAGE_KEYS.USER),
            storageService.removeItem(STORAGE_KEYS.TOKEN),
            storageService.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
            storageService.removeItem(STORAGE_KEYS.IS_LOGGED_IN),
          ]);
        } catch (storageError) {
          console.warn(
            'Failed to clear some auth storage items:',
            storageError,
          );
          // Continue anyway - storage cleanup failure shouldn't block sign-out
        }

        return {
          success: result.success,
          error: result.error,
          warning: result.warning,
        };
      } catch (error: any) {
        console.error('Sign-out mutation error:', error);

        // Even if sign-out fails, try to clear local storage
        try {
          await Promise.all([
            storageService.removeItem(STORAGE_KEYS.USER),
            storageService.removeItem(STORAGE_KEYS.TOKEN),
            storageService.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
            storageService.removeItem(STORAGE_KEYS.IS_LOGGED_IN),
          ]);

          return {
            success: true,
            warning: 'Local sign-out completed (Google sign-out failed)',
          };
        } catch (storageError) {
          console.error(
            'Failed to clear auth storage during emergency:',
            storageError,
          );
          return {
            success: false,
            error: error?.message || 'Sign-out failed completely',
          };
        }
      }
    },
    onSuccess: () => {
      // Clear all auth-related cache
      queryClient.setQueryData(AUTH_QUERY_KEYS.session, {
        user: null,
        tokens: null,
        isLoggedIn: false,
      });
      queryClient.setQueryData(AUTH_QUERY_KEYS.user, null);

      // Clear all cached data (since user is no longer authenticated)
      queryClient.clear();
    },
    onError: error => {
      console.error('Sign-out mutation error:', error);
    },
  });
};

/**
 * Hook that provides authentication state and actions
 */
export const useAuth = () => {
  const {
    data: session,
    isLoading: isSessionLoading,
    error: sessionError,
  } = useAuthSession();
  const signInMutation = useGoogleSignIn();
  const signOutMutation = useSignOut();

  return {
    // State
    user: session?.user || null,
    tokens: session?.tokens || null,
    isLoggedIn: session?.isLoggedIn || false,
    isLoading:
      isSessionLoading || signInMutation.isPending || signOutMutation.isPending,
    error:
      sessionError?.message ||
      signInMutation.error?.message ||
      signOutMutation.error?.message ||
      null,

    // Actions
    signIn: signInMutation.mutateAsync,
    signOut: signOutMutation.mutateAsync,

    // Mutation states
    isSigningIn: signInMutation.isPending,
    isSigningOut: signOutMutation.isPending,

    // Clear error function
    clearError: () => {
      signInMutation.reset();
      signOutMutation.reset();
    },

    // Raw mutations for advanced usage
    signInMutation,
    signOutMutation,
  };
};

/**
 * Hook to check if user is authenticated
 */
export const useIsAuthenticated = (): boolean => {
  const { data: session } = useAuthSession();
  return session?.isLoggedIn || false;
};

/**
 * Hook to get user data with type safety
 */
export const useUserData = () => {
  const { data: session } = useAuthSession();

  if (!session?.user) return null;

  return {
    id: session.user.id,
    name: session.user.name || 'Unknown User',
    email: session.user.email || '',
    photo: session.user.photo || null,
    givenName: session.user.givenName || '',
    familyName: session.user.familyName || '',
  };
};

/**
 * Hook to get authentication tokens
 */
export const useAuthTokens = (): AuthTokens | null => {
  const { data: session } = useAuthSession();
  return session?.tokens || null;
};
