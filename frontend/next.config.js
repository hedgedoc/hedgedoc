/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
const { isMockMode, isTestMode, isProfilingMode, isBuildTime } = require('./src/utils/test-modes')
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: isProfilingMode
})

console.log('Node environment is', process.env.NODE_ENV)

const isDev = process.env.NODE_ENV === 'development'

if (isTestMode) {
  console.warn(`This build runs in test mode. This means:
 - No sandboxed iframe
 - Additional data-attributes for e2e tests added to DOM
 - Editor and renderer are running on the same origin
 - No frontend config caching
`)
}

if (isMockMode) {
  console.warn(`This build runs in mock mode. This means:
 - No real data. All API responses are mocked
 - No persistent data
 - No realtime editing
`)
}

if (isBuildTime) {
  console.warn(`This process runs in build mode. During build time this means:
 - Editor and Renderer base urls are '' (empty string)
 - No frontend config will be fetched
`)
}

if (isProfilingMode) {
  console.info('This build contains the bundle analyzer and profiling metrics.')
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

const cspDirectives = [
  "default-src 'self';",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''};`,
  "style-src 'self' 'unsafe-inline';",
  "img-src 'self' data: blob: https:;",
  // TODO adapt connect-src for GitHub Gist and GitLab snippet export
  "connect-src 'self' https://vimeo.com;",
  "font-src 'self' data:;",
  "media-src 'self' data: blob: https:;",
  "frame-src 'self' https:;",
  "object-src 'none';",
  "base-uri 'self';",
  "form-action 'self';",
];
const cspHeader = cspDirectives.join(' ');

/** @type {import('next').NextConfig} */
const rawNextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader
          }
        ]
      }
    ]
  },
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
        destination: '/login',
        permanent: true
      }
    ])
  },
  output: 'standalone',
  swcMinify: true,
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../')
  },
  productionBrowserSourceMaps: true
}
const completeNextConfig = withBundleAnalyzer(rawNextConfig)

module.exports = completeNextConfig
