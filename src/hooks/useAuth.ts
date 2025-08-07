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

interface RefreshTokensResult {
  success: boolean;
  tokens?: AuthTokens;
  error?: string;
}

interface AuthSession {
  user: User | null;
  tokens: AuthTokens | null;
  isLoggedIn: boolean;
}

// ============================================================================
// QUERIES
// ============================================================================

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
          return { user: null, tokens: null, isLoggedIn: false };
        }

        // Try silent sign-in
        const silentResult = await authHelpers.silentSignIn();

        if (silentResult.success && silentResult.user && silentResult.tokens) {
          // Load additional stored auth data if any
          const [storedUser, storedToken, storedRefreshToken] =
            await Promise.all([
              storageService.getItem<User>(STORAGE_KEYS.USER),
              storageService.getItem<string>(STORAGE_KEYS.TOKEN),
              storageService.getItem<string>(STORAGE_KEYS.REFRESH_TOKEN),
            ]);

          const user = storedUser || silentResult.user;
          const tokens: AuthTokens = {
            idToken: storedToken || silentResult.tokens.idToken,
            accessToken: storedRefreshToken || silentResult.tokens.accessToken,
          };

          return { user, tokens, isLoggedIn: true };
        }

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

// ============================================================================
// MUTATIONS
// ============================================================================

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
 * Mutation for refreshing authentication tokens
 */
export const useRefreshTokens = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<RefreshTokensResult> => {
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

          return {
            success: true,
            tokens: result.tokens,
          };
        }

        return {
          success: false,
          error: result.error || 'Token refresh failed',
        };
      } catch (error: any) {
        console.error('Token refresh mutation error:', error);
        return {
          success: false,
          error: error?.message || 'Token refresh failed',
        };
      }
    },
    onSuccess: result => {
      if (result.success && result.tokens) {
        // Update session cache with new tokens
        const currentSession = queryClient.getQueryData<AuthSession>(
          AUTH_QUERY_KEYS.session,
        );
        if (currentSession) {
          queryClient.setQueryData(AUTH_QUERY_KEYS.session, {
            ...currentSession,
            tokens: result.tokens,
          });
        }
      }
    },
    onError: error => {
      console.error('Token refresh mutation error:', error);
      // On refresh failure, user might need to sign in again
      // Clear auth state
      queryClient.setQueryData(AUTH_QUERY_KEYS.session, {
        user: null,
        tokens: null,
        isLoggedIn: false,
      });
    },
  });
};

// ============================================================================
// UTILITY HOOKS
// ============================================================================

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
  const refreshTokensMutation = useRefreshTokens();

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
    refreshTokens: refreshTokensMutation.mutateAsync,

    // Mutation states
    isSigningIn: signInMutation.isPending,
    isSigningOut: signOutMutation.isPending,
    isRefreshingTokens: refreshTokensMutation.isPending,

    // Clear error function
    clearError: () => {
      signInMutation.reset();
      signOutMutation.reset();
      refreshTokensMutation.reset();
    },

    // Raw mutations for advanced usage
    signInMutation,
    signOutMutation,
    refreshTokensMutation,
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
