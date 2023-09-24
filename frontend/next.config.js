/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
const { isMockMode, isTestMode, isProfilingMode, isBuildTime, Logger, BaseUrlFromEnvExtractor } = require('@hedgedoc/commons')
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: isProfilingMode
})

const logger = new Logger('Bootstrap')

logger.info('Node environment is', process.env.NODE_ENV)
new BaseUrlFromEnvExtractor(false).extractBaseUrls()

if (isTestMode) {
  logger.warn(`This build runs in test mode. This means:
 - No sandboxed iframe
 - Additional data-attributes for e2e tests added to DOM
 - Editor and renderer are running on the same origin
 - No frontend config caching
`)
}

if (isMockMode) {
  logger.warn(`This build runs in mock mode. This means:
 - No real data. All API responses are mocked
 - No persistent data
 - No realtime editing
`)
}

if (isBuildTime) {
  logger.warn(`This process runs in build mode. During build time this means:
 - Editor and Renderer base urls are https://example.org
 - No frontend config will be fetched
`)
}

if (isProfilingMode) {
  logger.info('This build contains the bundle analyzer and profiling metrics.')
}

/** @type {import('@svgr/webpack').LoaderOptions} */
const svgrConfig = {
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

/** @type {import('next').NextConfig} */
const rawNextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: svgrConfig
        }
      ]
    })

    const emojiPickerDataModulePath = path.dirname(require.resolve('emoji-picker-element-data/en/emojibase/data.json'))

    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: [
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
  swcMinify: false, //Otherwise emoji picker is minified incorrectly
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../')
  },
  productionBrowserSourceMaps: true
}
const completeNextConfig = withBundleAnalyzer(rawNextConfig)

module.exports = completeNextConfig
