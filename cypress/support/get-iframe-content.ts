/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

declare namespace Cypress {
  interface Chainable {
    getIframeBody(): Chainable<Element>
    getReveal(): Chainable<Element>
    getMarkdownBody(): Chainable<Element>
  }
}

Cypress.Commands.add('getIframeBody', () => {
  return cy
    .get(`iframe[data-cypress-id="documentIframe"][data-content-ready="true"]`)
    .should('be.visible')
    .its('0.contentDocument')
    .should('exist')
    .its('body')
    .should('not.be.undefined')
    .then(cy.wrap.bind(cy))
})

Cypress.Commands.add('getReveal', () => {
  return cy.getIframeBody().find('.reveal')
})

Cypress.Commands.add('getMarkdownBody', () => {
  return cy.getIframeBody().find('.markdown-body')
})
