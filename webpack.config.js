const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const StartServerPlugin = require('start-server-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: ['webpack/hot/poll?1000', './src/index'],
  watch: false,
  target: 'node',
  stats: 'minimal',
  externals: [
    nodeExternals({
      whitelist: ['webpack/hot/poll?1000'],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new StartServerPlugin('server.js'),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.EnvironmentPlugin(['NODE_ENV']),
  ],
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'server.js',
  },
};
