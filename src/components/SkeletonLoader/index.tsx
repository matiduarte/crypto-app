import React from 'react';
import { View } from 'react-native';
import { styles } from './styles';

interface SkeletonLoaderProps {
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  count = 8,
}) => (
  <View style={styles.skeletonContainer}>
    {Array.from({ length: count }).map((_, index) => (
      <View key={index} style={styles.skeletonItem}>
        <View style={styles.skeletonLeft}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonTextContainer}>
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonSubtitle} />
          </View>
        </View>
        <View style={styles.skeletonRight}>
          <View style={styles.skeletonPrice} />
          <View style={styles.skeletonChange} />
        </View>
      </View>
    ))}
  </View>
);
