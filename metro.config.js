const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Point assetRegistryPath directly to the actual asset-registry file in react-native
config.transformer.assetRegistryPath = path.resolve(
  __dirname,
  'node_modules/react-native/src/asset-registry.js'
);

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  'react-native/asset-registry': path.resolve(
    __dirname,
    'node_modules/react-native/src/asset-registry.js'
  ),
};

module.exports = config;
