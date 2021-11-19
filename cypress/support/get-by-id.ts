/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
declare namespace Cypress {
  interface Chainable {
    getById(id: string): Chainable<Element>
    findById(id: string): Chainable<Element>
  }
}

const CYPRESS_ATTR = 'data-cypress-id'

Cypress.Commands.add('getById', (id: string) => {
  return cy.get(`[${CYPRESS_ATTR}="${id}"]`)
})

Cypress.Commands.add(
  'findById',
  {
    prevSubject: 'element'
  },
  (parent: JQuery<HTMLElement>, id: string) => {
    return cy.wrap(parent).find(`[${CYPRESS_ATTR}="${id}"]`)
  }
)
