import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@services/authService';
import storageService from '@utils/storage';
import { AuthTokens, User } from '@types';

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

interface AuthSession {
  user: User | null;
  tokens: AuthTokens | null;
  isLoggedIn: boolean;
}

/**
 * Simple auth session query
 */
const useAuthSession = () => {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.session,
    queryFn: async (): Promise<AuthSession> => {
      try {
        const [storedUser, storedToken, storedIsLoggedIn] = await Promise.all([
          storageService.getItem<User>(STORAGE_KEYS.USER),
          storageService.getItem<string>(STORAGE_KEYS.TOKEN),
          storageService.getItem<boolean>(STORAGE_KEYS.IS_LOGGED_IN),
        ]);

        if (storedIsLoggedIn && storedUser && storedToken) {
          try {
            // Validate the session by checking if tokens are still valid
            const isSessionValid = await authService.validateSession();

            if (isSessionValid) {
              return {
                user: storedUser,
                tokens: { idToken: storedToken, accessToken: '' },
                isLoggedIn: true,
              };
            } else {
              // Clear expired session data
              await Promise.all([
                storageService.removeItem(STORAGE_KEYS.USER),
                storageService.removeItem(STORAGE_KEYS.TOKEN),
                storageService.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
                storageService.removeItem(STORAGE_KEYS.IS_LOGGED_IN),
                storageService.removeItem('auth_session_start_time'),
              ]);

              return { user: null, tokens: null, isLoggedIn: false };
            }
          } catch (validationError) {
            // On validation error, assume session is invalid and clear it
            await Promise.all([
              storageService.removeItem(STORAGE_KEYS.USER),
              storageService.removeItem(STORAGE_KEYS.TOKEN),
              storageService.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
              storageService.removeItem(STORAGE_KEYS.IS_LOGGED_IN),
              storageService.removeItem('auth_session_start_time'),
            ]);

            return { user: null, tokens: null, isLoggedIn: false };
          }
        }

        return { user: null, tokens: null, isLoggedIn: false };
      } catch (error) {
        return { user: null, tokens: null, isLoggedIn: false };
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes - normal session checking
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 2, // Check every 2 minutes for session expiration
    refetchIntervalInBackground: false, // Don't check in background to save resources
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
        // Initialize Google Sign-In configuration first
        const { APP_CONFIG } = await import('../constants/config');

        await authService.configure({
          webClientId: APP_CONFIG.GOOGLE_SIGNIN_CONFIG.WEB_CLIENT_ID,
          iosClientId: APP_CONFIG.GOOGLE_SIGNIN_CONFIG.IOS_CLIENT_ID,
          offlineAccess: APP_CONFIG.GOOGLE_SIGNIN_CONFIG.OFFLINE_ACCESS,
          forceCodeForRefreshToken:
            APP_CONFIG.GOOGLE_SIGNIN_CONFIG.FORCE_CODE_FOR_REFRESH_TOKEN,
        });

        const result = await authService.signIn();

        if (result.success && result.user && result.tokens) {
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
  });
};

/**
 * Simple sign-out mutation
 */
const useSignOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await Promise.all([
          storageService.removeItem(STORAGE_KEYS.USER),
          storageService.removeItem(STORAGE_KEYS.TOKEN),
          storageService.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
          storageService.removeItem(STORAGE_KEYS.IS_LOGGED_IN),
        ]);
        return { success: true };
      } catch (error) {
        return { success: false, error: 'Failed to sign out' };
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEYS.session, {
        user: null,
        tokens: null,
        isLoggedIn: false,
      });
      queryClient.clear();
    },
  });
};

/**
 * Hook that provides authentication state and actions with session expiration handling
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
      signInMutation.error?.message ||
      signOutMutation.error?.message ||
      sessionError?.message ||
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
