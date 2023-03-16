/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { RendererType } from '../../src/components/render-page/window-post-message-communicator/rendering-message'

declare namespace Cypress {
  interface Chainable<Subject = unknown> {
    getIframeBody(rendererType?: RendererType): Chainable<Element>

    getReveal(): Chainable<Element>

    getMarkdownBody(): Chainable<Element>

    getSimpleRendererBody(): Chainable<Element>
  }
}

Cypress.Commands.add('getIframeBody', (rendererType?: RendererType) => {
  const renderTypeAttribute = rendererType ? `[data-cypress-renderer-type="${rendererType}"]` : ''
  return cy
    .get(`iframe[data-cypress-id="documentIframe"][data-cypress-renderer-ready="true"]${renderTypeAttribute}`)
    .should('be.visible')
    .its('0.contentDocument')
    .should('exist')
    .its('body')
    .should('not.be.undefined')
    .then(cy.wrap.bind(cy))
})

Cypress.Commands.add('getReveal', () => {
  return cy.getIframeBody(RendererType.SLIDESHOW).find('.reveal')
})

Cypress.Commands.add('getMarkdownBody', () => {
  return cy.getIframeBody(RendererType.DOCUMENT).findByCypressId('markdown-body')
})

Cypress.Commands.add('getSimpleRendererBody', () => {
  return cy.getIframeBody(RendererType.SIMPLE).findByCypressId('markdown-body')
})
