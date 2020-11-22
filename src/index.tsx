/*
SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom'
import { ApplicationLoader } from './components/application-loader/application-loader'
import { NotFoundErrorScreen } from './components/common/routing/not-found-error-screen'
import { Redirector } from './components/common/routing/redirector'
import { ErrorBoundary } from './components/error-boundary/error-boundary'
import { HistoryPage } from './components/history-page/history-page'
import { IntroPage } from './components/intro-page/intro-page'
import { LandingLayout } from './components/landing-layout/landing-layout'
import { LoginPage } from './components/login-page/login-page'
import { PadViewOnly } from './components/pad-view-only/pad-view-only'
import { ProfilePage } from './components/profile-page/profile-page'
import { RegisterPage } from './components/register-page/register-page'
import { store } from './redux'
import * as serviceWorkerRegistration from './service-worker-registration'
import './style/dark.scss'
import './style/index.scss'

const Editor = React.lazy(() => import(/* webpackPrefetch: true */ './components/editor/editor'))

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <ApplicationLoader>
        <ErrorBoundary>
          <Switch>
            <Route path="/history">
              <LandingLayout>
                <HistoryPage/>
              </LandingLayout>
            </Route>
            <Route path="/intro">
              <LandingLayout>
                <IntroPage/>
              </LandingLayout>
            </Route>
            <Route path="/login">
              <LandingLayout>
                <LoginPage/>
              </LandingLayout>
            </Route>
            <Route path="/register">
              <LandingLayout>
                <RegisterPage/>
              </LandingLayout>
            </Route>
            <Route path="/profile">
              <LandingLayout>
                <ProfilePage/>
              </LandingLayout>
            </Route>
            <Route path="/n/:id">
              <Editor/>
            </Route>
            <Route path="/s/:id">
              <PadViewOnly/>
            </Route>
            <Route path="/:id">
              <Redirector/>
            </Route>
            <Route path="/">
              <Redirect to="/intro"/>
            </Route>
            <Route>
              <NotFoundErrorScreen/>
            </Route>
          </Switch>
        </ErrorBoundary>
      </ApplicationLoader>
    </Router>
  </Provider>
  , document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorkerRegistration.unregister()
