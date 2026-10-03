const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const fs = require('fs');
const _ = require('lodash');

// Shared chrome lives in src/partials; each page renders it with its own `page` id
const partial = (name, params = {}) =>
  _.template(fs.readFileSync(path.resolve(__dirname, 'src/partials', `${name}.html`), 'utf8'))(params);

const page = (name) =>
  new HtmlWebpackPlugin({
    template: `./src/${name}.html`,
    filename: `${name}.html`,
    chunks: ['main'],
    templateParameters: {
      chromeTop: partial('chrome-top', { page: name }),
      socialFooter: partial('social-footer'),
      chromeBottom: partial('chrome-bottom'),
    },
  });

module.exports = {
  mode: 'production',
  entry: './src/js/app.js',
  output: {
    filename: 'js/bundle.js',
    path: path.resolve(__dirname, 'docs'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name][ext]',
        },
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/css', to: 'css' },
        { from: 'src/assets', to: 'assets' },
      ],
    }),
    ...['index', 'about', 'login', 'projects', 'reviews'].map(page),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'docs'),
    },
    compress: true,
    port: 9000,
    hot: true,
  },
};