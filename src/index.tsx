import React from 'react'
import ReactDOM from 'react-dom'
import {BrowserRouter as Router} from 'react-router-dom'
import * as serviceWorker from './service-worker';
import {ApplicationStateStoreProvider} from "./redux/application-state-store-provider/application-state-store-provider";
import {setUpI18n} from "./initializers/i18n";
import {InitializeUserStateFromApi} from "./components/initialize/initialize-user-state-from-api";
import {Landing} from "./components/landing/layout";
import {setUpFontAwesome} from "./initializers/fontAwesome";
import {InitializeConfigStateFromApi} from "./components/initialize/initalize-config-state-from-api";

setUpFontAwesome();
setUpI18n().then(
    () => {
        ReactDOM.render(
            <ApplicationStateStoreProvider>
                <InitializeUserStateFromApi/>
                <InitializeConfigStateFromApi/>
                <Router>
                    <Landing/>
                </Router>
            </ApplicationStateStoreProvider>
            , document.getElementById('root')
        )
    }
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
