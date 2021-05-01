/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

declare namespace Cypress {
  interface Chainable {
    loadConfig(): Chainable<Window>
  }
}

export const banner = {
  text: 'This is the mock banner call',
  timestamp: '2020-05-22T20:46:08.962Z'
}

export const branding = {
  name: 'DEMO Corp',
  logo: '/img/demo.png'
}

export const authProviders = {
  facebook: true,
  github: true,
  twitter: true,
  gitlab: true,
  dropbox: true,
  ldap: true,
  google: true,
  saml: true,
  oauth2: true,
  internal: true,
  openid: true
}

export const config = {
  allowAnonymous: true,
  authProviders: authProviders,
  branding: branding,
  banner: banner,
  customAuthNames: {
    ldap: 'FooBar',
    oauth2: 'Olaf2',
    saml: 'aufSAMLn.de'
  },
  maxDocumentLength: 200,
  specialUrls: {
    privacy: 'https://example.com/privacy',
    termsOfUse: 'https://example.com/termsOfUse',
    imprint: 'https://example.com/imprint'
  },
  plantumlServer: 'http://mock-plantuml.local',
  version: {
    version: 'mock',
    sourceCodeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    issueTrackerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  'iframeCommunication': {
    'editorOrigin': 'http://127.0.0.1:3001/',
    'rendererOrigin': 'http://127.0.0.1:3001/'
  }
}

Cypress.Commands.add('loadConfig', (additionalConfig?: Partial<typeof config>) => {
  return cy.intercept('/api/private/config', {
    statusCode: 200,
    body: {
      ...config,
      ...additionalConfig
    }
  })
})

beforeEach(() => {
  cy.loadConfig()
})
