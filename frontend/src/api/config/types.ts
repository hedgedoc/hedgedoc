/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface FrontendConfig {
  allowRegister: boolean
  allowProfileEdits: boolean
  allowChooseUsername: boolean
  authProviders: AuthProvider[]
  branding: BrandingConfig
  guestAccess: GuestAccessLevel
  useImageProxy: boolean
  specialUrls: SpecialUrls
  version: BackendVersion
  plantumlServer?: string
  maxDocumentLength: number
}

export enum GuestAccessLevel {
  DENY = 'deny',
  READ = 'read',
  WRITE = 'write',
  CREATE = 'create'
}

export enum AuthProviderType {
  OIDC = 'oidc',
  LDAP = 'ldap',
  LOCAL = 'local'
}

export type AuthProviderTypeWithCustomName = AuthProviderType.LDAP | AuthProviderType.OIDC

export type AuthProviderTypeWithoutCustomName = AuthProviderType.LOCAL

export const authProviderTypeOneClick = [AuthProviderType.OIDC]

export interface AuthProviderWithCustomName {
  type: AuthProviderTypeWithCustomName
  identifier: string
  providerName: string
  theme?: string
}

export interface AuthProviderWithoutCustomName {
  type: AuthProviderTypeWithoutCustomName
}

export type AuthProvider = AuthProviderWithCustomName | AuthProviderWithoutCustomName

export interface BrandingConfig {
  name?: string
  logo?: string
}

export interface BackendVersion {
  major: number
  minor: number
  patch: number
  preRelease?: string
  commit?: string
}

export interface SpecialUrls {
  privacy?: string
  termsOfUse?: string
  imprint?: string
}
