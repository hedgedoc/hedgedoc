/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to fill an input field with text and trigger a change event.
     * @example cy.get(input).fill('content')
     */
    fill (value: string): Chainable<Element>
    codemirrorFill (value: string): Chainable<Element>
  }
}

Cypress.Commands.add('fill', {
  prevSubject: 'element'
}, (subject, value) => {
  return cy.wrap(subject)
    .invoke('val', value)
    .trigger('change', { force: true })
})

Cypress.Commands.add('codemirrorFill', (content: string) => {
  const line = content.split("\n").find(value => value !== '');
  cy.get('.CodeMirror')
    .click()
    .get('textarea')
    .fill(content)
  if(line) {
    cy.get('.CodeMirror')
      .contains('.CodeMirror-line', line)
  }
})
