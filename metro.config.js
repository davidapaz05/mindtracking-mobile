const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  // Garante compatibilidade com Expo SDK 46+ e babelTransformerPath do svg-transformer:
  config.transformer = {
    ...config.transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  };
  config.resolver = {
    ...config.resolver,
    assetExts: config.resolver.assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...config.resolver.sourceExts, 'svg'],
  };

  return config;
})();
