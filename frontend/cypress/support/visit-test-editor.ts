/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NoteDto } from '@hedgedoc/commons'

export const testNoteId = 'test'
const mockMetadata = {
  id: testNoteId,
  aliases: ['mock-note'],
  primaryAlias: 'mock-note',
  title: 'Mock Note',
  description: 'Mocked note for testing',
  tags: ['test', 'mock', 'cypress'],
  updatedAt: '2021-04-24T09:27:51.000Z',
  lastUpdatedBy: null,
  version: 2,
  createdAt: '2021-04-24T09:27:51.000Z',
  editedBy: [],
  permissions: {
    owner: 'mock',
    sharedToUsers: [],
    sharedToGroups: []
  }
}

beforeEach(() => {
  cy.intercept(`api/private/notes/${testNoteId}`, {
    content: '',
    metadata: mockMetadata,
    editedByAtPosition: []
  } as NoteDto)
  cy.intercept(`api/private/notes/${testNoteId}/metadata`, mockMetadata)
})
