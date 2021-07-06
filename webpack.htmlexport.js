const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  name: 'save-as-html',
  entry: {
    htmlExport: path.join(__dirname, 'public/js/htmlExport.js')
  },
  module: {
    rules: [{
      test: /\.css$/,
      use: [MiniCssExtractPlugin.loader, 'css-loader']
    },
    {
      test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
      use: [
        {
          loader: 'url-loader'
        }
      ]
    }]
  },
  output: {
    path: path.join(__dirname, 'public/build'),
    publicPath: 'build/',
    filename: '[name].js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      // Load a custom template (uses lodash templating)
      template: 'public/views/htmlexport.ejs',
      filename: 'htmlexport.html',
      inject: false,
      cache: false
    }),
    new MiniCssExtractPlugin({ filename: 'htmlexport.css' })
  ]
}
