module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'], // This is essential for Expo!
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          safe: false, // Set to true in production
          allowUndefined: true,
        },
      ],
    ],
  };
};