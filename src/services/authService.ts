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
   */
  async isSignedIn(): Promise<boolean> {
    try {
      const userInfo = GoogleSignin.getCurrentUser();
      return userInfo !== null;
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
   * Get current authentication tokens
   */
  async getCurrentTokens(): Promise<AuthTokens | null> {
    try {
      const tokens = await GoogleSignin.getTokens();
      return {
        idToken: tokens.idToken,
        accessToken: tokens.accessToken,
      };
    } catch (error) {
      console.error('Error getting tokens:', error);
      return null;
    }
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
   * Sign out from Google
   */
  async signOut(): Promise<SignInResult> {
    try {
      await GoogleSignin.signOut();

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
   */
  async revokeAccess(): Promise<SignInResult> {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Revoke access error:', error);
      return {
        success: false,
        error: error?.message || 'Revoke access failed',
      };
    }
  }

  /**
   * Refresh authentication tokens
   */
  async refreshTokens(): Promise<SignInResult> {
    try {
      const tokens = await this.getCurrentTokens();

      if (!tokens) {
        return {
          success: false,
          error: 'Unable to refresh tokens - no valid session',
        };
      }

      return {
        success: true,
        tokens,
      };
    } catch (error: any) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        error: error?.message || 'Token refresh failed',
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
   * Validate user session
   */
  async validateSession(): Promise<boolean> {
    try {
      const isSignedIn = await this.isSignedIn();
      if (!isSignedIn) return false;

      const userInfo = this.getCurrentUser();
      const tokens = await this.getCurrentTokens();

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
   */
  async silentSignIn(): Promise<SignInResult> {
    try {
      const isValid = await authService.validateSession();

      if (isValid) {
        const user = authService.getCurrentUser();
        const tokens = await authService.getCurrentTokens();

        if (user && tokens) {
          return {
            success: true,
            user: user,
            tokens,
          };
        }
      }

      return {
        success: false,
        error: 'No valid session found',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Silent sign-in failed',
      };
    }
  },

  /**
   * Complete sign-out with cleanup
   */
  async completeSignOut(): Promise<SignInResult> {
    return await authService.revokeAccess();
  },
};
