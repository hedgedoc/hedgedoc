/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to log the user out.
     * @example cy.logout()
     */
    logout(): Chainable<Window>
  }
}

Cypress.Commands.add('logout', () => {
  cy.getById('user-dropdown').click()
  cy.getById('user-dropdown-sign-out-button').click()
})
