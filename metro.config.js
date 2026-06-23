const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// react-native@0.81.5's own metro dependencies transitively pull in
// react-native@0.86.0, which gets nested at node_modules/react-native/node_modules/react-native.
// Metro's codegen trips on files in that nested copy (e.g. VirtualViewExperimentalNativeComponent.js).
// Block the nested path so metro only resolves from the top-level react-native@0.81.5.
config.resolver.blockList = [
  /node_modules\/react-native\/node_modules\/react-native\/.*/,
];

module.exports = config;
