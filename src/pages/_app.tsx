/*
 SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

 SPDX-License-Identifier: AGPL-3.0-only
 */
import type { AppProps } from 'next/app'
import { store } from '../redux'
import { Provider } from 'react-redux'
import { ErrorBoundary } from '../components/error-boundary/error-boundary'
import { ApplicationLoader } from '../components/application-loader/application-loader'
import '../../global-styles/dark.scss'
import '../../global-styles/index.scss'
import type { NextPage } from 'next'

/**
 * The actual hedgedoc next js app.
 * Provides necessary wrapper components to every page.
 */
const HedgeDocApp: NextPage<AppProps> = ({ Component, pageProps }: AppProps) => {
  return (
    <Provider store={store}>
      <ApplicationLoader>
        <ErrorBoundary>
          <Component {...pageProps} />
        </ErrorBoundary>
      </ApplicationLoader>
    </Provider>
  )
}

export default HedgeDocApp
