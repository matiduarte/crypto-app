import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { AuthServiceConfig, AuthTokens, SignInResult, User } from '@types';

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
    } catch (error) {
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
        return false;
      }
    } catch (error) {
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
      // Check if this is a token expiration error
      if (this.isTokenExpiredError(error)) {
        // Silently clear the session since tokens are invalid
        try {
          await GoogleSignin.signOut();
        } catch (signOutError) {
          // Silent failure handling
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

      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Sign-out failed',
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

    return {
      success: false,
      error: errorMessage,
    };
  }

  /**
   * Validate user session with custom timeout and token expiration handling
   */
  async validateSession(): Promise<boolean> {
    try {
      const isSignedIn = await this.isSignedIn();
      if (!isSignedIn) return false;

      const userInfo = this.getCurrentUser();
      const tokens = await this.getCurrentTokens();

      // If getCurrentTokens returned null due to expiration, session is invalid
      if (!tokens || !tokens.idToken) {
        return false;
      }

      return !!(userInfo && tokens && tokens.idToken);
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
