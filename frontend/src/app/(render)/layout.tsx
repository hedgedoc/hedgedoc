/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../../../global-styles/index.scss'
import { ApplicationLoader } from '../../components/application-loader/application-loader'
import { BaseUrlContextProvider } from '../../components/common/base-url/base-url-context-provider'
import { FrontendConfigContextProvider } from '../../components/common/frontend-config-context/frontend-config-context-provider'
import { ExpectedOriginBoundary } from '../../components/layout/expected-origin-boundary'
import { StoreProvider } from '../../redux/store-provider'
import { baseUrlFromEnvExtractor } from '../../utils/base-url-from-env-extractor'
import React from 'react'
import { getConfig } from '../../api/config'
import type { Metadata, Viewport } from 'next'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const baseUrls = baseUrlFromEnvExtractor.extractBaseUrls()
  const frontendConfig = await getConfig(baseUrls.renderer)

  return (
    <html lang='en'>
      <body>
        <ExpectedOriginBoundary expectedOrigin={baseUrls.renderer}>
          <BaseUrlContextProvider baseUrls={baseUrls}>
            <FrontendConfigContextProvider config={frontendConfig}>
              <StoreProvider>
                <ApplicationLoader>{children}</ApplicationLoader>
              </StoreProvider>
            </FrontendConfigContextProvider>
          </BaseUrlContextProvider>
        </ExpectedOriginBoundary>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  applicationName: 'HedgeDoc',
  appleWebApp: {
    title: 'HedgeDoc',
    capable: true,
    statusBarStyle: 'black-translucent'
  },
  description: 'HedgeDoc - Ideas grow better together',
  title: 'HedgeDoc',
  manifest: '/icons/site.webmanifest',
  icons: {
    apple: [
      { url: '/icons/apple-touch-icon-120x120.png', sizes: '120x120' },
      { url: '/icons/apple-touch-icon-152x152.png', sizes: '152x152' },
      { url: '/icons/apple-touch-icon-180x180.png', sizes: '180x180' },
      { url: '/icons/android-chrome-192x192.png', sizes: '192x192' },
      { url: '/icons/android-chrome-512x512.png', sizes: '512x512' }
    ]
  }
}

export const viewport: Viewport = {
  themeColor: '#b51f08',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover'
}
