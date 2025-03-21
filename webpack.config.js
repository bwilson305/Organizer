const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './app.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'development',
  resolve: {
    extensions: ['.js'],
    fallback: {
      "fs": false,
      "path": false,
      "crypto": false,
      "util": false,
      "stream": false,
      "buffer": false,
      "process/browser": false,
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html', // Source file
      filename: 'index.html'    // Output file in dist
    })
  ]
};