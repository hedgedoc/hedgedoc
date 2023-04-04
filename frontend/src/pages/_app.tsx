/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../../global-styles/dark.scss'
import '../../global-styles/index.scss'
import { ApplicationLoader } from '../components/application-loader/application-loader'
import { BaseUrlContextProvider } from '../components/common/base-url/base-url-context-provider'
import type { BaseUrls } from '../components/common/base-url/base-url-context-provider'
import { ErrorBoundary } from '../components/error-boundary/error-boundary'
import { BaseHead } from '../components/layout/base-head'
import { UiNotificationBoundary } from '../components/notifications/ui-notification-boundary'
import { StoreProvider } from '../redux/store-provider'
import { BaseUrlFromEnvExtractor } from '../utils/base-url-from-env-extractor'
import { configureLuxon } from '../utils/configure-luxon'
import { determineCurrentOrigin } from '../utils/determine-current-origin'
import { ExpectedOriginBoundary } from '../utils/expected-origin-boundary'
import type { AppContext, AppInitialProps, AppProps } from 'next/app'
import React from 'react'

configureLuxon()

interface AppPageProps {
  baseUrls: BaseUrls | undefined
  currentOrigin: string | undefined
}

/**
 * The actual hedgedoc next js app.
 * Provides necessary wrapper components to every page.
 */
function HedgeDocApp({ Component, pageProps }: AppProps<AppPageProps>) {
  return (
    <BaseUrlContextProvider baseUrls={pageProps.baseUrls}>
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
    </BaseUrlContextProvider>
  )
}

const baseUrlFromEnvExtractor = new BaseUrlFromEnvExtractor()

HedgeDocApp.getInitialProps = ({ ctx }: AppContext): AppInitialProps<AppPageProps> => {
  const baseUrls = baseUrlFromEnvExtractor.extractBaseUrls().orElse(undefined)
  const currentOrigin = determineCurrentOrigin(ctx)

  return {
    pageProps: {
      baseUrls,
      currentOrigin
    }
  }
}

// noinspection JSUnusedGlobalSymbols
export default HedgeDocApp
