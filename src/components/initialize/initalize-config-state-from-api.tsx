import {useDispatch} from "react-redux";
import React from "react";
import {getConfig} from "../../api/config";
import {ApplicationConfigState} from "../../redux/application-config/types";
import {setApplicationConfig} from "../../redux/application-config/actions";

const InitializeConfigStateFromApi: React.FC = () => {
    const dispatch = useDispatch();
    getConfig()
        .then((response) => {
            if (response.status === 200) {
                return (response.json() as Promise<ApplicationConfigState>);
            }
        })
        .then(config => {
            if (!config) {
                return;
            }
            dispatch(setApplicationConfig({
                allowAnonymous: config.allowAnonymous,
                authProviders: {
                    facebook: config.authProviders.facebook,
                    github: config.authProviders.github,
                    twitter: config.authProviders.twitter,
                    gitlab: config.authProviders.gitlab,
                    dropbox: config.authProviders.dropbox,
                    ldap: config.authProviders.ldap,
                    google: config.authProviders.google,
                    saml: config.authProviders.saml,
                    oauth2: config.authProviders.oauth2,
                    email: config.authProviders.email
                },
                specialLinks: {
                    privacy: config.specialLinks.privacy,
                    termsOfUse: config.specialLinks.termsOfUse,
                    imprint: config.specialLinks.imprint,
                }
            }));
        });

    return null;
}

export { InitializeConfigStateFromApi }
