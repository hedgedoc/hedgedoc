/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export const testNoteId = 'test'

beforeEach(() => {
  cy.intercept(`api/private/notes/${testNoteId}`, {
    content: '',
    metadata: {
      id: testNoteId,
      alias: ['mock-note'],
      primaryAlias: 'mock-note',
      title: 'Mock Note',
      description: 'Mocked note for testing',
      tags: ['test', 'mock', 'cypress'],
      updateTime: '2021-04-24T09:27:51.000Z',
      updateUser: null,
      viewCount: 0,
      version: 2,
      createTime: '2021-04-24T09:27:51.000Z',
      editedBy: [],
      permissions: {
        owner: 'mock',
        sharedToUsers: [],
        sharedToGroups: []
      }
    },
    editedByAtPosition: []
  })
})
