/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ProviderType } from '@hedgedoc/commons'
import { HttpMethod } from '../../src/handler-utils/respond-to-matching-request'
import { IGNORE_MOTD, MOTD_LOCAL_STORAGE_KEY } from '../../src/components/global-dialogs/motd-modal/local-storage-keys'

declare namespace Cypress {
  interface Chainable {
    loadConfig(additionalConfig?: Partial<typeof config>): Chainable<Window>
    logIn: Chainable<Window>
    logOut: Chainable<Window>
  }
}

export const branding = {
  name: 'DEMO Corp',
  logo: '/public/img/demo.png'
}

export const authProviders = [
  {
    type: ProviderType.LOCAL
  },
  {
    type: ProviderType.LDAP,
    identifier: 'test-ldap',
    providerName: 'Test LDAP'
  },
  {
    type: ProviderType.OIDC,
    identifier: 'test-oidc',
    providerName: 'Test OIDC'
  }
]

export const config = {
  allowRegister: true,
  allowProfileEdits: true,
  allowChooseUsername: true,
  guestAccess: 'write',
  authProviders: authProviders,
  branding: branding,
  useImageProxy: false,
  specialUrls: {
    privacy: 'https://example.com/privacy',
    termsOfUse: 'https://example.com/termsOfUse',
    imprint: 'https://example.com/imprint'
  },
  version: {
    major: 0,
    minor: 0,
    patch: 0,
    preRelease: '',
    commit: 'MOCK'
  },
  plantumlServer: 'http://mock-plantuml.local',
  maxDocumentLength: 200
}

Cypress.Commands.add('loadConfig', (additionalConfig?: Partial<typeof config>) => {
  return cy.request(HttpMethod.POST, '/api/private/config', { ...config, ...additionalConfig })
})

Cypress.Commands.add('logIn', () => {
  return cy.setCookie('mock-session', '1', { path: '/' })
})

Cypress.Commands.add('logOut', () => {
  return cy.clearCookie('mock-session')
})

beforeEach(() => {
  cy.loadConfig()
  window.localStorage.setItem(MOTD_LOCAL_STORAGE_KEY, IGNORE_MOTD)
  cy.logIn()

  cy.intercept('GET', '/public/motd.md', {
    body: '404 Not Found!',
    statusCode: 404
  })
  cy.intercept('HEAD', '/public/motd.md', {
    statusCode: 404
  })
})
