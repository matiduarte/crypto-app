import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  backgroundColor?: string;
  edges?: Edge[];
  style?: ViewStyle;
}

export const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  backgroundColor = colors.backgroundDark,
  edges = ['top', 'bottom', 'left', 'right'],
  style,
}) => {
  return (
    <SafeAreaView 
      style={[
        styles.container,
        { backgroundColor },
        style,
      ]}
      edges={edges}
    >
      {children}
    </SafeAreaView>
  );
};

// Specialized components for common use cases
export const SafeAreaScreen: React.FC<Omit<SafeAreaWrapperProps, 'edges'>> = (props) => (
  <SafeAreaWrapper {...props} edges={['top', 'left', 'right']} />
);

export const SafeAreaModal: React.FC<Omit<SafeAreaWrapperProps, 'edges'>> = (props) => (
  <SafeAreaWrapper {...props} edges={['bottom', 'left', 'right']} />
);

export const SafeAreaHeader: React.FC<Omit<SafeAreaWrapperProps, 'edges'>> = (props) => (
  <SafeAreaWrapper {...props} edges={['top', 'left', 'right']} />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});