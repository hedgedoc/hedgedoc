/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

console.log('Node env is', process.env.NODE_ENV)

if (process.env.NEXT_PUBLIC_USE_MOCK_API === 'true') {
  console.log('Uses mock API')
} else if (!!process.env.NEXT_PUBLIC_BACKEND_BASE_URL) {
  console.log('Backend base url is', process.env.NEXT_PUBLIC_BACKEND_BASE_URL)
} else {
  console.error(`==============
Neither NEXT_PUBLIC_USE_MOCK_API or NEXT_PUBLIC_BACKEND_BASE_URL is set.
If you want to create a production build we suggest that you set a backend url with NEXT_PUBLIC_BACKEND_BASE_URL.
If you want to create a build that uses the mock api then use build:mock instead or set NEXT_PUBLIC_USE_MOCK_API to "true".
==============`)
  process.exit(1)
}

if (!!process.env.NEXT_PUBLIC_TEST_MODE) {
  console.log('Built in test mode')
}

const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})

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
    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          { from: path.join(__dirname, 'node_modules/@hpcc-js/wasm/dist/graphvizlib.wasm'), to: 'static/js' },
          { from: path.join(__dirname, 'node_modules/@hpcc-js/wasm/dist/expatlib.wasm'), to: 'static/js' },
          {
            from: path.join(__dirname, 'node_modules/emoji-picker-element-data/en/emojibase/data.json'),
            to: 'static/js/emoji-data.json'
          }
        ]
      })
    )
    return config
  },
  reactStrictMode: true,
  redirects: () => {
    return Promise.resolve([
      {
        source: '/',
        destination: '/intro',
        permanent: true
      }
    ])
  }
}

const completeNextConfig = withBundleAnalyzer(rawNextConfig)

module.exports = completeNextConfig
