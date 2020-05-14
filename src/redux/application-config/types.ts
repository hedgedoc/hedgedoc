export interface ApplicationConfigState {
    allowAnonymous: boolean,
    authProviders: AuthProvidersState,
    specialLinks: SpecialLinks,
}


export interface AuthProvidersState {
    facebook: true,
    github: false,
    twitter: false,
    gitlab: false,
    dropbox: false,
    ldap: false,
    google: false,
    saml: false,
    oauth2: false,
    email: false,
}

export interface SpecialLinks {
    privacy: string,
    termsOfUse: string,
    imprint: string,
}
