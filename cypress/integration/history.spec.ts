/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('History', () => {
  beforeEach(() => {
    cy.visit('/history')
  })

  describe('History Mode', () => {
    it('Cards', () => {
      cy.get('div.card')
        .should('be.visible')
    })

    it('Table', () => {
      cy.get('i.fa-table')
        .click()
      cy.get('table.history-table')
        .should('be.visible')
    })
  })

  describe('Pinning', () => {
    describe('working', () => {
      beforeEach(() => {
        cy.intercept('PUT', '/api/v2/history/features', (req) => {
          req.reply(200, req.body)
        })
      })

      it('Cards', () => {
        cy.get('div.card')
          .should('be.visible')
        cy.get('.history-pin.btn')
          .first()
          .as('pin-button')
        cy.get('@pin-button')
          .should('not.have.class', 'pinned')
          .click()
        cy.get('@pin-button')
          .should('have.class', 'pinned')
      })

      it('Table', () => {
        cy.get('i.fa-table')
          .click()
        cy.get('.history-pin.btn')
          .first()
          .as('pin-button')
        cy.get('@pin-button')
          .should('not.have.class', 'pinned')
          .click()
        cy.get('@pin-button')
          .should('have.class', 'pinned')
      })
    })

    describe('failing', () => {
      beforeEach(() => {
        cy.intercept('PUT', '/api/v2/history/features', {
          statusCode: 401
        })
      })

      it('Cards', () => {
        cy.get('div.card')
          .should('be.visible')
        cy.get('.fa-thumb-tack')
          .first()
          .click()
        cy.get('.modal-dialog')
          .should('be.visible')
      })

      it('Table', () => {
        cy.get('i.fa-table')
          .click()
        cy.get('.fa-thumb-tack')
          .first()
          .click()
        cy.get('.modal-dialog')
          .should('be.visible')
      })
    })
  })
})
