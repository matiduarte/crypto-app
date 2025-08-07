import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types';
import { CryptoListScreen } from '../screens/main/CryptoListScreen';
import { ExchangeScreen } from '../screens/main/ExchangeScreen';
import { ScannerScreen } from '../screens/main/ScannerScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#fff',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: '#1a1a1a',
        },
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f1f3f4',
          paddingTop: 2,
          paddingBottom: 12,
          height: 85,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 8,
        },
        tabBarActiveTintColor: '#4285F4',
        tabBarInactiveTintColor: '#9e9e9e',
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
        name="CryptoList"
        component={CryptoListScreen}
        options={{
          title: 'Markets',
          headerTitle: '📊 Cryptocurrency Markets',
          tabBarLabel: 'Markets',
          tabBarIcon: ({ focused }) =>
            TabIconComponent({ focused, icon: '📊' }),
        }}
      />

      <Tab.Screen
        name="Exchange"
        component={ExchangeScreen}
        options={{
          title: 'Exchange',
          headerTitle: '💱 Currency Exchange',
          tabBarLabel: 'Exchange',
          tabBarIcon: ({ focused }) =>
            TabIconComponent({ focused, icon: '💱' }),
        }}
      />

      <Tab.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{
          title: 'Scanner',
          headerTitle: '📱 QR Code Scanner',
          tabBarLabel: 'Scanner',
          tabBarIcon: ({ focused }) =>
            TabIconComponent({ focused, icon: '📱' }),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          headerTitle: '👤 Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) =>
            TabIconComponent({ focused, icon: '👤' }),
        }}
      />
    </Tab.Navigator>
  );
};

interface TabIconProps {
  icon: string;
  focused: boolean;
}

const TabIconComponent = ({ icon, focused }: TabIconProps) => (
  <TabIcon icon={icon} focused={focused} />
);

const getTextStyle = (focused: boolean) => ({
  fontSize: focused ? 24 : 20,
  opacity: focused ? 1 : 0.7,
});

const TabIcon: React.FC<TabIconProps> = ({ icon, focused }) => {
  return <Text style={getTextStyle(focused)}>{icon}</Text>;
};
