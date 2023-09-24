/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { AuthProvider } from '../../src/api/config/types'
import { AuthProviderType } from '../../src/api/config/types'

const initLoggedOutTestWithCustomAuthProviders = (cy: Cypress.cy, enabledProviders: AuthProvider[]) => {
  cy.logOut()
  cy.loadConfig({
    authProviders: enabledProviders
  })
  cy.visitHistory()
}

describe('When logged-in, ', () => {
  it('sign-in button is hidden', () => {
    cy.visitHistory()
    cy.getByCypressId('base-app-bar').should('be.visible')
    cy.getByCypressId('sign-in-button').should('not.exist')
  })
  describe('login page route will redirect', () => {
    it('to /history if no redirect url has been provided', () => {
      cy.visit('/login')
      cy.url().should('contain', '/history')
    })
    it('to any page if a redirect url has been provided', () => {
      cy.visit('/login?redirectBackTo=/profile')
      cy.url().should('contain', '/profile')
    })
    it('to /history if a external redirect url has been provided', () => {
      cy.visit('/login?redirectBackTo=https://example.org')
      cy.url().should('contain', '/history')
    })
  })
})

describe('When logged-out ', () => {
  describe('and no auth-provider is enabled, ', () => {
    it('sign-in button is hidden', () => {
      initLoggedOutTestWithCustomAuthProviders(cy, [])
      cy.getByCypressId('sign-in-button').should('not.exist')
    })
  })

  describe('and an interactive auth-provider is enabled, ', () => {
    it('sign-in button points to login route: internal', () => {
      initLoggedOutTestWithCustomAuthProviders(cy, [
        {
          type: AuthProviderType.LOCAL
        }
      ])
      cy.getByCypressId('sign-in-button')
        .should('be.visible')
        .parent()
        .should('have.attr', 'href', '/login?redirectBackTo=/history')
    })

    it('sign-in button points to login route: ldap', () => {
      initLoggedOutTestWithCustomAuthProviders(cy, [
        {
          type: AuthProviderType.LDAP,
          identifier: 'cy-ldap',
          providerName: 'cy LDAP'
        }
      ])
      cy.getByCypressId('sign-in-button')
        .should('be.visible')
        .parent()
        .should('have.attr', 'href', '/login?redirectBackTo=/history')
    })
  })

  describe('and only one one-click auth-provider is enabled, ', () => {
    it('sign-in button points to auth-provider', () => {
      initLoggedOutTestWithCustomAuthProviders(cy, [
        {
          type: AuthProviderType.GITHUB
        }
      ])
      cy.getByCypressId('sign-in-button')
        .should('be.visible')
        .parent()
        // The absolute URL is used because it is defined as API base URL absolute.
        .should('have.attr', 'href', '/auth/github')
    })
  })

  describe('and multiple one-click auth-providers are enabled, ', () => {
    it('sign-in button points to login route', () => {
      initLoggedOutTestWithCustomAuthProviders(cy, [
        {
          type: AuthProviderType.GITHUB
        },
        {
          type: AuthProviderType.GOOGLE
        }
      ])
      cy.getByCypressId('sign-in-button')
        .should('be.visible')
        .parent()
        .should('have.attr', 'href', '/login?redirectBackTo=/history')
    })
  })

  describe('and one-click- as well as interactive auth-providers are enabled, ', () => {
    it('sign-in button points to login route', () => {
      initLoggedOutTestWithCustomAuthProviders(cy, [
        {
          type: AuthProviderType.GITHUB
        },
        {
          type: AuthProviderType.LOCAL
        }
      ])
      cy.getByCypressId('sign-in-button')
        .should('be.visible')
        .parent()
        .should('have.attr', 'href', '/login?redirectBackTo=/history')
    })
  })
})
