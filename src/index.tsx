import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import * as serviceWorker from './service-worker'
import { Landing } from './components/landing/layout'
import { ApplicationLoader } from './components/application-loader/application-loader'
import { Provider } from 'react-redux'
import { store } from './utils/store'
import { setUp } from './initializers'

const initTasks = setUp()

ReactDOM.render(
  <Provider store={store}>
    <ApplicationLoader initTasks={initTasks}>
      <Router>
        <Landing/>
      </Router>
    </ApplicationLoader>
  </Provider>
  , document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
