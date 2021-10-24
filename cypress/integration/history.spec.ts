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
      cy.get('div.card').should('be.visible')
    })

    it('Table', () => {
      cy.get('[data-cypress-id="history-mode-table"]').click()
      cy.get('[data-cypress-id="history-table"]').should('be.visible')
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
        cy.get('[data-cypress-id="history-mode-table"]').click()
        cy.get('[data-cypress-id="history-table"]').should('be.visible')
        cy.get('[data-cypress-id="history-entry-title"]').contains('Features')
      })

      it('in cards view', () => {
        cy.get('[data-cypress-id="history-entry-title"]').contains('Features')
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
        cy.get('[data-cypress-id="history-mode-table"]').click()
        cy.get('[data-cypress-id="history-table"]').should('be.visible')
        cy.get('[data-cypress-id="history-entry-title"]').contains('Untitled')
      })

      it('in cards view', () => {
        cy.get('[data-cypress-id="history-entry-title"]').contains('Untitled')
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
        cy.get('div.card').should('be.visible')
        cy.get('.history-pin.btn').first().as('pin-button')
        cy.get('@pin-button').should('have.class', 'pinned').click()
        cy.get('@pin-button').should('not.have.class', 'pinned')
      })

      it('Table', () => {
        cy.get('i.fa-table').click()
        cy.get('.history-pin.btn').first().as('pin-button')
        cy.get('@pin-button').should('have.class', 'pinned').click()
        cy.get('@pin-button').should('not.have.class', 'pinned')
      })
    })

    describe('failing', () => {
      beforeEach(() => {
        cy.intercept('PUT', '/mock-backend/api/private/me/history/features', {
          statusCode: 401
        })
      })

      it('Cards', () => {
        cy.get('div.card').should('be.visible')
        cy.get('.fa-thumb-tack').first().click()
        cy.get('.notifications-area .toast').should('be.visible')
      })

      it('Table', () => {
        cy.get('i.fa-table').click()
        cy.get('.fa-thumb-tack').first().click()
        cy.get('.notifications-area .toast').should('be.visible')
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
      cy.get('[data-cypress-id="import-history-file-button"]').click()
      cy.get('[data-cypress-id="import-history-file-input"]').attachFile({
        filePath: 'history.json',
        mimeType: 'application/json'
      })
      cy.get('[data-cypress-id="history-entry-title"]')
        .should('have.length', 1)
        .contains('cy-Test')
    })

    it('fails on invalid file', () => {
      cy.get('[data-cypress-id="import-history-file-button"]').click()
      cy.get('[data-cypress-id="import-history-file-input"]').attachFile({
        filePath: 'history.json.license',
        mimeType: 'text/plain'
      })
      cy.get('[data-cypress-id="notification-toast"]').should('be.visible')
    })

    it('works when selecting two files with the same name', () => {
      cy.get('[data-cypress-id="import-history-file-button"]').click()
      cy.get('[data-cypress-id="import-history-file-input"]').attachFile({
        filePath: 'history.json',
        mimeType: 'application/json'
      })
      cy.get('[data-cypress-id="history-entry-title"]')
        .should('have.length', 1)
        .contains('cy-Test')
      cy.get('[data-cypress-id="import-history-file-button"]').click()
      cy.get('[data-cypress-id="import-history-file-input"]').attachFile({
        filePath: 'history-2.json',
        fileName: 'history.json',
        mimeType: 'application/json'
      })
      cy.get('[data-cypress-id="history-entry-title"]')
        .should('have.length', 2)
        .contains('cy-Test2')
    })
  })
})
