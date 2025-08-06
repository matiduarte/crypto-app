import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryProvider } from './src/contexts/QueryProvider';
import { CryptoTestComponent } from './src/components/common/CryptoTestComponent';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <QueryProvider>
        <StatusBar 
          barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
          backgroundColor="transparent"
          translucent
        />
        <CryptoTestComponent />
      </QueryProvider>
    </SafeAreaProvider>
  );
}

// Styles removed - now handled by individual components with SafeArea

export default App;
