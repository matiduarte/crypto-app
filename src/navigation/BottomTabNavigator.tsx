import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '@types';
import { CryptoListScreen } from '@screens/main/CryptoListScreen';
import { ExchangeScreen } from '@screens/main/ExchangeScreen';
import { ScannerScreen } from '@screens/main/ScannerScreen';
import { ProfileScreen } from '@screens/main/ProfileScreen';
import { CustomIcon } from '@components';
import { colors } from '@constants/colors';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.primary,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: colors.surface,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
          paddingTop: 2,
          paddingBottom: 12,
          height: 85,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inactive,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Crypto"
        component={CryptoListScreen}
        options={{
          title: 'Markets',
          headerTitle: 'Cryptocurrency Markets',
          tabBarLabel: 'Markets',
          tabBarIcon: ({ focused }) =>
            TabIcon({ focused, iconName: 'show-chart' }),
        }}
      />

      <Tab.Screen
        name="Exchange"
        component={ExchangeScreen}
        options={{
          title: 'Exchange',
          headerTitle: 'Currency Exchange',
          tabBarLabel: 'Exchange',
          tabBarIcon: ({ focused }) =>
            TabIcon({ focused, iconName: 'swap-horiz' }),
        }}
      />

      <Tab.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{
          title: 'Scanner',
          headerTitle: 'QR Code Scanner',
          tabBarLabel: 'Scanner',
          tabBarIcon: ({ focused }) =>
            TabIcon({ focused, iconName: 'qr-code-scanner' }),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          headerTitle: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => TabIcon({ focused, iconName: 'person' }),
        }}
      />
    </Tab.Navigator>
  );
};

interface TabIconProps {
  iconName: string;
  focused: boolean;
}

const TabIcon = ({ iconName, focused }: TabIconProps) => (
  <CustomIcon
    name={iconName}
    size={focused ? 26 : 22}
    color={focused ? colors.primary : colors.inactive}
  />
);
