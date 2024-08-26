// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  // babelTransformerPath: require.resolve('react-native-svg-transformer'),
  // assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false, // false
      inlineRequires: true,
    },
  }),
};
//
config.resolver = {
  ...config.resolver,
  //assetExts: ['tflite', ...config.resolver.assetExts],
  // sourceExts: [...config.resolver.sourceExts, 'svg', 'd.ts'],
};

config.resolver.assetExts.push("tflite");


module.exports = config;