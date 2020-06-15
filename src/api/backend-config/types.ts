export interface BackendConfig {
  allowAnonymous: boolean,
  authProviders: AuthProvidersState,
  banner: BannerConfig,
  customAuthNames: CustomAuthNames,
  specialLinks: SpecialLinks,
  version: BackendVersion,
}

export interface BannerConfig {
  text: string
  timestamp: string
}

export interface BackendVersion {
  version: string,
  sourceCodeUrl: string
  issueTrackerUrl: string
}

export interface AuthProvidersState {
  facebook: boolean,
  github: boolean,
  twitter: boolean,
  gitlab: boolean,
  dropbox: boolean,
  ldap: boolean,
  google: boolean,
  saml: boolean,
  oauth2: boolean,
  email: boolean,
  openid: boolean,
}

export interface CustomAuthNames {
  ldap: string;
  oauth2: string;
  saml: string;
}

export interface SpecialLinks {
  privacy: string,
  termsOfUse: string,
  imprint: string,
}
