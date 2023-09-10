/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { HistoryEntry } from '../../src/api/history/types'

describe('History', () => {
  describe('History Mode', () => {
    beforeEach(() => {
      cy.visitHistory()
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
        cy.intercept('GET', '/api/private/me/history', {
          body: [
            {
              identifier: 'cypress',
              title: 'Features',
              lastVisitedAt: '2020-05-16T22:26:56.547Z',
              pinStatus: false,
              tags: []
            } as HistoryEntry
          ]
        })
        cy.visitHistory()
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
        cy.intercept('GET', '/api/private/me/history', {
          body: [
            {
              identifier: 'cypress-no-title',
              title: '',
              lastVisitedAt: '2020-05-16T22:26:56.547Z',
              pinStatus: false,
              tags: []
            } as HistoryEntry
          ]
        })
        cy.visitHistory()
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
      cy.visitHistory()
    })

    describe('working', () => {
      beforeEach(() => {
        cy.intercept('PUT', '/api/private/me/history/features', (req) => {
          req.reply(200, req.body)
        })
      })

      it('Cards', () => {
        cy.getByCypressId('history-card').should('be.visible')
        cy.get('[data-cypress-card-title=Features]')
          .findByCypressId('history-entry-pin-button')
          .should('have.attr', 'data-cypress-pinned', 'true')
          .click()
        cy.get('[data-cypress-card-title=Features]')
          .findByCypressId('history-entry-pin-button')
          .should('have.attr', 'data-cypress-pinned', 'false')
      })

      it('Table', () => {
        cy.getByCypressId('history-mode-table').click()
        cy.get('[data-cypress-entry-title=Features]')
          .findByCypressId('history-entry-pin-button')
          .should('have.attr', 'data-cypress-pinned', 'true')
          .click()
        cy.get('[data-cypress-entry-title=Features]')
          .findByCypressId('history-entry-pin-button')
          .should('have.attr', 'data-cypress-pinned', 'false')
      })
    })

    describe('failing', () => {
      beforeEach(() => {
        cy.intercept('PUT', '/api/private/me/history/features', {
          statusCode: 401
        })
      })

      it('Cards', () => {
        cy.getByCypressId('history-card').should('be.visible')
        cy.get('[data-cypress-card-title=Features]')
          .findByCypressId('history-entry-pin-button')
          .should('have.attr', 'data-cypress-pinned', 'true')
          .click()
        cy.getByCypressId('notification-toast').should('be.visible')
      })

      it('Table', () => {
        cy.getByCypressId('history-mode-table').click()
        cy.get('[data-cypress-entry-title=Features]')
          .findByCypressId('history-entry-pin-button')
          .should('have.attr', 'data-cypress-pinned', 'true')
          .click()
        cy.getByCypressId('notification-toast').should('be.visible')
      })
    })
  })

  describe('Import', () => {
    beforeEach(() => {
      cy.clearLocalStorage('history')
      cy.intercept('GET', '/api/private/me/history', {
        body: []
      })
      cy.visitHistory()
      cy.logOut()

      cy.fixture('history.json').as('history')
      cy.fixture('history-2.json').as('history-2')
      cy.fixture('invalid-history.txt').as('invalid-history')
    })

    it('works with valid file', () => {
      cy.getByCypressId('import-history-file-button').should('be.visible')
      cy.getByCypressId('import-history-file-input').selectFile(
        {
          contents: '@history',
          fileName: 'history.json',
          mimeType: 'application/json'
        },
        { force: true }
      )
      cy.getByCypressId('history-entry-title').should('have.length', 1).contains('cy-Test')
    })

    it('fails on invalid file', () => {
      cy.getByCypressId('import-history-file-button').should('be.visible')
      cy.getByCypressId('import-history-file-input').selectFile(
        {
          contents: '@invalid-history',
          fileName: 'invalid-history.txt',
          mimeType: 'text/plain'
        },
        { force: true }
      )
      cy.getByCypressId('notification-toast').should('be.visible')
    })

    it('works when selecting two files with the same name', () => {
      cy.getByCypressId('import-history-file-button').should('be.visible')
      cy.getByCypressId('import-history-file-input').selectFile(
        {
          contents: '@history',
          fileName: 'history.json',
          mimeType: 'application/json'
        },
        { force: true }
      )
      cy.getByCypressId('history-entry-title').should('have.length', 1).contains('cy-Test')
      cy.getByCypressId('import-history-file-button').should('be.visible')
      cy.getByCypressId('import-history-file-input').selectFile(
        {
          contents: '@history-2',
          fileName: 'history.json',
          mimeType: 'application/json'
        },
        { force: true }
      )
      cy.getByCypressId('history-entry-title').should('have.length', 2).contains('cy-Test2')
    })
  })
})
