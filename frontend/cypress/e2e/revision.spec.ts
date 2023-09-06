/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { testNoteId } from '../support/visit-test-editor'
import { DateTime } from 'luxon'
import { join } from 'path'

describe('Revision modal', () => {
  const testTitle = 'testContent'
  const testContent = `---\ntitle: ${testTitle}\n---\nThis is some test content`

  const defaultCreatedAt = '2021-12-29T17:54:11.000Z'
  const formattedDate = DateTime.fromISO(defaultCreatedAt).toFormat('DDDD T')
  const revisionPayload = [
    {
      id: 1,
      createdAt: defaultCreatedAt,
      length: 2788,
      authorUsernames: [],
      anonymousAuthorCount: 4,
      title: 'Features',
      description: 'Many features, such wow!',
      tags: ['hedgedoc', 'demo', 'react']
    },
    {
      id: 0,
      createdAt: defaultCreatedAt,
      length: 2782,
      authorUsernames: [],
      anonymousAuthorCount: 2,
      title: 'Features',
      description: 'Many more features, such wow!',
      tags: ['hedgedoc', 'demo', 'react']
    }
  ]
  beforeEach(() => {
    cy.intercept('GET', `api/private/notes/${testNoteId}/revisions`, revisionPayload)
    cy.visitTestNote()
    cy.getByCypressId('sidebar.revision.button').click()
  })

  it('can delete revisions', () => {
    cy.intercept('DELETE', `api/private/notes/${testNoteId}/revisions`, {
      statusCode: 204
    })
    const cardsContents = [formattedDate, 'Length: 2788', 'Anonymous authors or guests: 4']

    cardsContents.forEach((content) => cy.getByCypressId('revision.modal.lists').contains(content))

    cy.getByCypressId('revision.modal.revert.button').should('be.disabled')
    cy.getByCypressId('revision.modal.download.button').should('be.disabled')
    cy.getByCypressId('revision.modal.delete.button').click()
    cy.getByCypressId('revision.delete.modal').should('be.visible')

    cy.getByCypressId('revision.delete.button').click()
    cy.getByCypressId('revision.delete.modal').should('not.exist')
    cy.getByCypressId('sidebar.revision.modal').should('be.visible')
  })
  it('can handle fail of revision deletion', () => {
    cy.intercept('DELETE', `api/private/notes/${testNoteId}/revisions`, {
      statusCode: 400
    })
    cy.getByCypressId('revision.modal.delete.button').click()
    cy.getByCypressId('revision.delete.modal').should('be.visible')

    cy.getByCypressId('revision.delete.button').click()
    cy.getByCypressId('revision.delete.modal').should('not.exist')
    cy.getByCypressId('notification-toast').should('be.visible')
    cy.getByCypressId('sidebar.revision.modal').should('be.visible')
  })
  it('can download revisions', () => {
    cy.intercept('GET', `/api/private/notes/${testNoteId}/revisions/1`, {
      id: 1,
      createdAt: defaultCreatedAt,
      title: 'Features',
      description: 'Many more features, such wow!',
      tags: ['hedgedoc', 'demo', 'react'],
      patch: testContent,
      edits: [],
      length: 2788,
      authorUsernames: [],
      anonymousAuthorCount: 4,
      content: testContent
    })

    const downloadFolder = Cypress.config('downloadsFolder')
    const fileName = `${testNoteId}-${defaultCreatedAt.replace(/:/g, '_')}.md`
    const filePath = join(downloadFolder, fileName)

    cy.getByCypressId('revision.modal.lists').contains(formattedDate).click()
    cy.getByCypressId('revision.modal.download.button').click()
    cy.readFile(filePath).should('contain', testContent)
  })
})
