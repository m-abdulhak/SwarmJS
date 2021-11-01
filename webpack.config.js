const path = require('path');

module.exports = {
  mode: 'development',
  entry: [
    './src/index.js',
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
  },
  module: {
    rules: [
      {
        test: require.resolve('matter-js'),
        loader: 'expose-loader',
        options: {
          exposes: ['Matter'],
        },
      },
    ],
  },
};
