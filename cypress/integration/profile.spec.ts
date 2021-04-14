/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

describe('profile page', () => {
  beforeEach(() => {
    cy.intercept({
      url: '/api/v2/tokens',
      method: 'GET'
    }, {
      body: [
        {
          label: 'cypress-App',
          created: 1601991518
        }
      ]
    })
    cy.intercept({
      url: '/api/v2/tokens',
      method: 'POST'
    }, {
      body: {
        label: 'cypress',
        secret: 'c-y-p-r-e-s-s',
        created: Date.now()
      }
    })
    cy.intercept({
      url: '/api/v2/tokens/1601991518',
      method: 'DELETE'
    }, {
      body: []
    })
    cy.visit('/profile')
  })

  describe('access tokens', () => {
    it('list existing tokens', () => {
      cy.get('.card.access-tokens .list-group-item .text-start.col')
        .contains('cypress-App')
    })

    it('delete token', () => {
      cy.get('.modal-dialog')
        .should('not.exist')
      cy.get('.card.access-tokens .list-group-item .btn-danger')
        .click()
      cy.get('.modal-dialog')
        .should('be.visible')
        .get('.modal-footer .btn-danger')
        .click()
      cy.get('.modal-dialog')
        .should('not.exist')
    })

    it('add token', () => {
      cy.get('.card.access-tokens .btn-primary')
        .should('be.disabled')
      cy.get('.card.access-tokens input[type=text]')
        .type('cypress')
      cy.get('.modal-dialog')
        .should('not.exist')
      cy.get('.card.access-tokens .btn-primary')
        .should('not.be.disabled')
        .click()
      cy.get('.modal-dialog')
        .should('be.visible')
        .get('.modal-dialog input[readonly]')
        .should('have.value', 'c-y-p-r-e-s-s')
    })
  })
})
