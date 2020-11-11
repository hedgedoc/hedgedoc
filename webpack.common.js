const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

// Fix possible nofile-issues
const fs = require('fs')
const gracefulFs = require('graceful-fs')
gracefulFs.gracefulify(fs)

module.exports = {
  name: 'app',
  plugins: [
    new webpack.ProvidePlugin({
      Visibility: 'visibilityjs',
      Cookies: 'js-cookie',
      key: 'keymaster',
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      'moment': 'moment',
      'Handlebars': 'handlebars'
    }),
    new HtmlWebpackPlugin({
      template: 'public/views/includes/header.ejs',
      chunks: ['font', 'index-styles', 'index'],
      filename: path.join(__dirname, 'public/views/build/index-header.ejs'),
      inject: false,
      chunksSortMode: 'manual'
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
      chunks: ['index'],
      filename: path.join(__dirname, 'public/views/build/index-scripts.ejs'),
      inject: false
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
      chunks: ['font', 'cover'],
      filename: path.join(__dirname, 'public/views/build/cover-header.ejs'),
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
      chunks: ['cover'],
      filename: path.join(__dirname, 'public/views/build/cover-scripts.ejs'),
      inject: false
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
      chunks: ['font', 'pretty-styles', 'pretty'],
      filename: path.join(__dirname, 'public/views/build/pretty-header.ejs'),
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
      chunks: ['pretty'],
      filename: path.join(__dirname, 'public/views/build/pretty-scripts.ejs'),
      inject: false
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
      chunks: ['font', 'slide-styles', 'slide'],
      filename: path.join(__dirname, 'public/views/build/slide-header.ejs'),
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
      chunks: ['slide'],
      filename: path.join(__dirname, 'public/views/build/slide-scripts.ejs'),
      inject: false
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
    new MiniCssExtractPlugin()
  ],

  entry: {
    font: path.join(__dirname, 'public/css/google-font.css'),
    'font-pack': path.join(__dirname, 'public/css/font.css'),
    common: [
      'expose-loader?jQuery!expose-loader?$!jquery',
      'velocity-animate',
      'imports-loader?$=jquery!jquery-mousewheel',
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
      'expose-loader?select2!select2',
      'expose-loader?moment!moment',
      path.join(__dirname, 'public/js/cover.js')
    ],
    index: [
      'babel-polyfill',
      'script-loader!jquery-ui-resizable',
      'script-loader!Idle.Js',
      'expose-loader?LZString!lz-string',

      'script-loader!codemirror-lib-codemirror',
      'script-loader!codemirror-addon-mode-overlay',
      'script-loader!codemirror-addon-mode-simple',
      'script-loader!codemirror-addon-mode-multiplex',
      'script-loader!codemirror-addon-selection-active-line',
      'script-loader!codemirror-addon-search-searchcursor',
      'script-loader!codemirror-addon-search-search',
      'script-loader!codemirror-addon-search-jump-to-line',
      'script-loader!codemirror-addon-search-matchesonscrollbar',
      'script-loader!codemirror-addon-search-match-highlighter',
      'script-loader!codemirror-addon-scroll-simplescrollbars',
      'script-loader!codemirror-addon-scroll-annotatescrollbar',
      'script-loader!codemirror-addon-display-panel',
      'script-loader!codemirror-addon-display-placeholder',
      'script-loader!codemirror-addon-display-fullscreen',
      'script-loader!codemirror-addon-display-autorefresh',
      'script-loader!codemirror-addon-dialog-dialog',
      'script-loader!codemirror-addon-edit-matchbrackets',
      'script-loader!codemirror-addon-edit-closebrackets',
      'script-loader!codemirror-addon-edit-matchtags',
      'script-loader!codemirror-addon-edit-closetag',
      'script-loader!codemirror-addon-edit-continuelist',
      'script-loader!codemirror-addon-comment-comment',
      'script-loader!codemirror-addon-comment-continuecomment',
      'script-loader!codemirror-addon-wrap-hardwrap',
      'script-loader!codemirror-addon-fold-foldcode',
      'script-loader!codemirror-addon-fold-brace-fold',
      'script-loader!codemirror-addon-fold-foldgutter',
      'script-loader!codemirror-addon-fold-markdown-fold',
      'script-loader!codemirror-addon-fold-xml-fold',
      'script-loader!codemirror-addon-merge-merge',
      'script-loader!codemirror-mode-xml-xml',
      'script-loader!codemirror-mode-markdown-markdown_math',
      'script-loader!codemirror-mode-gfm-gfm',
      'script-loader!codemirror-mode-javascript-javascript',
      'script-loader!codemirror-mode-typescript-typescript',
      'script-loader!codemirror-mode-jsx-jsx',
      'script-loader!codemirror-mode-css-css',
      'script-loader!codemirror-mode-htmlmixed-htmlmixed',
      'script-loader!codemirror-mode-htmlembedded-htmlembedded',
      'script-loader!codemirror-mode-clike-clike',
      'script-loader!codemirror-mode-clojure-clojure',
      'script-loader!codemirror-mode-diff-diff',
      'script-loader!codemirror-mode-ruby-ruby',
      'script-loader!codemirror-mode-rust-rust',
      'script-loader!codemirror-mode-python-python',
      'script-loader!codemirror-mode-plantuml-plantuml',
      'script-loader!codemirror-mode-csv-csv',
      'script-loader!codemirror-mode-shell-shell',
      'script-loader!codemirror-mode-php-php',
      'script-loader!codemirror-mode-sas-sas',
      'script-loader!codemirror-mode-stex-stex',
      'script-loader!codemirror-mode-sql-sql',
      'script-loader!codemirror-mode-haskell-haskell',
      'script-loader!codemirror-mode-coffeescript-coffeescript',
      'script-loader!codemirror-mode-yaml-yaml',
      'script-loader!codemirror-mode-yaml-frontmatter-yaml-frontmatter',
      'script-loader!codemirror-mode-pug-pug',
      'script-loader!codemirror-mode-lua-lua',
      'script-loader!codemirror-mode-cmake-cmake',
      'script-loader!codemirror-mode-nginx-nginx',
      'script-loader!codemirror-mode-perl-perl',
      'script-loader!codemirror-mode-sass-sass',
      'script-loader!codemirror-mode-r-r',
      'script-loader!codemirror-mode-dockerfile-dockerfile',
      'script-loader!codemirror-mode-tiddlywiki-tiddlywiki',
      'script-loader!codemirror-mode-mediawiki-mediawiki',
      'script-loader!codemirror-mode-go-go',
      'script-loader!codemirror-mode-graphviz-graphviz',
      'script-loader!codemirror-mode-groovy-groovy',
      'script-loader!codemirror-mode-gherkin-gherkin',
      'script-loader!codemirror-mode-mllike-mllike',
      'script-loader!codemirror-keymap-emacs',
      'script-loader!codemirror-keymap-sublime',
      'script-loader!codemirror-keymap-vim',

      'script-loader!inlineAttachment',
      'script-loader!jqueryTextcomplete',
      'script-loader!codemirrorSpellChecker',
      'script-loader!codemirrorInlineAttachment',
      'script-loader!ot',
      'flowchart.js',
      'js-sequence-diagrams',
      'expose-loader?RevealMarkdown!reveal-markdown',
      path.join(__dirname, 'public/js/index.js')
    ],
    'index-styles': [
      path.join(__dirname, 'public/vendor/jquery-ui/jquery-ui.min.css'),
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
      'expose-loader?Spinner!spin.js',
      'script-loader!jquery-ui-resizable',
      'bootstrap-validator',
      'expose-loader?jsyaml!js-yaml',
      'script-loader!mermaid',
      'expose-loader?moment!moment',
      'script-loader!handlebars',
      'expose-loader?hljs!highlight.js',
      'expose-loader?emojify!emojify.js',
      'script-loader!Idle.Js',
      'script-loader!gist-embed',
      'expose-loader?LZString!lz-string',

      'script-loader!codemirror-lib-codemirror',
      'script-loader!codemirror-addon-mode-overlay',
      'script-loader!codemirror-addon-mode-simple',
      'script-loader!codemirror-addon-mode-multiplex',
      'script-loader!codemirror-addon-selection-active-line',
      'script-loader!codemirror-addon-search-searchcursor',
      'script-loader!codemirror-addon-search-search',
      'script-loader!codemirror-addon-search-jump-to-line',
      'script-loader!codemirror-addon-search-matchesonscrollbar',
      'script-loader!codemirror-addon-search-match-highlighter',
      'script-loader!codemirror-addon-scroll-simplescrollbars',
      'script-loader!codemirror-addon-scroll-annotatescrollbar',
      'script-loader!codemirror-addon-display-panel',
      'script-loader!codemirror-addon-display-placeholder',
      'script-loader!codemirror-addon-display-fullscreen',
      'script-loader!codemirror-addon-display-autorefresh',
      'script-loader!codemirror-addon-dialog-dialog',
      'script-loader!codemirror-addon-edit-matchbrackets',
      'script-loader!codemirror-addon-edit-closebrackets',
      'script-loader!codemirror-addon-edit-matchtags',
      'script-loader!codemirror-addon-edit-closetag',
      'script-loader!codemirror-addon-edit-continuelist',
      'script-loader!codemirror-addon-comment-comment',
      'script-loader!codemirror-addon-comment-continuecomment',
      'script-loader!codemirror-addon-wrap-hardwrap',
      'script-loader!codemirror-addon-fold-foldcode',
      'script-loader!codemirror-addon-fold-brace-fold',
      'script-loader!codemirror-addon-fold-foldgutter',
      'script-loader!codemirror-addon-fold-markdown-fold',
      'script-loader!codemirror-addon-fold-xml-fold',
      'script-loader!codemirror-addon-merge-merge',
      'script-loader!codemirror-mode-xml-xml',
      'script-loader!codemirror-mode-markdown-markdown_math',
      'script-loader!codemirror-mode-gfm-gfm',
      'script-loader!codemirror-mode-javascript-javascript',
      'script-loader!codemirror-mode-typescript-typescript',
      'script-loader!codemirror-mode-jsx-jsx',
      'script-loader!codemirror-mode-css-css',
      'script-loader!codemirror-mode-htmlmixed-htmlmixed',
      'script-loader!codemirror-mode-htmlembedded-htmlembedded',
      'script-loader!codemirror-mode-clike-clike',
      'script-loader!codemirror-mode-clojure-clojure',
      'script-loader!codemirror-mode-diff-diff',
      'script-loader!codemirror-mode-ruby-ruby',
      'script-loader!codemirror-mode-rust-rust',
      'script-loader!codemirror-mode-python-python',
      'script-loader!codemirror-mode-plantuml-plantuml',
      'script-loader!codemirror-mode-csv-csv',
      'script-loader!codemirror-mode-shell-shell',
      'script-loader!codemirror-mode-php-php',
      'script-loader!codemirror-mode-sas-sas',
      'script-loader!codemirror-mode-stex-stex',
      'script-loader!codemirror-mode-sql-sql',
      'script-loader!codemirror-mode-haskell-haskell',
      'script-loader!codemirror-mode-coffeescript-coffeescript',
      'script-loader!codemirror-mode-yaml-yaml',
      'script-loader!codemirror-mode-yaml-frontmatter-yaml-frontmatter',
      'script-loader!codemirror-mode-pug-pug',
      'script-loader!codemirror-mode-lua-lua',
      'script-loader!codemirror-mode-cmake-cmake',
      'script-loader!codemirror-mode-nginx-nginx',
      'script-loader!codemirror-mode-perl-perl',
      'script-loader!codemirror-mode-sass-sass',
      'script-loader!codemirror-mode-r-r',
      'script-loader!codemirror-mode-dockerfile-dockerfile',
      'script-loader!codemirror-mode-tiddlywiki-tiddlywiki',
      'script-loader!codemirror-mode-mediawiki-mediawiki',
      'script-loader!codemirror-mode-go-go',
      'script-loader!codemirror-mode-graphviz-graphviz',
      'script-loader!codemirror-mode-groovy-groovy',
      'script-loader!codemirror-mode-gherkin-gherkin',
      'script-loader!codemirror-mode-mllike-mllike',
      'script-loader!codemirror-keymap-emacs',
      'script-loader!codemirror-keymap-sublime',
      'script-loader!codemirror-keymap-vim',

      'script-loader!inlineAttachment',
      'script-loader!jqueryTextcomplete',
      'script-loader!codemirrorSpellChecker',
      'script-loader!codemirrorInlineAttachment',
      'script-loader!ot',
      'flowchart.js',
      'js-sequence-diagrams',
      'expose-loader?Viz!viz.js',
      'script-loader!abcjs',
      'expose-loader?io!socket.io-client',
      'expose-loader?RevealMarkdown!reveal-markdown',
      path.join(__dirname, 'public/js/index.js')
    ],
    pretty: [
      'babel-polyfill',
      'flowchart.js',
      'js-sequence-diagrams',
      'expose-loader?RevealMarkdown!reveal-markdown',
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
      'expose-loader?jsyaml!js-yaml',
      'script-loader!mermaid',
      'expose-loader?moment!moment',
      'script-loader!handlebars',
      'expose-loader?hljs!highlight.js',
      'expose-loader?emojify!emojify.js',
      'script-loader!gist-embed',
      'flowchart.js',
      'js-sequence-diagrams',
      'expose-loader?Viz!viz.js',
      'script-loader!abcjs',
      'expose-loader?RevealMarkdown!reveal-markdown',
      path.join(__dirname, 'public/js/pretty.js')
    ],
    slide: [
      'babel-polyfill',
      'bootstrap-tooltip',
      'flowchart.js',
      'js-sequence-diagrams',
      'expose-loader?RevealMarkdown!reveal-markdown',
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
      'expose-loader?jQuery!expose-loader?$!jquery',
      'velocity-animate',
      'imports-loader?$=jquery!jquery-mousewheel',
      'bootstrap-tooltip',
      'expose-loader?jsyaml!js-yaml',
      'script-loader!mermaid',
      'expose-loader?moment!moment',
      'script-loader!handlebars',
      'expose-loader?hljs!highlight.js',
      'expose-loader?emojify!emojify.js',
      'script-loader!gist-embed',
      'flowchart.js',
      'js-sequence-diagrams',
      'expose-loader?Viz!viz.js',
      'script-loader!abcjs',
      'expose-loader?Reveal!reveal.js',
      'expose-loader?RevealMarkdown!reveal-markdown',
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
      'codemirror-lib-codemirror': path.join(__dirname, 'node_modules/codemirror/src/codemirror.js'),
      'codemirror-addon-mode-overlay': path.join(__dirname, 'node_modules/codemirror/addon/mode/overlay.js'),
      'codemirror-addon-mode-simple': path.join(__dirname, 'node_modules/codemirror/addon/mode/simple.js'),
      'codemirror-addon-mode-multiplex': path.join(__dirname, 'node_modules/codemirror/addon/mode/multiplex.js'),
      'codemirror-addon-selection-active-line': path.join(__dirname, 'node_modules/codemirror/addon/selection/active-line.js'),
      'codemirror-addon-search-searchcursor': path.join(__dirname, 'node_modules/codemirror/addon/search/searchcursor.js'),
      'codemirror-addon-search-search': path.join(__dirname, 'node_modules/codemirror/addon/search/search.js'),
      'codemirror-addon-search-jump-to-line': path.join(__dirname, 'node_modules/codemirror/addon/search/jump-to-line.js'),
      'codemirror-addon-search-matchesonscrollbar': path.join(__dirname, 'node_modules/codemirror/addon/search/matchesonscrollbar.js'),
      'codemirror-addon-search-match-highlighter': path.join(__dirname, 'node_modules/codemirror/addon/search/match-highlighter.js'),
      'codemirror-addon-scroll-simplescrollbars': path.join(__dirname, 'node_modules/codemirror/addon/scroll/simplescrollbars.js'),
      'codemirror-addon-scroll-annotatescrollbar': path.join(__dirname, 'node_modules/codemirror/addon/scroll/annotatescrollbar.js'),
      'codemirror-addon-display-panel': path.join(__dirname, 'node_modules/codemirror/addon/display/panel.js'),
      'codemirror-addon-display-placeholder': path.join(__dirname, 'node_modules/codemirror/addon/display/placeholder.js'),
      'codemirror-addon-display-fullscreen': path.join(__dirname, 'node_modules/codemirror/addon/display/fullscreen.js'),
      'codemirror-addon-display-autorefresh': path.join(__dirname, 'node_modules/codemirror/addon/display/autorefresh.js'),
      'codemirror-addon-dialog-dialog': path.join(__dirname, 'node_modules/codemirror/addon/dialog/dialog.js'),
      'codemirror-addon-edit-matchbrackets': path.join(__dirname, 'node_modules/codemirror/addon/edit/matchbrackets.js'),
      'codemirror-addon-edit-closebrackets': path.join(__dirname, 'node_modules/codemirror/addon/edit/closebrackets.js'),
      'codemirror-addon-edit-matchtags': path.join(__dirname, 'node_modules/codemirror/addon/edit/matchtags.js'),
      'codemirror-addon-edit-closetag': path.join(__dirname, 'node_modules/codemirror/addon/edit/closetag.js'),
      'codemirror-addon-edit-continuelist': path.join(__dirname, 'node_modules/codemirror/addon/edit/continuelist.js'),
      'codemirror-addon-comment-comment': path.join(__dirname, 'node_modules/codemirror/addon/comment/comment.js'),
      'codemirror-addon-comment-continuecomment': path.join(__dirname, 'node_modules/codemirror/addon/comment/continuecomment.js'),
      'codemirror-addon-wrap-hardwrap': path.join(__dirname, 'node_modules/codemirror/addon/wrap/hardwrap.js'),
      'codemirror-addon-fold-foldcode': path.join(__dirname, 'node_modules/codemirror/addon/fold/foldcode.js'),
      'codemirror-addon-fold-brace-fold': path.join(__dirname, 'node_modules/codemirror/addon/fold/brace-fold.js'),
      'codemirror-addon-fold-foldgutter': path.join(__dirname, 'node_modules/codemirror/addon/fold/foldgutter.js'),
      'codemirror-addon-fold-markdown-fold': path.join(__dirname, 'node_modules/codemirror/addon/fold/markdown-fold.js'),
      'codemirror-addon-fold-xml-fold': path.join(__dirname, 'node_modules/codemirror/addon/fold/xml-fold.js'),
      'codemirror-addon-merge-merge': path.join(__dirname, 'node_modules/codemirror/addon/merge/merge.js'),
      'codemirror-mode-xml-xml': path.join(__dirname, 'node_modules/codemirror/mode/xml/xml.js'),
      'codemirror-mode-markdown-markdown_math': path.join(__dirname, 'node_modules/codemirror/mode/markdown/markdown_math.js'),
      'codemirror-mode-gfm-gfm': path.join(__dirname, 'node_modules/codemirror/mode/gfm/gfm.js'),
      'codemirror-mode-javascript-javascript': path.join(__dirname, 'node_modules/codemirror/mode/javascript/javascript.js'),
      'codemirror-mode-typescript-typescript': path.join(__dirname, 'node_modules/codemirror/mode/typescript/typescript.js'),
      'codemirror-mode-jsx-jsx': path.join(__dirname, 'node_modules/codemirror/mode/jsx/jsx.js'),
      'codemirror-mode-css-css': path.join(__dirname, 'node_modules/codemirror/mode/css/css.js'),
      'codemirror-mode-htmlmixed-htmlmixed': path.join(__dirname, 'node_modules/codemirror/mode/htmlmixed/htmlmixed.js'),
      'codemirror-mode-htmlembedded-htmlembedded': path.join(__dirname, 'node_modules/codemirror/mode/htmlembedded/htmlembedded.js'),
      'codemirror-mode-clike-clike': path.join(__dirname, 'node_modules/codemirror/mode/clike/clike.js'),
      'codemirror-mode-clojure-clojure': path.join(__dirname, 'node_modules/codemirror/mode/clojure/clojure.js'),
      'codemirror-mode-diff-diff': path.join(__dirname, 'node_modules/codemirror/mode/diff/diff.js'),
      'codemirror-mode-ruby-ruby': path.join(__dirname, 'node_modules/codemirror/mode/ruby/ruby.js'),
      'codemirror-mode-rust-rust': path.join(__dirname, 'node_modules/codemirror/mode/rust/rust.js'),
      'codemirror-mode-python-python': path.join(__dirname, 'node_modules/codemirror/mode/python/python.js'),
      'codemirror-mode-plantuml-plantuml': path.join(__dirname, 'node_modules/codemirror/mode/plantuml/plantuml.js'),
      'codemirror-mode-csv-csv': path.join(__dirname, 'node_modules/codemirror/mode/csv/csv.js'),
      'codemirror-mode-shell-shell': path.join(__dirname, 'node_modules/codemirror/mode/shell/shell.js'),
      'codemirror-mode-php-php': path.join(__dirname, 'node_modules/codemirror/mode/php/php.js'),
      'codemirror-mode-sas-sas': path.join(__dirname, 'node_modules/codemirror/mode/sas/sas.js'),
      'codemirror-mode-stex-stex': path.join(__dirname, 'node_modules/codemirror/mode/stex/stex.js'),
      'codemirror-mode-sql-sql': path.join(__dirname, 'node_modules/codemirror/mode/sql/sql.js'),
      'codemirror-mode-haskell-haskell': path.join(__dirname, 'node_modules/codemirror/mode/haskell/haskell.js'),
      'codemirror-mode-coffeescript-coffeescript': path.join(__dirname, 'node_modules/codemirror/mode/coffeescript/coffeescript.js'),
      'codemirror-mode-yaml-yaml': path.join(__dirname, 'node_modules/codemirror/mode/yaml/yaml.js'),
      'codemirror-mode-yaml-frontmatter-yaml-frontmatter': path.join(__dirname, 'node_modules/codemirror/mode/yaml-frontmatter/yaml-frontmatter.js'),
      'codemirror-mode-pug-pug': path.join(__dirname, 'node_modules/codemirror/mode/pug/pug.js'),
      'codemirror-mode-lua-lua': path.join(__dirname, 'node_modules/codemirror/mode/lua/lua.js'),
      'codemirror-mode-cmake-cmake': path.join(__dirname, 'node_modules/codemirror/mode/cmake/cmake.js'),
      'codemirror-mode-nginx-nginx': path.join(__dirname, 'node_modules/codemirror/mode/nginx/nginx.js'),
      'codemirror-mode-perl-perl': path.join(__dirname, 'node_modules/codemirror/mode/perl/perl.js'),
      'codemirror-mode-sass-sass': path.join(__dirname, 'node_modules/codemirror/mode/sass/sass.js'),
      'codemirror-mode-r-r': path.join(__dirname, 'node_modules/codemirror/mode/r/r.js'),
      'codemirror-mode-dockerfile-dockerfile': path.join(__dirname, 'node_modules/codemirror/mode/dockerfile/dockerfile.js'),
      'codemirror-mode-tiddlywiki-tiddlywiki': path.join(__dirname, 'node_modules/codemirror/mode/tiddlywiki/tiddlywiki.js'),
      'codemirror-mode-mediawiki-mediawiki': path.join(__dirname, 'node_modules/codemirror/mode/mediawiki/mediawiki.js'),
      'codemirror-mode-go-go': path.join(__dirname, 'node_modules/codemirror/mode/go/go.js'),
      'codemirror-mode-graphviz-graphviz': path.join(__dirname, 'node_modules/codemirror/mode/graphviz/graphviz.js'),
      'codemirror-mode-groovy-groovy': path.join(__dirname, 'node_modules/codemirror/mode/groovy/groovy.js'),
      'codemirror-mode-gherkin-gherkin': path.join(__dirname, 'node_modules/codemirror/mode/gherkin/gherkin.js'),
      'codemirror-mode-mllike-mllike': path.join(__dirname, 'node_modules/codemirror/mode/mllike/mllike.js'),
      'codemirror-keymap-emacs': path.join(__dirname, 'node_modules/codemirror/keymap/emacs.js'),
      'codemirror-keymap-sublime': path.join(__dirname, 'node_modules/codemirror/keymap/sublime.js'),
      'codemirror-keymap-vim': path.join(__dirname, 'node_modules/codemirror/keymap/vim.js'),

      inlineAttachment: path.join(__dirname, 'public/vendor/inlineAttachment/inline-attachment.js'),
      jqueryTextcomplete: path.join(__dirname, 'public/vendor/jquery-textcomplete/jquery.textcomplete.js'),
      codemirrorSpellChecker: path.join(__dirname, 'public/vendor/codemirror-spell-checker/spell-checker.min.js'),
      codemirrorInlineAttachment: path.join(__dirname, 'public/vendor/inlineAttachment/codemirror.inline-attachment.js'),
      ot: path.join(__dirname, 'public/vendor/ot/ot.min.js'),
      mermaid: path.join(__dirname, 'node_modules/mermaid/dist/mermaid.min.js'),
      handlebars: path.join(__dirname, 'node_modules/handlebars/dist/handlebars.min.js'),
      'jquery-ui-resizable': path.join(__dirname, 'public/vendor/jquery-ui/jquery-ui.min.js'),
      'gist-embed': path.join(__dirname, 'node_modules/gist-embed/gist-embed.min.js'),
      'bootstrap-tooltip': path.join(__dirname, 'public/vendor/bootstrap/tooltip.min.js'),
      'reveal-markdown': path.join(__dirname, 'public/js/reveal-markdown.js'),
      abcjs: path.join(__dirname, 'public/vendor/abcjs_basic_3.1.1-min.js'),
      raphael: path.join(__dirname, 'node_modules/raphael/raphael.no-deps.js')
    }
  },

  externals: {
    'viz.js': 'Viz',
    'socket.io-client': 'io',
    'jquery': '$',
    'moment': 'moment',
    'handlebars': 'Handlebars',
    'highlight.js': 'hljs',
    'select2': 'select2'
  },

  module: {
    rules: [{
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
        options: { _: 'lodash', Raphael: 'raphael', eve: 'eve' }
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
