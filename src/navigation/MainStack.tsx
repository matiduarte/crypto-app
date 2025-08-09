import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CryptoStackParamList } from '../types';
import { BottomTabNavigator } from './BottomTabNavigator';
import { colors } from '../constants/colors';

const Stack = createNativeStackNavigator<CryptoStackParamList>();

export const MainStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: colors.textPrimary,
        },
        headerTintColor: colors.primary,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="CryptoList"
        component={BottomTabNavigator}
        options={{
          headerShown: false, // BottomTabNavigator handles its own headers
        }}
      />
    </Stack.Navigator>
  );
};
