import React from 'react';
import { StyleSheet, ViewStyle, ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@constants/colors';

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

// Pre-configured screen types
export const ScrollableScreen: React.FC<
  Omit<ScreenWrapperProps, 'scrollable'>
> = props => <ScreenWrapper {...props} scrollable />;

export const FixedScreen: React.FC<
  Omit<ScreenWrapperProps, 'scrollable'>
> = props => <ScreenWrapper {...props} scrollable={false} />;

export const FullScreenModal: React.FC<
  Omit<ScreenWrapperProps, 'safeAreaEdges'>
> = props => (
  <ScreenWrapper
    {...props}
    safeAreaEdges={['top', 'bottom', 'left', 'right']}
  />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 16,
  },
});
