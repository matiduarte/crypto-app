# Google Sign-In Configuration Guide

## Overview
This guide explains how to configure Google Sign-In for the CryptoApp Mobile Challenge. You'll need to create a project in Google Cloud Console and configure both Android and iOS clients.

## Prerequisites
- Google account
- Access to Google Cloud Console
- Android development setup (for testing on Android)
- iOS development setup (for testing on iOS)

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Note down your **Project ID** and **Project Number**

## Step 2: Enable Google Sign-In API

1. In Google Cloud Console, go to **APIs & Services > Library**
2. Search for "Google Sign-In API" or "Google+ API"
3. Click **Enable**

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services > OAuth consent screen**
2. Choose **External** user type
3. Fill in required information:
   - App name: `CryptoApp`
   - User support email: your email
   - App domain: can leave blank for testing
   - Developer contact: your email
4. Add scopes (optional for basic sign-in)
5. Save and continue

## Step 4: Create OAuth 2.0 Credentials

### For Android:

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth 2.0 Client IDs**
3. Application type: **Android**
4. Name: `CryptoApp Android`
5. Package name: `com.cryptoapp` (or your actual package name)
6. SHA-1 certificate fingerprint:
   
   **For Debug (Development):**
   ```bash
   # On macOS/Linux:
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   
   # On Windows:
   keytool -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```
   
   **For Release (Production):**
   ```bash
   keytool -list -v -keystore /path/to/your/release-key.keystore -alias your-key-alias
   ```

7. Click **Create**
8. Note down the **Client ID**

### For iOS:

1. Click **Create Credentials > OAuth 2.0 Client IDs**
2. Application type: **iOS**
3. Name: `CryptoApp iOS`
4. Bundle ID: `org.reactjs.native.example.CryptoApp` (or your actual bundle ID)
5. Click **Create**
6. Note down the **Client ID**

### For Web (Required for both platforms):

1. Click **Create Credentials > OAuth 2.0 Client IDs**
2. Application type: **Web application**
3. Name: `CryptoApp Web`
4. Click **Create**
5. Note down the **Client ID** (this will be your `webClientId`)

## Step 5: Download Configuration Files

### Android:
1. In **APIs & Services > Credentials**
2. Find your Android OAuth 2.0 Client ID
3. Download the `google-services.json` file
4. Place it in `android/app/google-services.json`

### iOS:
1. In **APIs & Services > Credentials**
2. Find your iOS OAuth 2.0 Client ID
3. Download the `GoogleService-Info.plist` file
4. Place it in `ios/GoogleService-Info.plist`

## Step 6: Update App Configuration

### Update `src/constants/config.ts`:

```typescript
export const APP_CONFIG = {
  // ... other config
  GOOGLE_SIGNIN_CONFIG: {
    WEB_CLIENT_ID: 'YOUR_WEB_CLIENT_ID_HERE', // From Step 4 (Web)
    IOS_CLIENT_ID: 'YOUR_IOS_CLIENT_ID_HERE', // From Step 4 (iOS) - optional
  },
} as const;
```

### Update Android `android/build.gradle`:

Add to the dependencies section (if not already present):
```gradle
dependencies {
    classpath 'com.google.gms:google-services:4.3.15'
}
```

### Update `android/app/build.gradle`:

Add at the bottom of the file:
```gradle
apply plugin: 'com.google.gms.google-services'
```

### Update iOS URL Schemes:

1. Open `ios/CryptoApp.xcworkspace` in Xcode
2. Select your project in the navigator
3. Select your app target
4. Go to **Info > URL Types**
5. Add a new URL Type:
   - Identifier: `GoogleSignIn`
   - URL Schemes: Your `REVERSED_CLIENT_ID` from `GoogleService-Info.plist`

## Step 7: Test Configuration

1. Start your app: `npm start`
2. Run on Android: `npm run android`
3. Run on iOS: `npm run ios`
4. Test the Google Sign-In functionality

## Troubleshooting

### Common Issues:

1. **"Developer Error" on Android:**
   - Check SHA-1 fingerprint is correct
   - Ensure package name matches exactly
   - Verify `google-services.json` is in the right location

2. **"Sign-In Failed" on iOS:**
   - Check Bundle ID matches exactly
   - Verify `GoogleService-Info.plist` is added to Xcode project
   - Ensure URL schemes are configured correctly

3. **"Invalid Client" Error:**
   - Verify webClientId is correct in app configuration
   - Check OAuth consent screen is configured
   - Ensure all client IDs are from the same Google Cloud project

### Debug Commands:

```bash
# Clear Metro cache
npm run reset

# Clean and rebuild Android
npm run android-clean && npm run android

# Clean and rebuild iOS
npm run pod-install && npm run ios
```

## Security Notes

- **Never commit** `google-services.json` or `GoogleService-Info.plist` to version control
- Add these files to `.gitignore`
- Use environment variables for production deployments
- Regularly rotate API keys and certificates

## Example .gitignore entries:

```
# Google Sign-In configuration files
android/app/google-services.json
ios/GoogleService-Info.plist

# Keep example files for reference
!*.example
```

---

**Note:** This setup is required for Google Sign-In to work. Without these configuration files, the authentication feature will not function properly.