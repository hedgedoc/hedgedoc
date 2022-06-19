/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import 'cypress-fill-command'

declare namespace Cypress {
  interface Chainable {
    setCodemirrorContent(value: string): Chainable<Element>
  }
}

Cypress.Commands.add('setCodemirrorContent', (content: string) => {
  const line = content.split('\n').find((value) => value !== '')
  cy.getByCypressId('editor-pane')
    .should('have.attr', 'data-cypress-editor-ready', 'true')
    .get('.cm-editor')
    .click()
    .get('.cm-content')
    .fill(content)
  if (line) {
    cy.getByCypressId('editor-pane')
      .should('have.attr', 'data-cypress-editor-ready', 'true')
      .get('.cm-editor')
      .find('.cm-line')
      .should('contain.text', line)
  }
})
