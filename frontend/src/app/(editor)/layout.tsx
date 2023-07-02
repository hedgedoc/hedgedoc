/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../../../global-styles/index.scss'
import { ApplicationLoader } from '../../components/application-loader/application-loader'
import { BaseUrlContextProvider } from '../../components/common/base-url/base-url-context-provider'
import { FrontendConfigContextProvider } from '../../components/common/frontend-config-context/frontend-config-context-provider'
import { MotdModal } from '../../components/global-dialogs/motd-modal/motd-modal'
import { DarkMode } from '../../components/layout/dark-mode/dark-mode'
import { UiNotificationBoundary } from '../../components/notifications/ui-notification-boundary'
import { StoreProvider } from '../../redux/store-provider'
import { baseUrlFromEnvExtractor } from '../../utils/base-url-from-env-extractor'
import { configureLuxon } from '../../utils/configure-luxon'
import type { Metadata } from 'next'
import type { PropsWithChildren } from 'react'
import React from 'react'
import { getConfig } from '../../api/config'

configureLuxon()

interface RootLayoutProps extends PropsWithChildren {
  appBar: React.ReactNode
}

export default async function RootLayout({ children, appBar }: RootLayoutProps) {
  const baseUrls = baseUrlFromEnvExtractor.extractBaseUrls()
  const frontendConfig = await getConfig(baseUrls.editor)

  return (
    <html lang='en'>
      <head>
        <link color='#b51f08' href='/icons/safari-pinned-tab.svg' rel='mask-icon' />
      </head>
      <body>
        <BaseUrlContextProvider baseUrls={baseUrls}>
          <FrontendConfigContextProvider config={frontendConfig}>
            <StoreProvider>
              <ApplicationLoader>
                <DarkMode />
                <MotdModal />
                <UiNotificationBoundary>
                  <div className={'d-flex flex-column vh-100'}>
                    {appBar}
                    {children}
                  </div>
                </UiNotificationBoundary>
              </ApplicationLoader>
            </StoreProvider>
          </FrontendConfigContextProvider>
        </BaseUrlContextProvider>
      </body>
    </html>
  )
}

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  themeColor: '#b51f08',
  applicationName: 'HedgeDoc',
  appleWebApp: {
    title: 'HedgeDoc'
  },
  description: 'HedgeDoc - Ideas grow better together',
  viewport: 'width=device-width, initial-scale=1',
  title: 'HedgeDoc',
  manifest: '/icons/site.webmanifest'
}
