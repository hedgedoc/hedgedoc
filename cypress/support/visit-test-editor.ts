/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

declare namespace Cypress {
  interface Chainable {
    visitTestEditor (query?: string): Chainable<Cypress.AUTWindow>
  }
}

export const testNoteId = 'test'

Cypress.Commands.add('visitTestEditor', (query?: string) => {
  return cy.visit(`/n/${testNoteId}${query ? `?${query}` : ''}`)
})

beforeEach(() => {
  cy.intercept(`/api/v2/notes/${testNoteId}-get`, {
    "id": "ABC123",
    "alias": "banner",
    "lastChange": {
      "userId": "test",
      "timestamp": 1600033920
    },
    "viewCount": 0,
    "createTime": 1600033920,
    "content": "",
    "authorship": [],
    "preVersionTwoNote": true
  })
})
