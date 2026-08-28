const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

/**
 * @param {Object} env
 * @param {{ mode: string }} argv
 * @returns {import('webpack').Configuration}
 */
module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production'

  return {
    entry: './src/index.jsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      clean: true,
      publicPath: '/'
    },
    resolve: {
      extensions: ['.js', '.jsx']
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: 'babel-loader'
        },
        {
          test: /\.css$/,
          // In production the CSS is emitted as its own file so it can be
          // cached apart from the JS; in development it stays inline for HMR.
          use: [isProduction ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader']
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({ template: './public/index.html' }),
      ...(isProduction
        ? [new MiniCssExtractPlugin({ filename: '[name].[contenthash].css' })]
        : [])
    ],
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    devServer: {
      port: 8080,
      open: false,
      hot: true,
      // Lets the SPA answer deep links without a server-side router.
      historyApiFallback: true
    }
  }
}
