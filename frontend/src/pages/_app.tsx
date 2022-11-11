/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { AppInitialProps, AppProps } from 'next/app'
import { ErrorBoundary } from '../components/error-boundary/error-boundary'
import { ApplicationLoader } from '../components/application-loader/application-loader'
import '../../global-styles/dark.scss'
import '../../global-styles/index.scss'
import { BaseHead } from '../components/layout/base-head'
import { StoreProvider } from '../redux/store-provider'
import { UiNotificationBoundary } from '../components/notifications/ui-notification-boundary'
import { ExpectedOriginBoundary } from '../utils/uri-origin-boundary'
import React from 'react'
import { BaseUrlContextProvider } from '../components/common/base-url/base-url-context-provider'
import type { BaseUrls } from '../components/common/base-url/base-url-context-provider'
import { BaseUrlFromEnvExtractor } from '../utils/base-url-from-env-extractor'

interface AppPageProps {
  baseUrls: BaseUrls | undefined
}

/**
 * The actual hedgedoc next js app.
 * Provides necessary wrapper components to every page.
 */
function HedgeDocApp({ Component, pageProps }: AppProps<AppPageProps>) {
  return (
    <BaseUrlContextProvider baseUrls={pageProps.baseUrls}>
      <StoreProvider>
        <ExpectedOriginBoundary>
          <BaseHead />
          <ApplicationLoader>
            <ErrorBoundary>
              <UiNotificationBoundary>
                <Component {...pageProps} />
              </UiNotificationBoundary>
            </ErrorBoundary>
          </ApplicationLoader>
        </ExpectedOriginBoundary>
      </StoreProvider>
    </BaseUrlContextProvider>
  )
}

const baseUrlFromEnvExtractor: BaseUrlFromEnvExtractor = new BaseUrlFromEnvExtractor()

HedgeDocApp.getInitialProps = (): AppInitialProps<AppPageProps> => {
  const baseUrls = baseUrlFromEnvExtractor.extractBaseUrls().orElse(undefined)

  return {
    pageProps: {
      baseUrls
    }
  }
}

// noinspection JSUnusedGlobalSymbols
export default HedgeDocApp
