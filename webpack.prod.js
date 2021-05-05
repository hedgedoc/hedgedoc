const common = require('./webpack.common.js')
const htmlexport = require('./webpack.htmlexport')
const { merge } = require('webpack-merge')
const path = require('path')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const { ESBuildMinifyPlugin } = require('esbuild-loader')

module.exports = [
  merge(common, {
    mode: 'production',
    output: {
      path: path.join(__dirname, 'public/build'),
      publicPath: 'build/',
      filename: '[name].[contenthash].js'
    },
    optimization: {
      minimizer: [
        new ESBuildMinifyPlugin({
          target: 'es2015'
        })
      ]
    }
  }),
  merge(htmlexport, {
    mode: 'production',
    optimization: {
      minimizer: [
        new OptimizeCSSAssetsPlugin({})
      ]
    }
  })]
