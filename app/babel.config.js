// Babel do React Native + alias "@/" apontando para src/ (o mesmo do tsconfig.json).
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ts', '.tsx', '.js', '.json'],
        alias: { '@': './src' },
      },
    ],
  ],
};
