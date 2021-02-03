/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

declare namespace Cypress {
  interface Chainable {
    getMarkdownRenderer(): Chainable<Element>

    getMarkdownBody(): Chainable<Element>
  }
}

Cypress.Commands.add('getMarkdownRenderer', () => {
  return cy.get(`iframe[data-cy="documentIframe"]`)
           .its('0.contentDocument')
           .should('exist')
           .its('body')
           .should('not.be.undefined')
           .then(cy.wrap.bind(cy))
})

Cypress.Commands.add('getMarkdownBody', () => {
  return cy.getMarkdownRenderer()
           .find('.markdown-body')
})
