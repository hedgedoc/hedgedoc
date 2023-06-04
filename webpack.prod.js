const common = require('./webpack.common.js')
const htmlexport = require('./webpack.htmlexport')
const { merge } = require('webpack-merge')
const path = require('path')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const { EsbuildPlugin } = require('esbuild-loader')

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
        new EsbuildPlugin({
          target: 'es2015',
          format: 'cjs',
          exclude: ['MathJax/extensions/a11y/mathmaps', 'reveal.js/plugin/markdown/marked.js']
        })
      ],
      splitChunks: {
        chunks: 'all'
      }
    },
    devtool: 'source-map'
  }),
  merge(htmlexport, {
    mode: 'production',
    optimization: {
      minimizer: [
        new EsbuildPlugin({
          target: 'es2015',
          format: 'cjs'
        }),
        new OptimizeCSSAssetsPlugin({})
      ]
    }
  })]
