/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('History', () => {
  describe('History Mode', () => {
    beforeEach(() => {
      cy.visit('/history')
    })

    it('Cards', () => {
      cy.getByCypressId('history-card').should('be.visible')
    })

    it('Table', () => {
      cy.getByCypressId('history-mode-table').click()
      cy.getByCypressId('history-table').should('be.visible')
    })
  })

  describe('entry title', () => {
    describe('is as given when not empty', () => {
      beforeEach(() => {
        cy.clearLocalStorage('history')
        cy.intercept('GET', '/mock-backend/api/private/me/history', {
          body: [
            {
              identifier: 'cypress',
              title: 'Features',
              lastVisited: '2020-05-16T22:26:56.547Z',
              pinStatus: false,
              tags: []
            }
          ]
        })
        cy.visit('/history')
      })

      it('in table view', () => {
        cy.getByCypressId('history-mode-table').click()
        cy.getByCypressId('history-table').should('be.visible')
        cy.getByCypressId('history-entry-title').contains('Features')
      })

      it('in cards view', () => {
        cy.getByCypressId('history-entry-title').contains('Features')
      })
    })
    describe('is untitled when not empty', () => {
      beforeEach(() => {
        cy.clearLocalStorage('history')
        cy.intercept('GET', '/mock-backend/api/private/me/history', {
          body: [
            {
              identifier: 'cypress-no-title',
              title: '',
              lastVisited: '2020-05-16T22:26:56.547Z',
              pinStatus: false,
              tags: []
            }
          ]
        })
        cy.visit('/history')
      })

      it('in table view', () => {
        cy.getByCypressId('history-mode-table').click()
        cy.getByCypressId('history-table').should('be.visible')
        cy.getByCypressId('history-entry-title').contains('Untitled')
      })

      it('in cards view', () => {
        cy.getByCypressId('history-entry-title').contains('Untitled')
      })
    })
  })

  describe('Pinning', () => {
    beforeEach(() => {
      cy.visit('/history')
    })

    describe('working', () => {
      beforeEach(() => {
        cy.intercept('PUT', '/mock-backend/api/private/me/history/features', (req) => {
          req.reply(200, req.body)
        })
      })

      it('Cards', () => {
        cy.getByCypressId('history-card').should('be.visible')
        cy.getByCypressId('history-entry-pin-button').first().as('pin-button')
        cy.get('@pin-button').should('have.attr', 'data-cypress-pinned', 'true').click()
        cy.get('@pin-button').should('have.attr', 'data-cypress-pinned', 'false')
      })

      it('Table', () => {
        cy.getByCypressId('history-mode-table').click()
        cy.getByCypressId('history-entry-pin-button').first().as('pin-button')
        cy.get('@pin-button').should('have.attr', 'data-cypress-pinned', 'true').click()
        cy.get('@pin-button').should('have.attr', 'data-cypress-pinned', 'false')
      })
    })

    describe('failing', () => {
      beforeEach(() => {
        cy.intercept('PUT', '/mock-backend/api/private/me/history/features', {
          statusCode: 401
        })
      })

      it('Cards', () => {
        cy.getByCypressId('history-card').should('be.visible')
        cy.getByCypressId('history-entry-pin-button').first().click()
        cy.getByCypressId('notification-toast').should('be.visible')
      })

      it('Table', () => {
        cy.getByCypressId('history-mode-table').click()
        cy.getByCypressId('history-entry-pin-button').first().click()
        cy.getByCypressId('notification-toast').should('be.visible')
      })
    })
  })

  describe('Import', () => {
    beforeEach(() => {
      cy.clearLocalStorage('history')
      cy.intercept('GET', '/mock-backend/api/private/me/history', {
        body: []
      })
      cy.visit('/history')
      cy.logout()
    })

    it('works with valid file', () => {
      cy.getByCypressId('import-history-file-button').should('be.visible')
      cy.getByCypressId('import-history-file-input').attachFixture({
        filePath: 'history.json',
        mimeType: 'application/json'
      })
      cy.getByCypressId('history-entry-title').should('have.length', 1).contains('cy-Test')
    })

    it('fails on invalid file', () => {
      cy.getByCypressId('import-history-file-button').should('be.visible')
      cy.getByCypressId('import-history-file-input').attachFixture({
        filePath: 'invalid-history.txt',
        mimeType: 'text/plain'
      })
      cy.getByCypressId('notification-toast').should('be.visible')
    })

    it('works when selecting two files with the same name', () => {
      cy.getByCypressId('import-history-file-button').should('be.visible')
      cy.getByCypressId('import-history-file-input').attachFixture({
        filePath: 'history.json',
        mimeType: 'application/json'
      })
      cy.getByCypressId('history-entry-title').should('have.length', 1).contains('cy-Test')
      cy.getByCypressId('import-history-file-button').should('be.visible')
      cy.getByCypressId('import-history-file-input').attachFixture({
        filePath: 'history-2.json',
        fileName: 'history.json',
        mimeType: 'application/json'
      })
      cy.getByCypressId('history-entry-title').should('have.length', 2).contains('cy-Test2')
    })
  })
})
