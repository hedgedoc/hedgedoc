/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to fill an input field with text and trigger a change event.
     * @example cy.get(input).fill('content')
     */
    fill(value: string): Chainable<Element>

    setCodemirrorContent(value: string): Chainable<Element>
  }
}

Cypress.Commands.add(
  'fill',
  {
    prevSubject: 'element'
  },
  (subject, value) => {
    return cy.wrap(subject).invoke('val', value).trigger('change', { force: true })
  }
)

Cypress.Commands.add('setCodemirrorContent', (content: string) => {
  const line = content.split('\n').find((value) => value !== '')
  cy.get('.CodeMirror').click().get('textarea').type('{ctrl}a').type('{backspace}').fill(content)
  if (line) {
    cy.get('.CodeMirror').find('.CodeMirror-line').should('contain.text', line)
  }
})
