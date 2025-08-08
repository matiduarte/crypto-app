import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

export interface AuthTokens {
  idToken: string;
  accessToken: string;
}

export type User = {
  id: string;
  name: string | null;
  email: string;
  photo: string | null;
  familyName: string | null;
  givenName: string | null;
};

export interface SignInResult {
  success: boolean;
  user?: User;
  tokens?: AuthTokens;
  error?: string;
  warning?: string;
}

export interface AuthServiceConfig {
  webClientId: string;
  offlineAccess?: boolean;
  hostedDomain?: string;
  forceCodeForRefreshToken?: boolean;
}

class AuthService {
  private isConfigured = false;

  /**
   * Configure Google Sign-In
   */
  async configure(
    config: AuthServiceConfig & { iosClientId?: string },
  ): Promise<void> {
    try {
      const configParams: any = {
        webClientId: config.webClientId,
        offlineAccess: config.offlineAccess ?? true,
        hostedDomain: config.hostedDomain ?? '',
        forceCodeForRefreshToken: config.forceCodeForRefreshToken ?? true,
      };

      // Add iosClientId if provided (required when GoogleService-Info.plist is not properly detected)
      if (config.iosClientId) {
        configParams.iosClientId = config.iosClientId;
      }

      GoogleSignin.configure(configParams);

      this.isConfigured = true;
      console.log('Google Sign-In configured successfully', configParams);
    } catch (error) {
      console.error('Google Sign-In configuration failed:', error);
      throw error;
    }
  }

  /**
   * Check if Google Play Services are available (Android only)
   */
  async hasPlayServices(): Promise<boolean> {
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      return true;
    } catch (error) {
      console.error('Google Play Services not available:', error);
      return false;
    }
  }

  /**
   * Check if user is currently signed in
   * Uses signInSilently() for better iOS compatibility after app restart
   */
  async isSignedIn(): Promise<boolean> {
    try {
      // First try to get current user (fast, cached)
      const currentUser = GoogleSignin.getCurrentUser();
      if (currentUser) {
        return true;
      }

      // If no cached user, try silent sign-in (especially important for iOS)
      try {
        const silentSignInResult = await GoogleSignin.signInSilently();
        return !!silentSignInResult;
      } catch (silentError: any) {
        // Silent sign-in failed - user is not signed in
        console.log(
          'Silent sign-in failed, user not signed in:',
          silentError?.message || 'Unknown error',
        );
        return false;
      }
    } catch (error) {
      console.error('Error checking sign-in status:', error);
      return false;
    }
  }

  /**
   * Get current user information
   */
  getCurrentUser(): User | null {
    try {
      const userInfo = GoogleSignin.getCurrentUser();
      return userInfo ? userInfo.user : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Get current user information with iOS session restoration
   * This method will attempt to restore the session if needed
   */
  async getCurrentUserWithRestore(): Promise<User | null> {
    try {
      // First try to get cached user
      const userInfo = GoogleSignin.getCurrentUser();
      if (userInfo && userInfo.user) {
        return userInfo.user;
      }

      // If no cached user, try silent sign-in for iOS compatibility
      try {
        const silentSignInResult = await GoogleSignin.signInSilently();
        if (silentSignInResult.type === 'success') {
          return silentSignInResult.data.user || null;
        }
        return null;
      } catch (silentError: any) {
        console.log(
          'Silent user restoration failed:',
          silentError?.message || 'Unknown error',
        );
        return null;
      }
    } catch (error) {
      console.error('Error getting current user with restore:', error);
      return null;
    }
  }

  /**
   * Get current authentication tokens with expiration handling
   */
  async getCurrentTokens(): Promise<AuthTokens | null> {
    try {
      const tokens = await GoogleSignin.getTokens();
      return {
        idToken: tokens.idToken,
        accessToken: tokens.accessToken,
      };
    } catch (error: any) {
      console.error('Error getting tokens:', error);

      // Check if this is a token expiration error
      if (this.isTokenExpiredError(error)) {
        console.warn('Tokens have expired, clearing session');
        // Silently clear the session since tokens are invalid
        try {
          await GoogleSignin.signOut();
          console.log('Session cleared due to expired tokens');
        } catch (signOutError) {
          console.warn(
            'Failed to clear session after token expiration:',
            signOutError,
          );
        }
      }

      return null;
    }
  }

  /**
   * Check if an error indicates token expiration/revocation
   */
  private isTokenExpiredError(error: any): boolean {
    const errorString = error?.message || '';
    const errorCode = error?.code || '';

    // Check for specific Google token expiration indicators
    return (
      errorString.includes('invalid_grant') ||
      errorString.includes('Token has been expired or revoked') ||
      errorString.includes('expired') ||
      errorString.includes('revoked') ||
      errorCode === 'invalid_grant' ||
      errorCode === -10 // OAuth token error code
    );
  }

  /**
   * Sign in with Google
   */
  async signIn(): Promise<SignInResult> {
    try {
      if (!this.isConfigured) {
        throw new Error(
          'Google Sign-In not configured. Call configure() first.',
        );
      }

      // Check Play Services availability
      const hasPlayServices = await this.hasPlayServices();
      if (!hasPlayServices) {
        return {
          success: false,
          error: 'Google Play Services not available',
        };
      }

      // Perform sign-in
      const result = await GoogleSignin.signIn();

      if (result.type !== 'success') {
        return {
          success: false,
          error: 'Sign in was cancelled or failed',
        };
      }

      const userInfo = result.data;

      if (!userInfo) {
        return {
          success: false,
          error: 'Sign-in failed - no user information received',
        };
      }

      // Get tokens
      const tokens = await this.getCurrentTokens();

      if (!tokens) {
        return {
          success: false,
          error: 'Sign-in failed - no authentication tokens received',
        };
      }

      return {
        success: true,
        user: userInfo.user,
        tokens,
      };
    } catch (error: any) {
      return this.handleSignInError(error);
    }
  }

  /**
   * Sign out from Google (without revoking tokens)
   * This is a lighter version that just signs out locally
   */
  async signOut(): Promise<SignInResult> {
    try {
      await GoogleSignin.signOut();
      console.log('Successfully signed out from Google');

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Sign-out error:', error);
      return {
        success: false,
        error: error?.message || 'Sign-out failed',
      };
    }
  }

  /**
   * Revoke access and sign out
   * Made more robust to handle token revocation failures gracefully
   */
  async revokeAccess(): Promise<SignInResult> {
    let revokeSuccess = false;
    let signOutSuccess = false;
    let lastError: any = null;

    // Try to revoke access first, but don't fail if it doesn't work
    try {
      await GoogleSignin.revokeAccess();
      revokeSuccess = true;
      console.log('Successfully revoked Google access');
    } catch (error: any) {
      console.warn('Failed to revoke Google access (non-critical):', error);
      lastError = error;
      // Don't return here - continue with sign out
    }

    // Always try to sign out, even if revoke failed
    try {
      await GoogleSignin.signOut();
      signOutSuccess = true;
      console.log('Successfully signed out from Google');
    } catch (error: any) {
      console.error('Failed to sign out from Google:', error);
      lastError = error;
    }

    // Consider it successful if we managed to sign out, even if revoke failed
    if (signOutSuccess) {
      return {
        success: true,
        // Optionally include a warning about revoke failure
        ...(revokeSuccess
          ? {}
          : {
              warning:
                'Sign-out successful, but token revocation failed (non-critical)',
            }),
      };
    } else {
      return {
        success: false,
        error: lastError?.message || 'Sign-out failed',
      };
    }
  }

  /**
   * Handle sign-in errors with specific error codes
   */
  private handleSignInError(error: any): SignInResult {
    let errorMessage = 'Sign-in failed';

    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      errorMessage = 'Sign-in was cancelled by user';
    } else if (error.code === statusCodes.IN_PROGRESS) {
      errorMessage = 'Sign-in is already in progress';
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      errorMessage = 'Google Play Services not available';
    } else if (error.code === statusCodes.SIGN_IN_REQUIRED) {
      errorMessage = 'Sign-in is required';
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('Google Sign-In error:', {
      code: error.code,
      message: error.message,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }

  /**
   * Validate user session with token expiration handling
   */
  async validateSession(): Promise<boolean> {
    try {
      const isSignedIn = await this.isSignedIn();
      if (!isSignedIn) return false;

      const userInfo = this.getCurrentUser();
      const tokens = await this.getCurrentTokens();

      // If getCurrentTokens returned null due to expiration, session is invalid
      if (!tokens || !tokens.idToken) {
        console.warn(
          'Session validation failed: tokens are invalid or expired',
        );
        return false;
      }

      return !!(userInfo && tokens && tokens.idToken);
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }

  /**
   * Get user profile information in a normalized format
   */
  async getUserProfile(): Promise<{
    id: string;
    name: string;
    email: string;
    photo?: string;
    givenName?: string;
    familyName?: string;
  } | null> {
    try {
      const user = this.getCurrentUser();

      if (!user) return null;

      return {
        id: user.id || '',
        name: user.name || 'Unknown User',
        email: user.email || '',
        photo: user.photo || undefined,
        givenName: user.givenName || undefined,
        familyName: user.familyName || undefined,
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

// Helper functions for common auth operations
export const authHelpers = {
  /**
   * Initialize Google Sign-In with configuration
   */
  async initialize(): Promise<boolean> {
    try {
      // Import config at runtime to avoid circular imports
      const { APP_CONFIG } = await import('../constants/config');

      await authService.configure({
        webClientId: APP_CONFIG.GOOGLE_SIGNIN_CONFIG.WEB_CLIENT_ID,
        iosClientId: APP_CONFIG.GOOGLE_SIGNIN_CONFIG.IOS_CLIENT_ID,
        offlineAccess: APP_CONFIG.GOOGLE_SIGNIN_CONFIG.OFFLINE_ACCESS,
        forceCodeForRefreshToken:
          APP_CONFIG.GOOGLE_SIGNIN_CONFIG.FORCE_CODE_FOR_REFRESH_TOKEN,
      });

      return true;
    } catch (error) {
      console.error('Auth initialization failed:', error);
      return false;
    }
  },

  /**
   * Quick sign-in with error handling
   */
  async quickSignIn(): Promise<SignInResult> {
    const initialized = await authHelpers.initialize();
    if (!initialized) {
      return {
        success: false,
        error: 'Authentication service initialization failed',
      };
    }

    return await authService.signIn();
  },

  /**
   * Silent sign-in (check existing session)
   * Enhanced for iOS compatibility with proper session restoration and token expiration handling
   */
  async silentSignIn(): Promise<SignInResult> {
    try {
      // Try to restore user session (especially important for iOS)
      const user = await authService.getCurrentUserWithRestore();

      if (user) {
        // If we got the user, also try to get tokens
        const tokens = await authService.getCurrentTokens();

        if (tokens) {
          return {
            success: true,
            user: user,
            tokens,
          };
        } else {
          console.warn(
            'User found but tokens are invalid/expired - session cleared',
          );
          // Session was automatically cleared by getCurrentTokens() if tokens were expired
          return {
            success: false,
            error: 'Authentication session has expired. Please sign in again.',
          };
        }
      }

      return {
        success: false,
        error: 'No valid session found',
      };
    } catch (error: any) {
      console.error('Silent sign-in error:', error);
      return {
        success: false,
        error: error?.message || 'Silent sign-in failed',
      };
    }
  },

  /**
   * Complete sign-out with cleanup
   * Tries to revoke access first, falls back to regular sign-out if that fails
   */
  async completeSignOut(): Promise<SignInResult> {
    // First try the full revoke access approach
    const revokeResult = await authService.revokeAccess();

    if (revokeResult.success) {
      return revokeResult;
    }

    console.warn(
      'Revoke access failed, attempting simple sign-out as fallback',
    );

    // If revoke access fails, try simple sign-out as fallback
    const signOutResult = await authService.signOut();

    if (signOutResult.success) {
      return {
        success: true,
        warning:
          'Sign-out successful using fallback method (token revocation failed)',
      };
    }

    // If both fail, return the original error
    return revokeResult;
  },

  /**
   * Emergency sign-out that only does local cleanup
   * Use this when Google services are not responding
   */
  async emergencySignOut(): Promise<SignInResult> {
    try {
      // Try simple sign-out first
      const result = await authService.signOut();

      if (result.success) {
        return {
          success: true,
          warning: 'Emergency sign-out completed (local only)',
        };
      }

      // If even simple sign-out fails, we'll consider it successful
      // since we're doing emergency cleanup
      console.warn(
        'Emergency sign-out: Google sign-out failed, but continuing with local cleanup',
      );

      return {
        success: true,
        warning: 'Emergency sign-out completed (Google services unavailable)',
      };
    } catch (error: any) {
      console.error('Emergency sign-out error:', error);
      // Even in emergency, if everything fails, we should report it
      return {
        success: false,
        error: error?.message || 'Emergency sign-out failed',
      };
    }
  },
};
