/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { testNoteId } from '../support/visit-test-editor'

describe('Delete note', () => {
  beforeEach(() => {
    cy.visitTestNote()
  })

  it('correctly deletes a note', () => {
    cy.intercept('DELETE', `api/private/notes/${testNoteId}`, {
      statusCode: 204
    })
    cy.getByCypressId('sidebar.deleteNote.button').click()
    cy.getByCypressId('sidebar.deleteNote.modal').should('be.visible')
    cy.getByCypressId('sidebar.deleteNote.modal.noteTitle').should('be.visible').text().should('eq', 'Untitled')
    cy.getByCypressId('deletionModal.confirmButton').should('be.visible').click()
    cy.getByCypressId('sidebar.deleteNote.modal').should('not.be.exist')
    cy.getByCypressId('notification-toast').should('not.exist')
  })

  it('displays an error notification if something goes wrong', () => {
    cy.intercept('DELETE', `api/private/notes/${testNoteId}`, {
      statusCode: 400
    })
    cy.getByCypressId('sidebar.deleteNote.button').click()
    cy.getByCypressId('sidebar.deleteNote.modal').should('be.visible')
    cy.getByCypressId('sidebar.deleteNote.modal.noteTitle').should('be.visible').text().should('eq', 'Untitled')
    cy.getByCypressId('deletionModal.confirmButton').should('be.visible').click()
    cy.getByCypressId('sidebar.deleteNote.modal').should('not.exist')
    cy.getByCypressId('notification-toast').should('be.visible')
  })

  describe('displays the note title coming from', () => {
    const title = 'mock_title'
    it('yaml metadata', () => {
      cy.setCodemirrorContent(`---\ntitle: ${title}\n---`)
    })
    it('opengraph', () => {
      cy.setCodemirrorContent(`---\nopengraph:\n  title: ${title}\n---`)
    })
    it('just first heading', () => {
      cy.setCodemirrorContent(`# ${title}`)
    })
    afterEach(() => {
      cy.getByCypressId('sidebar.deleteNote.button').click()
      cy.getByCypressId('sidebar.deleteNote.modal').should('be.visible')
      cy.getByCypressId('sidebar.deleteNote.modal.noteTitle').should('be.visible').text().should('eq', title)
    })
  })
})
