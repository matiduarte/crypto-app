# CryptoApp - Mobile Challenge

React Native cryptocurrency application with real-time price tracking, currency exchange, and QR wallet scanning.

## Features

- Google Sign-In authentication
- Real-time cryptocurrency prices
- Bidirectional crypto fiat exchange
- QR wallet scanner with history

## Tech Stack

- **React Native** 0.80.2 with TypeScript
- **TanStack Query** - Data fetching and caching
- **React Navigation** - Navigation system
- **Axios** - HTTP client for API calls
- **React Native Vector Icons** - Icon system
- **React Native Vision Camera** - QR scanning
- **AsyncStorage** - Local data persistence

## Setup

### Prerequisites

- Node.js e18
- React Native CLI
- Xcode (iOS) / Android Studio (Android)

### Installation

```bash
# Install dependencies
npm install

# iOS setup
cd ios && pod install && cd ..

# Android setup (if needed)
cd android && ./gradlew clean && cd ..
```

## Environment Variables

This app uses environment variables for sensitive configuration. Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:

- `COINGECKO_API_KEY` - API key from [CoinGecko](https://coingecko.com/api)
- `WEB_CLIENT_ID` - Google OAuth web client ID
- `IOS_CLIENT_ID` - Google OAuth iOS client ID

## Running the App

```bash
# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Development

```bash
# Linting
npm run lint

# Testing
npm test
npm run test:coverage

# Clean cache
npm run clean
```

## Project Structure

```
src/
 components/     # Reusable UI components
 screens/        # Screen components
 navigation/     # Navigation setup
 hooks/          # Custom React hooks
 services/       # API services
 utils/          # Helper functions
 types/          # TypeScript definitions
```

## API Integration

- **CoinGecko API** for cryptocurrency data
- **Real-time price updates** with auto-refresh
- **Google OAuth** for authentication

## Demo

- Login Screen

https://github.com/user-attachments/assets/db808a89-6024-4cbf-9689-8a33d5475bb2

- Crypto List Screen

https://github.com/user-attachments/assets/5e47594b-1af3-4695-b021-e13750643951

https://github.com/user-attachments/assets/2eebfe1e-3b49-4537-930d-e248adf4f22c

- Exchange Screen

https://github.com/user-attachments/assets/72baa9b8-5497-48e8-b303-fc1bb2ef1e26

- Scanner Screen


https://github.com/user-attachments/assets/ad8a6d80-af78-4902-af8c-16c71ef775d8


https://github.com/user-attachments/assets/1e20b769-af9d-44fd-9218-c79790140893


https://github.com/user-attachments/assets/980821ec-3b27-4760-afb6-a216dabf4e7d


- Profile Screen

https://github.com/user-attachments/assets/0aedadec-fab2-4b14-ba9d-f8f5b773abf2









