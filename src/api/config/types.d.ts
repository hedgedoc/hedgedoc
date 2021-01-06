/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface Config {
  allowAnonymous: boolean,
  allowRegister: boolean,
  authProviders: AuthProvidersState,
  branding: BrandingConfig,
  banner: BannerConfig,
  customAuthNames: CustomAuthNames,
  useImageProxy: boolean,
  specialLinks: SpecialLinks,
  version: BackendVersion,
  plantumlServer: string | null,
  maxDocumentLength: number,
}

export interface BrandingConfig {
  name: string,
  logo: string,
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
  internal: boolean,
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
