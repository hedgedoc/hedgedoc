const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  webpack: {
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: 'node_modules/@hpcc-js/wasm/dist/graphvizlib.wasm', to: 'static/js' },
          { from: 'node_modules/@hpcc-js/wasm/dist/expatlib.wasm', to: 'static/js' }
        ],
      }),
    ],
  },
}
