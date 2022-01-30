/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const authProvidersDisabled = {
  facebook: false,
  github: false,
  twitter: false,
  gitlab: false,
  dropbox: false,
  ldap: false,
  google: false,
  saml: false,
  oauth2: false,
  local: false
}

const initLoggedOutTestWithCustomAuthProviders = (
  cy: Cypress.cy,
  enabledProviders: Partial<typeof authProvidersDisabled>
) => {
  cy.loadConfig({
    authProviders: {
      ...authProvidersDisabled,
      ...enabledProviders
    }
  })
  cy.visitHome()
  cy.logout()
}

describe('When logged-in, ', () => {
  it('sign-in button is hidden', () => {
    cy.visitHome()
    cy.getByCypressId('sign-in-button').should('not.exist')
  })
})

describe('When logged-out ', () => {
  describe('and no auth-provider is enabled, ', () => {
    it('sign-in button is hidden', () => {
      initLoggedOutTestWithCustomAuthProviders(cy, {})
      cy.getByCypressId('sign-in-button').should('not.exist')
    })
  })

  describe('and an interactive auth-provider is enabled, ', () => {
    it('sign-in button points to login route: internal', () => {
      initLoggedOutTestWithCustomAuthProviders(cy, {
        local: true
      })
      cy.getByCypressId('sign-in-button').should('be.visible').should('have.attr', 'href', '/login')
    })

    it('sign-in button points to login route: ldap', () => {
      initLoggedOutTestWithCustomAuthProviders(cy, {
        ldap: true
      })
      cy.getByCypressId('sign-in-button').should('be.visible').should('have.attr', 'href', '/login')
    })
  })

  describe('and only one one-click auth-provider is enabled, ', () => {
    it('sign-in button points to auth-provider', () => {
      initLoggedOutTestWithCustomAuthProviders(cy, {
        saml: true
      })
      cy.getByCypressId('sign-in-button')
        .should('be.visible')
        // The absolute URL is used because it is defined as API base URL absolute.
        .should('have.attr', 'href', '/mock-backend/auth/saml')
    })
  })

  describe('and multiple one-click auth-providers are enabled, ', () => {
    it('sign-in button points to login route', () => {
      initLoggedOutTestWithCustomAuthProviders(cy, {
        saml: true,
        github: true
      })
      cy.getByCypressId('sign-in-button').should('be.visible').should('have.attr', 'href', '/login')
    })
  })

  describe('and one-click- as well as interactive auth-providers are enabled, ', () => {
    it('sign-in button points to login route', () => {
      initLoggedOutTestWithCustomAuthProviders(cy, {
        saml: true,
        local: true
      })
      cy.getByCypressId('sign-in-button').should('be.visible').should('have.attr', 'href', '/login')
    })
  })
})
