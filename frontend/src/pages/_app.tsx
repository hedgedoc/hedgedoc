/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../../global-styles/index.scss'
import type { FrontendConfig } from '../api/config/types'
import { ApplicationLoader } from '../components/application-loader/application-loader'
import type { BaseUrls } from '../components/common/base-url/base-url-context-provider'
import { BaseUrlContextProvider } from '../components/common/base-url/base-url-context-provider'
import { FrontendConfigContextProvider } from '../components/common/frontend-config-context/frontend-config-context-provider'
import { ErrorBoundary } from '../components/error-boundary/error-boundary'
import { BaseHead } from '../components/layout/base-head'
import { UiNotificationBoundary } from '../components/notifications/ui-notification-boundary'
import { StoreProvider } from '../redux/store-provider'
import { BaseUrlFromEnvExtractor } from '../utils/base-url-from-env-extractor'
import { configureLuxon } from '../utils/configure-luxon'
import { determineCurrentOrigin } from '../utils/determine-current-origin'
import { ExpectedOriginBoundary } from '../utils/expected-origin-boundary'
import { FrontendConfigFetcher } from '../utils/frontend-config-fetcher'
import { isTestMode } from '../utils/test-modes'
import type { AppContext, AppInitialProps, AppProps } from 'next/app'
import React from 'react'

configureLuxon()

interface AppPageProps {
  baseUrls: BaseUrls | undefined
  frontendConfig: FrontendConfig | undefined
  currentOrigin: string | undefined
}

/**
 * The actual hedgedoc next js app.
 * Provides necessary wrapper components to every page.
 */
function HedgeDocApp({ Component, pageProps }: AppProps<AppPageProps>) {
  return (
    <BaseUrlContextProvider baseUrls={pageProps.baseUrls}>
      <FrontendConfigContextProvider config={pageProps.frontendConfig}>
        <ExpectedOriginBoundary currentOrigin={pageProps.currentOrigin}>
          <StoreProvider>
            <BaseHead />
            <ApplicationLoader>
              <ErrorBoundary>
                <UiNotificationBoundary>
                  <Component {...pageProps} />
                </UiNotificationBoundary>
              </ErrorBoundary>
            </ApplicationLoader>
          </StoreProvider>
        </ExpectedOriginBoundary>
      </FrontendConfigContextProvider>
    </BaseUrlContextProvider>
  )
}

const baseUrlFromEnvExtractor = new BaseUrlFromEnvExtractor()
const frontendConfigFetcher = new FrontendConfigFetcher()

HedgeDocApp.getInitialProps = async ({ ctx }: AppContext): Promise<AppInitialProps<AppPageProps>> => {
  const baseUrls = baseUrlFromEnvExtractor.extractBaseUrls().orElse(undefined)
  const frontendConfig = isTestMode ? undefined : await frontendConfigFetcher.fetch(baseUrls) //some tests mock the frontend config. Therefore it needs to be fetched in the browser.
  const currentOrigin = determineCurrentOrigin(ctx)

  return {
    pageProps: {
      baseUrls,
      frontendConfig,
      currentOrigin
    }
  }
}

// noinspection JSUnusedGlobalSymbols
export default HedgeDocApp
