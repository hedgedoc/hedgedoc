/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

//TODO: [mrdrogdrog] The following function and two constants already exist in typescript code.
// However, this file must be a js file and therefore can't access the ts function.
// I have no idea how to resolve this redundancy without extracting it into a node module.
const isPositiveAnswer = (value) => {
  const lowerValue = value.toLowerCase()
  return lowerValue === 'yes' || lowerValue === '1' || lowerValue === 'true'
}

const isTestMode = !!process.env.NEXT_PUBLIC_TEST_MODE && isPositiveAnswer(process.env.NEXT_PUBLIC_TEST_MODE)

const isMockMode = !!process.env.NEXT_PUBLIC_USE_MOCK_API && isPositiveAnswer(process.env.NEXT_PUBLIC_USE_MOCK_API)

console.log('Node env is', process.env.NODE_ENV)

if (isMockMode) {
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

if (!!process.env.NEXT_PUBLIC_IGNORE_IFRAME_ORIGIN_CONFIG) {
  console.warn(
    'You have set NEXT_PUBLIC_IGNORE_IFRAME_ORIGIN_CONFIG. This flag is ONLY for testing purposes and will decrease the security of the editor if used in production!'
  )
}

if (isTestMode) {
  console.warn(`This build runs in test mode. This means:
 - no sandboxed iframe
 - Additional data-attributes for e2e tests added to DOM`)
}

if (!!isMockMode) {
  console.warn(`This build runs in mock mode. This means:
 - No real data. All API responses are mocked
 - No persistent data
 - No realtime editing
 `)
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
  reactStrictMode: false,
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
