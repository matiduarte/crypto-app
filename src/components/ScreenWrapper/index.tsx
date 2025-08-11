import React from 'react';
import { ViewStyle, ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@constants/colors';
import { styles } from './styles';

interface ScreenWrapperProps {
  children: React.ReactNode;
  backgroundColor?: string;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  scrollable?: boolean;
  scrollViewProps?: Omit<
    ScrollViewProps,
    'children' | 'style' | 'contentContainerStyle'
  >;
  safeAreaEdges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  backgroundColor = colors.backgroundDark,
  style,
  contentContainerStyle,
  scrollable = false,
  scrollViewProps = {},
  safeAreaEdges = ['left', 'right'],
}) => {
  const containerStyle = [styles.container, { backgroundColor }, style];

  if (scrollable) {
    const { ScrollView } = require('react-native');

    return (
      <SafeAreaView style={containerStyle} edges={safeAreaEdges}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.contentContainer,
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={false}
          {...scrollViewProps}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={containerStyle} edges={safeAreaEdges}>
      {children}
    </SafeAreaView>
  );
};

export const ScrollableScreen: React.FC<
  Omit<ScreenWrapperProps, 'scrollable'>
> = props => <ScreenWrapper {...props} scrollable />;

export const FixedScreen: React.FC<
  Omit<ScreenWrapperProps, 'scrollable'>
> = props => <ScreenWrapper {...props} scrollable={false} />;
