/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../../../global-styles/index.scss'
import { ApplicationLoader } from '../../components/application-loader/application-loader'
import { BaseUrlContextProvider } from '../../components/common/base-url/base-url-context-provider'
import { FrontendConfigContextProvider } from '../../components/common/frontend-config-context/frontend-config-context-provider'
import { DarkMode } from '../../components/layout/dark-mode/dark-mode'
import { ExpectedOriginBoundary } from '../../components/layout/expected-origin-boundary'
import { UiNotificationBoundary } from '../../components/notifications/ui-notification-boundary'
import { StoreProvider } from '../../redux/store-provider'
import { baseUrlFromEnvExtractor } from '../../utils/base-url-from-env-extractor'
import { configureLuxon } from '../../utils/configure-luxon'
import type { Metadata, Viewport } from 'next'
import type { PropsWithChildren } from 'react'
import React from 'react'
import { getConfig } from '../../api/config'
import { MotdProvider } from '../../components/motd/motd-context'
import { fetchMotd } from '../../components/global-dialogs/motd-modal/fetch-motd'
import { CachedMotdModal } from '../../components/global-dialogs/motd-modal/cached-motd-modal'

configureLuxon()

interface RootLayoutProps extends PropsWithChildren {
  appBar: React.ReactNode
}

export default async function RootLayout({ children, appBar }: RootLayoutProps) {
  const baseUrls = baseUrlFromEnvExtractor.extractBaseUrls()
  const frontendConfig = await getConfig(baseUrls.editor)
  const motd = await fetchMotd(baseUrls.internalApiUrl ?? baseUrls.editor)

  return (
    <html lang='en'>
      <head>
        <link color='#b51f08' href='/icons/safari-pinned-tab.svg' rel='mask-icon' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='default' />
        <meta name='apple-mobile-web-app-title' content='HedgeDoc' />
        <meta name='mobile-web-app-capable' content='yes' />
        <link rel='apple-touch-icon' href='/icons/apple-touch-icon.png' />
        <link rel='apple-touch-icon' sizes='120x120' href='/icons/apple-touch-icon-120x120.png' />
        <link rel='apple-touch-icon' sizes='152x152' href='/icons/apple-touch-icon-152x152.png' />
        <link rel='apple-touch-icon' sizes='180x180' href='/icons/apple-touch-icon-180x180.png' />
        <link rel='apple-touch-icon' sizes='192x192' href='/icons/android-chrome-192x192.png' />
        <link rel='apple-touch-icon' sizes='512x512' href='/icons/android-chrome-512x512.png' />
      </head>
      <body>
        <ExpectedOriginBoundary expectedOrigin={baseUrls.editor}>
          <BaseUrlContextProvider baseUrls={baseUrls}>
            <MotdProvider motd={motd}>
              <FrontendConfigContextProvider config={frontendConfig}>
                <StoreProvider>
                  <ApplicationLoader>
                    <DarkMode />
                    <CachedMotdModal />
                    <UiNotificationBoundary>
                      <div className={'d-flex flex-column vh-100'}>
                        {appBar}
                        {children}
                      </div>
                    </UiNotificationBoundary>
                  </ApplicationLoader>
                </StoreProvider>
              </FrontendConfigContextProvider>
            </MotdProvider>
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
    statusBarStyle: 'default'
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
