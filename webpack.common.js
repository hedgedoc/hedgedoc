const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

// Fix possible nofile-issues
const fs = require('fs')
const gracefulFs = require('graceful-fs')
gracefulFs.gracefulify(fs)

module.exports = {
  name: 'app',
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [
        '**/*',
        '!htmlExport*',
        '!htmlexport*'
      ]
    }),
    new webpack.ProvidePlugin({
      Visibility: 'visibilityjs',
      Cookies: 'js-cookie',
      key: 'keymaster',
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      'moment': 'moment',
      CodeMirror: 'codemirror/lib/codemirror.js'
    }),
    new HtmlWebpackPlugin({
      template: 'public/views/includes/header.ejs',
      chunks: ['font-pack', 'index-styles-pack', 'index-styles', 'index'],
      filename: path.join(__dirname, 'public/views/build/index-pack-header.ejs'),
      inject: false,
      chunksSortMode: 'manual'
    }),
    new HtmlWebpackPlugin({
      template: 'public/views/includes/scripts.ejs',
      chunks: ['common', 'index-pack'],
      filename: path.join(__dirname, 'public/views/build/index-pack-scripts.ejs'),
      inject: false,
      chunksSortMode: 'manual'
    }),
    new HtmlWebpackPlugin({
      template: 'public/views/includes/header.ejs',
      chunks: ['font-pack', 'cover-styles-pack', 'cover'],
      filename: path.join(__dirname, 'public/views/build/cover-pack-header.ejs'),
      inject: false,
      chunksSortMode: 'manual'
    }),
    new HtmlWebpackPlugin({
      template: 'public/views/includes/scripts.ejs',
      chunks: ['common', 'cover-pack'],
      filename: path.join(__dirname, 'public/views/build/cover-pack-scripts.ejs'),
      inject: false,
      chunksSortMode: 'manual'
    }),
    new HtmlWebpackPlugin({
      template: 'public/views/includes/header.ejs',
      chunks: ['font-pack', 'pretty-styles-pack', 'pretty-styles', 'pretty'],
      filename: path.join(__dirname, 'public/views/build/pretty-pack-header.ejs'),
      inject: false,
      chunksSortMode: 'manual'
    }),
    new HtmlWebpackPlugin({
      template: 'public/views/includes/scripts.ejs',
      chunks: ['common', 'pretty-pack'],
      filename: path.join(__dirname, 'public/views/build/pretty-pack-scripts.ejs'),
      inject: false,
      chunksSortMode: 'manual'
    }),
    new HtmlWebpackPlugin({
      template: 'public/views/includes/header.ejs',
      chunks: ['font-pack', 'slide-styles-pack', 'slide-styles', 'slide'],
      filename: path.join(__dirname, 'public/views/build/slide-pack-header.ejs'),
      inject: false,
      chunksSortMode: 'manual'
    }),
    new HtmlWebpackPlugin({
      template: 'public/views/includes/scripts.ejs',
      chunks: ['slide-pack'],
      filename: path.join(__dirname, 'public/views/build/slide-pack-scripts.ejs'),
      inject: false
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          context: path.join(__dirname, 'node_modules/mathjax/unpacked'),
          from: '**/*',
          globOptions: {
            dot: false
          },
          to: 'MathJax/'
        },
        {
          context: path.join(__dirname, 'node_modules/mathjax/fonts'),
          from: '**/*',
          globOptions: {
            dot: false
          },
          to: 'fonts/'
        },
        {
          context: path.join(__dirname, 'node_modules/emojify.js'),
          from: 'dist/**/*',
          globOptions: {
            dot: false
          },
          to: 'emojify.js/'
        },
        {
          context: path.join(__dirname, 'node_modules/reveal.js'),
          from: 'js',
          to: 'reveal.js/js'
        },
        {
          context: path.join(__dirname, 'node_modules/reveal.js'),
          from: 'css',
          to: 'reveal.js/css'
        },
        {
          context: path.join(__dirname, 'node_modules/reveal.js'),
          from: 'lib',
          to: 'reveal.js/lib'
        },
        {
          context: path.join(__dirname, 'node_modules/reveal.js'),
          from: 'plugin',
          to: 'reveal.js/plugin'
        }
      ]
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
      chunkFilename: '[id].[contenthash].css'
    })
  ],

  entry: {
    'font-pack': path.join(__dirname, 'public/css/font.css'),
    common: [
      'expose-loader?exposes[]=$&exposes[]=jQuery!jquery',
      'velocity-animate',
      'imports-loader?imports=default|jquery|$!jquery-mousewheel',
      'bootstrap'
    ],
    cover: [
      'babel-polyfill',
      path.join(__dirname, 'public/js/cover.js')
    ],
    'cover-styles-pack': [
      path.join(__dirname, 'node_modules/bootstrap/dist/css/bootstrap.min.css'),
      path.join(__dirname, 'node_modules/fork-awesome/css/fork-awesome.min.css'),
      path.join(__dirname, 'public/css/bootstrap-social.css'),
      path.join(__dirname, 'node_modules/select2/select2.css'),
      path.join(__dirname, 'node_modules/select2/select2-bootstrap.css')
    ],
    'cover-pack': [
      'babel-polyfill',
      'bootstrap-validator',
      'expose-loader?exposes=select2!select2',
      'expose-loader?exposes=moment!moment',
      path.join(__dirname, 'public/js/cover.js')
    ],
    index: [
      'babel-polyfill',
      'expose-loader?exposes=LZString!lz-string',
      'flowchart.js',
      'js-sequence-diagrams',
      'expose-loader?exposes=RevealMarkdown!reveal-markdown',
      path.join(__dirname, 'public/js/index.js')
    ],
    'index-styles': [
      path.join(__dirname, 'public/vendor/codemirror-spell-checker/spell-checker.min.css'),
      path.join(__dirname, 'node_modules/codemirror/lib/codemirror.css'),
      path.join(__dirname, 'node_modules/codemirror/addon/fold/foldgutter.css'),
      path.join(__dirname, 'node_modules/codemirror/addon/display/fullscreen.css'),
      path.join(__dirname, 'node_modules/codemirror/addon/dialog/dialog.css'),
      path.join(__dirname, 'node_modules/codemirror/addon/scroll/simplescrollbars.css'),
      path.join(__dirname, 'node_modules/codemirror/addon/search/matchesonscrollbar.css'),
      path.join(__dirname, 'node_modules/codemirror/theme/monokai.css'),
      path.join(__dirname, 'node_modules/codemirror/theme/one-dark.css'),
      path.join(__dirname, 'node_modules/codemirror/mode/tiddlywiki/tiddlywiki.css'),
      path.join(__dirname, 'node_modules/codemirror/mode/mediawiki/mediawiki.css'),
      path.join(__dirname, 'node_modules/spin.js/spin.css'),
      path.join(__dirname, 'public/css/github-extract.css'),
      path.join(__dirname, 'public/vendor/showup/showup.css'),
      path.join(__dirname, 'public/css/mermaid.css'),
      path.join(__dirname, 'public/css/markdown.css'),
      path.join(__dirname, 'public/css/slide-preview.css')
    ],
    'index-styles-pack': [
      path.join(__dirname, 'node_modules/bootstrap/dist/css/bootstrap.min.css'),
      path.join(__dirname, 'node_modules/fork-awesome/css/fork-awesome.min.css'),
      path.join(__dirname, 'public/css/bootstrap-social.css'),
      path.join(__dirname, 'node_modules/ionicons/css/ionicons.min.css')
    ],
    'index-pack': [
      'babel-polyfill',
      'bootstrap-validator',
      'expose-loader?exposes=jsyaml!js-yaml',
      'expose-loader?exposes=moment!moment',
      'expose-loader?exposes=emojify!emojify.js',
      'expose-loader?exposes=LZString!lz-string',
      'flowchart.js',
      'js-sequence-diagrams',
      'expose-loader?exposes=io!socket.io-client',
      'expose-loader?exposes=RevealMarkdown!reveal-markdown',
      path.join(__dirname, 'public/js/index.js')
    ],
    pretty: [
      'babel-polyfill',
      'flowchart.js',
      'js-sequence-diagrams',
      'expose-loader?exposes=RevealMarkdown!reveal-markdown',
      path.join(__dirname, 'public/js/pretty.js')
    ],
    'pretty-styles': [
      path.join(__dirname, 'public/css/github-extract.css'),
      path.join(__dirname, 'public/css/mermaid.css'),
      path.join(__dirname, 'public/css/markdown.css'),
      path.join(__dirname, 'public/css/slide-preview.css')
    ],
    'pretty-styles-pack': [
      path.join(__dirname, 'node_modules/bootstrap/dist/css/bootstrap.min.css'),
      path.join(__dirname, 'node_modules/fork-awesome/css/fork-awesome.min.css'),
      path.join(__dirname, 'node_modules/ionicons/css/ionicons.min.css')
    ],
    'pretty-pack': [
      'babel-polyfill',
      'expose-loader?exposes=jsyaml!js-yaml',
      'expose-loader?exposes=moment!moment',
      'expose-loader?exposes=emojify!emojify.js',
      'flowchart.js',
      'js-sequence-diagrams',
      'expose-loader?exposes=RevealMarkdown!reveal-markdown',
      path.join(__dirname, 'public/js/pretty.js')
    ],
    slide: [
      'babel-polyfill',
      'bootstrap-tooltip',
      'flowchart.js',
      'js-sequence-diagrams',
      'expose-loader?exposes=RevealMarkdown!reveal-markdown',
      path.join(__dirname, 'public/js/slide.js')
    ],
    'slide-styles': [
      path.join(__dirname, 'public/vendor/bootstrap/tooltip.min.css'),
      path.join(__dirname, 'public/css/github-extract.css'),
      path.join(__dirname, 'public/css/mermaid.css'),
      path.join(__dirname, 'public/css/markdown.css')
    ],
    'slide-styles-pack': [
      path.join(__dirname, 'node_modules/fork-awesome/css/fork-awesome.min.css'),
      path.join(__dirname, 'node_modules/ionicons/css/ionicons.min.css')
    ],
    'slide-pack': [
      'babel-polyfill',
      'expose-loader?exposes[]=$&exposes[]=jQuery!jquery',
      'velocity-animate',
      'imports-loader?imports=default|jquery|$!jquery-mousewheel',
      'bootstrap-tooltip',
      'expose-loader?exposes=jsyaml!js-yaml',
      'expose-loader?exposes=moment!moment',
      'expose-loader?exposes=emojify!emojify.js',
      'flowchart.js',
      'js-sequence-diagrams',
      'expose-loader?exposes=Reveal!reveal.js',
      'expose-loader?exposes=RevealMarkdown!reveal-markdown',
      path.join(__dirname, 'public/js/slide.js')
    ]
  },

  output: {
    path: path.join(__dirname, 'public/build'),
    publicPath: 'build/',
    filename: '[name].js'
  },

  resolve: {
    modules: ['node_modules'],
    extensions: ['.js'],
    alias: {
      'bootstrap-tooltip': path.join(__dirname, 'public/vendor/bootstrap/tooltip.min.js'),
      'reveal-markdown': path.join(__dirname, 'public/js/reveal-markdown.js'),
      raphael: path.join(__dirname, 'node_modules/raphael/raphael.no-deps.js')
    }
  },

  externals: {
    'socket.io-client': 'io',
    'jquery': '$',
    'moment': 'moment',
    'select2': 'select2'
  },

  module: {
    rules: [
      {
        test: require.resolve(path.join(__dirname, 'public/vendor/codemirror-spell-checker/spell-checker.min.js')),
        use: {
          loader: 'imports-loader',
          options: {
            imports: ['default codemirror CodeMirror']
          }
        }
      },
      {
        test: require.resolve(path.join(__dirname, 'public/vendor/ot/ot.min.js')),
        use: {
          loader: 'exports-loader',
          options: {
            type: 'commonjs',
            exports: ['ot']
          }
        },
        parser: {
          amd: false
        }
      },
      {
        // Idle.js must be imported as CommonJS, as its AMD export is broken
        test: require.resolve('Idle.Js'),
        parser: {
          amd: false
        }
      },
      {
        test: /\.js$/,
        use: [{ loader: 'babel-loader' }],
        exclude: [/node_modules/, /public\/vendor/]
      }, {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '',
            }
          },
          'css-loader'
        ]
      }, {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1
            }
          },
          'less-loader'
        ]
      }, {
        test: require.resolve('js-sequence-diagrams'),
        use: [{
          loader: 'imports-loader',
          options: {
            imports: ['default lodash _', 'default raphael Raphael', 'default eve eve']
          }
        }]
      }, {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use: [{ loader: 'file-loader' }]
      }, {
        test: /\.html$/,
        use: [{ loader: 'string-loader' }]
      }, {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'url-loader',
          options: { prefix: 'font/', limit: '5000' }
        }]
      }, {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'url-loader',
          options: { limit: '5000', mimetype: 'application/octet-stream' }
        }]
      }, {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'url-loader',
          options: { limit: '10000', mimetype: 'svg+xml' }
        }]
      }, {
        test: /\.png(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'url-loader',
          options: { limit: '10000', mimetype: 'image/png' }
        }]
      }, {
        test: /\.gif(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'url-loader',
          options: { limit: '10000', mimetype: 'image/gif' }
        }]
      }]
  },
  node: {
    fs: 'empty'
  },

  stats: {
    assets: false
  }
}
