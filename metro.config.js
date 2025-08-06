const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    assetExts: ['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp', 'ttf', 'otf', 'woff', 'woff2'],
  },
  transformer: {
    // Enable SVG support if needed in the future
    babelTransformerPath: require.resolve('@react-native/metro-babel-transformer'),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
