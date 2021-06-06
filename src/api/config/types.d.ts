/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface Config {
  allowAnonymous: boolean
  allowRegister: boolean
  authProviders: AuthProvidersState
  branding: BrandingConfig
  customAuthNames: CustomAuthNames
  useImageProxy: boolean
  specialUrls: SpecialUrls
  version: BackendVersion
  plantumlServer: string | null
  maxDocumentLength: number
  iframeCommunication: iframeCommunicationConfig
}

export interface iframeCommunicationConfig {
  editorOrigin: string
  rendererOrigin: string
}

export interface BrandingConfig {
  name: string
  logo: string
}

export interface BackendVersion {
  major: number
  minor: number
  patch: number
  preRelease?: string
  commit?: string
}

export interface AuthProvidersState {
  facebook: boolean
  github: boolean
  twitter: boolean
  gitlab: boolean
  dropbox: boolean
  ldap: boolean
  google: boolean
  saml: boolean
  oauth2: boolean
  internal: boolean
  openid: boolean
}

export interface CustomAuthNames {
  ldap: string
  oauth2: string
  saml: string
}

export interface SpecialUrls {
  privacy?: string
  termsOfUse?: string
  imprint?: string
}
