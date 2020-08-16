import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom'
import { ApplicationLoader } from './components/application-loader/application-loader'
import { Editor } from './components/editor/editor'
import { NotFoundErrorScreen } from './components/common/routing/not-found-error-screen'
import { LandingLayout } from './components/landing-layout/landing-layout'
import { HistoryPage } from './components/history-page/history-page'
import { IntroPage } from './components/intro-page/intro-page'
import { LoginPage } from './components/login-page/login-page'
import { ProfilePage } from './components/profile-page/profile-page'
import { RegisterPage } from './components/register-page/register-page'
import { Redirector } from './components/common/routing/redirector'
import './style/index.scss'
import * as serviceWorker from './service-worker'
import { store } from './redux'

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <ApplicationLoader>
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
      </ApplicationLoader>
    </Router>
  </Provider>
  , document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
