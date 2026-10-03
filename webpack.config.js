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
      // Image-slot component: <%= visual({ a, b, c, img }) %> (contract documented in partials/visual.html)
      visual: (opts) => partial('visual', opts),
    },
  });

module.exports = {
  mode: 'production',
  entry: './src/js/app.js',
  output: {
    filename: 'js/[name].[contenthash:8].js',
    // Never build straight into docs/: scripts/build-safe.js verifies this folder, then swaps it in
    path: path.resolve(__dirname, 'docs-build'),
    // Relative to each HTML file, so URLs resolve under the /.Webly/ project subpath, a custom domain, or localhost
    publicPath: 'auto',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|webp)$/i,
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
        { from: 'src/assets', to: 'assets', globOptions: { ignore: ['**/.gitkeep'] }, noErrorOnMissing: true },
      ],
    }),
    ...['index', 'about', 'login', 'projects', 'reviews'].map(page),
  ],
  devServer: {
    // Served from memory; nothing is written to docs/
    watchFiles: ['src/**/*'],
    compress: true,
    port: 9000,
    hot: true,
    open: false,
  },
};