/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { AppProps } from 'next/app'
import { ErrorBoundary } from '../components/error-boundary/error-boundary'
import { ApplicationLoader } from '../components/application-loader/application-loader'
import '../../global-styles/dark.scss'
import '../../global-styles/index.scss'
import type { NextPage } from 'next'
import { BaseHead } from '../components/layout/base-head'
import { StoreProvider } from '../redux/store-provider'
import { UiNotificationBoundary } from '../components/notifications/ui-notification-boundary'

/**
 * The actual hedgedoc next js app.
 * Provides necessary wrapper components to every page.
 */
const HedgeDocApp: NextPage<AppProps> = ({ Component, pageProps }: AppProps) => {
  return (
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
  )
}

export default HedgeDocApp
