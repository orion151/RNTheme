module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      require.resolve('babel-plugin-module-resolver'),
      {
        alias: {
          "@analytics": './src/analytics',
          "@assets": './src/ui/assets',
          "@components": './src/ui/components',
          "@epics": './src/redux/epics',
          "@hoc": './src/hoc',
          "@hooks": './src/hooks',
          "@mocks": './src/mocks',
          "@models": './src/models',
          "@navigation": './src/ui/navigation',
          "@redux": './src/redux',
          "@services": './src/services',
          "@slices": './src/redux/slices',
          "@types": './src/types',
          "@ui": './src/ui',
          "@util": './src/utilities',
        }
      }
    ]
  ],
  env: {
    test: {
      plugins: ["transform-es2015-modules-commonjs"]
    }
  }
}
