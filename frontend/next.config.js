/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
const { isMockMode, isTestMode } = require('./src/utils/test-modes')
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})

console.log('Node environment is', process.env.NODE_ENV)

if (isMockMode) {
  console.log('Use mock API')
}

if (isTestMode) {
  console.warn(`This build runs in test mode. This means:
 - no sandboxed iframe
 - Additional data-attributes for e2e tests added to DOM
 - Editor and renderer are running on the same origin`)
}

if (isMockMode) {
  console.warn(`This build runs in mock mode. This means:
 - No real data. All API responses are mocked
 - No persistent data
 - No realtime editing
 `)
}

/** @type {import('next').NextConfig} */
const rawNextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgoConfig: {
              plugins: [
                {
                  name: 'preset-default',
                  params: {
                    overrides: {
                      removeViewBox: false
                    }
                  }
                }
              ]
            }
          }
        }
      ]
    })

    const wasmModulePath = path.dirname(require.resolve('@hpcc-js/wasm'))
    const emojiPickerDataModulePath = path.dirname(require.resolve('emoji-picker-element-data/en/emojibase/data.json'))

    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          { from: path.join(wasmModulePath, 'graphvizlib.wasm'), to: 'static/js' },
          { from: path.join(wasmModulePath, 'expatlib.wasm'), to: 'static/js' },
          {
            from: emojiPickerDataModulePath,
            to: 'static/js/emoji-data.json'
          }
        ]
      })
    )
    return config
  },
  reactStrictMode: false,
  redirects: () => {
    return Promise.resolve([
      {
        source: '/',
        destination: '/intro',
        permanent: true
      }
    ])
  },
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../')
  }
}
const completeNextConfig = withBundleAnalyzer(rawNextConfig)

module.exports = completeNextConfig
