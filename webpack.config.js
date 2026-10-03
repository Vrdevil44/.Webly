const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const fs = require('fs');
const _ = require('lodash');

// Shared chrome lives in src/partials; each page renders it with its own `page` id
const partial = (name, params = {}) =>
  _.template(fs.readFileSync(path.resolve(__dirname, 'src/partials', `${name}.html`), 'utf8'))(params);

const SITE = 'https://vrdevil44.github.io/.Webly/';
// Favicon is authored once (src/assets/favicon.svg) and inlined as a data URI in every <head>
const favicon = 'data:image/svg+xml,' + encodeURIComponent(
  fs.readFileSync(path.resolve(__dirname, 'src/assets/favicon.svg'), 'utf8').trim()
);

const page = (name) =>
  new HtmlWebpackPlugin({
    template: `./src/${name}.html`,
    filename: `${name}.html`,
    chunks: ['main'],
    templateParameters: {
      // Per-page <head>: head({ title, description, file, css: [...] }); see partials/head.html
      head: (opts) => partial('head', { site: SITE, favicon, ...opts }),
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
  // og.png is a social-card asset that pages never load, so the size hint doesn't apply to it
  performance: { assetFilter: (name) => !name.endsWith('.png') },
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
        { from: 'src/assets', to: 'assets', globOptions: { ignore: ['**/.gitkeep', '**/favicon.svg'] }, noErrorOnMissing: true },
        { from: 'src/assets/favicon.svg', to: 'favicon.svg' },
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