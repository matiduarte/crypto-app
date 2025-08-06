import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CryptoStackParamList } from '../types';
import { BottomTabNavigator } from './BottomTabNavigator';
import { CryptoDetailScreen } from '../screens/main/CryptoDetailScreen';

const Stack = createNativeStackNavigator<CryptoStackParamList>();

export const MainStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: '#1a1a1a',
        },
        headerTintColor: '#4285F4',
        contentStyle: { backgroundColor: '#f8f9fa' },
      }}
    >
      <Stack.Screen
        name="CryptoList"
        component={BottomTabNavigator}
        options={{
          headerShown: false, // BottomTabNavigator handles its own headers
        }}
      />

      <Stack.Screen
        name="CryptoDetail"
        component={CryptoDetailScreen}
        options={({ route }) => ({
          title: route.params.symbol.toUpperCase(),
          headerTitle: `${route.params.symbol.toUpperCase()} Details`,
        })}
      />
    </Stack.Navigator>
  );
};
