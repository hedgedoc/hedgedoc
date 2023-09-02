/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../../../global-styles/index.scss'
import { ApplicationLoader } from '../../components/application-loader/application-loader'
import { BaseUrlContextProvider } from '../../components/common/base-url/base-url-context-provider'
import { FrontendConfigContextProvider } from '../../components/common/frontend-config-context/frontend-config-context-provider'
import { StoreProvider } from '../../redux/store-provider'
import { extractBaseUrls } from '../../utils/base-url-from-env-extractor'
import React from 'react'
import { getConfig } from '../../api/config'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const baseUrls = extractBaseUrls()
  const frontendConfig = await getConfig(baseUrls.renderer)

  return (
    <html lang='en'>
      <body>
        <BaseUrlContextProvider baseUrls={baseUrls}>
          <FrontendConfigContextProvider config={frontendConfig}>
            <StoreProvider>
              <ApplicationLoader>{children}</ApplicationLoader>
            </StoreProvider>
          </FrontendConfigContextProvider>
        </BaseUrlContextProvider>
      </body>
    </html>
  )
}

export const dynamic = 'force-dynamic'
