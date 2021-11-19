/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

declare namespace Cypress {
  interface Chainable {
    visitTestEditor(query?: string): Chainable<Cypress.AUTWindow>
  }
}

export const testNoteId = 'test'

Cypress.Commands.add('visitTestEditor', (query?: string) => {
  return cy.visit(`/n/${testNoteId}${query ? `?${query}` : ''}`)
})

beforeEach(() => {
  cy.intercept(`/mock-backend/api/private/notes/${testNoteId}-get`, {
    content: '',
    metadata: {
      id: 'mock_note_id',
      alias: 'mockNote',
      version: 2,
      viewCount: 0,
      updateTime: '2021-04-24T09:27:51.000Z',
      updateUser: {
        userName: 'test',
        displayName: 'Testy',
        photo: '',
        email: ''
      },
      createTime: '2021-04-24T09:27:51.000Z',
      editedBy: []
    }
  })
})
